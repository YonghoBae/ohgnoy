import Link from "next/link";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

const linkClass =
  "font-semibold text-primary underline-offset-4 hover:underline";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <PixelCard className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="font-pixel text-xs text-text-muted">404</p>
        <h1 className="text-2xl font-extrabold">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-text-muted">
          주소가 바뀌었거나 없는 페이지입니다.
        </p>
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
