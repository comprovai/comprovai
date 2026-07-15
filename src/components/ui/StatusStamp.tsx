import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@/types/expense";

interface StatusStampProps {
  status: ExpenseStatus;
  className?: string;
}

const stampConfig: Record<ExpenseStatus, { label: string; colorClass: string }> = {
  rascunho: { label: "Rascunho", colorClass: "text-text-subtle border-text-subtle" },
  enviada: { label: "Enviada", colorClass: "text-brand border-brand" },
  aprovada: { label: "Aprovada", colorClass: "text-success border-success" },
  reprovada: { label: "Reprovada", colorClass: "text-danger border-danger" },
  financeiro: { label: "Em financeiro", colorClass: "text-primary border-primary" },
  lancada: { label: "Lançada", colorClass: "text-primary border-primary" },
  nota_gerada: { label: "Nota gerada", colorClass: "text-success border-success" },
};

export function StatusStamp({ status, className }: StatusStampProps) {
  const { label, colorClass } = stampConfig[status];

  return (
    <span
      className={cn(
        "inline-block -rotate-[8deg] select-none rounded-full border-2 p-[3px]",
        colorClass,
        className
      )}
    >
      <span
        className={cn(
          "block rounded-full border px-3 py-1",
          "text-[11px] font-bold uppercase tracking-[0.15em] leading-none",
          colorClass
        )}
      >
        {label}
      </span>
    </span>
  );
}
