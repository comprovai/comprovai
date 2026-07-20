import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ManualDocument } from "@/components/documentos/ManualDocument";
import { MANUAL_META } from "@/lib/manual/conteudo-manual";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const buffer = await renderToBuffer(ManualDocument());

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${MANUAL_META.codigo}-manual-comprovai.pdf"`,
    },
  });
}
