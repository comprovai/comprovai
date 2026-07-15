import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<MoneyDisplayProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

export function MoneyDisplay({ value, size = "md", className }: MoneyDisplayProps) {
  return (
    <span
      className={cn(
        "font-bold text-text-default [font-variant-numeric:tabular-nums]",
        sizeClasses[size],
        className
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}
