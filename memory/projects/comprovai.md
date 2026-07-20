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
- **Geração** (`gerar-documento/actions.ts`): usa `admin` client (service_role) pra tudo após validar role='financeiro' na sessão. Busca comprovante mais recente de cada despesa (signed URL 10min, usado só internamente pro PDF). Upload do PDF pro bucket privado `documentos` (mesmo modelo do `comprovantes`: só service_role escreve). Cria `documentos_gerados` + `documentos_gerados_itens`, muda despesas selecionadas pra `status='nota_gerada'`.
- **Numeração sequencial endurecida (0009, 2026-07-15):** trocado o `count()+1` (tinha race condition) por tabela `documentos_numeracao` (empresa_id, tipo_documento, ano, ultimo_numero) + função `proximo_numero_documento()` que faz UPSERT atômico (`ON CONFLICT DO UPDATE ... RETURNING`). Semeada com o maior número já emitido pra não colidir com os documentos de teste (1/2026, 2/2026) já existentes. Testado via SQL direto: retornou 3 corretamente (consumiu esse número — próxima nota real sai como 4/2026, sem problema, é só um número de teste "pulado").
- Testado ponta a ponta com dado real: gerou "Nota de Débito Nº 1/2026", PDF válido confirmado via curl (magic bytes `%PDF-1.3`, 3714 bytes) e registros corretos em `documentos_gerados`/`documentos_gerados_itens`/despesa. Não consegui abrir o PDF no visualizador interno pra revisão visual (ferramenta não conectou neste ambiente) — usuário deve abrir o PDF baixado manualmente pra validar o layout.

## Recibo de Reembolso (2026-07-16)
Template recebido do usuário. Fluxo em duas etapas (diferente da Nota de Débito, que é gerada de uma vez só pelo financeiro): financeiro cria o recibo (fica `aguardando_assinatura`, sem PDF ainda) → colaborador assina com canvas em `/app/minhas-despesas/recibos` → só aí o PDF é gerado de verdade (com a imagem da assinatura, IP, user-agent, timestamp capturados no momento da assinatura) e as despesas viram `nota_gerada`.

- **Elegibilidade:** despesas `status='lancada'` (já marcadas como reembolsadas pelo financeiro) e `tipo in (reembolso, ambos)` — ou seja, o recibo é o registro formal/assinado de um reembolso que já aconteceu, não o que dispara o pagamento.
- **`/app/financeiro/gerar-recibo`:** financeiro seleciona colaborador (não cliente/projeto, como na nota), vê despesas elegíveis, cria o `documentos_gerados` (tipo_documento='recibo_reembolso', destinatario_tipo='colaborador', status='aguardando_assinatura') + itens. Usa a mesma função `proximo_numero_documento()` da Fase 7 (já genérica por tipo_documento).
- **`/app/minhas-despesas/recibos`:** colaborador vê "aguardando assinatura" e "assinados" (com link do PDF). `SignaturePad.tsx` é um canvas simples (pointer events, sem lib externa) que exporta a assinatura como PNG base64.
- **`assinarRecibo` action:** confere que quem está assinando é o dono do documento e que ainda não foi assinado; captura IP (`x-forwarded-for`) e user-agent via `headers()` do Next; salva a assinatura como PNG no bucket `documentos`; só então renderiza o PDF final (`ReciboReembolsoDocument.tsx`, cabeçalho mais simples que a nota — só logo/nome/CNPJ, conforme o template) e atualiza tudo.
- Nenhuma migration nova precisou — `documentos_gerados` já tinha as colunas de assinatura desde a Fase 2 (o schema original já antecipava esse fluxo).
- Sidebar do colaborador ganhou o item "Recibos"; dashboard do financeiro agora tem os 2 botões separados (Nota de Débito / Recibo de Reembolso).
- **Testado ponta a ponta de verdade** (não só via SQL): financeiro gerou o recibo, colaborador assinou desenhando no canvas (via drag simulado no browser), PDF final de 21.901 bytes confirmado via curl, `assinatura_ip`/`assinatura_user_agent` gravados corretamente, despesas viraram `nota_gerada`.

## Painel de Admin (Fase 8, 2026-07-15)
`/app/admin/*`, guard próprio em `src/app/app/admin/layout.tsx` (só role='admin', redireciona outros pra sua home via `ROLE_HOME`). Sidebar do admin agora tem 4 itens (Usuários, Clientes e Projetos, Categorias, Empresa) em vez de um só "Admin" genérico.

- **Usuários** (`/app/admin/usuarios`): cria usuário de verdade — `auth.admin.createUser` (service_role) pra criar o login, depois insert normal em `usuarios` (respeita a RLS admin já existente da Fase 2). Admin define a senha inicial diretamente (não tem convite por e-mail, mesmo padrão manual usado o jogo inteiro). Edição inline por linha (role, gestor_id, ativo) e reset de senha por linha (`auth.admin.updateUserById`) — era o único workaround pro "esqueci minha senha" antes do self-service (ver Fase 9 abaixo); continua útil pra admin resetar sem depender do e-mail do usuário.
- **Clientes e Projetos** (`/app/admin/clientes`): dois CRUDs simples (clientes: nome/cnpj; projetos: nome/código/cliente/ativo), edição inline por linha.
- **Categorias** (`/app/admin/categorias`): nome + limite_valor opcional, edição inline.
- **Empresa** (`/app/admin/empresa`): edita `empresas` (nome/cnpj/endereco/telefone/logo_url) e faz upsert manual em `dados_bancarios_empresa` (não tem constraint unique em empresa_id, então a action confere se já existe linha antes de decidir update vs insert).
- Nenhuma RLS nova foi necessária — as políticas de admin já cobriam tudo (usuarios_insert_admin, usuarios_update_self_or_admin, empresas_update_admin, e as políticas genéricas company-wide de clientes/projetos/categorias/dados_bancarios da Fase 2).
- Testado ponta a ponta com usuário real: criou um usuário colaborador pelo painel e conseguiu logar com ele imediatamente (confirma que o fluxo auth.admin.createUser + insert perfil funciona de ponta a ponta); guard de role bloqueou o colaborador de acessar `/app/admin/*`; criou cliente novo e viu aparecer no select de projetos na hora.

## Esqueci minha senha + Offline (Fase 9, 2026-07-16)
Decisões do usuário: reset de senha via **e-mail embutido do Supabase** (sem SMTP próprio — aceitável pro volume do piloto); offline **opção 2** — sem conexão, colaborador sobe a foto, é avisado, preenche manual, sincroniza depois.

**Reset de senha:**
- Link "Esqueci minha senha" no login (antes desabilitado) agora vai pra `/esqueci-senha` → `supabase.auth.resetPasswordForEmail()` client-side (não expõe se o e-mail existe, mesma postura do erro de login).
- `/auth/callback` (Route Handler) troca o `code` da URL por sessão via `exchangeCodeForSession` e redireciona pra `/redefinir-senha`.
- `/redefinir-senha` checa se existe sessão válida antes de mostrar o form; sem sessão (link inválido/expirado ou usuário nunca clicou no e-mail) mostra erro claro. Testado os dois casos: com sessão ativa mostra o form, sem sessão mostra "link inválido ou expirado".
- Não dá pra confirmar recebimento real do e-mail neste ambiente (sem acesso a caixa de entrada) — só confirmei que a chamada ao Supabase não retorna erro.

**Offline (Dexie.js):**
- `src/lib/offline-db.ts` — banco IndexedDB (`comprovai-offline`) com uma tabela `despesasPendentes` guardando os campos do formulário + a foto como `Blob`.
- `useOnlineStatus` hook (`navigator.onLine` + eventos `online`/`offline`).
- `DespesaForm`: se offline, pula a chamada `/api/extrair-comprovante` (não adianta, sem rede) e mostra banner avisando; ao salvar, grava no Dexie em vez de chamar o servidor. Edição de despesa reprovada (`despesaExistente` existe) fica bloqueada offline — só criação nova funciona offline, por decisão de escopo.
- `/api/upload-comprovante` — rota nova, sobe a foto sem chamar a Claude (usada só na sincronização, já que a extração por IA não rodou no momento da criação offline).
- `salvarDespesa` ganhou `criadoOffline` (grava `despesas.criado_offline`, coluna que já existia desde a Fase 2) e `skipRedirect` (pra rodar em background sem navegar a página).
- `SincronizarPendentes` (montado em `/app/minhas-despesas`): ao detectar conexão, sobe cada pendência (foto + dados) e cria a despesa de verdade.
- **Bug real encontrado e corrigido durante o teste:** o efeito de sincronização rodava em duplicidade (Strict Mode do React re-invoca efeitos em dev) e criava a MESMA despesa duas vezes no Supabase. Corrigido com um lock em nível de módulo (`sincronizacaoEmAndamento`, fora do componente — sobrevive à dupla invocação) + reivindicação do registro do Dexie (delete-then-process, com re-inserção em caso de falha) antes de processar.
- Testado ponta a ponta de verdade (offline simulado via `Object.defineProperty(navigator, 'onLine', ...)` + eventos, já que a ferramenta de browser não tem toggle real de rede): criou despesa offline → confirmou no IndexedDB → voltou "online" → confirmou 1 único registro no Supabase (não duplicado, após o fix) → confirmou IndexedDB limpo depois da sincronização.

## Exclusão de despesa + responsividade mobile (2026-07-20)
Pendência da Fase 4 finalmente resolvida: modal Sim/Não do design system (nunca `window.confirm`) em `MinhasDespesasList.tsx`, botão de lixeira só aparece em `rascunho`/`enviada` (únicos status que a policy de DELETE permite — RLS quem decide, a action só delega). Testado ponta a ponta.

**Responsividade mobile do `AppLayout`** (afeta todas as roles, não só colaborador): sidebar era `w-60` fixa dentro de um `flex` row sem colapso — no celular o conteúdo saía da tela e precisava de scroll horizontal. Corrigido em `Sidebar.tsx`: `hidden md:flex` na sidebar desktop, mais uma barra mobile (`md:hidden`) com botão hambúrguer que abre um drawer (`role="dialog"`, fecha ao clicar fora ou navegar). `AppLayout` virou `flex-col md:flex-row`. Confirmado via `document.body.scrollWidth === window.innerWidth` em 375px — pendência real, não só do colaborador.

## Landing page — SEO, conversão e decisões de arquitetura (2026-07-20)
**Decisões de arquitetura fechadas** (perguntas recorrentes do usuário sobre "multi-tenant"):
- **Banco por cliente: não.** Modelo permanece compartilhado (schema único + RLS por `empresa_id`), que é o que já existe desde a Fase 2. Um banco físico por cliente só se justificaria por exigência contratual de isolamento físico — não é o caso hoje.
- **Self-service de contratação (billing automatizado): adiado de propósito.** Com 1 piloto, automatizar cadastro+pagamento+provisionamento é gasto de engenharia sem retorno ainda. Resolvido por enquanto com captação de lead (abaixo) + provisionamento manual (como foi feito com a Consuldata), até ter 3-5 clientes pagantes.

**O que foi construído:**
- `layout.tsx`: metadata expandida (OpenGraph, Twitter card, keywords, `metadataBase`). `sitemap.ts` e `robots.ts` novos (rotas nativas do Next, geram `/sitemap.xml` e `/robots.txt`; `disallow: /app/` pra não indexar telas autenticadas).
- `page.tsx`: seção de 4 diferenciais (nota de débito automática, sem cartão/Pix corporativo, aprovação com trilha, funciona offline) + CTA duplo ("Solicitar acesso" via anchor scroll + "Área do Cliente" pro login).
- **Tabela `leads` nova** (migration `0010_criar_tabela_leads.sql`): `nome`/`email`/`empresa`/`telefone`/`mensagem`/`criado_em`. RLS com `insert` público (`anon`+`authenticated`, `with check (true)`) e **sem policy de select** — visitante grava, ninguém lê pelo client, só via SQL direto/service_role. `SolicitarAcessoForm.tsx` (client) + `solicitarAcesso` action em `src/app/actions.ts` (novo arquivo, root do App Router — só existia `src/app/app/actions.ts` até então, que é do route group `/app`, coisa diferente).
- Testado ponta a ponta: form grava no banco (confirmado via SQL, lead de teste depois removido), `sitemap.xml`/`robots.txt` respondem certo, sem overflow horizontal no mobile.

**Pendências que ficaram documentadas no [[TASKS]]** pra próxima sessão: item 6a (Termos/LGPD) precisa de revisão de advogado antes de valer como documento real.

## Manual de Procedimentos COM-PROC-001 (2026-07-20, item 7)
Li o modelo real (`SUP-PROC-001`, Suprimentos, fornecido pelo usuário) pra replicar o padrão SGI da Consuldata: cabeçalho com código/versão/data, bloco Elaborado/Verificado/Aprovado Por, vigência, histórico de revisões, sumário fixo (Objetivo/Escopo/Definições/Papéis/Procedimento Operacional/Disposições Finais).

- **Conteúdo centralizado em `src/lib/manual/conteudo-manual.ts`** (`MANUAL_META` + textos) — usado tanto pelo PDF quanto pelo chat, sem duplicar.
- **`ManualDocument.tsx`** segue o mesmo estilo visual dos outros PDFs (`NotaDebitoDocument.tsx`: navy `#212771`, Helvetica, rodapé fixo com código/versão/data).
- **`/api/manual`** (GET, exige login, qualquer role) renderiza sob demanda via `renderToBuffer` — mesmo padrão da Nota de Débito. Sem numeração sequencial (não é um documento transacional por cliente, é um manual único da empresa).
- **Cadeia de assinatura decidida por mim** (sinalizado no [[TASKS]] pra confirmação): Elaborado Por Junior Lopes, Verificado Por Laryssa Victoria (mesma verificadora do SUP-PROC-001), Aprovado Por Igor Monin Tenório Magalhães (mesmo aprovador) — não inventei nomes novos, usei a cadeia que já existe pra esse tipo de documento na Consuldata.
- **Decisão consciente:** a seção "Responsáveis e Aprovadores com e-mails" do modelo original NÃO virou uma lista estática de nomes/e-mails no manual do Comprovai — isso vive em Admin > Usuários (dado dinâmico) e ficaria desatualizado no PDF estático. O manual só referencia isso em Disposições Finais.
- **"Busca inteligente no manual"** (exigência literal do item 7) resolvida sem construir nada novo: o mesmo `MANUAL_COMPLETO` (de `conteudo-manual.ts`, reexportado por `src/lib/chat/conteudo-ajuda.ts`) entra no system prompt de `/api/chat` só quando `role` está presente (usuário autenticado) — o manual é interno da Consuldata, não aparece pro chat público da landing. Testado: perguntei o código do documento e onde baixar, respondeu certo (`COM-PROC-001`, link "Manual do sistema" na sidebar).
- Link "Manual do sistema" adicionado na `Sidebar.tsx`, visível pra todas as roles (fora do `navItems` por role).

## Chat inteligente — FAQ + chatbot contextual (2026-07-20, itens 5+6b)
Construído junto (mesma infra) logo depois da landing page, como planejado.

- **`src/lib/chat/conteudo-ajuda.ts`**: conteúdo do FAQ (Q&A sobre o produto) + dicas por role (`DICAS_POR_ROLE`), tudo hardcoded — não criei tabela/admin de FAQ ainda, não vale o custo com 1 cliente.
- **`/api/chat`**: mesmo padrão de tool-use forçado da extração de comprovante (`@anthropic-ai/sdk`, `claude-sonnet-5`), mas com 2 tools e `tool_choice: {type: "any"}` (Claude escolhe qual usar, não fixo): `responder` (resposta normal) ou `sugerir_whatsapp` (quando detecta intenção de falar com humano — retorna texto + resumo pro wa.me). Prompt de sistema monta produto+FAQ+dica do role+tela atual.
- **`ChatWidget.tsx`**: botão flutuante **`bottom-6 left-6`** (canto oposto ao FAB "+" de `/app/minhas-despesas`, que é `bottom-6 right-6` — de propósito, pra nunca colidir). Montado em dois lugares: `src/app/page.tsx` (landing pública, sem `role` — modo só-FAQ, item 5) e `src/app/app/layout.tsx` (toda tela autenticada, com `role` do usuário — item 6b). Contexto de tela vem de `usePathname()` dentro do próprio widget, não precisa passar prop por página.
- **Handoff pro WhatsApp:** botão só renderiza se `NEXT_PUBLIC_WHATSAPP_NUMERO` estiver setada (env var nova, formato `55DDDNUMERO`) — **ainda não está configurada, é a única pendência ativa no [[TASKS]]**. Sem a env var, o chat funciona normal (detecção de intenção inclusive), só não mostra o botão — degradação graciosa, não quebra nada.
- Testado ponta a ponta: pergunta de FAQ respondida certo (nota de débito) tanto na landing quanto dentro do app; pedido explícito de "falar com uma pessoa" corretamente disparou `sugerir_whatsapp`; contexto de role+tela confirmado (colaborador em `/app/minhas-despesas` recebeu resposta específica daquela tela); sem sobreposição com o FAB no mobile (375px, confirmado via bounding box).
