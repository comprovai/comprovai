import Link from "next/link";

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

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-brand sm:text-4xl">
          Despesas, aprovação e repasse ao cliente — sem parecer um SaaS genérico
        </h1>
        <p className="mt-4 max-w-xl text-text-default">
          Feito para empresas de serviço e consultoria que precisam repassar despesa de projeto
          ao cliente via nota de débito — o fluxo que o expense management genérico não prioriza.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90"
        >
          Área do Cliente
        </Link>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-text-subtle sm:px-12">
        Comprovai
      </footer>
    </main>
  );
}
