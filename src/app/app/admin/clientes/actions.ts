"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AcaoResult {
  error?: string;
}

async function getEmpresaId(): Promise<{ empresaId?: string; redirectLogin?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { redirectLogin: true };

  const { data } = await supabase.from("usuarios").select("empresa_id").eq("id", user.id).single();
  return { empresaId: data?.empresa_id };
}

export async function criarCliente(formData: FormData): Promise<AcaoResult> {
  const { empresaId, redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");
  if (!empresaId) return { error: "Empresa não encontrada." };

  const nome = String(formData.get("nome") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim() || null;

  if (!nome) return { error: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert({ empresa_id: empresaId, nome, cnpj });

  if (error) return { error: "Não foi possível criar o cliente." };

  revalidatePath("/app/admin/clientes");
  return {};
}

export async function atualizarCliente(
  id: string,
  dados: { nome: string; cnpj: string | null }
): Promise<AcaoResult> {
  const { redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");

  if (!dados.nome.trim()) return { error: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ nome: dados.nome, cnpj: dados.cnpj })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar o cliente." };

  revalidatePath("/app/admin/clientes");
  return {};
}

export async function criarProjeto(formData: FormData): Promise<AcaoResult> {
  const { empresaId, redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");
  if (!empresaId) return { error: "Empresa não encontrada." };

  const nome = String(formData.get("nome") ?? "").trim();
  const codigo = String(formData.get("codigo") ?? "").trim() || null;
  const clienteId = String(formData.get("cliente_id") ?? "") || null;

  if (!nome) return { error: "Informe o nome do projeto/proposta." };

  const supabase = await createClient();
  const { error } = await supabase.from("projetos_propostas").insert({
    empresa_id: empresaId,
    nome,
    codigo,
    cliente_id: clienteId,
    ativo: true,
  });

  if (error) return { error: "Não foi possível criar o projeto/proposta." };

  revalidatePath("/app/admin/clientes");
  return {};
}

export async function atualizarProjeto(
  id: string,
  dados: { nome: string; codigo: string | null; clienteId: string | null; ativo: boolean }
): Promise<AcaoResult> {
  const { redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");

  if (!dados.nome.trim()) return { error: "Informe o nome do projeto/proposta." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projetos_propostas")
    .update({
      nome: dados.nome,
      codigo: dados.codigo,
      cliente_id: dados.clienteId,
      ativo: dados.ativo,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar o projeto/proposta." };

  revalidatePath("/app/admin/clientes");
  return {};
}
