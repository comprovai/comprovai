"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/role-redirect";

export interface LoginState {
  error?: string;
}

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

  const destino = usuario?.role ? ROLE_HOME[usuario.role] : undefined;

  redirect(destino ?? "/login");
}
