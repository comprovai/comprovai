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
