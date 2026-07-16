import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/format";

export interface ReciboItem {
  data: string;
  descricao: string;
  categoria: string;
  projeto: string | null;
  valor: number;
}

export interface ReciboComprovante {
  url: string;
  legenda: string;
}

export interface ReciboReembolsoDocumentProps {
  numero: string;
  dataEmissao: string;
  empresa: {
    nome: string;
    cnpj: string | null;
    logoUrl: string | null;
  };
  colaboradorNome: string;
  itens: ReciboItem[];
  valorTotal: number;
  assinatura: {
    imagemUrl: string;
    timestamp: string;
    ip: string;
    userAgent: string;
  };
  comprovantes: ReciboComprovante[];
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
  logo: { width: 120, height: 40, objectFit: "contain" },
  empresaNome: { fontSize: 12, fontWeight: 700, color: "#212771" },
  empresaCnpj: { fontSize: 8, color: "#8d949a", marginTop: 2 },
  tituloBox: { alignItems: "flex-end" },
  titulo: { fontSize: 13, fontWeight: 700, color: "#212771" },
  secao: { marginBottom: 14 },
  secaoTitulo: {
    fontSize: 9,
    fontWeight: 700,
    color: "#8d949a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  linha: { marginBottom: 2 },
  tabela: { marginTop: 4 },
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
  colData: { width: "13%" },
  colDescricao: { width: "32%" },
  colCategoria: { width: "20%" },
  colProjeto: { width: "20%" },
  colValor: { width: "15%", textAlign: "right" },
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
  legal: { marginTop: 20, fontSize: 9, color: "#555555", lineHeight: 1.4 },
  assinaturaBox: { marginTop: 24 },
  assinaturaImagem: { width: 180, height: 60, objectFit: "contain" },
  assinaturaNome: { fontSize: 10, fontWeight: 700, marginTop: 4 },
  assinaturaMeta: { fontSize: 8, color: "#8d949a", marginTop: 2 },
  anexoPagina: { padding: 36 },
  anexoLegenda: { fontSize: 10, fontWeight: 700, marginBottom: 8, color: "#212771" },
  anexoImagem: { width: "100%", maxHeight: 650, objectFit: "contain" },
});

export function ReciboReembolsoDocument({
  numero,
  dataEmissao,
  empresa,
  colaboradorNome,
  itens,
  valorTotal,
  assinatura,
  comprovantes,
}: ReciboReembolsoDocumentProps) {
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
            {empresa.cnpj && <Text style={styles.empresaCnpj}>CNPJ {empresa.cnpj}</Text>}
          </View>
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>RECIBO DE REEMBOLSO DE DESPESAS Nº {numero}</Text>
            <Text>Data: {formatDate(dataEmissao)}</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Colaborador</Text>
          <Text style={styles.linha}>Nome: {colaboradorNome}</Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Itens</Text>
          <View style={styles.tabela}>
            <View style={styles.tabelaHeader}>
              <Text style={[styles.th, styles.colData]}>Data</Text>
              <Text style={[styles.th, styles.colDescricao]}>Descrição</Text>
              <Text style={[styles.th, styles.colCategoria]}>Categoria</Text>
              <Text style={[styles.th, styles.colProjeto]}>Projeto</Text>
              <Text style={[styles.th, styles.colValor]}>Valor</Text>
            </View>
            {itens.map((item, index) => (
              <View key={index} style={styles.tabelaLinha}>
                <Text style={styles.colData}>{formatDate(item.data)}</Text>
                <Text style={styles.colDescricao}>{item.descricao}</Text>
                <Text style={styles.colCategoria}>{item.categoria}</Text>
                <Text style={styles.colProjeto}>{item.projeto ?? "—"}</Text>
                <Text style={styles.colValor}>{formatCurrency(item.valor)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalLinha}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValor}>{formatCurrency(valorTotal)}</Text>
          </View>
        </View>

        <Text style={styles.legal}>
          Declaro para os devidos fins que os valores acima discriminados referem-se a reembolso
          de despesas efetivamente incorridas em nome da empresa, conforme comprovantes anexos,
          não constituindo remuneração ou contraprestação de serviços.
        </Text>

        <View style={styles.assinaturaBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={assinatura.imagemUrl} style={styles.assinaturaImagem} />
          <Text style={styles.assinaturaNome}>Assinado digitalmente por: {colaboradorNome}</Text>
          <Text style={styles.assinaturaMeta}>
            Data/hora: {assinatura.timestamp} — IP: {assinatura.ip}
          </Text>
          <Text style={styles.assinaturaMeta}>Dispositivo: {assinatura.userAgent}</Text>
        </View>
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
