# Ohgnoy Frontend (Next.js)

[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=ohgnoy)](https://ohgnoy.vercel.app)

'Ohgnoy'는 Next.js, TypeScript 기반의 개발 블로그 및 포트폴리오 웹사이트입니다. 마크다운으로 작성된 게시글을 정적 페이지로 렌더링하며, 백엔드 API와 연동하여 다양한 동적 기능을 제공합니다.

## ✨ 주요 기능

- **블로그**: 마크다운(.md) 파일 기반의 정적 블로그 게시글 렌더링
- **포켓몬 도감**: Pokemon API를 활용한 포켓몬 정보 조회 및 검색 기능
- **실시간 채팅**: Socket.IO 기반의 사용자 간 실시간 채팅 기능
- **사용자 인증**: NextAuth.js를 이용한 사용자 세션 관리
- **게시글 관리**: 백엔드 API와 연동한 게시글 CRUD, 댓글, 좋아요 기능

## 🛠️ 기술 스택

- **Framework**: Next.js, React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Recoil
- **Data Fetching**: Axios
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO Client

## 🚀 시작하기

### 1. 레포지토리 클론

```bash
git clone [https://github.com/YonghoBae/ohgnoy.git](https://github.com/YonghoBae/ohgnoy.git)
cd ohgnoy
```

### 2. 의존성 설치

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다.

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 채워주세요. 백엔드 API 서버의 주소를 입력해야 합니다.

```env
# .env.local

# 백엔드 API 서버 주소
Ohgnoy_BackendAPI=[https://your-backend-api-url.com](https://your-backend-api-url.com)
```

### 4. 개발 서버 실행

다음 명령어를 사용하여 개발 서버를 시작합니다.

```bash
npm run dev
```

서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
/src
├── /app             # Next.js 13+ App Router 기반 페이지
│   ├── /api         # API 라우트
│   ├── /_components # 공통 컴포넌트
│   └── /posts       # 블로그 게시글 상세 페이지
├── /interfaces      # TypeScript 타입 정의
├── /lib             # API 연동, 상수 등 라이브러리 파일
└── /_posts          # 마크다운 블로그 게시글 원본 파일
```

## 🔗 배포

이 프로젝트는 [Vercel](https://ohgnoy.vercel.app)을 통해 배포되었습니다.