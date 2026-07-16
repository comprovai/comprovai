"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded border border-border-default bg-surface p-8">
        <h1 className="mb-1 text-xl font-bold text-brand">Comprovai</h1>
        <p className="mb-6 text-sm text-text-subtle">Entre com seu e-mail corporativo</p>

        <form action={formAction} className="flex flex-col gap-4">
          <Input name="email" type="email" label="E-mail" autoComplete="email" required />
          <Input
            name="password"
            type="password"
            label="Senha"
            autoComplete="current-password"
            required
          />

          {state.error && (
            <p className="text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <Link
            href="/esqueci-senha"
            className="text-center text-xs text-brand underline"
          >
            Esqueci minha senha
          </Link>
        </form>
      </div>
    </main>
  );
}
