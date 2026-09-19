import type { Metadata } from 'next';

import PortfolioDeck from './deck';
import { PROFILE } from './data';

/**
 * 이 주소는 채용 담당자에게 링크로 보냅니다. 메타 태그가 없으면 메신저에 붙였을 때
 * 미리보기가 빈 채로 뜨고, 브라우저 탭에는 라우트 경로만 나옵니다.
 * `og:image`는 표지(1쪽)를 그대로 씁니다.
 */
export const metadata: Metadata = {
  title: `${PROFILE.name} 포트폴리오 · ${PROFILE.roleKo}`,
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.name} · ${PROFILE.roleKo}`,
    description: PROFILE.summary,
    type: 'profile',
    images: [{ url: '/portfolio/og-cover.png', width: 1280, height: 720 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.name} · ${PROFILE.roleKo}`,
    description: PROFILE.summary,
    images: ['/portfolio/og-cover.png'],
  },
};

/** 기본 규격 — PowerPoint 16:9. 화면으로 읽는 것이 이 덱의 용도입니다. */
export default function PortfolioPdfPage() {
  return <PortfolioDeck paper="ppt" />;
}
