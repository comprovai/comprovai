"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { criarCategoria, atualizarCategoria } from "@/app/app/admin/categorias/actions";

export interface Categoria {
  id: string;
  nome: string;
  limiteValor: number | null;
}

function LinhaCategoria({ categoria }: { categoria: Categoria }) {
  const [nome, setNome] = useState(categoria.nome);
  const [limite, setLimite] = useState(categoria.limiteValor?.toString().replace(".", ",") ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function salvar() {
    setPending(true);
    setErro(null);
    const limiteValor = limite.trim() ? Number(limite.replace(",", ".")) : null;
    const result = await atualizarCategoria(categoria.id, { nome, limiteValor });
    setPending(false);
    if (result.error) setErro(result.error);
  }

  return (
    <tr className="border-b border-border-default last:border-0">
      <td className="px-3 py-2">
        <Input label="" value={nome} onChange={(e) => setNome(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <Input
          label=""
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          placeholder="Sem limite"
          className="w-32"
        />
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

export function CategoriasManager({ categorias }: { categorias: Categoria[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCriar(formData: FormData) {
    setErro(null);
    const result = await criarCategoria(formData);
    if (result.error) {
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleCriar}
        className="mb-4 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
      >
        <Input label="Nome" name="nome" required className="w-52" />
        <Input label="Limite de valor (opcional)" name="limite_valor" placeholder="0,00" className="w-40" />
        <Button type="submit" variant="primary">
          Adicionar categoria
        </Button>
        {erro && (
          <p className="w-full text-sm text-danger" role="alert">
            {erro}
          </p>
        )}
      </form>
      <div className="overflow-x-auto rounded border border-border-default bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 font-bold">Nome</th>
              <th className="px-3 py-2 font-bold">Limite de valor</th>
              <th className="px-3 py-2 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <LinhaCategoria key={c.id} categoria={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
