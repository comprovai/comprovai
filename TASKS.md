# Tasks

## Active
- [ ] **Configurar `NEXT_PUBLIC_WHATSAPP_NUMERO` nas env vars do Vercel** (produção) — já está em `.env.local` (dev) e testado funcionando (`5511957737933`, botão de handoff confirmado no browser); falta só replicar a mesma variável no painel do Vercel antes do próximo deploy, isso eu não consigo fazer por aqui.

## Someday / Backlog
- [ ] Responsividade mobile do menu lateral em `/app/*` — botão hambúrguer + drawer, implementado e testado (375px, sem scroll horizontal), pode precisar de ajuste fino depois de uso real no celular.
- [ ] Item 6a (Termos de Uso + LGPD) — conteúdo/estrutura técnica é barata, mas precisa de revisão de advogado antes de valer como documento jurídico real.
- [ ] Item 7 (manual SGI da Consuldata) — código de documento definido como `COM-PROC-001`; falta escrever o conteúdo e decidir se a "busca inteligente" vira uma página `/ajuda` no app (recomendado, reaproveita infra do item 5, já pronta) além do PDF formal.
- [ ] Item 4 completo (self-service de contratação + billing automatizado) — propositalmente adiado até ter 3-5 clientes pagantes; por ora, captação de lead (ver Completed) resolve a conversão sem esse custo.

## Completed
- [x] Chat inteligente (itens 5+6b): widget flutuante (`ChatWidget.tsx`) na landing pública (FAQ pra visitante) e em todas as telas autenticadas (`AppLayout`, contextualizado por role + tela atual via `usePathname`). Rota `/api/chat` com Claude (tool-use forçado, mesmo padrão da extração de comprovante) escolhendo entre responder direto ou `sugerir_whatsapp` quando detecta intenção de falar com humano — testado ponta a ponta nos dois casos (pergunta de FAQ respondida certo; pedido de humano detectado e ofereceu handoff). Botão do WhatsApp só aparece se `NEXT_PUBLIC_WHATSAPP_NUMERO` estiver configurado (ainda não está — ver Active). Confirmado sem sobreposição com o FAB "+" no mobile (cantos opostos).
- [x] Landing page: SEO técnico (metadata OpenGraph/Twitter, `sitemap.xml`, `robots.txt`) + seção de diferenciais + formulário "Solicitar acesso" (tabela `leads` no Supabase, migration `0010_criar_tabela_leads.sql`). Testado ponta a ponta: envio grava no banco, sitemap/robots respondem, sem overflow no mobile (375px).
- [x] UI de exclusão de despesa: modal de confirmação Sim/Não do design system (`Modal`/`Button`), sem `window.confirm()`/`window.alert()`. Botão de lixeira em `rascunho`/`enviada` (únicos status que a policy de DELETE permite); testado ponta a ponta (criou rascunho, excluiu, sumiu da lista sem reload).
- [x] Fase 1 — identidade visual própria do design system (tokens, componentes base) — revisão em /design-system
- [x] Modelar schema Supabase (Postgres + RLS) para empresas, usuários, despesas, aprovação, documentos gerados e exclusão de despesas — ver [[projects/comprovai]]
- [x] Auth Supabase (e-mail+senha, sem cadastro aberto) + reset de senha self-service
- [x] Extração de dados de comprovante via Claude API (foto -> dados estruturados)
- [x] Fluxo offline com Dexie.js (IndexedDB), sincronização automática ao reconectar
- [x] Fluxo completo: lançamento -> aprovação/reprovação -> conferência financeiro -> reembolso/nota de débito com PDF
- [x] Recibo de Reembolso com assinatura digital do colaborador
- [x] Painel admin (usuários, clientes/projetos, categorias, empresa)
- [x] Landing page pública + deploy em produção (comprovai.vercel.app)
- [x] Piloto Consuldata Teleprocessamento configurado no banco (4 usuários de teste ativos)
