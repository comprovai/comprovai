import { Receipt, Stamp, MousePointerClick, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { StatusStamp } from "@/components/ui/StatusStamp";
import type { ExpenseStatus } from "@/types/expense";

const statuses: ExpenseStatus[] = [
  "rascunho",
  "enviada",
  "aprovada",
  "reprovada",
  "financeiro",
  "lancada",
  "nota_gerada",
];

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Receipt;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={20} strokeWidth={1.5} className="text-brand" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand">{title}</h2>
      </div>
      <div className="rounded border border-border-default bg-surface p-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-2xl font-bold text-brand">Design System — Comprovai</h1>
        <p className="mb-10 text-sm text-text-subtle">
          Componentes base para revisão antes das próximas fases.
        </p>

        <Section icon={MousePointerClick} title="Button">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Aprovar</Button>
            <Button variant="secondary">Salvar rascunho</Button>
            <Button variant="danger">Reprovar</Button>
            <Button variant="primary" disabled>
              Desabilitado
            </Button>
          </div>
        </Section>

        <Section icon={CircleDollarSign} title="MoneyDisplay">
          <div className="flex flex-wrap items-end gap-8">
            <MoneyDisplay value={1234.56} size="sm" />
            <MoneyDisplay value={1234.56} size="md" />
            <MoneyDisplay value={1234.56} size="lg" />
          </div>
        </Section>

        <Section icon={Stamp} title="StatusStamp">
          <div className="flex flex-wrap gap-8 py-4">
            {statuses.map((status) => (
              <StatusStamp key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section icon={Receipt} title="ReceiptCard">
          <div className="flex flex-wrap gap-8">
            <ReceiptCard
              valor={452.9}
              categoria="Transporte"
              data="2026-07-10"
              fornecedor="Uber"
              status="aprovada"
            />
            <ReceiptCard
              valor={128.0}
              categoria="Alimentação"
              data="2026-07-12"
              fornecedor="Restaurante Sabor & Cia"
              status="enviada"
            />
            <ReceiptCard
              valor={980.0}
              categoria="Hospedagem"
              data="2026-07-08"
              fornecedor="Hotel Atlântico"
              status="reprovada"
            />
            <ReceiptCard
              valor={310.5}
              categoria="Material"
              data="2026-07-14"
              fornecedor="Papelaria Central"
              status="financeiro"
            />
          </div>
        </Section>
      </div>
    </main>
  );
}
