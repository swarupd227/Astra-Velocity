import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-slate-300",
        accent: "bg-teal-500/15 text-teal-300",
        highlight: "bg-amber-500/15 text-amber-300",
        outline: "border border-slate-700 text-slate-300",
        danger: "bg-red-500/15 text-red-300",
        success: "bg-emerald-500/15 text-emerald-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
