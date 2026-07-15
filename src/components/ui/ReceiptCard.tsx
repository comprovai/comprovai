import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@/types/expense";

interface ReceiptCardProps {
  valor: number;
  categoria: string;
  data: string | Date;
  fornecedor: string;
  status: ExpenseStatus;
  className?: string;
}

const TEETH = 14;

function zigzagClipPath(teeth: number): string {
  const step = 100 / teeth;
  const points: string[] = ["0% 0%", "100% 0%", "100% 100%"];

  for (let i = teeth; i >= 0; i--) {
    const x = i * step;
    const y = i % 2 === 0 ? 100 : 40;
    points.push(`${x}% ${y}%`);
  }

  return `polygon(${points.join(", ")})`;
}

export function ReceiptCard({
  valor,
  categoria,
  data,
  fornecedor,
  status,
  className,
}: ReceiptCardProps) {
  return (
    <div className={cn("w-full max-w-sm bg-background", className)}>
      <div className="rounded border border-border-default border-b-0 bg-surface p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-text-default">{fornecedor}</p>
            <p className="text-xs text-text-subtle">{categoria}</p>
          </div>
          <StatusStamp status={status} />
        </div>

        <div className="flex items-end justify-between">
          <p className="text-xs text-text-subtle">{formatDate(data)}</p>
          <MoneyDisplay value={valor} size="lg" />
        </div>
      </div>

      <div
        className="h-2 w-full bg-surface"
        style={{ clipPath: zigzagClipPath(TEETH) }}
        aria-hidden
      />
    </div>
  );
}
