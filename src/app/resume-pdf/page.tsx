import type { Metadata } from 'next';

import Resume from './resume';
import { PROFILE } from '../portfolio-pdf/data';

/** 인쇄해서 보낼 A4 세로 이력서. `/portfolio-pdf`와 같은 이유로 og:image는 표지를 씁니다. */
export const metadata: Metadata = {
  title: `${PROFILE.name} 이력서 · ${PROFILE.roleKo}`,
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.name} 이력서`,
    description: PROFILE.summary,
    type: 'profile',
    images: [{ url: '/portfolio/og-cover.png', width: 1280, height: 720 }],
  },
};

export default function ResumePdfPage() {
  return <Resume />;
}
