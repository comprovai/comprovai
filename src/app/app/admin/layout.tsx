import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/role-redirect";

const ABAS = [
  { href: "/app/admin/usuarios", label: "Usuários" },
  { href: "/app/admin/clientes", label: "Clientes e Projetos" },
  { href: "/app/admin/categorias", label: "Categorias" },
  { href: "/app/admin/empresa", label: "Empresa" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/login");
  }

  if (usuario.role !== "admin") {
    redirect(ROLE_HOME[usuario.role] ?? "/login");
  }

  return (
    <div>
      <nav className="mb-6 flex gap-4 border-b border-border-default">
        {ABAS.map((aba) => (
          <Link
            key={aba.href}
            href={aba.href}
            className="border-b-2 border-transparent px-1 pb-3 text-sm font-bold text-text-subtle hover:text-brand"
          >
            {aba.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
