import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

export default function PixelIconBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        styles.pixelFrameSmall,
        styles.pixelPanelBg,
        "inline-flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-[var(--px-active)] hover:text-[var(--px-text)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
