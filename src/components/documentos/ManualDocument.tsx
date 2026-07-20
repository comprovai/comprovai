import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "@/lib/format";
import {
  MANUAL_META,
  OBJETIVO,
  ESCOPO,
  DEFINICOES,
  PAPEIS,
  PROCEDIMENTO_OPERACIONAL,
  DISPOSICOES_FINAIS,
} from "@/lib/manual/conteudo-manual";

const styles = StyleSheet.create({
  page: { padding: 36, paddingBottom: 56, fontSize: 10, color: "#212121", fontFamily: "Helvetica" },
  capaTitulo: { fontSize: 18, fontWeight: 700, color: "#212771", textAlign: "center", marginBottom: 4 },
  capaSubtitulo: { fontSize: 11, color: "#555555", textAlign: "center", marginBottom: 20 },
  metaLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #212771",
    borderBottom: "1 solid #212771",
    paddingVertical: 6,
    marginBottom: 20,
  },
  metaLabel: { fontWeight: 700 },
  assinaturasLinha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  assinaturaBox: { width: "31%" },
  assinaturaTitulo: {
    fontSize: 8,
    fontWeight: 700,
    color: "#8d949a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  assinaturaNome: { fontSize: 10, fontWeight: 700 },
  assinaturaCargo: { fontSize: 9, color: "#555555" },
  vigenciaBox: { border: "1 solid #dddddd", borderRadius: 2, padding: 10, marginBottom: 20 },
  vigenciaTitulo: {
    fontSize: 9,
    fontWeight: 700,
    color: "#212771",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  vigenciaLinha: { marginBottom: 2 },
  historicoHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #212771",
    paddingBottom: 4,
    marginBottom: 4,
  },
  historicoLinha: { flexDirection: "row", borderBottom: "0.5 solid #dddddd", paddingVertical: 4 },
  th: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: "#555555" },
  colVersao: { width: "15%" },
  colData: { width: "20%" },
  colDescricao: { width: "40%" },
  colResponsavel: { width: "25%" },
  sumarioItem: { marginBottom: 4, fontSize: 10 },
  secaoTitulo: {
    fontSize: 12,
    fontWeight: 700,
    color: "#212771",
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  paragrafo: { marginBottom: 8, lineHeight: 1.4 },
  subTitulo: { fontSize: 10, fontWeight: 700, marginBottom: 2, color: "#212771" },
  subParagrafo: { marginBottom: 10, lineHeight: 1.4 },
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
});

export function ManualDocument() {
  const rodapeTexto = `${MANUAL_META.codigo} | Versão ${MANUAL_META.versao} | Revisão ${MANUAL_META.revisao} | Data de Emissão: ${formatDate(MANUAL_META.dataEmissao)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.capaTitulo}>{MANUAL_META.titulo}</Text>
        <Text style={styles.capaSubtitulo}>Setor: {MANUAL_META.setor}</Text>

        <View style={styles.metaLinha}>
          <Text>
            <Text style={styles.metaLabel}>Código: </Text>
            {MANUAL_META.codigo}
          </Text>
          <Text>
            <Text style={styles.metaLabel}>Data de Emissão: </Text>
            {formatDate(MANUAL_META.dataEmissao)}
          </Text>
          <Text>
            <Text style={styles.metaLabel}>Versão: </Text>
            {MANUAL_META.versao}
          </Text>
          <Text>
            <Text style={styles.metaLabel}>Revisão: </Text>
            {MANUAL_META.revisao}
          </Text>
        </View>

        <View style={styles.assinaturasLinha}>
          <View style={styles.assinaturaBox}>
            <Text style={styles.assinaturaTitulo}>Elaborado Por</Text>
            <Text style={styles.assinaturaNome}>{MANUAL_META.elaboradoPor.nome}</Text>
            <Text style={styles.assinaturaCargo}>{MANUAL_META.elaboradoPor.cargo}</Text>
          </View>
          <View style={styles.assinaturaBox}>
            <Text style={styles.assinaturaTitulo}>Verificado Por</Text>
            <Text style={styles.assinaturaNome}>{MANUAL_META.verificadoPor.nome}</Text>
            <Text style={styles.assinaturaCargo}>{MANUAL_META.verificadoPor.cargo}</Text>
          </View>
          <View style={styles.assinaturaBox}>
            <Text style={styles.assinaturaTitulo}>Aprovado Por</Text>
            <Text style={styles.assinaturaNome}>{MANUAL_META.aprovadoPor.nome}</Text>
            <Text style={styles.assinaturaCargo}>{MANUAL_META.aprovadoPor.cargo}</Text>
          </View>
        </View>

        <View style={styles.vigenciaBox}>
          <Text style={styles.vigenciaTitulo}>Vigência e Validade</Text>
          <Text style={styles.vigenciaLinha}>
            Início da Vigência: {formatDate(MANUAL_META.inicioVigencia)}
          </Text>
          <Text style={styles.vigenciaLinha}>
            Próxima Revisão Prevista: {formatDate(MANUAL_META.proximaRevisao)}
          </Text>
          <Text style={styles.vigenciaLinha}>
            Periodicidade de Revisão: {MANUAL_META.periodicidadeRevisao}
          </Text>
        </View>

        <Text style={styles.vigenciaTitulo}>Histórico de Revisões</Text>
        <View style={styles.historicoHeader}>
          <Text style={[styles.th, styles.colVersao]}>Versão/Revisão</Text>
          <Text style={[styles.th, styles.colData]}>Data</Text>
          <Text style={[styles.th, styles.colDescricao]}>Descrição</Text>
          <Text style={[styles.th, styles.colResponsavel]}>Responsável</Text>
        </View>
        <View style={styles.historicoLinha}>
          <Text style={styles.colVersao}>
            {MANUAL_META.versao} / {MANUAL_META.revisao}
          </Text>
          <Text style={styles.colData}>{formatDate(MANUAL_META.dataEmissao)}</Text>
          <Text style={styles.colDescricao}>Emissão inicial do documento</Text>
          <Text style={styles.colResponsavel}>{MANUAL_META.elaboradoPor.nome}</Text>
        </View>

        <Text style={styles.secaoTitulo}>Sumário</Text>
        {[
          "Objetivo",
          "Escopo",
          "Definições Operacionais",
          "Papéis e Responsabilidades",
          "Procedimento Operacional",
          "Disposições Finais",
        ].map((item) => (
          <Text key={item} style={styles.sumarioItem}>
            {item}
          </Text>
        ))}

        <Text style={styles.rodape} fixed>
          {rodapeTexto}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.secaoTitulo}>Objetivo</Text>
        <Text style={styles.paragrafo}>{OBJETIVO}</Text>

        <Text style={styles.secaoTitulo}>Escopo</Text>
        <Text style={styles.paragrafo}>{ESCOPO}</Text>

        <Text style={styles.secaoTitulo}>Definições Operacionais</Text>
        {DEFINICOES.map((d) => (
          <View key={d.titulo}>
            <Text style={styles.subTitulo}>{d.titulo}</Text>
            <Text style={styles.subParagrafo}>{d.texto}</Text>
          </View>
        ))}

        <Text style={styles.secaoTitulo}>Papéis e Responsabilidades</Text>
        {PAPEIS.map((p) => (
          <View key={p.papel}>
            <Text style={styles.subTitulo}>{p.papel}</Text>
            <Text style={styles.subParagrafo}>{p.texto}</Text>
          </View>
        ))}

        <Text style={styles.secaoTitulo}>Procedimento Operacional</Text>
        {PROCEDIMENTO_OPERACIONAL.map((p) => (
          <View key={p.titulo}>
            <Text style={styles.subTitulo}>{p.titulo}</Text>
            <Text style={styles.subParagrafo}>{p.texto}</Text>
          </View>
        ))}

        <Text style={styles.secaoTitulo}>Disposições Finais</Text>
        <Text style={styles.paragrafo}>{DISPOSICOES_FINAIS}</Text>

        <Text style={styles.rodape} fixed>
          {rodapeTexto}
        </Text>
      </Page>
    </Document>
  );
}
