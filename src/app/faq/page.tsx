import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/chat/conteudo-ajuda";

export const metadata = {
  title: "Perguntas frequentes — Comprovai",
};

export default function FaqPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <Link href="/" className="text-xl font-bold text-brand">
          Comprovai
        </Link>
        <Link
          href="/login"
          className="rounded border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/5"
        >
          Área do Cliente
        </Link>
      </header>

      <article className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16 sm:px-12">
        <h1 className="mb-2 text-2xl font-bold text-brand">Perguntas frequentes</h1>
        <p className="mb-8 text-sm text-text-subtle">
          Não achou o que precisa? O chat de ajuda (ícone no canto da tela) responde qualquer
          coisa sobre o Comprovai na hora.
        </p>

        <div className="flex flex-col gap-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.pergunta} className="rounded border border-border-default bg-surface p-5">
              <p className="text-sm font-bold text-brand">{item.pergunta}</p>
              <p className="mt-2 text-sm text-text-default">{item.resposta}</p>
            </div>
          ))}
        </div>
      </article>

      <footer className="px-6 py-6 text-center text-xs text-text-subtle sm:px-12">Comprovai</footer>
    </main>
  );
}
