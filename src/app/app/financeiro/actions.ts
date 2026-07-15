"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AcaoResult {
  error?: string;
}

export async function moverParaFinanceiro(despesaId: string): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("despesas")
    .update({ status: "financeiro" })
    .eq("id", despesaId);

  if (error) {
    return { error: "Não foi possível mover a despesa para financeiro." };
  }

  revalidatePath("/app/financeiro");
  return {};
}

export async function marcarComoReembolsado(
  despesaId: string,
  dataPagamento: string
): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!dataPagamento) {
    return { error: "Informe a data de pagamento." };
  }

  const { error } = await supabase
    .from("despesas")
    .update({ status: "lancada", data_pagamento: dataPagamento })
    .eq("id", despesaId);

  if (error) {
    return { error: "Não foi possível marcar a despesa como reembolsada." };
  }

  revalidatePath("/app/financeiro");
  return {};
}
