-- ============================================================
-- Dashboard financeiro precisa mover despesas aprovada -> financeiro ->
-- lancada. Isso reverte parcialmente a decisão anterior de "bloqueio
-- total" para financeiro: agora ele pode atualizar APENAS status e
-- data_pagamento (nunca valor/categoria/fornecedor/tipo/etc), reforçado
-- por um trigger — não é RLS column-level nativo, então a trava real
-- vem do trigger abaixo, não só da policy.
-- ============================================================

alter table public.despesas add column if not exists data_pagamento date;

create policy "despesas_update_financeiro" on public.despesas
  for update using (
    status in ('aprovada','financeiro')
    and public.get_my_role() = 'financeiro'
    and empresa_id = public.get_my_empresa_id()
  )
  with check (
    empresa_id = public.get_my_empresa_id()
  );

create or replace function public.restringir_update_financeiro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_my_role() = 'financeiro' then
    if new.valor is distinct from old.valor
      or new.data_despesa is distinct from old.data_despesa
      or new.categoria_id is distinct from old.categoria_id
      or new.fornecedor is distinct from old.fornecedor
      or new.tipo is distinct from old.tipo
      or new.colaborador_id is distinct from old.colaborador_id
      or new.projeto_id is distinct from old.projeto_id
      or new.cliente_id is distinct from old.cliente_id
      or new.motivo_reprovacao is distinct from old.motivo_reprovacao
      or new.origem_ia is distinct from old.origem_ia
      or new.empresa_id is distinct from old.empresa_id
    then
      raise exception 'financeiro só pode alterar status e data_pagamento';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_restringir_update_financeiro
before update on public.despesas
for each row execute function public.restringir_update_financeiro();

revoke execute on function public.restringir_update_financeiro() from public, anon, authenticated;
