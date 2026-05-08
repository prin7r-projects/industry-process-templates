"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-cinnabar text-paper hover:bg-cinnabar-deep border border-cinnabar hover:border-cinnabar-deep",
        secondary:
          "bg-paper-2 text-ink hover:bg-paper border border-ink",
        ghost:
          "bg-transparent text-ink hover:text-cinnabar",
        outline:
          "bg-transparent text-ink hover:bg-paper-2 border border-rule hover:border-ink",
      },
      size: {
        default: "h-11 px-6 text-[15px] rounded",
        lg: "h-12 px-7 text-base rounded",
        sm: "h-9 px-4 text-sm rounded",
        plate: "h-10 px-5 text-xs uppercase tracking-[0.08em] font-mono rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
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
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
