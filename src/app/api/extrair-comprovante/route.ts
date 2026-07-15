import { randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

function normalizeMediaType(type: string): AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(type)
    ? (type as AllowedMediaType)
    : "image/jpeg";
}

interface Extracao {
  valor: number | null;
  data: string | null;
  fornecedor: string | null;
  cnpj_fornecedor: string | null;
  categoria_sugerida: string | null;
}

async function extrairDadosComprovante(
  base64: string,
  mediaType: AllowedMediaType,
  categorias: string[]
): Promise<Extracao> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    tools: [
      {
        name: "registrar_extracao",
        description: "Registra os dados extraídos de um comprovante de despesa.",
        input_schema: {
          type: "object",
          properties: {
            valor: {
              type: ["number", "null"],
              description: "Valor total da despesa, em reais, sem símbolo de moeda.",
            },
            data: {
              type: ["string", "null"],
              description: "Data da despesa no formato YYYY-MM-DD.",
            },
            fornecedor: {
              type: ["string", "null"],
              description: "Nome do fornecedor ou estabelecimento.",
            },
            cnpj_fornecedor: {
              type: ["string", "null"],
              description: "CNPJ do fornecedor, apenas dígitos, se estiver legível.",
            },
            categoria_sugerida: {
              type: ["string", "null"],
              description:
                categorias.length > 0
                  ? `Uma destas categorias que melhor descreve a despesa: ${categorias.join(", ")}. Use null se nenhuma combinar bem.`
                  : "Categoria sugerida para a despesa, ou null se não for possível sugerir.",
            },
          },
          required: ["valor", "data", "fornecedor", "cnpj_fornecedor", "categoria_sugerida"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "registrar_extracao" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Extraia os dados deste comprovante de despesa (nota fiscal, recibo ou cupom). Se algum campo não estiver legível, use null para ele em vez de inventar um valor.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");

  if (!toolUse || toolUse.type !== "tool_use") {
    return {
      valor: null,
      data: null,
      fornecedor: null,
      cnpj_fornecedor: null,
      categoria_sugerida: null,
    };
  }

  return toolUse.input as Extracao;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const mediaType = normalizeMediaType(file.type);

  const admin = createAdminClient();

  const { data: categorias } = await admin
    .from("categorias_despesa")
    .select("nome")
    .eq("empresa_id", usuario.empresa_id);

  const categoriaNomes = (categorias ?? []).map((c) => c.nome);

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${usuario.empresa_id}/${user.id}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from("comprovantes")
    .upload(path, bytes, { contentType: mediaType, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Falha ao salvar o comprovante." }, { status: 500 });
  }

  let extraction: Extracao;
  try {
    extraction = await extrairDadosComprovante(bytes.toString("base64"), mediaType, categoriaNomes);
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível ler o comprovante automaticamente. Preencha os campos manualmente.",
        comprovantePath: path,
      },
      { status: 502 }
    );
  }

  const { data: signed } = await admin.storage.from("comprovantes").createSignedUrl(path, 60 * 60);

  return NextResponse.json({
    extraction,
    comprovantePath: path,
    signedUrl: signed?.signedUrl ?? null,
  });
}
