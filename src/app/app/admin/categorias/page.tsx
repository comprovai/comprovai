import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoriasManager } from "@/components/admin/CategoriasManager";

export default async function AdminCategoriasPage() {
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

  const { data: categorias } = await supabase
    .from("categorias_despesa")
    .select("id, nome, limite_valor")
    .eq("empresa_id", usuario.empresa_id)
    .order("nome");

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Categorias de despesa</h1>
      <CategoriasManager
        categorias={(categorias ?? []).map((c) => ({
          id: c.id,
          nome: c.nome,
          limiteValor: c.limite_valor,
        }))}
      />
    </div>
  );
}
