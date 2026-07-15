-- ============================================================
-- Após 'aprovada', a despesa fica congelada para sempre: nenhum papel
-- (nem financeiro) pode mais alterá-la ou excluí-la via RLS. O
-- acompanhamento financeiro passa a ser feito em documentos_gerados /
-- documentos_gerados_itens, sem nunca tocar despesas novamente.
-- 'reprovada' continua editável apenas pelo colaborador dono (para
-- corrigir e reenviar) — política despesas_update_colaborador já cobre
-- isso e não muda.
-- ============================================================

drop policy "despesas_update_financeiro" on public.despesas;

-- Admin pode agir sobre qualquer despesa da própria empresa, mas só antes
-- da decisão (rascunho/enviada) — mesma janela do aprovador, sem exigir
-- vínculo gestor_id.
create policy "despesas_update_admin" on public.despesas
  for update using (
    status in ('rascunho','enviada')
    and public.get_my_role() = 'admin'
    and empresa_id = public.get_my_empresa_id()
  )
  with check (
    empresa_id = public.get_my_empresa_id()
  );
