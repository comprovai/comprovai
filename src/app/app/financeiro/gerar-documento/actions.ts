"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotaDebitoDocument } from "@/components/documentos/NotaDebitoDocument";

export interface GerarNotaDebitoResult {
  error?: string;
  pdfUrl?: string;
  numero?: string;
}

export async function gerarNotaDebito(
  clienteId: string,
  projetoId: string,
  despesaIds: string[]
): Promise<GerarNotaDebitoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (despesaIds.length === 0) {
    return { error: "Selecione ao menos uma despesa." };
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id, role")
    .eq("id", user.id)
    .single();

  if (!usuario || usuario.role !== "financeiro") {
    return { error: "Apenas o financeiro pode gerar este documento." };
  }

  const admin = createAdminClient();

  const [{ data: empresa }, { data: cliente }, { data: projeto }, { data: dadosBancarios }] =
    await Promise.all([
      admin
        .from("empresas")
        .select("nome, cnpj, endereco, telefone, logo_url")
        .eq("id", usuario.empresa_id)
        .single(),
      admin.from("clientes").select("nome, cnpj").eq("id", clienteId).single(),
      admin.from("projetos_propostas").select("nome, codigo").eq("id", projetoId).single(),
      admin
        .from("dados_bancarios_empresa")
        .select("banco, agencia, conta, chave_pix")
        .eq("empresa_id", usuario.empresa_id)
        .maybeSingle(),
    ]);

  const { data: despesas } = await admin
    .from("despesas")
    .select("id, data_despesa, fornecedor, valor, categorias_despesa(nome)")
    .in("id", despesaIds)
    .eq("empresa_id", usuario.empresa_id)
    .eq("cliente_id", clienteId)
    .eq("projeto_id", projetoId)
    .eq("status", "financeiro")
    .in("tipo", ["nota_debito", "ambos"]);

  if (!despesas || despesas.length === 0) {
    return { error: "Nenhuma despesa elegível encontrada para os itens selecionados." };
  }

  const comprovantes: { url: string; legenda: string }[] = [];
  for (const d of despesas) {
    const { data: comprovante } = await admin
      .from("comprovantes")
      .select("url_arquivo")
      .eq("despesa_id", d.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (comprovante?.url_arquivo) {
      const { data: signed } = await admin.storage
        .from("comprovantes")
        .createSignedUrl(comprovante.url_arquivo, 60 * 10);
      if (signed?.signedUrl) {
        comprovantes.push({
          url: signed.signedUrl,
          legenda: `${d.fornecedor ?? "Comprovante"} — ${d.data_despesa}`,
        });
      }
    }
  }

  const valorTotal = despesas.reduce((total, d) => total + d.valor, 0);

  const anoAtual = new Date().getFullYear();
  const { count } = await admin
    .from("documentos_gerados")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", usuario.empresa_id)
    .eq("tipo_documento", "nota_debito")
    .gte("data_emissao", `${anoAtual}-01-01`)
    .lte("data_emissao", `${anoAtual}-12-31`);

  const numero = `${(count ?? 0) + 1}/${anoAtual}`;
  const dataEmissao = new Date().toISOString().slice(0, 10);

  const pdfBuffer = await renderToBuffer(
    NotaDebitoDocument({
      numero,
      dataEmissao,
      empresa: {
        nome: empresa?.nome ?? "",
        cnpj: empresa?.cnpj ?? null,
        endereco: empresa?.endereco ?? null,
        telefone: empresa?.telefone ?? null,
        logoUrl: empresa?.logo_url ?? null,
      },
      cliente: { nome: cliente?.nome ?? "", cnpj: cliente?.cnpj ?? null },
      projeto: { nome: projeto?.nome ?? "", codigo: projeto?.codigo ?? null },
      itens: despesas.map((d) => ({
        data: d.data_despesa,
        descricao: d.fornecedor ?? "—",
        categoria: d.categorias_despesa?.nome ?? "—",
        valor: d.valor,
      })),
      valorTotal,
      dadosBancarios: dadosBancarios
        ? {
            banco: dadosBancarios.banco,
            agencia: dadosBancarios.agencia,
            conta: dadosBancarios.conta,
            chavePix: dadosBancarios.chave_pix,
          }
        : null,
      comprovantes,
    })
  );

  const path = `${usuario.empresa_id}/nota_debito/${Date.now()}-${numero.replace("/", "-")}.pdf`;

  const { error: uploadError } = await admin.storage
    .from("documentos")
    .upload(path, pdfBuffer, { contentType: "application/pdf" });

  if (uploadError) {
    return { error: "Não foi possível salvar o PDF gerado." };
  }

  const { data: documento, error: documentoError } = await admin
    .from("documentos_gerados")
    .insert({
      empresa_id: usuario.empresa_id,
      tipo_documento: "nota_debito",
      destinatario_tipo: "cliente",
      cliente_id: clienteId,
      numero,
      data_emissao: dataEmissao,
      valor_total: valorTotal,
      pdf_url: path,
      criado_por: user.id,
    })
    .select("id")
    .single();

  if (documentoError || !documento) {
    return { error: "Não foi possível registrar o documento gerado." };
  }

  await admin.from("documentos_gerados_itens").insert(
    despesas.map((d) => ({ documento_gerado_id: documento.id, despesa_id: d.id }))
  );

  await admin
    .from("despesas")
    .update({ status: "nota_gerada" })
    .in(
      "id",
      despesas.map((d) => d.id)
    );

  const { data: signedPdf } = await admin.storage
    .from("documentos")
    .createSignedUrl(path, 60 * 60);

  return { numero, pdfUrl: signedPdf?.signedUrl };
}
