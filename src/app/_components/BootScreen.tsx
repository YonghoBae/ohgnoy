"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./pokedex-home.module.css";

const BOOT_DURATION_MS = 500;
const FADE_DURATION_MS = 200;
const SESSION_KEY = "pokedex-boot-shown";

type Phase = "pending" | "loading" | "fading" | "done";

export default function BootScreen() {
  const [phase, setPhase] = useState<Phase>("pending");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("loading");

    const fadeTimer = setTimeout(() => setPhase("fading"), BOOT_DURATION_MS);
    const doneTimer = setTimeout(() => setPhase("done"), BOOT_DURATION_MS + FADE_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "pending" || phase === "done") return null;

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
