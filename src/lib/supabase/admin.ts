import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente com service_role — bypassa RLS. Uso restrito a rotas server-side
 * que já validaram o usuário e a empresa antes de chamar isso (ex: upload
 * no Storage, escrita em tabelas de log imutáveis). Nunca importar em
 * código que roda no client.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
