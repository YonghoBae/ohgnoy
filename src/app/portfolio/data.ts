// 이메일 / 링크는 실제 값으로 교체해서 사용하세요.
export const EMAIL = 'you@example.com';
export const RESUME_LINK = '/files/resume.pdf';

export const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    link: 'https://github.com/your-github', // TODO: 실제 계정으로 교체
  },
  {
    label: 'Tech Blog',
    link: 'https://blog.example.com', // TODO: ohgnoy 블로그 주소로 교체
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/your-linkedin', // 없으면 이 항목 삭제해도 됨
  },
];

export const PROJECTS = [
  {
    name: 'Leafy – Hybrid AI 반려 식물 정서 케어 시스템',
    video: '/videos/leafy-demo.mp4',
    link: 'https://github.com/your-name/leafy',
    architectureImg: '/images/leafy-architecture.png',

    description:
      '사용자의 감정 상태를 분석하고 대화 맥락을 단기/장기로 분리해 관리하는 AI 반려식물 서비스입니다. 백엔드 중심으로 LLM 메모리 구조, Multi-Agent Router, 실시간 음성 대화 아키텍처를 직접 설계했으며, “감정 기반 대화 품질 안정화”를 주요 목표로 개발했습니다.',

    details: [
      // --- S: Situation ---
      '기존 함수형 구조는 기능이 늘어날수록 테스트와 수정이 어려워지고, 대화 맥락이 불안정해지는 문제가 있었습니다. 또한 음성 기반 상호작용은 WebSocket 기반 STT/TTS에서 지연이 크게 발생하며 사용자 경험을 저해하고 있었습니다.',

      // --- T: Task ---
      '백엔드 전반을 안정적이고 확장 가능하게 재설계하고, 감정 기반 서비스 특성에 맞는 메모리·에이전트·음성 아키텍처를 구축하는 역할을 맡았습니다.',

      // --- A: Action ---
      'Layered Architecture 적용: 기존 함수형 코드를 컨트롤러·서비스·도메인 레이어로 분리해 테스트 가능성과 유지보수성을 확보했습니다.',
      'Hybrid Memory 구축: Redis를 단기 기억, MySQL + Vector Store를 장기 기억으로 사용해 LLM에 필요한 정보만 전달하도록 최적화했습니다.',
      'Multi-Agent Router 구현: 기본 응답, 성찰, 행동 제안 에이전트를 Intent에 따라 자동 라우팅하여 대화 품질을 향상시켰습니다.',
      '행동 활성화(Behavioral Activation) 기반 미션 추천: 감정·각성 지표가 낮을 때 Micro Mode로 전환하고 “즉시 완료 가능한 저부담 미션”을 자동 추천하도록 설계했습니다.',
      '대화 안전성 강화: 생성 에이전트와 검토 에이전트를 분리해 응답 톤과 위험 표현을 2단계로 점검하는 구조를 실험 적용했습니다.',
      'WebRTC + OpenAI Realtime API로 실시간 음성 구조 재설계: 지연 문제를 해결하기 위해 WebSocket 구조를 폐기하고 Realtime 기반으로 재구축했으며, 서버를 Proxy로 두어 에이전트·메모리 상태가 음성과 동기화되도록 했습니다.',
      'Docker + GitHub Actions 기반 CI/CD 구축: 백엔드, DB, Redis를 컨테이너화하고 main 브랜치 기준으로 자동 배포되도록 파이프라인을 설계했습니다.',

      // --- R: Result ---
      '결과적으로 음성 지연이 크게 감소하고, 대화 맥락 유지가 안정되었으며, 프롬프트와 토큰 사용량이 줄어들어 LLM 비용 효율이 개선되었습니다. 리팩토링 후 기능 추가 속도도 향상되어 장기적인 확장성을 확보했습니다.',
    ],

    techStack: [
      'Node.js', 'TypeScript', 'Express', 'MySQL', 'Sequelize',
      'Redis', 'Upstash Vector', 'OpenAI API', 'LLM Agents',
      'WebRTC', 'Socket.IO', 'Docker', 'GitHub Actions',
      'Ubuntu Server', 'React Native', 'AR (React Viro)',
    ],
  },

  {
    name: 'Home Server & CI/CD Platform',
    video: '/videos/home-server.mp4',
    link: 'https://your-blog-or-docs/home-server',
    architectureImg: '/images/home-server-architecture.svg',

    description:
      '여러 개인 프로젝트를 안정적으로 운영하기 위해 구축한 홈서버 기반 인프라입니다. Docker 컨테이너 분리, Reverse Proxy, SSL 인증, CI/CD 자동 배포 환경을 직접 설계·운영하며 DevOps 경험을 쌓았습니다.',

    details: [
      // --- S ---
      '[S] WSL 기반 개발 환경에서는 포트 충돌, 네트워크 지연, 서버 지속 구동 문제 등이 반복적으로 발생했고, 여러 프로젝트를 동시에 운영하기 위한 통합 인프라가 부재했습니다.',

      // --- T ---
      '[T] 비용 없이 상시 운영 가능한 서버 환경을 구축하고, 프로젝트별로 독립적인 배포/운영 체계를 만드는 것이 목표였습니다.',

      // --- A ---
      '[A] 사용하지 않던 노트북을 Ubuntu Server로 리빌드하고, 모든 프로젝트를 Docker 컨테이너 단위로 분리 운영했습니다.',
      '[A] Nginx Proxy Manager를 활용해 도메인/서브도메인을 프로젝트별 컨테이너로 라우팅하고, Let’s Encrypt로 SSL을 자동 발급·갱신하도록 구성했습니다.',
      '[A] GitHub Actions 기반 CI/CD를 구축해 main 브랜치 머지 시 Docker 이미지 빌드 → 서버에 Pull → 컨테이너 재시작까지 자동화했습니다.',
      '[A] 배포 과정에서 사람이 .env를 직접 수정하지 않도록 GitHub Secrets로 환경 변수를 주입하는 스크립트를 만들었습니다.',
      '[A] WSL → Ubuntu Server 이전 과정에서 발생한 네트워크 지연 원인을 분석하고 Docker 네트워크 구조를 재설계하여 실시간 서비스(채팅/스트리밍)의 응답성을 개선했습니다.',

      // --- R ---
      '[R] 모든 프로젝트가 HTTPS 기반 독립 서비스로 운영 가능해졌고, 서버 안정성이 크게 향상되었습니다.',
      '[R] 배포 자동화로 운영 비용과 작업 시간이 줄었으며, 실수 가능성이 크게 감소했습니다.',
      '[R] DevOps 도구와 리버스 프록시, 컨테이너 오케스트레이션 개념을 실전에서 경험하게 되었습니다.',
    ],

    techStack: [
      'Ubuntu Server', 'Docker', 'Docker Compose',
      'Nginx Proxy Manager', 'Let’s Encrypt',
      'GitHub Actions', 'Node.js',
      'PostgreSQL', 'MySQL', 'Linux',
    ],
  },

  {
    name: 'Development Environment Automation (Vagrant & Ansible)',
    video: '/videos/dev-env-automation.mp4',
    link: 'https://your-blog-or-docs/dev-env-automation',
    architectureImg: undefined,

    description:
      '실습/개발 환경을 일관되게 재현하기 위해 Vagrant + Ansible 기반으로 VM 자동 생성·프로비저닝 환경을 구축한 프로젝트입니다. “어디서 실행해도 동일하게 동작하는 개발 환경”을 목표로 IaC 접근을 적용했습니다.',

    details: [
      // --- S ---
      '[S] Cloud & Distributed Systems 수업에서 HTCondor 실습 환경을 매번 새로 구성해야 했고, WSL/Windows/VirtualBox 간 설정 충돌로 재현성이 낮았습니다.',

      // --- T ---
      '[T] 팀원 누구나 똑같은 개발/실습 환경을 즉시 재현할 수 있는 자동화된 VM·프로비저닝 시스템을 구축하는 것이 목표였습니다.',

      // --- A ---
      '[A] Vagrant로 Ubuntu 기반 VM을 자동 생성하고, 네트워크·폴더 매핑 등 호스트/VM 환경 차이를 고려하며 구성했습니다.',
      '[A] Ansible Playbook으로 패키지 설치, 언어 런타임, 웹 서버, 프로젝트 클론, 사용자 생성 등 프로비저닝 과정을 코드로 정의했습니다.',
      '[A] VM과 Ansible 간 SSH 권한 문제, 경로 충돌, 호스트 환경 차이(Windwos/WSL/VM)를 분석해 해결하며 안정적인 IaC 구성을 완성했습니다.',
      '[A] Web 노드와 Worker 노드를 분리하는 구조를 설계해 분산 작업 실습(HTCondor)이 자동으로 재현되도록 환경을 구성했습니다.',

      // --- R ---
      '[R] vagrant up 한 번으로 동일한 실습 환경을 재현할 수 있게 되었고, 실습 준비 시간이 크게 단축되었습니다.',
      '[R] IaC 개념과 VM 자동화·프로비저닝 경험을 쌓아 DevOps 역량 기반을 확보했습니다.',
    ],

    techStack: [
      'Vagrant', 'Ansible', 'VirtualBox',
      'WSL', 'Ubuntu', 'Shell Script',
      'Infrastructure as Code',
    ],
  }

] as const;

export const WORK_EXPERIENCE = [
  {
    id: 'fullstack-bootcamp',
    title: 'Full-stack Web Development Program (Trainee)',
    company: 'University Full-stack Training (Summer Intensive)',
    start: '2024.07',
    end: '2024.08',
    link: 'https://your-univ-program-link.example.com',
    achievements: [
      'Node.js 백엔드, Next.js 프론트엔드, RAG(LangChain) 기초를 포함한 풀스택 커리큘럼 이수',
      '클론 코딩 중심 수업에서 한 단계 나아가, 개인 개발 블로그를 기획·구현하며 실전 환경에 가까운 개발·배포 프로세스 경험',
      '팀 프로젝트와 코드 리뷰를 통해 Git 기반 협업, 브랜치 전략, PR 리뷰 문화를 경험',
    ],
  },
  {
    id: 'cloud-computing-course',
    title: 'Cloud Computing & Distributed Systems (Student)',
    company: 'Computer Science Department',
    start: '2024.03',
    end: '2024.06',
    link: 'https://your-univ-cloud-course.example.com',
    achievements: [
      'HTCondor를 활용한 분산 작업 실행 및 모니터링 실습 수행',
      'Vagrant + Ansible을 이용한 개발/실습 환경 자동화 설계 및 구현',
      'WSL/Windows/VirtualBox 간 제약 사항을 분석하고, 실제 사용 가능한 인프라 구성으로 우회',
    ],
  },
];

export const SKILLS: Record<string, string[]> = {
  'Backend & Agents': [
    'Node.js',
    'TypeScript',
    'Express',
    'REST API Design',
    'JWT Auth',
    'LLM Agents (Basic)',
    'WebSocket (Basic)',
  ],
  Databases: ['MySQL', 'PostgreSQL', 'ERD 설계', '기본 정규화', '트랜잭션 기초'],
  'Infra & DevOps': [
    'Ubuntu Server',
    'Docker',
    'docker-compose',
    'Nginx / Reverse Proxy',
    'GitHub Actions',
    'WSL',
  ],
  'Frontend & Mobile': [
    'React',
    'Next.js',
    'React Native',
    'Tailwind CSS',
    'Basic UI/UX',
  ],
  'AI & AR/3D (Support)': [
    'React Viro (AR)',
    '3D Modeling (Maya, Basic)',
    'KoELECTRA 기반 감정 분류 활용',
    'LangChain (RAG 기초)',
  ],
  'Tools & Workflow': [
    'Git / GitHub',
    'Obsidian',
    'Digital Garden',
    'VS Code',
    'Postman',
    'Linux CLI',
  ],
};

export const EDUCATION = [
  {
    school: 'OO대학교',
    major: '컴퓨터공학과 (재학 중)',
    period: '2021.03 - Present', // TODO: 실제 연도로 수정
  },
];

export const BLOG_POSTS = [
  {
    uid: 'home-server-journey',
    title: 'WSL에서 Ubuntu Server로 – 홈서버 인프라 재구성기',
    description:
      'WSL 메모리 이슈와 네트워크 병목을 분석하고, Ubuntu Server + Docker 기반으로 홈서버를 재구성한 과정 정리.',
    link: 'https://blog.example.com/home-server-journey',
  },
  {
    uid: 'leafy-architecture',
    title: 'Leafy: AR 반려식물 서비스의 아키텍처와 감정 파이프라인',
    description:
      'React Native AR 클라이언트, 감정 분석 모델, 백엔드 서버를 어떻게 나누고 연결했는지에 대한 기술적 회고.',
    link: 'https://blog.example.com/leafy-architecture',
  },
  {
    uid: 'obsidian-workflow',
    title: '개발자를 위한 Obsidian 활용: 공부 기록에서 Digital Garden까지',
    description:
      '굿노트에서 Obsidian으로 넘어오면서 생긴 변화와, 개발 학습을 쌓고 공유하는 워크플로우 정리.',
    link: 'https://blog.example.com/obsidian-workflow',
  },
];
