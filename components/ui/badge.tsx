import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-brown text-brand-sun",
        amber:
          "border-transparent bg-brand-amber text-white",
        sun: "border-transparent bg-brand-sun text-brand-brown",
        warm: "border-brand-gold/20 bg-brand-warm text-brand-caramel",
        outline: "border-brand-gold/40 bg-transparent text-brand-caramel",
        success: "border-transparent bg-emerald-500 text-white",
        danger: "border-transparent bg-red-500 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
