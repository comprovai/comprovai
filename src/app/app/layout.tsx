import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { logout } from "./actions";

const NAV_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  colaborador: [
    { href: "/app/minhas-despesas", label: "Minhas despesas" },
    { href: "/app/minhas-despesas/recibos", label: "Recibos" },
  ],
  aprovador: [{ href: "/app/aprovacoes", label: "Aprovações" }],
  financeiro: [{ href: "/app/financeiro", label: "Financeiro" }],
  admin: [
    { href: "/app/admin/usuarios", label: "Usuários" },
    { href: "/app/admin/clientes", label: "Clientes e Projetos" },
    { href: "/app/admin/categorias", label: "Categorias" },
    { href: "/app/admin/empresa", label: "Empresa" },
  ],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nome, role, empresa_id")
    .eq("id", user.id)
    .single();

  const { data: empresa } = usuario
    ? await supabase.from("empresas").select("nome").eq("id", usuario.empresa_id).single()
    : { data: null };

  const navItems = usuario?.role ? (NAV_BY_ROLE[usuario.role] ?? []) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar
        navItems={navItems}
        nome={usuario?.nome ?? ""}
        empresaNome={empresa?.nome ?? ""}
        onSignOut={logout}
      />
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      <ChatWidget role={usuario?.role} />
    </div>
  );
}
