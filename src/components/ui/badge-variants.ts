import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(142.1,76.2%,30%)]",
        secondary:
          "border-transparent bg-[hsl(var(--info))] text-white hover:bg-[hsl(217.2,91.2%,50%)]",
        outline: "border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
        destructive:
          "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(0,84.2%,50%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
