import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmpresaForm, DadosBancariosForm } from "@/components/admin/EmpresaForm";

export default async function AdminEmpresaPage() {
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

  const [{ data: empresa }, { data: dadosBancarios }] = await Promise.all([
    supabase
      .from("empresas")
      .select("nome, cnpj, endereco, telefone, logo_url")
      .eq("id", usuario.empresa_id)
      .single(),
    supabase
      .from("dados_bancarios_empresa")
      .select("banco, agencia, conta, chave_pix")
      .eq("empresa_id", usuario.empresa_id)
      .maybeSingle(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Empresa</h1>
      <EmpresaForm
        empresa={{
          nome: empresa?.nome ?? "",
          cnpj: empresa?.cnpj ?? null,
          endereco: empresa?.endereco ?? null,
          telefone: empresa?.telefone ?? null,
          logoUrl: empresa?.logo_url ?? null,
        }}
      />
      <DadosBancariosForm
        dados={{
          banco: dadosBancarios?.banco ?? null,
          agencia: dadosBancarios?.agencia ?? null,
          conta: dadosBancarios?.conta ?? null,
          chavePix: dadosBancarios?.chave_pix ?? null,
        }}
      />
    </div>
  );
}
