import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-surface-50 text-surface-950 shadow hover:bg-surface-200",
        primary: "bg-brand-600 text-white shadow-md hover:bg-brand-500 border border-brand-500/50",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
        outline: "border border-surface-800 bg-transparent shadow-sm hover:bg-surface-900 hover:text-surface-50",
        secondary: "bg-surface-800 text-surface-50 shadow-sm hover:bg-surface-700 border border-surface-700/50",
        ghost: "hover:bg-surface-800 hover:text-surface-50 text-surface-300",
        link: "text-brand-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded-sm px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

