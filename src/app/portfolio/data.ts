// --- 타입 정의 (Interfaces / Types) ---

// 프로젝트 데이터 타입
export type Project = {
  id: string;
  name: string;
  description: string;
  link: string;
  video: string;
  techStack: string[]; // 기술 스택 추가
};

// 업무 경험 데이터 타입
export type WorkExperience = {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string;
  link: string;
  achievements: string[]; // 주요 성과 추가
};

// 블로그 포스트 데이터 타입
export type BlogPost = {
  uid: string;
  title: string;
  description: string;
  link: string;
};

// 소셜 링크 데이터 타입
export type SocialLink = {
  label: string;
  link: string;
};

// 기술 스택 데이터 타입
export type Skills = {
  [key: string]: string[];
};

// --- 데이터 ---

// 프로젝트
export const PROJECTS = [
  {
    name: 'Leafy - AR 반려 식물 키우기',
    description:
      'AR 기술을 활용해 가상의 식물을 키우고 상호작용하는 모바일 앱입니다. 사용자의 감정 상태에 따라 식물의 표정이 변하는 기능을 구현했습니다.',
    // 상세 설명을 위한 필드 추가
    details: [
      '역할: 백엔드 API 서버 구축 및 AR 기능 연동 담당',
      '주요 기능: 사용자 인증, 식물 데이터 관리, 감정 분석 API 연동',
      '성과: ViroReact 라이브러리를 활용하여 안정적인 AR 환경을 구축하고, 서버 응답 시간을 최적화하여 부드러운 사용자 경험 제공',
    ],
    techStack: ['React Native', 'ViroReact', 'Node.js', 'Express', 'MongoDB'],
    link: 'https://github.com/your-repo/leafy',
    video: '/videos/leafy_demo.mp4',
    // 아키텍처 다이어그램 이미지 경로 추가
    architectureImg: '/images/leafy_architecture.png',
  },
  // ... 다른 프로젝트 추가
];

// 업무 경험
export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    id: 'work-kakao',
    title: 'Backend Developer',
    company: 'Kakao',
    start: '2025',
    end: 'Present',
    link: 'https://www.kakaocorp.com',
    achievements: [
      'Spring Boot 기반 MSA 환경에서 선물하기 서비스 API 개발',
      'Docker와 Kubernetes를 활용하여 배포 파이프라인 구축 및 운영',
      'Redis를 도입하여 대용량 트래픽 처리 및 API 응답 속도 25% 개선',
    ],
  },
  /* 예시 경력 데이터 (필요시 주석 해제하여 사용)
  {
    id: 'work-freelance-design',
    company: 'Freelance',
    title: 'Design Engineer',
    start: '2022',
    end: '2024',
    link: 'https://github.com/YonghoBae',
    achievements: [
        'Component library design and development.',
        'Built and maintained design systems.',
    ]
  },
  */
];

// SKILLS 데이터 구조화
export const SKILLS = {
  Backend: ['Node.js', 'Express', 'Spring Boot', 'Java', 'Django', 'Python'],
  Frontend: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'HTML/CSS'],
  Database: ['MySQL', 'PostgreSQL'],
  'DevOps & Infra': ['Docker', 'Nginx', 'AWS (EC2)', 'CI/CD', 'Git'],
  // 'AR/VR & 3D': ['React-Viro', 'Maya', 'Blender', 'Unity'],
};

// EDUCATION 데이터 추가
export const EDUCATION = [
  {
    school: '충북대학교',
    major: '소프트웨어학과',
    period: '2020.03 - 2026.02 (졸업예정)',
  },
  // ... 다른 학력 추가
];

// 블로그 포스트
export const BLOG_POSTS: BlogPost[] = [
  {
    uid: 'blog-1',
    title: 'Exploring the Intersection of Design, AI, and Design Engineering',
    description: 'How AI is changing the way we design',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
  },
  {
    uid: 'blog-2',
    title: 'Why I left my job to start my own company',
    description:
      'A deep dive into my decision to leave my job and start my own company',
    link: '/blog/why-i-left-my-job-to-start-my-own-company',
  },
];

// 소셜 링크
export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Github',
    link: 'https://github.com/YonghoBae',
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/%EB%B0%B0%EC%9A%A9%ED%98%B8-b82b92387/',
  },
];

// 이메일
export const EMAIL = 'dyddyd134@naver.com';

// 이력서 파일 경로
export const RESUME_LINK = '/resume/BaeYongHo_Resume.pdf'; // public/resume/ 폴더에 이력서 파일을 넣어주세요
