export const MANUAL_META = {
  codigo: "COM-PROC-001",
  titulo: "Manual de Procedimentos do Sistema Comprovai",
  setor: "Financeiro e Administrativo",
  versao: "1.0",
  revisao: "00",
  dataEmissao: "2026-07-20",
  inicioVigencia: "2026-07-20",
  proximaRevisao: "2027-07-20",
  periodicidadeRevisao: "Anual (ou quando houver alteração relevante no sistema)",
  elaboradoPor: { nome: "Junior Lopes", cargo: "Desenvolvedor e Responsável pelo Comprovai" },
  verificadoPor: { nome: "Laryssa Victoria", cargo: "Encarregada Administrativa" },
  aprovadoPor: { nome: "Igor Monin Tenório Magalhães", cargo: "Diretor Infraestrutura" },
};

export const OBJETIVO = `
Estabelecer os procedimentos operacionais padronizados para uso do sistema Comprovai pelos
colaboradores, aprovadores, financeiro e administradores da ConsulData Teleprocessamento,
assegurando rastreabilidade, controle e agilidade no lançamento, aprovação, reembolso e
repasse de despesas ao cliente.
`.trim();

export const ESCOPO = `
Este manual aplica-se a todos os colaboradores, gestores, financeiro e administradores da
ConsulData que utilizam o Comprovai para: lançamento de despesas, aprovação ou reprovação,
conferência financeira, reembolso ao colaborador e emissão de nota de débito ao cliente.
`.trim();

export const DEFINICOES = [
  {
    titulo: "Status da despesa",
    texto:
      "Rascunho (ainda não enviada, só o dono vê), Enviada (aguardando decisão do gestor), " +
      "Aprovada (decisão definitiva — não pode mais ser editada por ninguém), Reprovada " +
      "(o gestor pediu correção, o colaborador pode editar e reenviar), Em financeiro " +
      "(aprovada, aguardando conferência), Lançada (reembolso já processado), Nota gerada " +
      "(virou nota de débito ou recibo de reembolso assinado).",
  },
  {
    titulo: "Nota de Débito",
    texto:
      "Documento em PDF, numerado sequencialmente, gerado pelo financeiro para repassar ao " +
      "cliente do projeto o custo das despesas já aprovadas, com todos os comprovantes " +
      "anexados. Sem natureza fiscal.",
  },
  {
    titulo: "Recibo de Reembolso",
    texto:
      "Comprovante formal, assinado digitalmente pelo colaborador (com captura de IP e " +
      "data/hora), de que ele foi reembolsado por despesas já marcadas como lançadas pelo " +
      "financeiro.",
  },
  {
    titulo: "Congelamento pós-aprovação",
    texto:
      "Uma vez aprovada, a despesa não pode mais ser alterada ou excluída por nenhum papel " +
      "do sistema, nem financeiro nem admin — é uma regra definitiva do Comprovai.",
  },
];

export const PAPEIS = [
  {
    papel: "Colaborador",
    texto:
      "Lança despesas em \"Minhas despesas\": fotografa o comprovante (o sistema lê os " +
      "dados automaticamente), confirma ou corrige, envia para aprovação. Pode editar e " +
      "reenviar despesas reprovadas, e excluir despesas em rascunho ou enviada. Assina " +
      "recibos de reembolso em \"Recibos\".",
  },
  {
    papel: "Aprovador (Gestor)",
    texto:
      "Vê em \"Aprovações\" só as despesas dos colaboradores que gerencia diretamente. " +
      "Aprova ou reprova — reprovação exige motivo escrito, registrado no histórico.",
  },
  {
    papel: "Financeiro",
    texto:
      "Confere despesas aprovadas no dashboard \"Financeiro\", move para conferência, marca " +
      "como reembolsada (com data de pagamento), e gera Nota de Débito ou Recibo de " +
      "Reembolso. Não edita valor, categoria, fornecedor ou qualquer outro dado da despesa " +
      "em si — só o status e a data de pagamento.",
  },
  {
    papel: "Admin",
    texto:
      "Gerencia usuários (cria login, define papel e gestor, reseta senha), clientes e " +
      "projetos, categorias de despesa, e os dados cadastrais da empresa (usados nos " +
      "documentos gerados).",
  },
];

export const PROCEDIMENTO_OPERACIONAL = [
  {
    titulo: "1. Lançamento de despesa",
    texto:
      "O colaborador acessa \"Minhas despesas\" e toca no botão + para lançar uma nova " +
      "despesa. Fotografa o comprovante — se houver conexão, o sistema lê automaticamente " +
      "valor, data, fornecedor e sugere a categoria. O colaborador confere, corrige se " +
      "necessário, escolhe o tipo (reembolso, nota de débito ou ambos) e o cliente/projeto " +
      "relacionado (quando aplicável), e escolhe \"Salvar rascunho\" ou \"Enviar para " +
      "aprovação\". Sem conexão, o app avisa que está offline, os dados são preenchidos " +
      "manualmente e a despesa fica salva no aparelho até sincronizar sozinha quando a " +
      "internet voltar.",
  },
  {
    titulo: "2. Aprovação",
    texto:
      "O gestor acessa \"Aprovações\" e vê as despesas enviadas pelos colaboradores que ele " +
      "gerencia. Pode abrir o comprovante em tamanho maior antes de decidir. Ao aprovar, a " +
      "despesa fica definitivamente travada. Ao reprovar, é obrigatório escrever o motivo — " +
      "a despesa volta para o colaborador, que pode corrigir e reenviar.",
  },
  {
    titulo: "3. Conferência financeira",
    texto:
      "O financeiro acessa o dashboard \"Financeiro\", filtra por período, colaborador, " +
      "cliente, projeto ou categoria. Move despesas aprovadas para conferência e, após " +
      "confirmar o pagamento, marca como \"reembolsada\" com a data efetiva do pagamento.",
  },
  {
    titulo: "4. Geração da Nota de Débito",
    texto:
      "Em \"Financeiro > Gerar Documento\", o financeiro seleciona cliente e projeto, vê as " +
      "despesas elegíveis (aprovadas, do tipo nota de débito ou ambos) e escolhe quais " +
      "incluir. O sistema gera o PDF com numeração sequencial oficial, dados da empresa, " +
      "itens e todos os comprovantes anexados em páginas separadas.",
  },
  {
    titulo: "5. Geração e assinatura do Recibo de Reembolso",
    texto:
      "Em \"Financeiro > Gerar Recibo\", o financeiro seleciona o colaborador e as despesas " +
      "já lançadas (reembolsadas) elegíveis. O recibo fica \"aguardando assinatura\" até o " +
      "colaborador assiná-lo digitalmente em \"Recibos\" — só então o PDF final é gerado, " +
      "com a assinatura, IP e data/hora capturados no momento.",
  },
];

export const DISPOSICOES_FINAIS = `
Este manual descreve o funcionamento do sistema Comprovai tal como implantado para a
ConsulData Teleprocessamento. A lista de usuários, papéis e gestores responsáveis por cada
área é mantida diretamente no sistema (Admin > Usuários) e não é reproduzida aqui, por ser
dinâmica — qualquer alteração de equipe já reflete automaticamente sem necessidade de
revisar este documento. Dúvidas sobre o uso do sistema podem ser esclarecidas a qualquer
momento pelo assistente de chat disponível em todas as telas do Comprovai.
`.trim();
