"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CriarReciboResult {
  error?: string;
  numero?: string;
}

export async function criarRecibo(
  colaboradorId: string,
  despesaIds: string[]
): Promise<CriarReciboResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (despesaIds.length === 0) {
    return { error: "Selecione ao menos uma despesa." };
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id, role")
    .eq("id", user.id)
    .single();

  if (!usuario || usuario.role !== "financeiro") {
    return { error: "Apenas o financeiro pode gerar este documento." };
  }

  const admin = createAdminClient();

  const { data: despesas } = await admin
    .from("despesas")
    .select("id, valor")
    .in("id", despesaIds)
    .eq("empresa_id", usuario.empresa_id)
    .eq("colaborador_id", colaboradorId)
    .eq("status", "lancada")
    .in("tipo", ["reembolso", "ambos"]);

  if (!despesas || despesas.length === 0) {
    return { error: "Nenhuma despesa elegível encontrada para os itens selecionados." };
  }

  const valorTotal = despesas.reduce((total, d) => total + d.valor, 0);
  const anoAtual = new Date().getFullYear();

  const { data: proximoNumero, error: numeroError } = await admin.rpc(
    "proximo_numero_documento",
    {
      p_empresa_id: usuario.empresa_id,
      p_tipo_documento: "recibo_reembolso",
      p_ano: anoAtual,
    }
  );

  if (numeroError || proximoNumero == null) {
    return { error: "Não foi possível gerar o número do documento." };
  }

  const numero = `${proximoNumero}/${anoAtual}`;

  const { data: documento, error: documentoError } = await admin
    .from("documentos_gerados")
    .insert({
      empresa_id: usuario.empresa_id,
      tipo_documento: "recibo_reembolso",
      destinatario_tipo: "colaborador",
      colaborador_id: colaboradorId,
      numero,
      data_emissao: new Date().toISOString().slice(0, 10),
      valor_total: valorTotal,
      status: "aguardando_assinatura",
      criado_por: user.id,
    })
    .select("id")
    .single();

  if (documentoError || !documento) {
    return { error: "Não foi possível registrar o documento gerado." };
  }

  await admin
    .from("documentos_gerados_itens")
    .insert(despesas.map((d) => ({ documento_gerado_id: documento.id, despesa_id: d.id })));

  revalidatePath("/app/financeiro/gerar-recibo");
  return { numero };
}
