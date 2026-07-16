"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export interface SalvarDespesaInput {
  despesaId?: string;
  valor: number;
  dataDespesa: string;
  categoriaId: string;
  fornecedor: string;
  cnpjFornecedor?: string | null;
  projetoId?: string | null;
  clienteId?: string | null;
  tipo: "reembolso" | "nota_debito" | "ambos";
  comprovantePath?: string | null;
  extracaoIa?: Json | null;
  enviar: boolean;
  criadoOffline?: boolean;
  /** Usado pela sincronização em segundo plano: evita o redirect ao final. */
  skipRedirect?: boolean;
}

export interface SalvarDespesaResult {
  error?: string;
}

export async function salvarDespesa(input: SalvarDespesaInput): Promise<SalvarDespesaResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return { error: "Usuário não encontrado." };
  }

  const dadosBase = {
    empresa_id: usuario.empresa_id,
    colaborador_id: user.id,
    valor: input.valor,
    data_despesa: input.dataDespesa,
    categoria_id: input.categoriaId,
    fornecedor: input.fornecedor,
    projeto_id: input.projetoId ?? null,
    cliente_id: input.clienteId ?? null,
    tipo: input.tipo,
    confirmado_colaborador: true,
    origem_ia: input.extracaoIa ?? null,
    criado_offline: input.criadoOffline ?? false,
  };

  let despesaId = input.despesaId;

  if (despesaId) {
    // A política de UPDATE só permite alterar despesas em rascunho/enviada
    // (colaborador) ou reprovada (para corrigir e reenviar). O status final
    // é setado nesse mesmo UPDATE — o RLS valida o status ATUAL da linha,
    // não o novo valor.
    const { error } = await supabase
      .from("despesas")
      .update({ ...dadosBase, status: input.enviar ? "enviada" : "rascunho" })
      .eq("id", despesaId);

    if (error) {
      return { error: "Não foi possível salvar a despesa." };
    }
  } else {
    // Uma despesa nova só pode ser INSERIDA com status rascunho/reprovada
    // (política despesas_insert_colaborador). Para "enviar", primeiro
    // insere como rascunho e depois faz um UPDATE pra 'enviada' — esse sim
    // permitido pela política de update do colaborador.
    const { data, error } = await supabase
      .from("despesas")
      .insert({ ...dadosBase, status: "rascunho" })
      .select("id")
      .single();

    if (error || !data) {
      return { error: "Não foi possível salvar a despesa." };
    }
    despesaId = data.id;

    if (input.enviar) {
      const { error: updateError } = await supabase
        .from("despesas")
        .update({ status: "enviada" })
        .eq("id", despesaId);

      if (updateError) {
        return { error: "Despesa salva como rascunho, mas não foi possível enviar para aprovação." };
      }
    }
  }

  if (input.comprovantePath) {
    await supabase.from("comprovantes").insert({
      despesa_id: despesaId,
      url_arquivo: input.comprovantePath,
      extraido_ia: input.extracaoIa ?? null,
    });
  }

  if (input.enviar) {
    await supabase.from("historico_aprovacao").insert({
      despesa_id: despesaId,
      usuario_id: user.id,
      acao: "enviado",
    });
  }

  revalidatePath("/app/minhas-despesas");

  if (input.skipRedirect) {
    return {};
  }

  redirect("/app/minhas-despesas");
}
