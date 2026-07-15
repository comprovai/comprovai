-- ============================================================
-- Comprovai — schema inicial
-- Tabelas de empresas, usuários, despesas, aprovação e documentos
-- gerados (nota de débito / recibo de reembolso), com RLS desde a criação.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- TABELAS
-- ============================================================

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  dominio_email text not null unique,
  criado_em timestamptz not null default now()
);

-- Perfil de usuário (estende auth.users). O vínculo empresa_id/role é
-- preenchido pelo fluxo de signup/onboarding da aplicação (Fase 3),
-- que roda com a service_role e portanto não depende das políticas abaixo.
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  nome text not null,
  email text not null,
  role text not null check (role in ('colaborador','aprovador','financeiro','admin')),
  gestor_id uuid references public.usuarios(id),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  nome text not null,
  cnpj text
);

create table public.projetos_propostas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  cliente_id uuid references public.clientes(id),
  codigo text,
  nome text not null,
  ativo boolean not null default true
);

create table public.categorias_despesa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  nome text not null,
  limite_valor numeric
);

create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  colaborador_id uuid not null references public.usuarios(id),
  projeto_id uuid references public.projetos_propostas(id),
  cliente_id uuid references public.clientes(id),
  data_despesa date not null,
  categoria_id uuid references public.categorias_despesa(id),
  fornecedor text,
  valor numeric not null,
  tipo text not null check (tipo in ('reembolso','nota_debito','ambos')),
  status text not null default 'rascunho' check (status in
    ('rascunho','enviada','aprovada','reprovada','financeiro','lancada','nota_gerada')),
  motivo_reprovacao text,
  aprovador_id uuid references public.usuarios(id),
  aprovado_em timestamptz,
  origem_ia jsonb,
  confirmado_colaborador boolean not null default false,
  criado_offline boolean not null default false,
  sync_status text not null default 'sincronizado',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.comprovantes (
  id uuid primary key default gen_random_uuid(),
  despesa_id uuid not null references public.despesas(id) on delete cascade,
  url_arquivo text not null,
  extraido_ia jsonb,
  criado_em timestamptz not null default now()
);

create table public.documentos_gerados (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  tipo_documento text not null check (tipo_documento in ('nota_debito','recibo_reembolso')),
  destinatario_tipo text not null check (destinatario_tipo in ('cliente','colaborador')),
  cliente_id uuid references public.clientes(id),
  colaborador_id uuid references public.usuarios(id),
  numero text not null,
  data_emissao date not null default current_date,
  valor_total numeric not null,
  pdf_url text,
  status text not null default 'gerado',
  assinatura_url text,
  assinatura_timestamp timestamptz,
  assinatura_ip text,
  assinatura_user_agent text,
  criado_por uuid not null references public.usuarios(id),
  criado_em timestamptz not null default now()
);

create table public.documentos_gerados_itens (
  id uuid primary key default gen_random_uuid(),
  documento_gerado_id uuid not null references public.documentos_gerados(id) on delete cascade,
  despesa_id uuid not null references public.despesas(id)
);

create table public.dados_bancarios_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  banco text,
  agencia text,
  conta text,
  chave_pix text
);

-- Auditoria imutável: apenas INSERT e SELECT (ver políticas RLS abaixo).
create table public.historico_aprovacao (
  id uuid primary key default gen_random_uuid(),
  despesa_id uuid not null references public.despesas(id),
  usuario_id uuid not null references public.usuarios(id),
  acao text not null,
  observacao text,
  criado_em timestamptz not null default now()
);

comment on table public.historico_aprovacao is
  'Auditoria imutável do fluxo de aprovação. Não possui política de UPDATE/DELETE para nenhum papel.';

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_usuarios_empresa_id on public.usuarios(empresa_id);
create index idx_usuarios_gestor_id on public.usuarios(gestor_id);
create index idx_clientes_empresa_id on public.clientes(empresa_id);
create index idx_projetos_empresa_id on public.projetos_propostas(empresa_id);
create index idx_projetos_cliente_id on public.projetos_propostas(cliente_id);
create index idx_categorias_empresa_id on public.categorias_despesa(empresa_id);
create index idx_despesas_empresa_id on public.despesas(empresa_id);
create index idx_despesas_colaborador_id on public.despesas(colaborador_id);
create index idx_despesas_aprovador_id on public.despesas(aprovador_id);
create index idx_despesas_status on public.despesas(status);
create index idx_comprovantes_despesa_id on public.comprovantes(despesa_id);
create index idx_documentos_empresa_id on public.documentos_gerados(empresa_id);
create index idx_documentos_itens_documento_id on public.documentos_gerados_itens(documento_gerado_id);
create index idx_documentos_itens_despesa_id on public.documentos_gerados_itens(despesa_id);
create index idx_dados_bancarios_empresa_id on public.dados_bancarios_empresa(empresa_id);
create index idx_historico_despesa_id on public.historico_aprovacao(despesa_id);

-- ============================================================
-- FUNÇÕES AUXILIARES (security definer para evitar recursão de RLS
-- ao consultar a própria tabela usuarios dentro das políticas)
-- ============================================================

create or replace function public.get_my_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.usuarios where id = auth.uid();
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.usuarios where id = auth.uid();
$$;

-- Mantém despesas.atualizado_em em dia a cada UPDATE.
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_despesas_atualizado_em
before update on public.despesas
for each row execute function public.set_atualizado_em();

-- ============================================================
-- RLS
-- ============================================================

alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.clientes enable row level security;
alter table public.projetos_propostas enable row level security;
alter table public.categorias_despesa enable row level security;
alter table public.despesas enable row level security;
alter table public.comprovantes enable row level security;
alter table public.documentos_gerados enable row level security;
alter table public.documentos_gerados_itens enable row level security;
alter table public.dados_bancarios_empresa enable row level security;
alter table public.historico_aprovacao enable row level security;

-- ---- empresas ----
-- Leitura restrita à própria empresa; escrita restrita a admin da própria empresa.
-- Criação de empresa (onboarding) é feita via service_role, que ignora RLS.
create policy "empresas_select_own" on public.empresas
  for select using (id = public.get_my_empresa_id());

create policy "empresas_update_admin" on public.empresas
  for update using (id = public.get_my_empresa_id() and public.get_my_role() = 'admin')
  with check (id = public.get_my_empresa_id() and public.get_my_role() = 'admin');

-- ---- usuarios ----
create policy "usuarios_select_empresa" on public.usuarios
  for select using (empresa_id = public.get_my_empresa_id());

create policy "usuarios_insert_admin" on public.usuarios
  for insert with check (empresa_id = public.get_my_empresa_id() and public.get_my_role() = 'admin');

create policy "usuarios_update_self_or_admin" on public.usuarios
  for update using (id = auth.uid() or (empresa_id = public.get_my_empresa_id() and public.get_my_role() = 'admin'))
  with check (empresa_id = public.get_my_empresa_id());

-- ---- clientes / projetos_propostas / categorias_despesa ----
-- Regra genérica do enunciado: leitura e escrita restritas à empresa,
-- sem papel específico exigido (não detalhado no pedido).
create policy "clientes_all_empresa" on public.clientes
  for all using (empresa_id = public.get_my_empresa_id())
  with check (empresa_id = public.get_my_empresa_id());

create policy "projetos_all_empresa" on public.projetos_propostas
  for all using (empresa_id = public.get_my_empresa_id())
  with check (empresa_id = public.get_my_empresa_id());

create policy "categorias_all_empresa" on public.categorias_despesa
  for all using (empresa_id = public.get_my_empresa_id())
  with check (empresa_id = public.get_my_empresa_id());

-- ---- despesas ----
create policy "despesas_select_empresa" on public.despesas
  for select using (empresa_id = public.get_my_empresa_id());

create policy "despesas_insert_colaborador" on public.despesas
  for insert with check (
    empresa_id = public.get_my_empresa_id()
    and colaborador_id = auth.uid()
    and status in ('rascunho','reprovada')
  );

create policy "despesas_update_colaborador" on public.despesas
  for update using (
    colaborador_id = auth.uid()
    and status in ('rascunho','reprovada')
  )
  with check (
    empresa_id = public.get_my_empresa_id()
    and colaborador_id = auth.uid()
  );

-- Aprovador: identificado pela relação gestor_id do colaborador (conforme
-- pedido). Adicionamos get_my_role() = 'aprovador' como camada extra de
-- defesa, já que todo gestor referenciado em gestor_id deve ter esse papel
-- pela definição de papéis do produto — sinalizado no resumo para revisão.
create policy "despesas_update_aprovador" on public.despesas
  for update using (
    status = 'enviada'
    and public.get_my_role() = 'aprovador'
    and exists (
      select 1 from public.usuarios u
      where u.id = despesas.colaborador_id
        and u.gestor_id = auth.uid()
    )
  )
  with check (
    empresa_id = public.get_my_empresa_id()
  );

create policy "despesas_update_financeiro" on public.despesas
  for update using (
    status in ('aprovada','financeiro')
    and public.get_my_role() = 'financeiro'
    and empresa_id = public.get_my_empresa_id()
  )
  with check (
    empresa_id = public.get_my_empresa_id()
  );

-- ---- comprovantes ---- (escopo via despesa pai, não tem empresa_id própria)
create policy "comprovantes_all_empresa" on public.comprovantes
  for all using (
    exists (select 1 from public.despesas d where d.id = comprovantes.despesa_id and d.empresa_id = public.get_my_empresa_id())
  )
  with check (
    exists (select 1 from public.despesas d where d.id = comprovantes.despesa_id and d.empresa_id = public.get_my_empresa_id())
  );

-- ---- documentos_gerados ----
create policy "documentos_gerados_all_empresa" on public.documentos_gerados
  for all using (empresa_id = public.get_my_empresa_id())
  with check (empresa_id = public.get_my_empresa_id());

-- ---- documentos_gerados_itens ---- (escopo via documento pai)
create policy "documentos_itens_all_empresa" on public.documentos_gerados_itens
  for all using (
    exists (select 1 from public.documentos_gerados dg where dg.id = documentos_gerados_itens.documento_gerado_id and dg.empresa_id = public.get_my_empresa_id())
  )
  with check (
    exists (select 1 from public.documentos_gerados dg where dg.id = documentos_gerados_itens.documento_gerado_id and dg.empresa_id = public.get_my_empresa_id())
  );

-- ---- dados_bancarios_empresa ----
create policy "dados_bancarios_all_empresa" on public.dados_bancarios_empresa
  for all using (empresa_id = public.get_my_empresa_id())
  with check (empresa_id = public.get_my_empresa_id());

-- ---- historico_aprovacao ---- (imutável: só INSERT e SELECT, sem UPDATE/DELETE)
create policy "historico_select_empresa" on public.historico_aprovacao
  for select using (
    exists (select 1 from public.despesas d where d.id = historico_aprovacao.despesa_id and d.empresa_id = public.get_my_empresa_id())
  );

create policy "historico_insert_empresa" on public.historico_aprovacao
  for insert with check (
    exists (select 1 from public.despesas d where d.id = historico_aprovacao.despesa_id and d.empresa_id = public.get_my_empresa_id())
  );
