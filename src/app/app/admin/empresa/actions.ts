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

export async function atualizarEmpresa(formData: FormData): Promise<AcaoResult> {
  const { empresaId, redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");
  if (!empresaId) return { error: "Empresa não encontrada." };

  const nome = String(formData.get("nome") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim() || null;
  const endereco = String(formData.get("endereco") ?? "").trim() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  if (!nome) return { error: "Informe o nome da empresa." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({ nome, cnpj, endereco, telefone, logo_url: logoUrl })
    .eq("id", empresaId);

  if (error) return { error: "Não foi possível salvar os dados da empresa." };

  revalidatePath("/app/admin/empresa");
  return {};
}

export async function atualizarDadosBancarios(formData: FormData): Promise<AcaoResult> {
  const { empresaId, redirectLogin } = await getEmpresaId();
  if (redirectLogin) redirect("/login");
  if (!empresaId) return { error: "Empresa não encontrada." };

  const banco = String(formData.get("banco") ?? "").trim() || null;
  const agencia = String(formData.get("agencia") ?? "").trim() || null;
  const conta = String(formData.get("conta") ?? "").trim() || null;
  const chavePix = String(formData.get("chave_pix") ?? "").trim() || null;

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("dados_bancarios_empresa")
    .select("id")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  const dados = { banco, agencia, conta, chave_pix: chavePix };

  const { error } = existente
    ? await supabase.from("dados_bancarios_empresa").update(dados).eq("id", existente.id)
    : await supabase.from("dados_bancarios_empresa").insert({ empresa_id: empresaId, ...dados });

  if (error) return { error: "Não foi possível salvar os dados bancários." };

  revalidatePath("/app/admin/empresa");
  return {};
}
