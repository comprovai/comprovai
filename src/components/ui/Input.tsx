import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label htmlFor={inputId} className="flex flex-col gap-1 text-sm text-text-default">
        {label}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "rounded border border-border-default bg-surface px-3 py-2 text-sm text-text-default",
            "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            className
          )}
          {...props}
        />
      </label>
    );
  }
);

Input.displayName = "Input";
