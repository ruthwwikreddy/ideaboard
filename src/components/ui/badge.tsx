import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[linear-gradient(120deg,#36ffe0,#5effc7,#86ffec)] text-[#041c21] shadow-[0_12px_30px_rgba(0,255,204,0.35)]",
        secondary: "border-white/15 bg-white/5 text-foreground/80",
        destructive: "border-[rgba(255,71,87,0.45)] bg-[rgba(255,71,87,0.2)] text-[#ff9ca6]",
        outline: "border-white/25 text-foreground",
        success:
          "border-transparent bg-[linear-gradient(120deg,#44ffe2,#4cffcf)] text-[#031c21] shadow-[0_10px_25px_rgba(0,255,204,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
