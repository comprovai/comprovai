-- ============================================================
-- Exclusão de despesas: colaborador (próprias, pré-decisão),
-- aprovador (pré-decisão, como gestor), admin (pré-decisão) —
-- todas com log imutável automático via trigger.
-- ============================================================

-- Tabela de log de exclusões. Sem FK para despesas: a despesa deixa de
-- existir após o DELETE, e queremos preservar o registro mesmo assim.
create table public.despesas_exclusoes (
  id uuid primary key default gen_random_uuid(),
  despesa_id uuid not null,
  empresa_id uuid not null references public.empresas(id),
  colaborador_id uuid not null,
  valor numeric not null,
  status_no_momento text not null,
  excluido_por uuid not null references public.usuarios(id),
  excluido_por_role text not null,
  criado_em timestamptz not null default now()
);

comment on table public.despesas_exclusoes is
  'Log imutável de exclusões de despesas. despesa_id não tem FK porque a despesa deixa de existir; preserva o registro para auditoria pós-exclusão.';

create index idx_despesas_exclusoes_empresa_id on public.despesas_exclusoes(empresa_id);
create index idx_despesas_exclusoes_despesa_id on public.despesas_exclusoes(despesa_id);

alter table public.despesas_exclusoes enable row level security;

-- Somente leitura para membros da empresa. Não há política de INSERT/UPDATE/
-- DELETE para nenhum papel: a única forma de gravar é via trigger SECURITY
-- DEFINER abaixo, que roda com o dono da função (bypassa RLS), então nenhum
-- cliente autenticado consegue inserir ou forjar um registro diretamente.
create policy "despesas_exclusoes_select_empresa" on public.despesas_exclusoes
  for select using (empresa_id = public.get_my_empresa_id());

-- Grava o log da exclusão. security definer + search_path fixo para evitar
-- hijack e para poder inserir mesmo com RLS habilitado na tabela de log.
create or replace function public.log_exclusao_despesa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.despesas_exclusoes (
    despesa_id, empresa_id, colaborador_id, valor, status_no_momento,
    excluido_por, excluido_por_role
  ) values (
    old.id, old.empresa_id, old.colaborador_id, old.valor, old.status,
    auth.uid(), public.get_my_role()
  );
  return old;
end;
$$;

create trigger trg_despesas_log_exclusao
after delete on public.despesas
for each row execute function public.log_exclusao_despesa();

-- log_exclusao_despesa só deve ser invocada pelo mecanismo de trigger,
-- nunca diretamente via RPC por nenhum papel.
revoke execute on function public.log_exclusao_despesa() from public, anon, authenticated;

-- ---- Políticas de DELETE em despesas ----

-- Colaborador: só a própria despesa, e só antes de aprovada/reprovada
-- (ou seja, enquanto ainda está em rascunho ou enviada aguardando decisão).
create policy "despesas_delete_colaborador" on public.despesas
  for delete using (
    colaborador_id = auth.uid()
    and empresa_id = public.get_my_empresa_id()
    and status in ('rascunho','enviada')
  );

-- Aprovador: só antes de decidir (status = 'enviada'), e só despesas de
-- colaboradores dos quais é gestor.
create policy "despesas_delete_aprovador" on public.despesas
  for delete using (
    status = 'enviada'
    and public.get_my_role() = 'aprovador'
    and exists (
      select 1 from public.usuarios u
      where u.id = despesas.colaborador_id
        and u.gestor_id = auth.uid()
    )
  );

-- Admin: só antes da decisão (rascunho ou enviada), dentro da própria empresa.
create policy "despesas_delete_admin" on public.despesas
  for delete using (
    status in ('rascunho','enviada')
    and public.get_my_role() = 'admin'
    and empresa_id = public.get_my_empresa_id()
  );
