import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

export default function PixelCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(styles.pixelFrame, styles.pixelPanelBg, className)}
      {...props}
    >
      {children}
    </div>
  );
}
