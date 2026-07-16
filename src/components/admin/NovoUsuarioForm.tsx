"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { criarUsuario } from "@/app/app/admin/usuarios/actions";

interface NovoUsuarioFormProps {
  aprovadores: { id: string; nome: string }[];
}

export function NovoUsuarioForm({ aprovadores }: NovoUsuarioFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErro(null);
    const result = await criarUsuario(formData);
    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-6 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
    >
      <Input label="Nome" name="nome" required className="w-40" />
      <Input label="E-mail" name="email" type="email" required className="w-52" />
      <Input label="Senha inicial" name="senha" type="password" minLength={6} required className="w-36" />
      <Select label="Papel" name="role" defaultValue="colaborador" className="w-36">
        <option value="colaborador">Colaborador</option>
        <option value="aprovador">Aprovador</option>
        <option value="financeiro">Financeiro</option>
        <option value="admin">Admin</option>
      </Select>
      <Select label="Gestor" name="gestor_id" defaultValue="" className="w-40">
        <option value="">Sem gestor</option>
        {aprovadores.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="primary" disabled={pending}>
        Criar usuário
      </Button>
      {erro && (
        <p className="w-full text-sm text-danger" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
