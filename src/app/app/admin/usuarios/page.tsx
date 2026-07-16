import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NovoUsuarioForm } from "@/components/admin/NovoUsuarioForm";
import { UsuariosTable } from "@/components/admin/UsuariosTable";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuarioAtual } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuarioAtual) {
    redirect("/login");
  }

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nome, email, role, gestor_id, ativo")
    .eq("empresa_id", usuarioAtual.empresa_id)
    .order("nome");

  const aprovadores = (usuarios ?? [])
    .filter((u) => u.role === "aprovador")
    .map((u) => ({ id: u.id, nome: u.nome }));

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Usuários</h1>

      <NovoUsuarioForm aprovadores={aprovadores} />

      <div className="overflow-x-auto rounded border border-border-default bg-surface">
        <UsuariosTable
          usuarios={(usuarios ?? []).map((u) => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            role: u.role,
            gestorId: u.gestor_id,
            ativo: u.ativo,
          }))}
          aprovadores={aprovadores}
        />
      </div>
    </div>
  );
}
