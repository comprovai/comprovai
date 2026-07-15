import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@/types/expense";

interface StatusStampProps {
  status: ExpenseStatus;
  className?: string;
}

const stampConfig: Record<ExpenseStatus, { label: string; colorClass: string }> = {
  aprovado: { label: "Aprovado", colorClass: "text-success border-success" },
  reprovado: { label: "Reprovado", colorClass: "text-danger border-danger" },
  pendente: { label: "Pendente", colorClass: "text-brand border-brand" },
  financeiro: { label: "Em financeiro", colorClass: "text-primary border-primary" },
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
