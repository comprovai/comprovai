-- Bucket privado para as fotos de comprovante. Sem políticas de RLS em
-- storage.objects para nenhum papel autenticado: todo upload/leitura passa
-- pela API route /api/extrair-comprovante (e futuras rotas server-side),
-- que usa a service_role e valida a empresa do usuário antes de tocar o
-- Storage. RLS do storage.objects já vem habilitada por padrão no Supabase,
-- então "nenhuma política" já significa "acesso negado direto do client".
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;
