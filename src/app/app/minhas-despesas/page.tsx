import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SincronizarPendentes } from "@/components/despesas/SincronizarPendentes";
import { MinhasDespesasList } from "@/components/despesas/MinhasDespesasList";

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

  return (
    <div className="pb-24">
      <h1 className="mb-6 text-lg font-bold text-brand">Minhas despesas</h1>

      <SincronizarPendentes />

      <MinhasDespesasList despesasIniciais={despesas ?? []} />

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
