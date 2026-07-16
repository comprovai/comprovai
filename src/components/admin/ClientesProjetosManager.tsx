"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  criarCliente,
  atualizarCliente,
  criarProjeto,
  atualizarProjeto,
} from "@/app/app/admin/clientes/actions";

export interface Cliente {
  id: string;
  nome: string;
  cnpj: string | null;
}

export interface Projeto {
  id: string;
  nome: string;
  codigo: string | null;
  clienteId: string | null;
  ativo: boolean;
}

function LinhaCliente({ cliente }: { cliente: Cliente }) {
  const [nome, setNome] = useState(cliente.nome);
  const [cnpj, setCnpj] = useState(cliente.cnpj ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function salvar() {
    setPending(true);
    setErro(null);
    const result = await atualizarCliente(cliente.id, { nome, cnpj: cnpj || null });
    setPending(false);
    if (result.error) setErro(result.error);
  }

  return (
    <tr className="border-b border-border-default last:border-0">
      <td className="px-3 py-2">
        <Input label="" value={nome} onChange={(e) => setNome(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <Input label="" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <Button variant="secondary" className="px-3 py-1 text-xs" disabled={pending} onClick={salvar}>
          Salvar
        </Button>
        {erro && <p className="mt-1 text-xs text-danger">{erro}</p>}
      </td>
    </tr>
  );
}

function LinhaProjeto({ projeto, clientes }: { projeto: Projeto; clientes: Cliente[] }) {
  const [nome, setNome] = useState(projeto.nome);
  const [codigo, setCodigo] = useState(projeto.codigo ?? "");
  const [clienteId, setClienteId] = useState(projeto.clienteId ?? "");
  const [ativo, setAtivo] = useState(projeto.ativo);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function salvar() {
    setPending(true);
    setErro(null);
    const result = await atualizarProjeto(projeto.id, {
      nome,
      codigo: codigo || null,
      clienteId: clienteId || null,
      ativo,
    });
    setPending(false);
    if (result.error) setErro(result.error);
  }

  return (
    <tr className="border-b border-border-default last:border-0">
      <td className="px-3 py-2">
        <Input label="" value={nome} onChange={(e) => setNome(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <Input label="" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-24" />
      </td>
      <td className="px-3 py-2">
        <Select label="" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Sem cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
      </td>
      <td className="px-3 py-2">
        <Button variant="secondary" className="px-3 py-1 text-xs" disabled={pending} onClick={salvar}>
          Salvar
        </Button>
        {erro && <p className="mt-1 text-xs text-danger">{erro}</p>}
      </td>
    </tr>
  );
}

export function ClientesProjetosManager({
  clientes,
  projetos,
}: {
  clientes: Cliente[];
  projetos: Projeto[];
}) {
  const clienteFormRef = useRef<HTMLFormElement>(null);
  const projetoFormRef = useRef<HTMLFormElement>(null);
  const [erroCliente, setErroCliente] = useState<string | null>(null);
  const [erroProjeto, setErroProjeto] = useState<string | null>(null);

  async function handleCriarCliente(formData: FormData) {
    setErroCliente(null);
    const result = await criarCliente(formData);
    if (result.error) {
      setErroCliente(result.error);
      return;
    }
    clienteFormRef.current?.reset();
  }

  async function handleCriarProjeto(formData: FormData) {
    setErroProjeto(null);
    const result = await criarProjeto(formData);
    if (result.error) {
      setErroProjeto(result.error);
      return;
    }
    projetoFormRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">Clientes</h2>
        <form
          ref={clienteFormRef}
          action={handleCriarCliente}
          className="mb-4 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
        >
          <Input label="Nome" name="nome" required className="w-52" />
          <Input label="CNPJ" name="cnpj" className="w-44" />
          <Button type="submit" variant="primary">
            Adicionar cliente
          </Button>
          {erroCliente && (
            <p className="w-full text-sm text-danger" role="alert">
              {erroCliente}
            </p>
          )}
        </form>
        <div className="overflow-x-auto rounded border border-border-default bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
                <th className="px-3 py-2 font-bold">Nome</th>
                <th className="px-3 py-2 font-bold">CNPJ</th>
                <th className="px-3 py-2 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <LinhaCliente key={c.id} cliente={c} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">
          Projetos / Propostas
        </h2>
        <form
          ref={projetoFormRef}
          action={handleCriarProjeto}
          className="mb-4 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
        >
          <Input label="Nome" name="nome" required className="w-52" />
          <Input label="Código" name="codigo" className="w-24" />
          <Select label="Cliente" name="cliente_id" defaultValue="" className="w-44">
            <option value="">Sem cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary">
            Adicionar projeto
          </Button>
          {erroProjeto && (
            <p className="w-full text-sm text-danger" role="alert">
              {erroProjeto}
            </p>
          )}
        </form>
        <div className="overflow-x-auto rounded border border-border-default bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
                <th className="px-3 py-2 font-bold">Nome</th>
                <th className="px-3 py-2 font-bold">Código</th>
                <th className="px-3 py-2 font-bold">Cliente</th>
                <th className="px-3 py-2 font-bold">Ativo</th>
                <th className="px-3 py-2 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((p) => (
                <LinhaProjeto key={p.id} projeto={p} clientes={clientes} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
