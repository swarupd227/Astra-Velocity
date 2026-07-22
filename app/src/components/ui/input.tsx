import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const FIELD_CLASSES =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_CLASSES, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_CLASSES, className)} {...props} />;
}

/**
 * Native <select> (keyboard/screen-reader behavior intact) dressed to match
 * the design language: appearance-none plus a custom chevron in a relative
 * wrapper. `className` sizes the wrapper (e.g. w-40) — the select itself
 * always fills it.
 */
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select className={cn(FIELD_CLASSES, "appearance-none pr-9")} {...props} />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
        aria-hidden
      />
    </span>
  );
}
