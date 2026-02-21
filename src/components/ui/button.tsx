import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold tracking-tight ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-[0_12px_30px_hsl(0_0%_100%/0.1)] hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-[0_18px_40px_hsl(0_0%_100%/0.15)]",
        destructive:
          "border border-[rgba(255,71,87,0.45)] bg-[rgba(255,71,87,0.18)] text-[#ff9ca6] hover:bg-[rgba(255,71,87,0.28)] hover:-translate-y-0.5",
        outline:
          "border border-white/15 bg-white/5 text-foreground hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5",
        secondary:
          "border border-white/10 bg-white/5 text-foreground/90 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
