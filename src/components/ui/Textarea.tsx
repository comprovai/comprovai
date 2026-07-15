import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <label htmlFor={textareaId} className="flex flex-col gap-1 text-sm text-text-default">
        {label}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
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

Textarea.displayName = "Textarea";
