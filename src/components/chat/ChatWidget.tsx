"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "@/lib/chat/conteudo-ajuda";

const SUGESTOES = FAQ_ITEMS.slice(0, 4);

interface Mensagem {
  role: "user" | "assistant";
  texto: string;
  whatsapp?: string | null;
}

interface ChatWidgetProps {
  role?: string;
}

const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;

export function ChatWidget({ role }: ChatWidgetProps) {
  const pagina = usePathname();
  const [open, setOpen] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function enviarTexto(texto: string) {
    if (!texto || pending) return;

    const historico = [...mensagens, { role: "user" as const, texto }];
    setMensagens(historico);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: historico.map(({ role: r, texto: t }) => ({ role: r, texto: t })),
          role: role ?? null,
          pagina,
        }),
      });
      const data = await res.json();
      setMensagens((atual) => [
        ...atual,
        { role: "assistant", texto: data.texto, whatsapp: data.whatsapp ?? null },
      ]);
    } catch {
      setMensagens((atual) => [
        ...atual,
        { role: "assistant", texto: "Não consegui responder agora, tenta de novo em instantes." },
      ]);
    } finally {
      setPending(false);
    }
  }

  function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    enviarTexto(input.trim());
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Fechar chat de ajuda" : "Abrir chat de ajuda"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg"
      >
        {open ? <X size={22} strokeWidth={1.5} /> : <MessageCircle size={22} strokeWidth={1.5} />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-40 flex h-[28rem] w-80 max-w-[calc(100vw-3rem)] flex-col rounded border border-border-default bg-surface shadow-xl">
          <div className="border-b border-border-default bg-brand px-4 py-3 text-sm font-bold text-white">
            Ajuda do Comprovai
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {mensagens.length === 0 && (
              <div>
                <p className="text-sm text-text-subtle">
                  Pergunta alguma coisa sobre como usar o Comprovai — lançamento, aprovação,
                  nota de débito, o que for.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {SUGESTOES.map((item) => (
                    <button
                      key={item.pergunta}
                      type="button"
                      onClick={() => enviarTexto(item.pergunta)}
                      className="rounded border border-border-default bg-background px-3 py-2 text-left text-xs text-text-default hover:border-brand"
                    >
                      {item.pergunta}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mensagens.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded px-3 py-2 text-sm",
                    m.role === "user" ? "bg-primary text-white" : "bg-background text-text-default"
                  )}
                >
                  <p>{m.texto}</p>
                  {m.whatsapp && NUMERO_WHATSAPP && (
                    <a
                      href={`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(m.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block rounded bg-success px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Falar no WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
            {pending && <p className="text-sm text-text-subtle">Digitando...</p>}
          </div>

          <form onSubmit={enviarFormulario} className="flex gap-2 border-t border-border-default p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 rounded border border-border-default bg-background px-3 py-2 text-sm text-text-default outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Enviar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary text-white disabled:opacity-50"
            >
              <Send size={16} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
