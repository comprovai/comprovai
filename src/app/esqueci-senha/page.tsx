"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    setPending(false);

    if (error) {
      setErro("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded border border-border-default bg-surface p-8">
        <h1 className="mb-1 text-xl font-bold text-brand">Esqueci minha senha</h1>
        <p className="mb-6 text-sm text-text-subtle">
          Informe seu e-mail corporativo para receber um link de redefinição.
        </p>

        {enviado ? (
          <p className="text-sm text-success">
            Se esse e-mail existir na nossa base, você vai receber um link de redefinição em
            instantes. Confira também a caixa de spam.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              label="E-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {erro && (
              <p className="text-sm text-danger" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={pending}>
              {pending ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>
        )}

        <Link href="/login" className="mt-4 block text-center text-xs text-brand underline">
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
