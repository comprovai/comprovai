import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientesProjetosManager } from "@/components/admin/ClientesProjetosManager";

export default async function AdminClientesPage() {
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

  const [{ data: clientes }, { data: projetos }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome, cnpj")
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
    supabase
      .from("projetos_propostas")
      .select("id, nome, codigo, cliente_id, ativo")
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Clientes e Projetos</h1>
      <ClientesProjetosManager
        clientes={clientes ?? []}
        projetos={(projetos ?? []).map((p) => ({
          id: p.id,
          nome: p.nome,
          codigo: p.codigo,
          clienteId: p.cliente_id,
          ativo: p.ativo,
        }))}
      />
    </div>
  );
}
