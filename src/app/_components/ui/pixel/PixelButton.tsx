import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export default function PixelButton({
  variant = "primary",
  className,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        "rounded-none border-2 border-text-base px-4 py-2 text-sm font-semibold shadow-pixel transition-transform",
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variant === "primary"
          ? "bg-primary text-white"
          : "bg-surface text-text-base hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
