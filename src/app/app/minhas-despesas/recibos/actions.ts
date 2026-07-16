"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReciboReembolsoDocument } from "@/components/documentos/ReciboReembolsoDocument";

export interface AssinarReciboResult {
  error?: string;
  pdfUrl?: string;
}

export async function assinarRecibo(
  documentoId: string,
  assinaturaDataUrl: string
): Promise<AssinarReciboResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id, nome")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return { error: "Usuário não encontrado." };
  }

  const admin = createAdminClient();

  const { data: documento } = await admin
    .from("documentos_gerados")
    .select("id, empresa_id, colaborador_id, numero, data_emissao, valor_total, status")
    .eq("id", documentoId)
    .single();

  if (!documento || documento.colaborador_id !== user.id || documento.status !== "aguardando_assinatura") {
    return { error: "Recibo não encontrado ou já assinado." };
  }

  const match = assinaturaDataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    return { error: "Assinatura inválida." };
  }
  const assinaturaBuffer = Buffer.from(match[1], "base64");

  const headersList = await headers();
  const ip = (headersList.get("x-forwarded-for") ?? "desconhecido").split(",")[0].trim();
  const userAgent = headersList.get("user-agent") ?? "desconhecido";
  const timestamp = new Date();

  const assinaturaPath = `${documento.empresa_id}/recibo_reembolso/assinaturas/${documento.id}.png`;

  const { error: uploadAssinaturaError } = await admin.storage
    .from("documentos")
    .upload(assinaturaPath, assinaturaBuffer, { contentType: "image/png", upsert: true });

  if (uploadAssinaturaError) {
    return { error: "Não foi possível salvar a assinatura." };
  }

  const { data: itens } = await admin
    .from("documentos_gerados_itens")
    .select("despesa_id")
    .eq("documento_gerado_id", documento.id);

  const despesaIds = (itens ?? []).map((i) => i.despesa_id);

  const { data: despesas } = await admin
    .from("despesas")
    .select("id, data_despesa, fornecedor, valor, categorias_despesa(nome), projetos_propostas(nome)")
    .in("id", despesaIds);

  const { data: empresa } = await admin
    .from("empresas")
    .select("nome, cnpj, logo_url")
    .eq("id", documento.empresa_id)
    .single();

  const comprovantes: { url: string; legenda: string }[] = [];
  for (const d of despesas ?? []) {
    const { data: comprovante } = await admin
      .from("comprovantes")
      .select("url_arquivo")
      .eq("despesa_id", d.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (comprovante?.url_arquivo) {
      const { data: signed } = await admin.storage
        .from("comprovantes")
        .createSignedUrl(comprovante.url_arquivo, 60 * 10);
      if (signed?.signedUrl) {
        comprovantes.push({
          url: signed.signedUrl,
          legenda: `${d.fornecedor ?? "Comprovante"} — ${d.data_despesa}`,
        });
      }
    }
  }

  const { data: signedAssinatura } = await admin.storage
    .from("documentos")
    .createSignedUrl(assinaturaPath, 60 * 10);

  const pdfBuffer = await renderToBuffer(
    ReciboReembolsoDocument({
      numero: documento.numero,
      dataEmissao: documento.data_emissao,
      empresa: { nome: empresa?.nome ?? "", cnpj: empresa?.cnpj ?? null, logoUrl: empresa?.logo_url ?? null },
      colaboradorNome: usuario.nome,
      itens: (despesas ?? []).map((d) => ({
        data: d.data_despesa,
        descricao: d.fornecedor ?? "—",
        categoria: d.categorias_despesa?.nome ?? "—",
        projeto: d.projetos_propostas?.nome ?? null,
        valor: d.valor,
      })),
      valorTotal: documento.valor_total,
      assinatura: {
        imagemUrl: signedAssinatura?.signedUrl ?? "",
        timestamp: timestamp.toLocaleString("pt-BR"),
        ip,
        userAgent,
      },
      comprovantes,
    })
  );

  const pdfPath = `${documento.empresa_id}/recibo_reembolso/${Date.now()}-${documento.numero.replace("/", "-")}.pdf`;

  const { error: uploadPdfError } = await admin.storage
    .from("documentos")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf" });

  if (uploadPdfError) {
    return { error: "Não foi possível salvar o PDF gerado." };
  }

  await admin
    .from("documentos_gerados")
    .update({
      status: "assinado",
      assinatura_url: assinaturaPath,
      assinatura_timestamp: timestamp.toISOString(),
      assinatura_ip: ip,
      assinatura_user_agent: userAgent,
      pdf_url: pdfPath,
    })
    .eq("id", documento.id);

  await admin.from("despesas").update({ status: "nota_gerada" }).in("id", despesaIds);

  const { data: signedPdf } = await admin.storage.from("documentos").createSignedUrl(pdfPath, 60 * 60);

  revalidatePath("/app/minhas-despesas/recibos");
  return { pdfUrl: signedPdf?.signedUrl };
}
