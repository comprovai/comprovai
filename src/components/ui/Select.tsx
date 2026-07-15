import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <label htmlFor={selectId} className="flex flex-col gap-1 text-sm text-text-default">
        {label}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "rounded border border-border-default bg-surface px-3 py-2 text-sm text-text-default",
            "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  }
);

Select.displayName = "Select";
