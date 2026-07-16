import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Upload de comprovante sem chamar a IA — usado pela sincronização de
// despesas criadas offline, onde a extração já não rodou no momento do
// registro (sem internet) e o colaborador preencheu tudo manualmente.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${usuario.empresa_id}/${user.id}/${randomUUID()}.${extension}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("comprovantes")
    .upload(path, bytes, { contentType: file.type || "image/jpeg" });

  if (error) {
    return NextResponse.json({ error: "Falha ao salvar o comprovante." }, { status: 500 });
  }

  return NextResponse.json({ comprovantePath: path });
}
