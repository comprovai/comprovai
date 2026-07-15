"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

const ROLE_REDIRECT: Record<string, string> = {
  colaborador: "/app/minhas-despesas",
  aprovador: "/app/aprovacoes",
  financeiro: "/app/financeiro",
  admin: "/app/admin",
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const destino = usuario?.role ? ROLE_REDIRECT[usuario.role] : undefined;

  redirect(destino ?? "/login");
}
