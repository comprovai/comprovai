import {
  DEFINICOES,
  OBJETIVO,
  PAPEIS,
  PROCEDIMENTO_OPERACIONAL,
} from "@/lib/manual/conteudo-manual";

// Conteúdo do Manual de Procedimentos (COM-PROC-001) reaproveitado aqui como
// base de busca do chat — é a "busca inteligente no manual" pedida pro item 7,
// sem precisar de uma página de busca separada. Só entra no prompt quando o
// usuário está autenticado (ver montarSystemPrompt em /api/chat), já que o
// manual é interno da Consuldata, não conteúdo pra visitante da landing.
export const MANUAL_COMPLETO = [
  OBJETIVO,
  ...DEFINICOES.map((d) => `${d.titulo}: ${d.texto}`),
  ...PAPEIS.map((p) => `${p.papel}: ${p.texto}`),
  ...PROCEDIMENTO_OPERACIONAL.map((p) => `${p.titulo}: ${p.texto}`),
  'O manual completo (COM-PROC-001, padrão SGI) pode ser consultado pelo link "Manual do sistema" no menu lateral.',
].join("\n\n");

export const SOBRE_O_PRODUTO = `
Comprovai é um sistema de lançamento, aprovação e reembolso de despesas corporativas,
com geração automática de nota de débito para repasse de custo a clientes. É feito para
empresas de serviço/consultoria que precisam repassar despesa de projeto ao cliente —
não é um "expense management" genérico. Público-alvo: PMEs de 5-150 colaboradores, sem
cartão corporativo nem Pix corporativo, que dependem de reembolso e repasse.
`.trim();

export const PERGUNTAS_FREQUENTES = `
P: Como eu lanço uma despesa?
R: Em "Minhas despesas", toque no botão + (canto inferior). Fotografe o comprovante — a
IA lê os dados automaticamente (valor, data, fornecedor) — confirme ou corrija os campos
e escolha "Salvar rascunho" ou "Enviar para aprovação".

P: O que significa cada status de despesa?
R: Rascunho (ainda não enviada), Enviada (aguardando aprovação do gestor), Aprovada
(aprovada, não pode mais ser editada), Reprovada (o gestor pediu correção — o colaborador
pode editar e reenviar), Em financeiro (aprovada, aguardando conferência), Lançada
(reembolso já processado), Nota gerada (virou nota de débito ou recibo assinado).

P: Posso lançar despesa sem internet?
R: Sim. Sem conexão, o app avisa que está offline, você preenche os dados manualmente
(sem a leitura automática por IA) e a despesa fica salva no aparelho. Quando a conexão
voltar, ela sincroniza sozinha.

P: Como funciona a aprovação?
R: O gestor vê as despesas dos colaboradores que ele gerencia em "Aprovações", pode
aprovar ou reprovar (reprovação exige motivo). Despesa aprovada não pode mais ser
alterada por ninguém, nem financeiro nem admin — é definitivo.

P: O que é a Nota de Débito?
R: É o documento que o financeiro gera para repassar o custo das despesas aprovadas ao
cliente do projeto, com um PDF contendo todos os comprovantes anexados e numeração
sequencial oficial.

P: O que é o Recibo de Reembolso?
R: É o comprovante formal de que o colaborador foi reembolsado. O financeiro gera o
recibo, e o colaborador assina digitalmente (desenhando a assinatura na tela) em
"Recibos" antes do PDF final ser gerado.

P: Esqueci minha senha, e agora?
R: Na tela de login, clique em "Esqueci minha senha" e siga o link enviado por e-mail.

P: Como excluo uma despesa?
R: Só é possível excluir despesas em rascunho ou enviada (ainda não decididas). O botão
de lixeira aparece na lista "Minhas despesas" para essas despesas, com confirmação antes
de excluir de verdade.
`.trim();

export const DICAS_POR_ROLE: Record<string, string> = {
  colaborador: `
O usuário atual é um COLABORADOR. Ele lança despesas em "Minhas despesas" e assina
recibos de reembolso em "Recibos". Dê dicas práticas sobre fotografar comprovantes,
entender os status da despesa e reenviar despesas reprovadas.
`.trim(),
  aprovador: `
O usuário atual é um APROVADOR (gestor). Ele só vê e aprova/reprova despesas dos
colaboradores que gerencia diretamente, em "Aprovações". Reprovação sempre exige um
motivo escrito.
`.trim(),
  financeiro: `
O usuário atual é do FINANCEIRO. Ele confere despesas aprovadas no dashboard
"Financeiro", marca como reembolsadas, e gera Nota de Débito ou Recibo de Reembolso.
Ele NÃO pode editar valor/categoria/fornecedor de uma despesa — só mover o status.
`.trim(),
  admin: `
O usuário atual é ADMIN. Ele gerencia usuários, clientes/projetos, categorias e os
dados da empresa em "Admin". Pode criar usuários novos (define a senha inicial) e
resetar senha de qualquer usuário da empresa.
`.trim(),
};
