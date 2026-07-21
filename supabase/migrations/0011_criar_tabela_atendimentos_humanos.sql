create table public.atendimentos_humanos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(id),
  usuario_id uuid references public.usuarios(id),
  origem text not null,
  pagina text,
  resumo text not null,
  transcricao jsonb not null,
  status text not null default 'aguardando',
  criado_em timestamptz not null default now()
);

alter table public.atendimentos_humanos enable row level security;

-- Chat público (landing, visitante anônimo) pode registrar pedido de atendimento,
-- mas só sem vínculo de empresa/usuário (evita spoofing de dado de outra empresa).
create policy "atendimentos_insert_anon"
  on public.atendimentos_humanos for insert
  to anon
  with check (empresa_id is null and usuario_id is null);

-- Chat dentro do app (usuário logado) só grava vinculado à própria empresa.
create policy "atendimentos_insert_autenticado"
  on public.atendimentos_humanos for insert
  to authenticated
  with check (empresa_id = public.get_my_empresa_id());

-- Admin da empresa pode ver os pedidos de atendimento da própria empresa
-- (base pra um futuro inbox / integração com WhatsApp Business API).
create policy "atendimentos_select_admin"
  on public.atendimentos_humanos for select
  to authenticated
  using (empresa_id = public.get_my_empresa_id() and public.get_my_role() = 'admin');
