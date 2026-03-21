// 연락처 & 리소스
export const EMAIL = 'dyddyd134@naver.com';

export const SOCIAL_LINKS = [
  { label: 'GitHub', link: 'https://github.com/YonghoBae' },
  { label: 'Tech Blog', link: 'https://ohgnoy.vercel.app/' },
  { label: 'Digital Garden', link: 'https://ohgnoy-digitalgarden.vercel.app/' },
];

// ----------------------------------------------------------------------------
// 프로젝트 (정예화된 3개)
// ----------------------------------------------------------------------------
export const PROJECTS = [
  {
    name: 'Leafy – Hybrid AI 정서 케어 시스템',
    video: '/videos/leafy-demo.mp4', // [전략] AR 반응 속도 증명용 영상
    link: 'https://github.com/InnerEcho/API',
    architectureImg: '/images/leafy-architecture.png',
    relatedLinks: [
      {
        label: 'Leafy API',
        link: 'https://github.com/InnerEcho/API',
      },
    ],
    description:
      '1인 가구의 정서적 고립 해결을 위한 AR 반려식물 & AI 상담 서비스입니다. 감정 분석 모델과 Multi-Agent LLM을 결합하여 사용자의 감정 원인을 추론하고, AR 시각 효과와 실시간 음성 대화를 통해 능동적인 정서 케어를 제공합니다.',
    details: [
      'S. 텍스트 위주의 챗봇은 감정 전달에 한계가 있고, 단순 AR 앱은 지속적인 사용 동기가 부족했습니다.',
      'T. 사용자가 부담 없이 감정을 털어놓고 행동 변화까지 이어질 수 있는 "실재감 있는" 정서 케어 시스템 구축이 필요했습니다.',
      'A1. Multi-Agent Router를 설계하여 상황(공감/성찰/제안)에 맞는 페르소나를 스위칭하고, Redis(단기) + Vector DB(장기) 하이브리드 메모리 구조로 대화의 맥락 정확도를 높였습니다.',
      'A2. WebRTC + OpenAI Realtime API를 통해 끊김 없는 음성 대화를 구현하고, 서버를 Proxy로 두어 보안성과 연결 안정성을 확보했습니다.',
      'A3. 감정 원인 추론 파이프라인을 구축하여 단순 감정 라벨링을 넘어 "왜 슬픈지"를 파악하고 맞춤형 행동 미션을 제안하도록 로직을 설계했습니다.',
      'R1. 하이브리드 메모리 도입으로 LLM 토큰 비용을 약 40% 절감하면서도 장기 기억 회상 정확도를 유지·개선했습니다.',
      'R2. WebRTC 도입으로 음성 지연 시간을 500ms 이내로 단축하여 실시간 대화 몰입감을 크게 높였습니다.',
    ],
    techStack: [
      'Node.js',
      'TypeScript',
      'LLM Agents',
      'OpenAI Realtime API',
      'Vector DB',
      'Redis',
      'WebRTC',
      'React Native (AR)',
      'Docker',
    ],
  },
  {
    name: 'Home Server & DevOps Platform',
    video: '/assets/blog/portfolio/homeserver_diagram.svg', // [전략] 아키텍처 다이어그램을 영상화하거나 이미지로 대체 추천
    link: 'https://ohgnoy.vercel.app/',
    architectureImg: '/images/home-server-architecture.svg',
    description:
      '유휴 장비를 활용해 구축한 온프레미스 Docker 환경입니다. Nginx Proxy Manager와 GitHub Actions를 연동하여 개인 프로젝트의 배포 자동화(CI/CD) 및 HTTPS 보안 환경을 0원으로 구축했습니다.',
    details: [
      'S. 로컬 개발 환경과 배포 환경의 차이로 인한 버그가 잦았고, 매번 수동으로 배포하는 과정이 비효율적이었습니다.',
      'T. 상용 클라우드 비용 없이도 연습용 자동화 배포 파이프라인과 모니터링 환경을 직접 만들어 보는 것이 목표였습니다.',
      'A1. Ubuntu Server에 Docker 기반의 마이크로서비스 환경을 구성하고, Nginx Proxy Manager로 서브도메인 라우팅 및 SSL 인증서 발급을 자동화했습니다.',
      'A2. GitHub Actions Self-hosted Runner를 활용해 메인 브랜치 병합 시 자동으로 이미지를 빌드하고 컨테이너를 교체하는 CD 파이프라인을 구축했습니다.',
      'R1. 배포 시간을 기존 20분에서 3분 이내로 단축하고, "코드 푸시 = 배포 완료"라는 완전한 자동화를 달성했습니다.',
      'R2. 실제 운영 중 발생하는 트래픽 이슈와 로그 관리를 경험하며 인프라 운영 역량을 확보했습니다.',
    ],
    techStack: [
      'Ubuntu Server',
      'Docker',
      'Nginx Proxy Manager',
      'GitHub Actions',
      'CI/CD',
      'Self-hosting',
    ],
  },
  {
    name: '홈서버 모니터링 & Apollo 원격 데스크탑 관제 시스템',
    video: '/assets/blog/portfolio/apollo.svg', // [전략] Grafana 대시보드 + Discord 알림 영상
    link: 'https://github.com/YonghoBae/monitoring-agent',
    architectureImg: '/images/apollo-monitoring-architecture.png',
    relatedLinks: [
      {
        label: 'Apollo Fork – Metrics Endpoint',
        link: 'https://github.com/YonghoBae/Apollo/tree/feature/metrics-endpoint',
      },
      {
        label: 'Apollo Client Monitoring Service',
        link: 'https://github.com/YonghoBae/apollo-client-monitoring',
      },
      {
        label: 'Monitoring Agent',
        link: 'https://github.com/YonghoBae/monitoring-agent',
      },
    ],
    description:
      '원격 데스크탑(Apollo) 호스트와 홈서버 상태를 관제하고, 장애 발생 시 Spring AI 에이전트가 원인을 분석해 리포트하는 모니터링 시스템입니다. C++ 오픈소스 수정부터 SRE 파이프라인 구축, AI 기반 장애 대응까지 엔지니어링 전 과정을 직접 구현했습니다.',
    details: [
      'S. 팬 소음을 듣고서야 장애를 인지하는 수동적인 운영 방식과, 클라이언트 지표만으로는 호스트 내부 지연(Encoding/Input Queue) 원인을 파악할 수 없는 관측성 부재 문제를 겪었습니다.',
      'T. 홈서버와 Apollo 호스트의 지표를 시각화하고, 장애 발생 시 "무슨 일이 벌어지고 있는지"를 자동으로 분석·리포트하는 프로액티브 모니터링 시스템 구축을 목표로 했습니다.',
      'A1. Apollo(C++)의 stat_tracker 구조를 역공학하여 In-memory Metrics Exporter를 직접 구현했습니다. 이를 통해 File I/O 오버헤드 없이 Frame Processing Latency 등 핵심 지표를 Prometheus로 실시간 노출했습니다.',
      'A2. 60fps 기준 Frame Budget(16.66ms) 초과 비율을 SLI로 정의하고, 임계치 초과 시 Alertmanager가 작동하도록 SLO 기반 알람 체계를 설계했습니다.',
      'A3. Alertmanager Webhook을 수신하는 Spring AI 에이전트를 구현하고, PostgreSQL(pgvector)에 저장된 과거 장애 이력을 RAG로 검색해 대응 가이드를 Discord로 자동 발송하게 했습니다.',
      'A4. Android ZUI OS의 디코딩 스로틀링 문제를 분석하고, Vendor 설정 및 입력기 최적화를 통해 디코딩 Latency Spike를 제거하여 P99 지연을 약 7ms 이내로 안정화했습니다.',
      'R1. 장애 감지 시점을 "사용자 체감 후"에서 "지표 이상 발생 직후"로 앞당겼고, 과거 해결 데이터를 기반으로 MTTR(평균 복구 시간)을 단축할 기반을 마련했습니다.',
    ],
    techStack: [
      'C++',
      'Spring Boot',
      'Spring AI',
      'Prometheus',
      'Grafana',
      'PostgreSQL',
      'pgvector',
      'Docker',
    ],
  },
] as const;

// ----------------------------------------------------------------------------
// 경험 / 활동 (IaC 프로젝트 흡수됨)
// ----------------------------------------------------------------------------
export const WORK_EXPERIENCE = [
  {
    id: 'bootcamp',
    title: 'Bootcamp Capstone – 개인 블로그 & 포트폴리오',
    company: 'University Special Program (자유 과제)',
    start: '2024.07',
    end: '2024.08',
    link: 'https://ohgnoy.vercel.app/',
    achievements: [
      '부트캠프 자유 과제로 Next.js 기반 풀스택 블로그·포트폴리오를 설계해 이후 개인 연습용 서비스로 운영',
      'GitHub Actions 및 Vercel 배포를 자동화해 강의 환경과 동일한 CI/CD 흐름을 경험하고 재사용',
      '과제 기록을 블로그 문서로 정리하여 학습 내용을 체계화하고 후기·레퍼런스로 활용',
    ],
  },
  {
    id: 'cloud-course',
    title: 'Cloud Computing & Distributed Systems',
    company: 'Computer Science Dept.',
    start: '2025.03',
    end: '2025.06',
    link: 'https://github.com/YonghoBae/htcondor-cluster-automation',
    achievements: [
      'HTCondor를 활용한 대규모 분산 작업 스케줄링 및 처리량 분석 수행',
      // [전략] IaC 프로젝트 내용을 강력한 성과로 요약
      'Vagrant와 Ansible을 도입하여 OS 종속성 문제를 해결하고, 명령어 한 줄로 5분 만에 클러스터 환경을 완벽히 재현하는 자동화 스크립트 구현',
      '팀원 간 개발 환경 불일치(Works on my machine) 문제를 0건으로 만들어 실습 효율 극대화',
    ],
  },
];

// ----------------------------------------------------------------------------
// 스킬
// ----------------------------------------------------------------------------
export type SkillGroup = {
  category: string;
  skills: string[];
  note?: string;
};

export const SKILLS: SkillGroup[] = [
  {
    category: 'Backend & API',
    skills: ['Node.js', 'TypeScript', 'Spring Boot', 'Express', 'REST API Design', 'Auth (JWT/OAuth)'],
    note: 'TypeScript 기반 Node.js와 Spring Boot를 상황에 맞게 선택해 서버 설계와 인증/테스팅을 전담합니다.',
  },
  {
    category: 'Data & Storage',
    skills: ['MySQL', 'PostgreSQL', 'Redis', 'Vector DB', 'ORM (Sequelize / TypeORM)'],
    note: '관계형 DB부터 Redis, 벡터 스토리지까지 프로젝트 요구에 맞게 선택합니다.',
  },
  {
    category: 'AI & Architecture',
    skills: ['LLM Agent Patterns', 'RAG Pipeline', 'Spring AI', 'Event-Driven Architecture'],
    note: 'Leafy, Monitoring Agent 등에서 Multi-Agent · RAG 흐름을 직접 설계했습니다.',
  },
  {
    category: 'DevOps & Observability',
    skills: ['Docker', 'GitHub Actions', 'Nginx', 'Prometheus', 'Grafana', 'Linux'],
    note: '홈서버 / GitHub Actions 기반 CI/CD와 모니터링 스택을 운영 중입니다.',
  },
  {
    category: 'Frontend & Mobile',
    skills: ['React', 'Next.js', 'React Native', 'Tailwind CSS'],
    note: '포트폴리오·AR 프로토타입 등 사용자 경험을 빠르게 검증할 수 있습니다.',
  },
];

// ----------------------------------------------------------------------------
// 학력
// ----------------------------------------------------------------------------
export const EDUCATION = [
  {
    school: '충북대학교',
    major: '소프트웨어학과',
    period: '2021.03 - Present',
  },
];

// ----------------------------------------------------------------------------
// 블로그 / 글
// ----------------------------------------------------------------------------
export const BLOG_POSTS = [
  {
    uid: '1',
    title: '홈서버 구축기: WSL에서 Ubuntu Server로 이사하기',
    description:
      'Docker 컨테이너 운영 중 겪은 메모리·네트워크 병목 현상 분석과, Ubuntu Server 마이그레이션을 통한 성능 개선 과정.',
    link: 'https://ohgnoy-digitalgarden.vercel.app/project/setting/Home%20Server/Ubuntu%20Server%20%EC%84%A4%EC%B9%98/',
  },
  {
    uid: '2',
    title: 'git push 하나로 완성되는 나만의 배포 파이프라인 구축기',
    description:
      'GitHub Actions로 Docker 이미지 빌드부터 SSH 배포까지 자동화하고, Secrets·캐시를 활용해 빌드 시간을 절감한 CI/CD 구축기.',
    link: 'https://ohgnoy-digitalgarden.vercel.app/project/setting/Github%20Actions/Github%20Actions/',
  },
  {
    uid: '3',
    title: 'Vagrant와 Ansible로 HTCondor 클러스터 자동화하기',
    description:
      'WSL 상에서 Vagrant/Ansible을 조합해 마스터·워커 노드를 자동 구성하고, 분산 크롤링 과제를 재현한 IaC 프로젝트 회고.',
    link: 'https://ohgnoy-digitalgarden.vercel.app/project/setting/Cloud%20Computing/vagrant,%20ansible/',
  },
];
