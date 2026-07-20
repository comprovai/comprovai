"use server";

import { createClient } from "@/lib/supabase/server";

export interface SolicitarAcessoInput {
  nome: string;
  email: string;
  empresa: string;
  telefone?: string;
  mensagem?: string;
}

export interface SolicitarAcessoResult {
  error?: string;
}

export async function solicitarAcesso(
  input: SolicitarAcessoInput
): Promise<SolicitarAcessoResult> {
  if (!input.nome.trim() || !input.email.trim() || !input.empresa.trim()) {
    return { error: "Preencha nome, e-mail e empresa." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("leads").insert({
    nome: input.nome,
    email: input.email,
    empresa: input.empresa,
    telefone: input.telefone || null,
    mensagem: input.mensagem || null,
  });

  if (error) {
    return { error: "Não foi possível enviar sua solicitação. Tente novamente." };
  }

  return {};
}
