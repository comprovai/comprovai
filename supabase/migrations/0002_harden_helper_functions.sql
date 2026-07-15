-- Corrige search_path mutável em set_atualizado_em (evita hijack via search_path).
alter function public.set_atualizado_em() set search_path = public;

-- get_my_empresa_id/get_my_role são helpers internos usados dentro de
-- políticas RLS; não precisam ser chamáveis diretamente via RPC público.
revoke execute on function public.get_my_empresa_id() from public, anon;
grant execute on function public.get_my_empresa_id() to authenticated;

revoke execute on function public.get_my_role() from public, anon;
grant execute on function public.get_my_role() to authenticated;
