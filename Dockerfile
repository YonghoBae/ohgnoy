# 1. Node.js 베이스 이미지 선택
FROM node:22.14.0

# 2. 앱 디렉토리 생성 및 이동
WORKDIR /app

# 3. 종속성 설치를 위한 파일 복사
COPY package.json package-lock.json* ./

# 4. 종속성 설치
RUN npm install

# 5. 전체 코드 복사
COPY . .

# 6. Next.js 개발 서버 포트 노출
EXPOSE 3000

# 7. 개발 서버 실행
CMD ["npm", "run", "dev"]