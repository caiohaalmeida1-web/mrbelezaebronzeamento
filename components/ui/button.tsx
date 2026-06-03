import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-brown text-brand-sun shadow-lg shadow-brand-brown/20 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-brand-brown/30 active:translate-y-0",
        amber:
          "bg-brand-amber text-white shadow-lg shadow-brand-amber/25 hover:translate-y-[-2px] hover:bg-brand-amber/90",
        whatsapp:
          "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:translate-y-[-2px] hover:bg-[#1FB855]",
        outline:
          "border-2 border-brand-brown bg-transparent text-brand-brown hover:bg-brand-brown hover:text-brand-sun",
        ghost:
          "text-brand-brown hover:bg-brand-warm hover:text-brand-brown",
        link: "text-brand-caramel underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "bg-brand-warm text-brand-brown hover:bg-brand-warm/80",
      },
      size: {
        default: "h-11 px-7 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
