"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useState } from "react";
import styles from "./pokedex-home.module.css";

const TRANSITION_MS = 500;

export default function EncounterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => router.push(href), TRANSITION_MS);
  };

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      {transitioning && (
        <div className={styles.encounterOverlay} aria-hidden="true">
          <span className={styles.encounterText}>
            <span className={styles.dialogCursor}>▶</span> 이동 중
          </span>
        </div>
      )}
    </>
  );
}
