import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { FinanceiroTable, type DespesaFinanceiro } from "@/components/financeiro/FinanceiroTable";
import { ROLE_HOME } from "@/lib/role-redirect";
import type { ExpenseStatus } from "@/types/expense";

interface FinanceiroPageProps {
  searchParams: Promise<{
    periodo_inicio?: string;
    periodo_fim?: string;
    colaborador_id?: string;
    cliente_id?: string;
    projeto_id?: string;
    categoria_id?: string;
    status?: string;
  }>;
}

const STATUS_FINANCEIRO: ExpenseStatus[] = ["aprovada", "financeiro", "lancada", "nota_gerada"];

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
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

  const [{ data: colaboradores }, { data: clientes }, { data: projetos }, { data: categorias }] =
    await Promise.all([
      supabase
        .from("usuarios")
        .select("id, nome")
        .eq("empresa_id", empresaId)
        .order("nome"),
      supabase.from("clientes").select("id, nome").eq("empresa_id", empresaId).order("nome"),
      supabase
        .from("projetos_propostas")
        .select("id, nome")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("categorias_despesa")
        .select("id, nome")
        .eq("empresa_id", empresaId)
        .order("nome"),
    ]);

  let query = supabase
    .from("despesas")
    .select(
      "id, data_despesa, valor, tipo, status, fornecedor, categorias_despesa(nome), usuarios!despesas_colaborador_id_fkey(nome), projetos_propostas(nome), clientes(nome)"
    )
    .in("status", STATUS_FINANCEIRO);

  if (filtros.status) query = query.eq("status", filtros.status);
  if (filtros.periodo_inicio) query = query.gte("data_despesa", filtros.periodo_inicio);
  if (filtros.periodo_fim) query = query.lte("data_despesa", filtros.periodo_fim);
  if (filtros.colaborador_id) query = query.eq("colaborador_id", filtros.colaborador_id);
  if (filtros.cliente_id) query = query.eq("cliente_id", filtros.cliente_id);
  if (filtros.projeto_id) query = query.eq("projeto_id", filtros.projeto_id);
  if (filtros.categoria_id) query = query.eq("categoria_id", filtros.categoria_id);

  const { data: despesasBrutas } = await query.order("data_despesa", { ascending: false });

  const despesas: DespesaFinanceiro[] = (despesasBrutas ?? []).map((d) => ({
    id: d.id,
    dataDespesa: d.data_despesa,
    colaboradorNome: d.usuarios?.nome ?? "—",
    categoriaNome: d.categorias_despesa?.nome ?? "Sem categoria",
    fornecedor: d.fornecedor ?? "—",
    valor: d.valor,
    tipo: d.tipo as DespesaFinanceiro["tipo"],
    status: d.status as ExpenseStatus,
    projetoNome: d.projetos_propostas?.nome ?? null,
    clienteNome: d.clientes?.nome ?? null,
  }));

  // Cards de resumo: 1 e 2 são fotografia atual (não respeitam o período);
  // 3 e 4 são "no período", usando o mesmo filtro de data_despesa da tabela.
  const { data: pendentesAprovacao } = await supabase
    .from("despesas")
    .select("valor")
    .eq("empresa_id", empresaId)
    .eq("status", "enviada");

  const { data: aprovadosAguardando } = await supabase
    .from("despesas")
    .select("valor")
    .eq("empresa_id", empresaId)
    .eq("status", "aprovada");

  let queryReembolsado = supabase
    .from("despesas")
    .select("valor")
    .eq("empresa_id", empresaId)
    .eq("status", "lancada")
    .in("tipo", ["reembolso", "ambos"]);
  if (filtros.periodo_inicio) queryReembolsado = queryReembolsado.gte("data_despesa", filtros.periodo_inicio);
  if (filtros.periodo_fim) queryReembolsado = queryReembolsado.lte("data_despesa", filtros.periodo_fim);
  const { data: reembolsadoPeriodo } = await queryReembolsado;

  let queryNotaGerada = supabase
    .from("despesas")
    .select("valor")
    .eq("empresa_id", empresaId)
    .eq("status", "nota_gerada")
    .in("tipo", ["nota_debito", "ambos"]);
  if (filtros.periodo_inicio) queryNotaGerada = queryNotaGerada.gte("data_despesa", filtros.periodo_inicio);
  if (filtros.periodo_fim) queryNotaGerada = queryNotaGerada.lte("data_despesa", filtros.periodo_fim);
  const { data: notaGeradaPeriodo } = await queryNotaGerada;

  const somar = (linhas: { valor: number }[] | null) =>
    (linhas ?? []).reduce((total, l) => total + l.valor, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-brand">Financeiro</h1>
        <Link
          href="/app/financeiro/gerar-documento"
          className="rounded border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/5"
        >
          Gerar Nota de Débito / Recibo de Reembolso
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap divide-x divide-border-default rounded border border-border-default bg-surface">
        <div className="flex-1 px-5 py-4">
          <p className="mb-1 text-xs text-text-subtle">Pendente de aprovação</p>
          <MoneyDisplay value={somar(pendentesAprovacao)} size="lg" />
        </div>
        <div className="flex-1 px-5 py-4">
          <p className="mb-1 text-xs text-text-subtle">Aprovado aguardando financeiro</p>
          <MoneyDisplay value={somar(aprovadosAguardando)} size="lg" />
        </div>
        <div className="flex-1 px-5 py-4">
          <p className="mb-1 text-xs text-text-subtle">Reembolsado no período</p>
          <MoneyDisplay value={somar(reembolsadoPeriodo)} size="lg" />
        </div>
        <div className="flex-1 px-5 py-4">
          <p className="mb-1 text-xs text-text-subtle">Em notas de débito no período</p>
          <MoneyDisplay value={somar(notaGeradaPeriodo)} size="lg" />
        </div>
      </div>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-xs text-text-default">
          De
          <input
            type="date"
            name="periodo_inicio"
            defaultValue={filtros.periodo_inicio}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Até
          <input
            type="date"
            name="periodo_fim"
            defaultValue={filtros.periodo_fim}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Colaborador
          <select
            name="colaborador_id"
            defaultValue={filtros.colaborador_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {(colaboradores ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Cliente
          <select
            name="cliente_id"
            defaultValue={filtros.cliente_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {(clientes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Projeto
          <select
            name="projeto_id"
            defaultValue={filtros.projeto_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {(projetos ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Categoria
          <select
            name="categoria_id"
            defaultValue={filtros.categoria_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {(categorias ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Status
          <select
            name="status"
            defaultValue={filtros.status ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="aprovada">Aprovada</option>
            <option value="financeiro">Em financeiro</option>
            <option value="lancada">Lançada</option>
            <option value="nota_gerada">Nota gerada</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded bg-brand px-4 py-1.5 text-sm font-bold text-white"
        >
          Filtrar
        </button>
      </form>

      <FinanceiroTable despesasIniciais={despesas} statusFiltro={filtros.status ?? null} />
    </div>
  );
}
