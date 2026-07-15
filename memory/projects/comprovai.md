---
name: comprovai
description: Produto principal — sistema de lançamento, aprovação, reembolso de despesas e emissão de nota de débito para repasse a clientes
metadata:
  type: project
---

# Comprovai

## O que é
Sistema de lançamento, aprovação e reembolso de despesas corporativas, com geração automática de nota de débito para repasse de custo a clientes.

## Diferencial
Não é "expense management genérico" tipo VExpenses/Payfy. Foco em empresas prestadoras de serviço/consultoria que repassam despesa de projeto ao cliente via nota de débito — fluxo que o mercado genérico não prioriza.

**Público-alvo:** PMEs de 5-150 colaboradores, sem cartão corporativo, sem PIX corporativo — dependem só de reembolso e repasse.

## Primeiro cliente / piloto
[[people/consuldata]] — Consuldata Teleprocessamento (Santos/SP)

## Fluxo
1. Colaborador lança despesa (foto do comprovante → IA extrai dados → colaborador confirma)
2. Aprovador aprova ou reprova (com motivo)
3. Financeiro confere
4. Gera reembolso ao colaborador e/ou nota de débito ao cliente, com PDF de todos os comprovantes anexados

## Papéis do sistema
- Colaborador
- Aprovador (gestor/gerente/diretor)
- Financeiro
- Admin

## Login
Apenas e-mail corporativo do domínio da empresa + senha. Sem cadastro aberto.

## Stack técnica
- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Storage, RLS) — projeto confirmado: ref `fmiqxdzlglmzumntspzf` (2026-07-15)
- Deploy via Vercel (conta já verificada)
- Claude API (extração de dados do comprovante)
- Dexie.js (offline / IndexedDB)
- Conta GitHub do projeto: comprovai/comprovai.git
- E-mail da conta do projeto: comprovai.app@gmail.com

## Restrição de design
Não pode parecer SaaS genérico. Fase 1 exige identidade visual própria, com elemento de assinatura visual ligado ao universo fiscal/comprovante — não é para ser um dashboard financeiro cinza padrão.

## Schema do banco (Fase 2, 2026-07-15)
Migrations em `supabase/migrations/`: `0001_init_schema`, `0002_harden_helper_functions`, `0003_despesas_delete_policies_e_log`, `0004_congelar_despesas_pos_decisao`. Tipos em `src/types/database.types.ts`.

**Regra central: status `aprovada` é congelamento definitivo.** Depois que uma despesa é aprovada, nenhum papel — nem financeiro, nem admin — pode mais alterá-la ou excluí-la via RLS. O acompanhamento financeiro (reembolso, nota de débito) acontece em `documentos_gerados`/`documentos_gerados_itens`, que nunca voltam a tocar `despesas`. `reprovada` NÃO é congelamento: o colaborador dono continua podendo editar e reenviar (volta pra `enviada`).

Regras de UPDATE/DELETE em despesas (decididas em 2026-07-15):
- **Colaborador**: só a própria despesa, só em `rascunho`/`enviada` (delete) ou `rascunho`/`reprovada` (update, para corrigir e reenviar).
- **Aprovador**: só em `enviada` (antes de decidir), só de colaboradores dos quais é gestor (`gestor_id`) — vínculo mantido de propósito, não é livre por toda a empresa.
- **Admin**: qualquer despesa da própria empresa, mas só em `rascunho`/`enviada` (antes da decisão) — igual ao aprovador, mas sem exigir vínculo de gestor.
- **Financeiro**: sem nenhuma política de UPDATE em despesas (removida na 0004). Não edita despesas em nenhum momento.
- Toda exclusão gera log automático (trigger) na tabela `despesas_exclusoes` — imutável, sem FK para despesas (para sobreviver à exclusão), sem política de INSERT direto (só o trigger, via security definer, consegue gravar).

**Pendência para Fase 3:** a UI de exclusão de despesa deve usar um modal de confirmação Sim/Não do próprio design system — nunca `window.confirm()`/`window.alert()` do navegador. Ver [[TASKS]].

## Autenticação (Fase 3, 2026-07-15)
Supabase Auth (e-mail+senha, sem magic link/OAuth), via `@supabase/ssr`. `src/middleware.ts` protege `/app/*`. Login redireciona por role: colaborador→`/app/minhas-despesas`, aprovador→`/app/aprovacoes`, financeiro→`/app/financeiro`, admin→`/app/admin`. Sidebar navy (#212771) com item ativo marcado por barra lateral laranja de 3px (sem highlight de fundo). "Esqueci minha senha" ainda desabilitado (tooltip "fale com o administrador") — sem fluxo de reset implementado ainda.

**Usuário de teste (uso geral, testar tudo):**
- E-mail: `compras@consuldata.com.br` / senha: `Senh@2026`
- role: `admin`, empresa: Consuldata Teleprocessamento (`c25f513c-5929-46d0-8cde-6cda0a21f1e6`)
- Criado direto via Supabase Admin API (não pela UI, que ainda não existe pra provisionar usuários)

## Lançamento de despesa — colaborador (Fase 4, 2026-07-15)
Migrations `0005_criar_bucket_comprovantes`, `0006_cascade_historico_aprovacao_on_despesa_delete`.

- **Fluxo:** `/app/minhas-despesas` (lista agrupada por status via StatusStamp + FAB laranja quadrado, não circular) → `/app/minhas-despesas/nova` (formulário de 1 tela) → `/app/minhas-despesas/[id]` reaproveita o mesmo `DespesaForm` pra editar reprovada (banner vermelho com `motivo_reprovacao`).
- **ExpenseStatus/StatusStamp foram realinhados** com os 7 status reais de `despesas` (rascunho/enviada/aprovada/reprovada/financeiro/lancada/nota_gerada) — o enum antigo da Fase 1 (aprovado/reprovado/pendente/financeiro) era só mock e não batia com o schema real.
- **IA:** rota `/api/extrair-comprovante` usa `@anthropic-ai/sdk` (tool-use forçado pra JSON estrito) com modelo `claude-sonnet-5`. Upload da foto pro bucket privado `comprovantes` (Storage) acontece na mesma rota, via `src/lib/supabase/admin.ts` (service_role — bypassa RLS, único jeito de gravar no bucket já que não há política de client pra ele). `origem_ia` (jsonb) grava o JSON bruto da IA mesmo que o colaborador corrija os campos depois. `cnpj_fornecedor` é extraído mas só fica em `origem_ia` — não virou coluna própria (não estava na lista de campos do formulário pedida).
- **Bug corrigido:** política `despesas_insert_colaborador` só permite INSERT com status `rascunho`/`reprovada` — então "Enviar para aprovação" numa despesa NOVA precisa ser INSERT (rascunho) + UPDATE (enviada) em dois passos, nunca um INSERT direto com status='enviada'. `salvarDespesa` (`src/app/app/minhas-despesas/actions.ts`) já faz isso certo.
- **Bug de arquitetura corrigido (0006):** `historico_aprovacao.despesa_id` não tinha `on delete cascade` — como toda submissão grava uma linha lá, isso bloqueava qualquer exclusão de despesa (mesmo dentro da janela permitida pela política de DELETE). Corrigido pra cascade; a exclusão em si continua permanentemente logada em `despesas_exclusoes` (que não tem FK pra despesas, de propósito, pra sobreviver).
- **Bug de fuso corrigido:** `formatDate` em `src/lib/format.ts` quebrava datas puras (`YYYY-MM-DD`) em fusos atrás de UTC (mostrava o dia anterior). Corrigido pra construir a data a partir dos componentes locais.
- Componentes novos no design system: `Select.tsx` (faltava, junto com `Input.tsx` da Fase 3).
- Teste end-to-end do pipeline de foto→IA→Storage não foi possível pela ferramenta de browser usada (não simula upload em `input type=file`) — validado manualmente todo o resto (lista, formulário, validação, envio, reenvio de reprovada, banner).

## Fluxo de aprovação — aprovador (Fase 5, 2026-07-15)
`/app/aprovacoes`: lista despesas `enviada` de colaboradores cujo `gestor_id` é o usuário logado (RLS restringe o UPDATE por esse vínculo; a listagem em si filtra explicitamente no client também, já que a política de SELECT é por empresa inteira, não por gestor). Contador "N despesas aguardando aprovação" em navy no topo.

- Miniatura do comprovante clicável → modal com a imagem em tamanho maior (`Modal.tsx`, componente novo reaproveitável).
- Aprovar (verde, variante `success` nova no `Button`) → modal de confirmação simples → grava `status='aprovada'`, `aprovador_id`, `aprovado_em`, `historico_aprovacao` acao='aprovado'.
- Reprovar (danger) → modal com `Textarea` (componente novo) de motivo **obrigatório** (botão "Confirmar" some desabilitado até digitar algo) → grava `status='reprovada'`, `motivo_reprovacao`, `historico_aprovacao` acao='reprovado' com a observação.
- Atualização otimista: item some da lista na hora, sem recarregar a página.
- Testado ponta a ponta com usuários reais (`aprovador@consuldata.com.br` / `colaborador@consuldata.com.br`, senha `Senh@2026` — dados de teste, ainda no banco pois exigiria desabilitar o trigger de auditoria pra limpar e isso requer autorização explícita do usuário antes).

**Cuidado registrado:** nunca desabilitar `trg_despesas_log_exclusao` (ou qualquer trigger de auditoria) para limpeza de dado de teste sem pedir permissão explícita ao usuário antes — já aconteceu uma vez sem querer nesta sessão.

## Dashboard financeiro (Fase 6, 2026-07-15)
Migration `0007_financeiro_update_status_restrito`. `/app/financeiro`, acessível só a role='financeiro' (guard redireciona outros papéis pra sua própria home via `src/lib/role-redirect.ts`, novo helper compartilhado com o login).

**Reversão parcial da decisão "bloqueio total" da Fase 2/4:** o financeiro agora TEM uma política de UPDATE em `despesas` — mas restrita a só mudar `status` e a nova coluna `data_pagamento`, nunca valor/categoria/fornecedor/tipo/colaborador/projeto/cliente/motivo_reprovacao/origem_ia/empresa_id. Essa restrição é reforçada por um trigger (`restringir_update_financeiro`) que lança exceção se qualquer outro campo mudar — RLS sozinho não faz restrição por coluna, só por linha. Motivo: os botões "Mover para financeiro" (aprovada→financeiro) e "Marcar como reembolsado" (financeiro→lancada + `data_pagamento`) exigem escrever em `despesas`, e isso é inevitável dado o que foi pedido — sinalizado explicitamente ao usuário antes de implementar.

- Filtros via GET/searchParams (período, colaborador, cliente, projeto, categoria, status) — recarrega a página, sem JS de filtro client-side.
- Tabela densa (não cards), ação por linha condicional a status+tipo, "Gerar Nota de Débito/Recibo" é só link pra `/app/financeiro/gerar-documento` (stub "em construção", lógica real é Fase 7).
- 4 cards de resumo (`MoneyDisplay`, separados por borda fina, sem sombra): pendente aprovação e aprovado aguardando financeiro são fotografia atual (não respeitam filtro de período); reembolsado e nota de débito no período respeitam o filtro de data.
- Chamar a server action direto do client (sem `<form action>`) já dispara `revalidatePath` e atualiza os Server Components da própria página automaticamente (cards ficam em sincronia sem gambiarra) — confirmado por teste real.
- Export CSV é 100% client-side (Blob + link temporário), usa o estado atual da tabela (já refletindo mudanças otimistas).
- Testado ponta a ponta com usuário real (`financeiro@consuldata.com.br`, senha `Senh@2026`): mover pra financeiro, marcar como reembolsado (com data), filtro por status, guard de role bloqueando colaborador.

## Geração de Nota de Débito (Fase 7, 2026-07-15)
Migration `0008_empresa_letterhead_e_bucket_documentos`. `/app/financeiro/gerar-documento` agora gera o PDF de verdade (antes era só stub).

- **PDF via `@react-pdf/renderer`**: `NotaDebitoDocument.tsx` replica o layout oficial da Consuldata (logo/nome, CNPJ/endereço/telefone no rodapé, número sequencial `{n}/{ano}`, destinatário cliente+CNPJ+projeto, tabela de itens, total, dados bancários, texto legal "sem natureza fiscal", uma página por comprovante anexado no final).
- **Novos campos em `empresas`**: `endereco`, `telefone`, `logo_url` (não existiam — só tinha CNPJ). Populados com os dados reais da Consuldata. `dados_bancarios_empresa` também populada (Bradesco, Ag 0045, c/c 0665384-7, PIX 67256404000111).
- **Logo:** `empresas.logo_url` = `https://www.consuldata.com.br/wp-content/uploads/2022/08/LOGO-SITE-1.png` (URL pública do próprio site da Consuldata, fornecida pelo usuário). Confirmado funcionando — PDF de teste foi de 3.714 bytes (sem logo) pra 19.044 bytes (com a logo embutida), batendo com o tamanho do PNG (17.917 bytes). Sem `logo_url`, o cabeçalho cai num fallback de texto (nome da empresa em navy) — útil pra futuros clientes sem logo cadastrada ainda.
- **Fluxo:** financeiro seleciona cliente → projeto (2 submits em cascata, GET/searchParams) → vê despesas elegíveis (status='financeiro', tipo in nota_debito/ambos, daquele cliente+projeto) → escolhe quais incluir (checkbox, todas marcadas por padrão) → gera.
- **Geração** (`gerar-documento/actions.ts`): usa `admin` client (service_role) pra tudo após validar role='financeiro' na sessão. Busca comprovante mais recente de cada despesa (signed URL 10min, usado só internamente pro PDF); numeração sequencial = `count(documentos_gerados do ano) + 1` — **tem race condition em uso concorrente**, aceitável pro volume do piloto mas vale endurecer depois (ex: sequence dedicada) se o volume crescer. Upload do PDF pro bucket privado `documentos` (mesmo modelo do `comprovantes`: só service_role escreve). Cria `documentos_gerados` + `documentos_gerados_itens`, muda despesas selecionadas pra `status='nota_gerada'`.
- **Recibo de Reembolso não foi implementado** — só a Nota de Débito, porque só esse template foi fornecido. O botão/fluxo de seleção de tipo de documento não existe ainda; quando o usuário mandar o template do recibo, adicionar tipo_documento='recibo_reembolso' seguindo o mesmo padrão.
- Testado ponta a ponta com dado real: gerou "Nota de Débito Nº 1/2026", PDF válido confirmado via curl (magic bytes `%PDF-1.3`, 3714 bytes) e registros corretos em `documentos_gerados`/`documentos_gerados_itens`/despesa. Não consegui abrir o PDF no visualizador interno pra revisão visual (ferramenta não conectou neste ambiente) — usuário deve abrir o PDF baixado manualmente pra validar o layout.
