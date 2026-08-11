"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./pokedex-home.module.css";

const BOOT_DURATION_MS = 1100;
const FADE_DURATION_MS = 300;

export default function BootScreen() {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), BOOT_DURATION_MS);
    const doneTimer = setTimeout(() => setPhase("done"), BOOT_DURATION_MS + FADE_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.bootOverlay} ${phase === "fading" ? styles.bootOverlayFading : ""}`}
      aria-hidden="true"
    >
      <div className={styles.bootContent}>
        <div className={styles.bootLogoRow}>
          <Image
            src="/frames/pokeball.png"
            alt=""
            width={32}
            height={32}
            className={styles.logoIcon}
          />
          <span className={styles.bootLogo}>HGNOY</span>
        </div>
        <div className={styles.bootBar}>
          <div className={styles.bootBarFill} />
        </div>
      </div>
    </div>
  );
}
