import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/format";

export interface NotaDebitoItem {
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
}

export interface NotaDebitoComprovante {
  url: string;
  legenda: string;
}

export interface NotaDebitoDocumentProps {
  numero: string;
  dataEmissao: string;
  empresa: {
    nome: string;
    cnpj: string | null;
    endereco: string | null;
    telefone: string | null;
    logoUrl: string | null;
  };
  cliente: {
    nome: string;
    cnpj: string | null;
  };
  projeto: {
    codigo: string | null;
    nome: string;
  };
  itens: NotaDebitoItem[];
  valorTotal: number;
  dadosBancarios: {
    banco: string | null;
    agencia: string | null;
    conta: string | null;
    chavePix: string | null;
  } | null;
  comprovantes: NotaDebitoComprovante[];
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#212121",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1 solid #dddddd",
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  empresaNome: {
    fontSize: 12,
    fontWeight: 700,
    color: "#212771",
  },
  tituloBox: {
    alignItems: "flex-end",
  },
  titulo: {
    fontSize: 13,
    fontWeight: 700,
    color: "#212771",
  },
  secao: {
    marginBottom: 14,
  },
  secaoTitulo: {
    fontSize: 9,
    fontWeight: 700,
    color: "#8d949a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  linha: {
    marginBottom: 2,
  },
  tabela: {
    marginTop: 4,
  },
  tabelaHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #212771",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tabelaLinha: {
    flexDirection: "row",
    borderBottom: "0.5 solid #dddddd",
    paddingVertical: 4,
  },
  colData: { width: "15%" },
  colDescricao: { width: "40%" },
  colCategoria: { width: "25%" },
  colValor: { width: "20%", textAlign: "right" },
  th: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: "#555555" },
  totalLinha: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1 solid #212771",
  },
  totalLabel: { fontSize: 10, fontWeight: 700, marginRight: 12 },
  totalValor: { fontSize: 12, fontWeight: 700, color: "#212771" },
  legal: {
    marginTop: 20,
    fontSize: 9,
    color: "#555555",
    lineHeight: 1.4,
  },
  rodape: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#8d949a",
    borderTop: "0.5 solid #dddddd",
    paddingTop: 6,
    textAlign: "center",
  },
  anexoPagina: {
    padding: 36,
  },
  anexoLegenda: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    color: "#212771",
  },
  anexoImagem: {
    width: "100%",
    maxHeight: 650,
    objectFit: "contain",
  },
});

export function NotaDebitoDocument({
  numero,
  dataEmissao,
  empresa,
  cliente,
  projeto,
  itens,
  valorTotal,
  dadosBancarios,
  comprovantes,
}: NotaDebitoDocumentProps) {
  const rodape = `${empresa.nome}${empresa.cnpj ? ` — CNPJ ${empresa.cnpj}` : ""}${
    empresa.endereco ? ` — ${empresa.endereco}` : ""
  }${empresa.telefone ? ` — Telefone: ${empresa.telefone}` : ""}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {empresa.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={empresa.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.empresaNome}>{empresa.nome}</Text>
            )}
          </View>
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>NOTA DE DÉBITO Nº {numero}</Text>
            <Text>Data de emissão: {formatDate(dataEmissao)}</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Destinatário</Text>
          <Text style={styles.linha}>Cliente: {cliente.nome}</Text>
          {cliente.cnpj && <Text style={styles.linha}>CNPJ: {cliente.cnpj}</Text>}
          <Text style={styles.linha}>
            Referente a: Projeto/Proposta {projeto.codigo ? `Nº ${projeto.codigo} - ` : ""}
            {projeto.nome}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Itens</Text>
          <View style={styles.tabela}>
            <View style={styles.tabelaHeader}>
              <Text style={[styles.th, styles.colData]}>Data</Text>
              <Text style={[styles.th, styles.colDescricao]}>Descrição</Text>
              <Text style={[styles.th, styles.colCategoria]}>Categoria</Text>
              <Text style={[styles.th, styles.colValor]}>Valor</Text>
            </View>
            {itens.map((item, index) => (
              <View key={index} style={styles.tabelaLinha}>
                <Text style={styles.colData}>{formatDate(item.data)}</Text>
                <Text style={styles.colDescricao}>{item.descricao}</Text>
                <Text style={styles.colCategoria}>{item.categoria}</Text>
                <Text style={styles.colValor}>{formatCurrency(item.valor)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalLinha}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValor}>{formatCurrency(valorTotal)}</Text>
          </View>
        </View>

        {dadosBancarios && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Dados bancários para pagamento</Text>
            <Text style={styles.linha}>
              Banco: {dadosBancarios.banco ?? "—"} | Agência: {dadosBancarios.agencia ?? "—"} |
              Conta: {dadosBancarios.conta ?? "—"} | PIX: {dadosBancarios.chavePix ?? "—"}
            </Text>
          </View>
        )}

        <Text style={styles.legal}>
          O presente documento não possui natureza fiscal, sendo emitido exclusivamente para fins
          de reembolso das despesas relacionadas ao projeto/proposta acima referenciado,
          incorridas por conta e ordem do cliente, conforme comprovantes anexos.
        </Text>

        <Text style={styles.rodape} fixed>
          {rodape}
        </Text>
      </Page>

      {comprovantes.map((comprovante, index) => (
        <Page key={index} size="A4" style={styles.anexoPagina}>
          <Text style={styles.anexoLegenda}>{comprovante.legenda}</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={comprovante.url} style={styles.anexoImagem} />
        </Page>
      ))}
    </Document>
  );
}
