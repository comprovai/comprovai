"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AcaoResult {
  error?: string;
}

export async function aprovarDespesa(despesaId: string): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("despesas")
    .update({
      status: "aprovada",
      aprovador_id: user.id,
      aprovado_em: new Date().toISOString(),
    })
    .eq("id", despesaId);

  if (error) {
    return { error: "Não foi possível aprovar a despesa." };
  }

  await supabase.from("historico_aprovacao").insert({
    despesa_id: despesaId,
    usuario_id: user.id,
    acao: "aprovado",
  });

  revalidatePath("/app/aprovacoes");
  return {};
}

export async function reprovarDespesa(despesaId: string, motivo: string): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const motivoLimpo = motivo.trim();
  if (!motivoLimpo) {
    return { error: "Informe o motivo da reprovação." };
  }

  const { error } = await supabase
    .from("despesas")
    .update({
      status: "reprovada",
      motivo_reprovacao: motivoLimpo,
    })
    .eq("id", despesaId);

  if (error) {
    return { error: "Não foi possível reprovar a despesa." };
  }

  await supabase.from("historico_aprovacao").insert({
    despesa_id: despesaId,
    usuario_id: user.id,
    acao: "reprovado",
    observacao: motivoLimpo,
  });

  revalidatePath("/app/aprovacoes");
  return {};
}
