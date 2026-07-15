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
