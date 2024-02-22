// Footer 컴포넌트를 import (하단에 사용될 컴포넌트)
import Footer from '@/app/_components/footer';
// 블로그 이름과 홈의 OG 이미지 URL을 import (메타데이터와 관련)
import { BLOG_NAME, HOME_OG_IMAGE_URL } from '@/lib/constants';
// Next.js의 Metadata 타입을 import (메타데이터의 타입 정의에 사용)
import type { Metadata } from 'next';
// Google Fonts에서 Inter 폰트를 불러옴 (글꼴 스타일링에 사용)
import { Inter } from 'next/font/google';
// 클래스 이름을 동적으로 구성하기 위한 classnames 라이브러리를 import
import cn from 'classnames';
// 테마 전환기 컴포넌트를 import (테마 변경 기능을 제공)
import { ThemeSwitcher } from './_components/theme-switcher';

import { Intro } from '@/app/_components/intro';

// 전역 스타일을 import (앱 전체에 적용될 CSS 파일)
import './globals.css';
import Container from './_components/container';

// Google의 Inter 폰트를 설정하고, 라틴 문자 집합을 서브셋으로 사용
const inter = Inter({ subsets: ['latin'] });

// Next.js의 페이지 메타데이터를 정의
export const metadata: Metadata = {
  title: `${BLOG_NAME}`, // 페이지 제목 (블로그 이름을 제목으로 사용)
  description: `개발 공부를 하면서 만든 연습용 블로그그 ${BLOG_NAME}.`, // 페이지 설명
  openGraph: {
    images: [HOME_OG_IMAGE_URL], // Open Graph 프로토콜에서 사용될 이미지 (미리보기 이미지 등)
  },
  verification: {
    google: '20MA_khcMkhCRMF1pekcIxcPFGjEOr7Gyzxr3VbAaDo',
  },

};

// Next.js의 기본 레이아웃 컴포넌트를 정의
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // 자식 요소를 React의 노드로 받음
}>) {
  return (
    // HTML 문서의 시작 (언어는 영어로 설정)
    <html lang="en">
      <head>
        {/* 다양한 크기의 favicon과 애플 터치 아이콘을 설정 */}
        {/* <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        /> */}
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        {/* Windows의 타일 색상을 지정 */}
        <meta name="msapplication-TileColor" content="#000000" />
        {/* Windows의 브라우저 구성 파일을 지정 */}
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        {/* 브라우저의 테마 색상을 지정 */}
        <meta name="theme-color" content="#000" />
        {/* RSS 피드에 대한 링크 설정 */}
        {/* <link rel="alternate" type="application/rss+xml" href="/feed.xml" /> */}
      </head>
      <body
        // Inter 폰트를 사용하고, 다크 모드에서 배경 및 텍스트 색상을 설정
        className={cn(inter.className, 'dark:bg-stone-900 dark:text-stone-50')}
      >
        {/* 테마 전환기 컴포넌트를 렌더링 */}
        <ThemeSwitcher />
        <Container>
          <Intro />
          {/* 페이지 콘텐츠를 포함할 div 요소, 최소 화면 크기 설정 */}
          <div className="min-h-screen">{children}</div>
          {/* 하단에 Footer 컴포넌트를 렌더링 */}
        </Container>
        <Footer />
      </body>
    </html>
  );
}
