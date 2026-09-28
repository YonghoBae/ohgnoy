import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export default function PixelButton({
  variant = "primary",
  type = "button",
  className,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.pixelFrameSmall,
        "px-4 py-2 text-sm font-semibold transition-transform",
        "active:translate-x-[2px] active:translate-y-[2px]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variant === "primary"
          ? "bg-primary text-on-primary hover:bg-primary-hover"
          : cn(styles.pixelPanelBg, "text-text-base hover:text-primary"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
