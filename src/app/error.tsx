"use client";

import Link from "next/link";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

const linkClass =
  "font-semibold text-primary underline-offset-4 hover:underline";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <PixelCard className="flex flex-col items-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-extrabold">문제가 발생했습니다</h1>
        <p className="text-sm text-text-muted">
          페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <PixelButton onClick={reset}>다시 시도</PixelButton>
        <p className="flex gap-6 text-sm">
          <Link href="/" className={linkClass}>
            홈
          </Link>
          <Link href="/pokemon/list" className={linkClass}>
            포켓몬 도감
          </Link>
        </p>
      </PixelCard>
    </div>
  );
}
