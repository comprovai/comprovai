"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [sessaoValida, setSessaoValida] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSessaoValida(!!data.session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setPending(false);

    if (error) {
      setErro("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (sessaoValida === null) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded border border-border-default bg-surface p-8">
        <h1 className="mb-1 text-xl font-bold text-brand">Redefinir senha</h1>

        {!sessaoValida ? (
          <p className="text-sm text-danger">
            Este link de redefinição é inválido ou expirou. Solicite um novo em &quot;Esqueci
            minha senha&quot; na tela de login.
          </p>
        ) : sucesso ? (
          <p className="text-sm text-success">Senha redefinida com sucesso. Redirecionando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="senha"
              type="password"
              label="Nova senha"
              minLength={6}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <Input
              name="confirmarSenha"
              type="password"
              label="Confirmar nova senha"
              minLength={6}
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />

            {erro && (
              <p className="text-sm text-danger" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={pending}>
              {pending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
