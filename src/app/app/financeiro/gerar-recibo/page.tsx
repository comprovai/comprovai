import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/role-redirect";
import { GerarReciboForm } from "@/components/documentos/GerarReciboForm";

interface GerarReciboPageProps {
  searchParams: Promise<{ colaborador_id?: string }>;
}

export default async function GerarReciboPage({ searchParams }: GerarReciboPageProps) {
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

  const { data: colaboradores } = await supabase
    .from("usuarios")
    .select("id, nome")
    .eq("empresa_id", empresaId)
    .order("nome");

  let despesas: {
    id: string;
    dataDespesa: string;
    fornecedor: string;
    categoriaNome: string;
    valor: number;
  }[] = [];

  if (filtros.colaborador_id) {
    const { data: despesasBrutas } = await supabase
      .from("despesas")
      .select("id, data_despesa, fornecedor, valor, categorias_despesa(nome)")
      .eq("empresa_id", empresaId)
      .eq("colaborador_id", filtros.colaborador_id)
      .eq("status", "lancada")
      .in("tipo", ["reembolso", "ambos"])
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
      <h1 className="mb-6 text-lg font-bold text-brand">Gerar Recibo de Reembolso</h1>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-border-default bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-xs text-text-default">
          Colaborador
          <select
            name="colaborador_id"
            defaultValue={filtros.colaborador_id ?? ""}
            className="rounded border border-border-default px-2 py-1.5 text-sm"
          >
            <option value="">Selecione...</option>
            {(colaboradores ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-brand px-4 py-1.5 text-sm font-bold text-white">
          Buscar
        </button>
      </form>

      {filtros.colaborador_id ? (
        <GerarReciboForm colaboradorId={filtros.colaborador_id} despesas={despesas} />
      ) : (
        <p className="text-sm text-text-subtle">Selecione um colaborador para ver as despesas elegíveis.</p>
      )}
    </div>
  );
}
