-- Substitui a numeração count()+1 (tinha race condition sob geração
-- concorrente) por um contador dedicado, incrementado atomicamente via
-- UPSERT. Só service_role toca essa tabela (mesmo padrão de despesas_exclusoes).
create table public.documentos_numeracao (
  empresa_id uuid not null references public.empresas(id),
  tipo_documento text not null,
  ano integer not null,
  ultimo_numero integer not null default 0,
  primary key (empresa_id, tipo_documento, ano)
);

alter table public.documentos_numeracao enable row level security;

-- Semeia o contador com o maior número já emitido, pra não colidir com
-- documentos gerados antes desta migration (ex: Nº 1/2026, 2/2026 já existentes).
insert into public.documentos_numeracao (empresa_id, tipo_documento, ano, ultimo_numero)
select
  empresa_id,
  tipo_documento,
  split_part(numero, '/', 2)::integer as ano,
  max(split_part(numero, '/', 1)::integer) as ultimo_numero
from public.documentos_gerados
group by empresa_id, tipo_documento, split_part(numero, '/', 2)::integer
on conflict (empresa_id, tipo_documento, ano) do nothing;

create or replace function public.proximo_numero_documento(
  p_empresa_id uuid,
  p_tipo_documento text,
  p_ano integer
)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.documentos_numeracao (empresa_id, tipo_documento, ano, ultimo_numero)
  values (p_empresa_id, p_tipo_documento, p_ano, 1)
  on conflict (empresa_id, tipo_documento, ano)
  do update set ultimo_numero = documentos_numeracao.ultimo_numero + 1
  returning ultimo_numero;
$$;

revoke execute on function public.proximo_numero_documento(uuid, text, integer) from public, anon, authenticated;
