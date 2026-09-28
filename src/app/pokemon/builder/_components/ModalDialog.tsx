"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Native <dialog> opened with showModal(): the browser supplies the dialog
// role, focus trapping, Escape to close, an inert background and focus
// return to the opener. We only forward the close events.
export default function ModalDialog({
  labelledBy,
  onClose,
  className,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "w-[calc(100%-2rem)] overscroll-contain border-0 bg-transparent p-0 text-inherit backdrop:bg-black/50",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
