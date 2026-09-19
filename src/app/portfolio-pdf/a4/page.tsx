import type { Metadata } from 'next';

import PortfolioDeck from '../deck';
import { PROFILE } from '../data';

/** 같은 문서의 다른 규격이므로 설명은 같고 제목만 규격을 밝힙니다. */
export const metadata: Metadata = {
  title: `${PROFILE.name} 포트폴리오 (A4 가로) · ${PROFILE.roleKo}`,
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.name} · ${PROFILE.roleKo}`,
    description: PROFILE.summary,
    type: 'profile',
    images: [{ url: '/portfolio/og-cover.png', width: 1280, height: 720 }],
  },
};

/**
 * 종이로 출력할 때 쓰는 A4 가로 규격. 같은 덱을 297×210mm로 다시 조판합니다 —
 * 16:9보다 가로가 좁고 세로가 길어 다이어그램 축소 배율이 조금 낮아집니다.
 */
export default function PortfolioPdfA4Page() {
  return <PortfolioDeck paper="a4" />;
}
