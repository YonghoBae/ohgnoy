import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';

/**
 * 덱 전용 글꼴. 사이트 전역(`app/layout.tsx`)은 Inter를 쓰지만 이 라우트만 갈아끼웁니다.
 *
 * 왜 필요한가 — Inter 는 라틴 전용이고 뒤에 붙는 "Inter Fallback" 도 라틴 대체용이라,
 * 이 덱 글자의 대부분인 한글에는 **선언된 글꼴이 하나도 없었습니다.** 브라우저 최후
 * 기본값으로 그려지니 macOS 는 Apple SD Gothic Neo, Windows 는 맑은 고딕이 나오고,
 * 자폭이 다르면 줄바꿈 위치가 달라져 44쪽에 맞춰 둔 조판이 어긋납니다. 실제로 뽑아 둔
 * PDF 에 박힌 글꼴은 ArialMT 와 Menlo 뿐이었습니다(Inter 는 인쇄에 들어가지도 못했고,
 * Menlo 는 macOS 전용입니다).
 *
 * Pretendard 는 한글과 라틴을 한 벌로 덮어서 이 문제를 한 번에 끝냅니다. 가변 폰트
 * 하나라 굵기 4종(400·500·600·700)을 파일 하나로 씁니다.
 */
export const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '400 700',
  display: 'block',
  variable: '--font-deck',
  // 폰트가 아직 안 왔을 때의 대체. 한글이 있는 시스템 글꼴을 명시해 둡니다 —
  // 비워 두면 여기서 또 기기마다 달라집니다.
  fallback: ['Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif'],
});

/**
 * 인라인 코드 칩. 기존에는 Tailwind 의 `font-mono` 기본값이라 macOS 에서만 Menlo 가
 * 잡히고 다른 기기에서는 무엇이 나올지 알 수 없었습니다.
 */
export const deckMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'block',
  variable: '--font-deck-mono',
});
