-- Dados de cabeçalho (letterhead) necessários para gerar a Nota de Débito:
-- endereço/telefone da empresa e uma URL de logo opcional.
alter table public.empresas add column if not exists endereco text;
alter table public.empresas add column if not exists telefone text;
alter table public.empresas add column if not exists logo_url text;

-- Bucket privado para os PDFs gerados (notas de débito / recibos).
-- Mesmo modelo do bucket 'comprovantes': sem política de client, só a
-- service_role (via rota/server action) grava e gera signed URLs.
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;
