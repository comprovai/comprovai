import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  DICAS_POR_ROLE,
  MANUAL_COMPLETO,
  PERGUNTAS_FREQUENTES,
  SOBRE_O_PRODUTO,
} from "@/lib/chat/conteudo-ajuda";

export const runtime = "nodejs";

interface ChatMensagem {
  role: "user" | "assistant";
  texto: string;
}

interface ChatRequestBody {
  mensagens: ChatMensagem[];
  role?: string | null;
  pagina?: string | null;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "responder",
    description: "Responde normalmente à pergunta do usuário sobre o Comprovai.",
    input_schema: {
      type: "object",
      properties: {
        texto: { type: "string", description: "A resposta em português, direta e curta." },
      },
      required: ["texto"],
    },
  },
  {
    name: "sugerir_whatsapp",
    description:
      "Use quando o usuário pedir explicitamente para falar com uma pessoa/atendente/humano, ou quando a dúvida claramente não pode ser resolvida pelo chat (problema técnico específico da conta dele, cobrança, etc).",
    input_schema: {
      type: "object",
      properties: {
        texto: {
          type: "string",
          description: "Mensagem breve avisando que vai conectar com um atendente humano.",
        },
        resumo: {
          type: "string",
          description: "Resumo de 1-2 frases do que o usuário precisa, para pré-preencher o WhatsApp.",
        },
      },
      required: ["texto", "resumo"],
    },
  },
];

function montarSystemPrompt(role?: string | null, pagina?: string | null): string {
  const partes = [SOBRE_O_PRODUTO, "", "Perguntas frequentes:", PERGUNTAS_FREQUENTES];

  if (role && DICAS_POR_ROLE[role]) {
    partes.push("", DICAS_POR_ROLE[role]);
  }

  if (role) {
    partes.push("", "Manual de Procedimentos do Sistema Comprovai (COM-PROC-001):", MANUAL_COMPLETO);
  }

  if (pagina) {
    partes.push("", `O usuário está na tela: ${pagina}.`);
  }

  partes.push(
    "",
    "Você é o assistente do Comprovai. Responda só sobre o produto, seja breve e direto, em português do Brasil. Sempre use uma das ferramentas disponíveis para responder."
  );

  return partes.join("\n");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequestBody;

  if (!Array.isArray(body.mensagens) || body.mensagens.length === 0) {
    return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 512,
    system: montarSystemPrompt(body.role, body.pagina),
    tools: TOOLS,
    tool_choice: { type: "any" },
    messages: body.mensagens.map((m) => ({
      role: m.role,
      content: m.texto,
    })),
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");

  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({
      texto: "Não consegui processar sua pergunta agora, tenta de novo?",
      whatsapp: null,
    });
  }

  if (toolUse.name === "sugerir_whatsapp") {
    const input = toolUse.input as { texto: string; resumo: string };
    return NextResponse.json({ texto: input.texto, whatsapp: input.resumo });
  }

  const input = toolUse.input as { texto: string };
  return NextResponse.json({ texto: input.texto, whatsapp: null });
}
