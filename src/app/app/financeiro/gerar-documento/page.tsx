import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/role-redirect";
import { GerarNotaForm } from "@/components/documentos/GerarNotaForm";

interface GerarDocumentoPageProps {
  searchParams: Promise<{
    cliente_id?: string;
    projeto_id?: string;
  }>;
}

export default async function GerarDocumentoPage({ searchParams }: GerarDocumentoPageProps) {
  const filtros = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id, role")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/login");
  }

  if (usuario.role !== "financeiro") {
    redirect(ROLE_HOME[usuario.role] ?? "/login");
  }

  const empresaId = usuario.empresa_id;

  const [{ data: clientes }, { data: projetos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("empresa_id", empresaId).order("nome"),
    supabase
      .from("projetos_propostas")
      .select("id, nome, cliente_id")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("nome"),
  ]);

  const projetosDoCliente = filtros.cliente_id
    ? (projetos ?? []).filter((p) => p.cliente_id === filtros.cliente_id)
    : [];

  let despesas: {
    id: string;
    dataDespesa: string;
    fornecedor: string;
    categoriaNome: string;
    valor: number;
  }[] = [];

  if (filtros.cliente_id && filtros.projeto_id) {
    const { data: despesasBrutas } = await supabase
      .from("despesas")
      .select("id, data_despesa, fornecedor, valor, categorias_despesa(nome)")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", filtros.cliente_id)
      .eq("projeto_id", filtros.projeto_id)
      .eq("status", "financeiro")
      .in("tipo", ["nota_debito", "ambos"])
      .order("data_despesa", { ascending: true });

    despesas = (despesasBrutas ?? []).map((d) => ({
      id: d.id,
      dataDespesa: d.data_despesa,
      fornecedor: d.fornecedor ?? "—",
      categoriaNome: d.categorias_despesa?.nome ?? "Sem categoria",
      valor: d.valor,
    }));
  }

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Gerar Nota de Débito</h1>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Cliente
          <select
            name="cliente_id"
            defaultValue={filtros.cliente_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Selecione...</option>
            {(clientes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Projeto/proposta
          <select
            name="projeto_id"
            defaultValue={filtros.projeto_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Selecione...</option>
            {projetosDoCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-brand px-4 py-1.5 text-sm font-bold text-white">
          Buscar
        </button>
      </form>

      {filtros.cliente_id && filtros.projeto_id ? (
        <GerarNotaForm
          clienteId={filtros.cliente_id}
          projetoId={filtros.projeto_id}
          despesas={despesas}
        />
      ) : (
        <p className="text-sm text-text-subtle">
          Selecione um cliente e um projeto/proposta para ver as despesas elegíveis.
        </p>
      )}
    </div>
  );
}
