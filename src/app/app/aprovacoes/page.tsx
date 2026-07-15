import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AprovacoesList, type DespesaAprovacao } from "@/components/aprovacoes/AprovacoesList";

export default async function AprovacoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: despesasBrutas } = await supabase
    .from("despesas")
    .select(
      "id, valor, data_despesa, fornecedor, categorias_despesa(nome), colaborador_id, usuarios!despesas_colaborador_id_fkey(nome, gestor_id)"
    )
    .eq("status", "enviada")
    .order("criado_em", { ascending: true });

  // RLS já restringe o que pode ser lido, mas a listagem de "quem eu aprovo"
  // depende do vínculo gestor_id, que filtramos aqui explicitamente também.
  const minhasDespesas = (despesasBrutas ?? []).filter(
    (d) => d.usuarios?.gestor_id === user.id
  );

  const admin = createAdminClient();

  const despesas: DespesaAprovacao[] = await Promise.all(
    minhasDespesas.map(async (d) => {
      const { data: comprovante } = await supabase
        .from("comprovantes")
        .select("url_arquivo")
        .eq("despesa_id", d.id)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      let comprovanteUrl: string | null = null;
      if (comprovante?.url_arquivo) {
        const { data: signed } = await admin.storage
          .from("comprovantes")
          .createSignedUrl(comprovante.url_arquivo, 60 * 60);
        comprovanteUrl = signed?.signedUrl ?? null;
      }

      return {
        id: d.id,
        valor: d.valor,
        dataDespesa: d.data_despesa,
        fornecedor: d.fornecedor ?? "—",
        categoriaNome: d.categorias_despesa?.nome ?? "Sem categoria",
        colaboradorNome: d.usuarios?.nome ?? "—",
        comprovanteUrl,
      };
    })
  );

  return (
    <div>
      <AprovacoesList despesasIniciais={despesas} />
    </div>
  );
}
