# Tasks

## Active

## Someday / Backlog
- [ ] Configurar Auth Supabase com login restrito a domínio corporativo (sem cadastro aberto)
- [ ] Integrar Claude API para extração de dados de comprovantes (foto -> dados estruturados)
- [ ] Implementar fluxo offline com Dexie.js (IndexedDB)
- [ ] Construir fluxo completo: lançamento -> aprovação/reprovação -> conferência financeiro -> reembolso/nota de débito com PDF
- [ ] Preparar piloto com Consuldata Teleprocessamento (Santos/SP)
- [ ] Fase 3 — UI de exclusão de despesa: usar modal de confirmação próprio do design system (StatusStamp/Button já existentes), NUNCA `window.confirm()`/`window.alert()` do browser. Botões Sim/Não seguindo os tokens visuais do Comprovai.

## Completed
- [x] Fase 1 — identidade visual própria do design system (tokens, componentes base) — revisão em /design-system
- [x] Modelar schema Supabase (Postgres + RLS) para empresas, usuários, despesas, aprovação, documentos gerados e exclusão de despesas — ver [[projects/comprovai]]
