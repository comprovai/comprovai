import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { SincronizarPendentes } from "@/components/despesas/SincronizarPendentes";
import type { ExpenseStatus } from "@/types/expense";

const ORDEM_STATUS: ExpenseStatus[] = [
  "rascunho",
  "reprovada",
  "enviada",
  "aprovada",
  "financeiro",
  "lancada",
  "nota_gerada",
];

export default async function MinhasDespesasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: despesas } = await supabase
    .from("despesas")
    .select("id, valor, data_despesa, fornecedor, status, categorias_despesa(nome)")
    .eq("colaborador_id", user.id)
    .order("criado_em", { ascending: false });

  const grupos = new Map<ExpenseStatus, typeof despesas>();
  for (const despesa of despesas ?? []) {
    const status = despesa.status as ExpenseStatus;
    const lista = grupos.get(status) ?? [];
    lista.push(despesa);
    grupos.set(status, lista);
  }

  const temDespesas = (despesas ?? []).length > 0;

  return (
    <div className="pb-24">
      <h1 className="mb-6 text-lg font-bold text-brand">Minhas despesas</h1>

      <SincronizarPendentes />

      {!temDespesas && (
        <p className="text-sm text-text-subtle">
          Você ainda não lançou nenhuma despesa. Toque no + para começar.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {ORDEM_STATUS.filter((status) => grupos.has(status)).map((status) => (
          <section key={status}>
            <div className="mb-3">
              <StatusStamp status={status} />
            </div>
            <div className="flex flex-col gap-3">
              {grupos.get(status)?.map((despesa) => {
                const conteudo = (
                  <ReceiptCard
                    valor={despesa.valor}
                    categoria={despesa.categorias_despesa?.nome ?? "Sem categoria"}
                    data={despesa.data_despesa}
                    fornecedor={despesa.fornecedor ?? "—"}
                    status={status}
                  />
                );

                return status === "reprovada" || status === "rascunho" ? (
                  <Link key={despesa.id} href={`/app/minhas-despesas/${despesa.id}`}>
                    {conteudo}
                  </Link>
                ) : (
                  <div key={despesa.id}>{conteudo}</div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/app/minhas-despesas/nova"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded bg-primary text-white"
        aria-label="Lançar nova despesa"
      >
        <Plus size={24} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
