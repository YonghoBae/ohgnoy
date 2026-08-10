import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function PixelCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border-2 border-text-base bg-surface shadow-pixel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
