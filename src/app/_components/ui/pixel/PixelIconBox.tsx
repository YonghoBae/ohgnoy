import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-text-base bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
