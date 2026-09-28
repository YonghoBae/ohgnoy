"use client";

import { useRouter } from "next/navigation";
import {
  AnchorHTMLAttributes,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import styles from "./site-shell.module.css";

const SHOW_DELAY_MS = 100; // don't flash the overlay on fast/prefetched navigations
const MIN_VISIBLE_MS = 200; // once shown, hold it briefly to avoid a one-frame flicker

export default function EncounterLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children" | "onClick">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showOverlay, setShowOverlay] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const handleMouseEnter = () => {
    router.prefetch(href);
  };

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setShowOverlay(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    if (shownAtRef.current === null) {
      setShowOverlay(false);
      return;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(() => {
      setShowOverlay(false);
      shownAtRef.current = null;
    }, remaining);
    return () => clearTimeout(timer);
  }, [isPending]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={className}
        {...rest}
      >
        {children}
      </a>
      {showOverlay && (
        <div className={styles.encounterOverlay} aria-hidden="true">
          <span className={styles.encounterText}>
            <span className={styles.dialogCursor}>▶</span> 이동 중…
          </span>
        </div>
      )}
    </>
  );
}
