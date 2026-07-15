import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DespesaForm } from "@/components/despesas/DespesaForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarDespesaPage({ params }: PageProps) {
  const { id } = await params;
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

  const { data: despesa } = await supabase
    .from("despesas")
    .select("*")
    .eq("id", id)
    .single();

  if (!despesa || despesa.colaborador_id !== user.id || !["rascunho", "reprovada"].includes(despesa.status)) {
    redirect("/app/minhas-despesas");
  }

  const { data: comprovante } = await supabase
    .from("comprovantes")
    .select("url_arquivo")
    .eq("despesa_id", id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  let comprovanteUrl: string | null = null;
  if (comprovante?.url_arquivo) {
    const admin = createAdminClient();
    const { data: signed } = await admin.storage
      .from("comprovantes")
      .createSignedUrl(comprovante.url_arquivo, 60 * 60);
    comprovanteUrl = signed?.signedUrl ?? null;
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
      <h1 className="mb-6 text-lg font-bold text-brand">Editar despesa</h1>
      <DespesaForm
        categorias={categorias ?? []}
        projetos={(projetos ?? []).map((p) => ({
          id: p.id,
          nome: p.nome,
          clienteId: p.cliente_id,
          clienteNome: p.clientes?.nome ?? null,
        }))}
        despesaExistente={{
          id: despesa.id,
          valor: despesa.valor,
          dataDespesa: despesa.data_despesa,
          categoriaId: despesa.categoria_id,
          fornecedor: despesa.fornecedor ?? "",
          projetoId: despesa.projeto_id,
          clienteId: despesa.cliente_id,
          tipo: despesa.tipo as "reembolso" | "nota_debito" | "ambos",
          motivoReprovacao: despesa.motivo_reprovacao,
          comprovanteUrl,
          comprovantePath: comprovante?.url_arquivo ?? null,
          origemIa: despesa.origem_ia,
        }}
      />
    </div>
  );
}
