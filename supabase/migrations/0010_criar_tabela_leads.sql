create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  empresa text not null,
  telefone text,
  mensagem text,
  criado_em timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Formulário público da landing page: qualquer visitante pode enviar uma
-- solicitação, mas ninguém lê pelo client (sem policy de select) — só
-- service_role (usado internamente) ou consulta direta via SQL enxergam os leads.
create policy "leads_insert_publico"
  on public.leads for insert
  to anon, authenticated
  with check (true);
