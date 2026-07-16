import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RecibosList } from "@/components/documentos/RecibosList";

export default async function RecibosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: documentos } = await supabase
    .from("documentos_gerados")
    .select("id, numero, data_emissao, valor_total, status, pdf_url")
    .eq("colaborador_id", user.id)
    .eq("tipo_documento", "recibo_reembolso")
    .order("data_emissao", { ascending: false });

  const admin = createAdminClient();

  const assinados = await Promise.all(
    (documentos ?? [])
      .filter((d) => d.status === "assinado")
      .map(async (d) => {
        let pdfUrl: string | null = null;
        if (d.pdf_url) {
          const { data: signed } = await admin.storage
            .from("documentos")
            .createSignedUrl(d.pdf_url, 60 * 60);
          pdfUrl = signed?.signedUrl ?? null;
        }
        return {
          id: d.id,
          numero: d.numero,
          dataEmissao: d.data_emissao,
          valorTotal: d.valor_total,
          pdfUrl,
        };
      })
  );

  const pendentes = (documentos ?? [])
    .filter((d) => d.status === "aguardando_assinatura")
    .map((d) => ({
      id: d.id,
      numero: d.numero,
      dataEmissao: d.data_emissao,
      valorTotal: d.valor_total,
      pdfUrl: null,
    }));

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand">Recibos de Reembolso</h1>
      <RecibosList pendentes={pendentes} assinados={assinados} />
    </div>
  );
}
