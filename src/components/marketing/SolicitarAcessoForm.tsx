"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { solicitarAcesso } from "@/app/actions";

export function SolicitarAcessoForm() {
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const result = await solicitarAcesso({
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      empresa: String(form.get("empresa") ?? ""),
      telefone: String(form.get("telefone") ?? ""),
      mensagem: String(form.get("mensagem") ?? ""),
    });

    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="rounded border border-border-default bg-surface p-6 text-center">
        <p className="text-sm font-bold text-brand">Solicitação enviada!</p>
        <p className="mt-2 text-sm text-text-subtle">
          Recebemos seus dados e vamos te responder em breve pra combinar os próximos passos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded border border-border-default bg-surface p-6 text-left">
      <Input name="nome" label="Nome" required />
      <Input name="email" type="email" label="E-mail" required />
      <Input name="empresa" label="Empresa" required />
      <Input name="telefone" label="Telefone (opcional)" />
      <Textarea name="mensagem" label="Conte um pouco sobre o seu processo de despesas (opcional)" />

      {erro && (
        <p className="text-sm text-danger" role="alert">
          {erro}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Solicitar acesso"}
      </Button>
    </form>
  );
}
