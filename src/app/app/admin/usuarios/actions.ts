"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AcaoResult {
  error?: string;
}

const ROLES_VALIDOS = ["colaborador", "aprovador", "financeiro", "admin"];

export async function criarUsuario(formData: FormData): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return { error: "Usuário administrador não encontrado." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const role = String(formData.get("role") ?? "");
  const gestorId = String(formData.get("gestor_id") ?? "") || null;

  if (!nome || !email || senha.length < 6 || !ROLES_VALIDOS.includes(role)) {
    return { error: "Preencha nome, e-mail, senha (mín. 6 caracteres) e papel válido." };
  }

  const adminClient = createAdminClient();

  const { data: novoUsuario, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (authError || !novoUsuario.user) {
    return { error: `Não foi possível criar o login: ${authError?.message ?? "erro desconhecido"}` };
  }

  const { error: perfilError } = await supabase.from("usuarios").insert({
    id: novoUsuario.user.id,
    empresa_id: admin.empresa_id,
    nome,
    email,
    role,
    gestor_id: gestorId,
    ativo: true,
  });

  if (perfilError) {
    return { error: "Login criado, mas não foi possível salvar o perfil do usuário." };
  }

  revalidatePath("/app/admin/usuarios");
  return {};
}

export async function atualizarUsuario(
  id: string,
  dados: { role: string; gestorId: string | null; ativo: boolean }
): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!ROLES_VALIDOS.includes(dados.role)) {
    return { error: "Papel inválido." };
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ role: dados.role, gestor_id: dados.gestorId, ativo: dados.ativo })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o usuário." };
  }

  revalidatePath("/app/admin/usuarios");
  return {};
}

export async function resetarSenha(id: string, novaSenha: string): Promise<AcaoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (novaSenha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(id, { password: novaSenha });

  if (error) {
    return { error: "Não foi possível trocar a senha." };
  }

  return {};
}
