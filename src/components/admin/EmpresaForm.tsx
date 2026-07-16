"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { atualizarEmpresa, atualizarDadosBancarios, type AcaoResult } from "@/app/app/admin/empresa/actions";

const initialState: AcaoResult = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {children}
    </Button>
  );
}

export interface EmpresaData {
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  logoUrl: string | null;
}

export interface DadosBancariosData {
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  chavePix: string | null;
}

export function EmpresaForm({ empresa }: { empresa: EmpresaData }) {
  const [state, formAction] = useFormState(
    async (_prev: AcaoResult, formData: FormData) => atualizarEmpresa(formData),
    initialState
  );

  return (
    <form action={formAction} className="mb-8 flex flex-col gap-4 rounded border border-border-default bg-surface p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Dados da empresa</h2>
      <Input label="Nome" name="nome" defaultValue={empresa.nome} required />
      <Input label="CNPJ" name="cnpj" defaultValue={empresa.cnpj ?? ""} />
      <Input label="Endereço" name="endereco" defaultValue={empresa.endereco ?? ""} />
      <Input label="Telefone" name="telefone" defaultValue={empresa.telefone ?? ""} />
      <Input label="URL do logo" name="logo_url" defaultValue={empresa.logoUrl ?? ""} />
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton>Salvar dados da empresa</SubmitButton>
    </form>
  );
}

export function DadosBancariosForm({ dados }: { dados: DadosBancariosData }) {
  const [state, formAction] = useFormState(
    async (_prev: AcaoResult, formData: FormData) => atualizarDadosBancarios(formData),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded border border-border-default bg-surface p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Dados bancários</h2>
      <Input label="Banco" name="banco" defaultValue={dados.banco ?? ""} />
      <Input label="Agência" name="agencia" defaultValue={dados.agencia ?? ""} />
      <Input label="Conta" name="conta" defaultValue={dados.conta ?? ""} />
      <Input label="Chave PIX" name="chave_pix" defaultValue={dados.chavePix ?? ""} />
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton>Salvar dados bancários</SubmitButton>
    </form>
  );
}
