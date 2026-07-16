"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AcaoResult {
  error?: string;
}

export async function criarCategoria(formData: FormData): Promise<AcaoResult> {
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

  if (!usuario) return { error: "Empresa não encontrada." };

  const nome = String(formData.get("nome") ?? "").trim();
  const limiteRaw = String(formData.get("limite_valor") ?? "").trim();
  const limiteValor = limiteRaw ? Number(limiteRaw.replace(",", ".")) : null;

  if (!nome) return { error: "Informe o nome da categoria." };

  const { error } = await supabase
    .from("categorias_despesa")
    .insert({ empresa_id: usuario.empresa_id, nome, limite_valor: limiteValor });

  if (error) return { error: "Não foi possível criar a categoria." };

  revalidatePath("/app/admin/categorias");
  return {};
}

export async function atualizarCategoria(
  id: string,
  dados: { nome: string; limiteValor: number | null }
): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!dados.nome.trim()) return { error: "Informe o nome da categoria." };

  const { error } = await supabase
    .from("categorias_despesa")
    .update({ nome: dados.nome, limite_valor: dados.limiteValor })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar a categoria." };

  revalidatePath("/app/admin/categorias");
  return {};
}
