import Link from "next/link";
import { SolicitarAcessoForm } from "@/components/marketing/SolicitarAcessoForm";
import { ChatWidget } from "@/components/chat/ChatWidget";

const DIFERENCIAIS = [
  {
    titulo: "Nota de débito automática",
    texto:
      "Gere o repasse de custo ao cliente com um clique: PDF pronto, numerado e com todos os comprovantes do período anexados.",
  },
  {
    titulo: "Sem cartão corporativo, sem Pix corporativo",
    texto:
      "Feito pra empresa que roda no reembolso de verdade — sem depender de cartão ou conta compartilhada que sua operação não tem.",
  },
  {
    titulo: "Aprovação com trilha completa",
    texto:
      "Colaborador lança, gestor aprova ou reprova com motivo, financeiro confere. Cada decisão fica registrada, sem planilha perdida.",
  },
  {
    titulo: "Funciona até sem internet",
    texto:
      "O colaborador fotografa o comprovante na rua, sem sinal — o app guarda localmente e sincroniza sozinho quando a conexão volta.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <span className="text-xl font-bold text-brand">Comprovai</span>
        <Link
          href="/login"
          className="rounded border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/5"
        >
          Área do Cliente
        </Link>
      </header>

      <section className="flex flex-col items-center px-6 py-16 text-center sm:px-12">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-brand sm:text-4xl">
          Sua equipe reembolsada, seu cliente cobrado — sem planilha.
        </h1>
        <p className="mt-4 max-w-xl text-text-default">
          Colaborador fotografa o comprovante, o sistema aprova, reembolsa e já gera a nota de
          débito pro cliente. Feito pra consultorias e prestadoras de serviço que ainda fazem
          esse fluxo na mão, sem cartão corporativo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#solicitar-acesso"
            className="rounded bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90"
          >
            Solicitar acesso
          </a>
          <Link
            href="/login"
            className="rounded border border-brand px-6 py-3 text-sm font-bold text-brand hover:bg-brand/5"
          >
            Área do Cliente
          </Link>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-12">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {DIFERENCIAIS.map((item) => (
            <div key={item.titulo} className="rounded border border-border-default bg-surface p-6">
              <p className="text-sm font-bold text-brand">{item.titulo}</p>
              <p className="mt-2 text-sm text-text-subtle">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="solicitar-acesso" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-xl font-bold text-brand">Quer testar com sua equipe?</h2>
          <p className="mt-2 text-sm text-text-subtle">
            Conta um pouco sobre sua empresa e a gente entra em contato pra configurar seu acesso.
          </p>
          <div className="mt-6">
            <SolicitarAcessoForm />
          </div>
        </div>
      </section>

      <footer className="flex flex-col items-center gap-2 px-6 py-6 text-center text-xs text-text-subtle sm:px-12">
        <div className="flex gap-4">
          <Link href="/termos" className="hover:text-text-default hover:underline">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="hover:text-text-default hover:underline">
            Política de Privacidade
          </Link>
        </div>
        <span>Comprovai</span>
      </footer>

      <ChatWidget />
    </main>
  );
}
