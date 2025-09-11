# OhGnoy Frontend (Next.js)

이 프로젝트는 "OhGnoy" 웹 애플리케이션의 프론트엔드입니다. Next.js, React, TypeScript를 사용하여 개발되었습니다.

## 주요 기능

- 마크다운(.md) 파일 기반 블로그 게시글 렌더링
- 백엔드 API와 연동한 게시글 CRUD, 댓글, 좋아요 기능
- Socket.IO 기반의 실시간 채팅
- Pokemon API를 활용한 포켓몬 도감
- NextAuth.js를 이용한 사용자 세션 관리

## 기술 스택

- **Framework**: Next.js, React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Recoil
- **Data Fetching**: Axios
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO Client

## 시작하기

### 1. 의존성 설치

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다.

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 백엔드 API 서버 주소 등 필요한 환경 변수를 설정합니다.


### 3. 개발 서버 실행

다음 명령어를 사용하여 개발 서버를 시작합니다.

```bash
npm run dev
```