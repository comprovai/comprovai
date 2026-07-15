import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DespesaForm } from "@/components/despesas/DespesaForm";

export default async function NovaDespesaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/login");
  }

  const [{ data: categorias }, { data: projetos }] = await Promise.all([
    supabase
      .from("categorias_despesa")
      .select("id, nome")
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
    supabase
      .from("projetos_propostas")
      .select("id, nome, cliente_id, clientes(nome)")
      .eq("empresa_id", usuario.empresa_id)
      .eq("ativo", true)
      .order("nome"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Nova despesa</h1>
      <DespesaForm
        categorias={categorias ?? []}
        projetos={(projetos ?? []).map((p) => ({
          id: p.id,
          nome: p.nome,
          clienteId: p.cliente_id,
          clienteNome: p.clientes?.nome ?? null,
        }))}
      />
    </div>
  );
}
