-- Sem isso, nenhuma despesa com pelo menos um registro de histórico
-- (ex: qualquer despesa já enviada) pode ser excluída, mesmo quando a
-- política de DELETE permite (rascunho/enviada) — a FK bloqueia antes.
-- A exclusão em si continua permanentemente registrada em
-- despesas_exclusoes (que não tem FK pra despesas, de propósito).
alter table public.historico_aprovacao
  drop constraint historico_aprovacao_despesa_id_fkey;

alter table public.historico_aprovacao
  add constraint historico_aprovacao_despesa_id_fkey
  foreign key (despesa_id) references public.despesas(id) on delete cascade;
