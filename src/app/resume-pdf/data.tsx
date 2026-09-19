// /resume-pdf 전용 데이터. 출처: 노션 「이력서」(page 38e3bf6b7ea981eda58ceb518b611636).
// 프로필·학력·자격증·기술 스택은 ../portfolio-pdf/data.tsx 것을 그대로 재사용합니다 —
// 같은 사실을 두 곳에 다른 말로 적어 두면 한쪽만 고치고 어긋나기 쉽습니다.
//
// 예외: 「AI 기반 홈서버 장애 관제」항목의 "자율적 도구 호출 흐름 정상화 (0회 → 평균 3회)"는
// docs/portfolio-sources.md 「아직 어디에도 없는 것」에 근거 없음으로 이미 확인된 수치라
// 정성 서술로 바꿨습니다.

import { EDUCATION, PROJECTS } from '../portfolio-pdf/data';

/**
 * 인적사항은 저장소에 넣지 않습니다 — 이 저장소는 공개(github.com/YonghoBae/ohgnoy)라
 * 한 번 커밋하면 나중에 지워도 히스토리에 남습니다. `.env.local` 에 적고, 사진은
 * `public/resume/` 에 두되 `.gitignore` 로 제외합니다(둘 다 로컬·Vercel 에만 존재).
 *
 * .env.local 예시
 *   NEXT_PUBLIC_RESUME_PHONE=010-0000-0000
 *   NEXT_PUBLIC_RESUME_BIRTH=2000.01.01
 *   NEXT_PUBLIC_RESUME_ADDRESS=충북 청주시 서원구
 *
 * 비어 있으면 그 행을 아예 렌더하지 않습니다(`resume.tsx` 의 `{PHONE && ...}`).
 * 값이 없다고 지어내지 않습니다 — 그대로 제출되는 항목입니다.
 */
export const PHONE = process.env.NEXT_PUBLIC_RESUME_PHONE ?? '';
export const BIRTH_DATE = process.env.NEXT_PUBLIC_RESUME_BIRTH ?? '';
/** 시/구까지만. 예: '충북 청주시 서원구' */
export const ADDRESS = process.env.NEXT_PUBLIC_RESUME_ADDRESS ?? '';

/** 증명사진 (3x4). 파일은 `.gitignore` 로 제외됩니다 — 없으면 사진 자리를 비웁니다. */
export const PHOTO = '/resume/profile.jpeg';

export const AWARDS = [
  {
    name: '장려상',
    event: '충북대학교 SW중심대학사업단 2024년 2학기 교과기반 프로젝트 영어 발표회',
    date: '2024.12',
    detail: '산학프로젝트(종합설계) 교과 프로젝트를 영어로 발표',
  },
];

/** 「코딩 에이전트 활용 경험」— 착수 전 / 작업 중 / 병합 전 3단계. */
export const AI_PRACTICE_TOOLS = 'Claude Code, Codex 등';

export const AI_PRACTICE_STEPS: { phase: string; points: string[] }[] = [
  {
    phase: '착수 전 — 계획을 문서로 확정한다',
    points: [
      '작업에 들어가기 전 요구사항과 제약을 질의응답으로 좁히고, 목표·구조·변경할 파일·태스크별 검증 방법을 계획 문서로 남긴 뒤 태스크 단위로 실행을 맡긴다',
      '코드보다 설계를 먼저 확정하는 순서를 지켜, 에이전트가 잘못 이해한 상태로 코드를 쓰는 것을 앞단에서 방지한다',
    ],
  },
  {
    phase: '작업 중 — 지킬 경계를 저장소에 남긴다',
    points: [
      '저장소 구조, API·DB 계약, 커밋 규칙을 문서로 명시해 사람과 에이전트가 같은 기준으로 작업하게 한다',
      '임의로 바꾸면 팀 작업이 깨지는 부분(예: DB 스키마)은 변경을 금지하고 주석으로 질문을 남기게 하며, 작업 맥락은 인수인계 문서로 넘겨 다음 세션이 같은 탐색을 반복하지 않게 한다',
    ],
  },
  {
    phase: '병합 전 — 읽고 이해한 뒤 병합한다',
    points: [
      '에이전트가 작성한 코드를 직접 읽어 동작을 이해한 뒤 병합하고, 불필요하게 복잡해진 구조와 중복은 리뷰 단계에서 걷어낸다',
      '문서·설계 검토도 검토 → 재검 → 사람 결정 단계를 거치게 해 에이전트 판정을 그대로 반영하지 않으며, 세션 컨텍스트를 정리해 토큰 사용을 줄이고 긴 작업에서도 판단 근거를 유지한다',
    ],
  },
];

/** 「교육 및 대외활동」— ../portfolio-pdf/data.tsx의 EDUCATION.extra(학력 보충)와는
 * 다른 절입니다. 저쪽은 한 줄 요약, 이쪽은 노션 원문의 기수별 상세 bullet입니다. */
/** 덱 학력 보충(EDUCATION.extra)에서 한 항목을 꺼냅니다. 덱에만 적혀 있던 이력을
 * 이력서에 옮겨 적으면 한쪽만 고쳐져 어긋나므로 문장을 그대로 참조합니다. */
function deckExtra(titlePrefix: string) {
  const item = EDUCATION.extra.find((e) => e.title.startsWith(titlePrefix));
  if (!item) throw new Error(`덱 학력 보충에 없는 항목: ${titlePrefix}`);
  return item;
}

/** 덱 항목의 detail 앞머리가 기간이면 기간 칸으로 떼어 냅니다. */
function deckActivity(titlePrefix: string) {
  const { title, detail } = deckExtra(titlePrefix);
  const [head, ...rest] = detail.split(' · ');
  const isPeriod = /^\d{4}\.\d{2}/.test(head);
  return {
    title,
    period: isPeriod ? head : '',
    points: [(isPeriod ? rest : [head, ...rest]).join(' · ')],
  };
}

export const EDU_ACTIVITIES: {
  title: string;
  period: string;
  points: string[];
}[] = [
  {
    // 덱은 2학기 진행 중까지 적어 두는데 노션 이력서는 1학기에서 멈춰 있었습니다.
    title: '삼성청년SW·AI아카데미(SSAFY) — Java 트랙',
    period: '2026.01 ~ 현재',
    points: [
      '1학기 수료 (2026.01.07 ~ 06.26) · 2학기 진행 중',
      'Java/Spring Boot 기반 웹 풀스택 및 생성형 AI(LangGraph, 파인튜닝) 융합 심화 과정 이수 (총 925시간)',
      '알고리즘 기초부터 데이터베이스 모델링, Spring AI를 활용한 REST API 설계 실무 역량 확보',
      // 1학기 최종 프로젝트 상세는 아래 「프로젝트 경험」의 AgentHub 항목과 같은
      // 내용이라 여기서는 연결만 해 둡니다 — 같은 문서에 두 번 적을 자리가 없습니다.
      '1학기 최종 프로젝트: AgentHub (아래 프로젝트 경험 참조)',
    ],
  },
  {
    title: '충북대학교 SW중심대학사업단 여름방학 SW개발자과정 몰입교육',
    // 덱이 2024.07.22 ~ 08.26 으로 못 박아 둔 날짜를 따릅니다.
    period: deckExtra('충북대 SW중심대학사업단').detail.match(/\(([^)]+)\)/)?.[1] ?? '',
    points: [
      'Next.js 기반 Web Full Stack(Front-end, Back-end, DB) 구축 및 배포 사이클 실습 (5주 · 1일 8시간 대면)',
      'LangChain 프레임워크를 활용한 LLM 연동 및 AI 서비스 파이프라인 개발 실습',
    ],
  },
  // 덱에만 있고 노션 이력서에는 없던 이력입니다.
  deckActivity('㈜케이아이에스'),
];

/**
 * 개요는 덱(../portfolio-pdf/data.tsx PROJECTS)의 `oneLiner`를 그대로 참조합니다.
 *
 * 노션 이력서의 개요 문장을 베껴 오면 안 됩니다 — 거기서는 성과가 개요에 섞여
 * 있어(AJT는 «각주가 원문과 맞는지 기계로 판정하며»가 서비스 정의처럼 올라와
 * 있었음) 프로젝트가 무엇인지 모르는 사람이 읽을 재료가 없습니다. 덱 쪽 문장은
 * 각 프로젝트의 시스템정의서·요구사항정의서가 출처이고, 덱에도 「개요는 서비스
 * 소개이지 내 소개가 아니다」가 규칙으로 적혀 있습니다.
 */
function deckOneLiner(deckName: string) {
  const project = PROJECTS.find((p) => p.name === deckName);
  if (!project) throw new Error(`덱에 없는 프로젝트: ${deckName}`);
  return project.oneLiner;
}

/**
 * 이력서 스택은 덱의 부분집합입니다. 이력서는 더 짧게 고르지만, 덱에 없는 이름이나
 * 다르게 적은 표기(`LangChain` vs `LangChain.js`)는 여기서 막습니다 — 두 문서가
 * 같은 프로젝트를 다른 스택으로 말하면 어느 쪽이 맞는지 읽는 쪽이 알 수 없습니다.
 * 덱에 빠진 기술이 있으면 덱을 채우지, 이 목록을 늘려 우회하지 않습니다.
 */
function deckStack(deckName: string, picks: string[]) {
  const project = PROJECTS.find((p) => p.name === deckName);
  if (!project) throw new Error(`덱에 없는 프로젝트: ${deckName}`);
  const missing = picks.filter((x) => !project.stack.includes(x));
  if (missing.length)
    throw new Error(`덱 ${deckName} 스택에 없는 항목: ${missing.join(', ')}`);
  return picks;
}

/** 「프로젝트 경험」— 덱(../portfolio-pdf/data.tsx PROJECTS)의 압축판. 문제 해결 4단계
 * 대신 [대괄호] 라벨이 붙은 성과 bullet 2~4개로 줄입니다. */
export type ResumeProject = {
  name: string;
  subtitle: string;
  period: string;
  team: string;
  role: string;
  repo?: string;
  oneLiner: string;
  stack: string[];
  highlights: { label: string; text: string }[];
};

export const RESUME_PROJECTS: ResumeProject[] = [
  {
    name: 'LLM Wiki 및 일정 관리 시스템',
    subtitle: 'AJT',
    period: '2026.07 ~ 2026.08',
    team: '6인 (SSAFY 2학기 자율 프로젝트)',
    role: 'AI 파트 담당',
    repo: 'github.com/YonghoBae/ajt-llm-wiki',
    oneLiner: deckOneLiner('AJT'),
    stack: deckStack('AJT', ['FastAPI', 'deepagents', 'MCP', 'Spring Boot', 'PostgreSQL', 'Jenkins', 'Docker', 'LangSmith']),
    highlights: [
      {
        label: '판정 기준 불일치 제거',
        text: '통과 게이트와 검사 결과의 기준을 일치시켜 모델 호출 40회 → 12회',
      },
      {
        label: '근거 검증 자동화',
        text: '인용 위치를 원문과 대조하는 기계 판정 — 각주 616개 중 613개 일치',
      },
      {
        label: '한국어 검색 교정',
        text: '공백 분리 색인을 2글자 n-gram으로 — 상위 5건 재현율 0.33 → 0.60',
      },
    ],
  },
  {
    name: 'AgentHub – AI Agent 오픈소스 탐색 커뮤니티',
    subtitle: '',
    period: '2026.05 ~ 2026.07',
    team: '2인 (SSAFY 1학기 최종 프로젝트)',
    role: '분석 에이전트·산출물 문서 11종 단독, 백엔드 연동',
    repo: 'github.com/finalyongoh/agenttrace',
    oneLiner: deckOneLiner('AgentHub'),
    stack: deckStack('AgentHub', ['Python', 'LangGraph', 'LangChain', 'FastAPI', 'PostgreSQL', 'tree-sitter', 'Java 21', 'Spring Boot', 'Spring Batch', 'JPA']),
    highlights: [
      {
        label: '근거 우선 분석 파이프라인',
        text: '근거를 파일 경로·행 범위·해시로 구조화 — 8개 영역 확인 0건 → 8건',
      },
      {
        label: '컨텍스트 한도 해소와 병목 분해',
        text: '128K를 넘던 도구 탐색을 구조 지도 기반 단일 호출로 전환',
      },
      {
        label: '분석 연동 계층(Spring)',
        text: '트리거 즉시 반환 + 콜백 수신 구조로 분리, Spring Batch 수집 인수',
      },
    ],
  },
  {
    name: 'Leafy – AI 기반 정서 지원 경험 설계 프로젝트',
    subtitle: '',
    period: '2025.03 ~ 2025.11',
    team: '3인',
    role: '팀장 / 백엔드 전반 / AI Agent 파이프라인 / WebSocket / 배포 자동화',
    repo: 'github.com/InnerEcho/API',
    oneLiner: deckOneLiner('Leafy'),
    stack: deckStack('Leafy', ['Node.js', 'TypeScript', 'MySQL', 'Redis', 'Upstash Vector', 'LangChain.js', 'Docker', 'Nginx', 'GitHub Actions']),
    highlights: [
      {
        label: 'AI Agent 파이프라인 설계',
        text: 'AgentRouter 역할 분리(3단계)와 SafetyModerator 검토 단계 분리',
      },
      {
        label: '하이브리드 메모리 구조 설계',
        text: 'Redis(단기) / Vector DB(장기) 분리로 누적 토큰 O(N²) → O(N)',
      },
      {
        label: 'WebSocket 연결 안정화',
        text: 'Room-state Snapshot 동기화·Heartbeat로 단절 시 상태 유실 차단',
      },
      {
        label: 'Docker 기반 배포 자동화',
        text: 'GitHub Actions + Docker CI/CD — 배포 34건 중앙값 1.5분',
      },
    ],
  },
  {
    name: 'AI 기반 홈서버 장애 관제 시스템',
    subtitle: '',
    // 「현황: 운영 중」만 적혀 있어 이 프로젝트만 담당 역할이 비어 있었습니다.
    // 운영 중이라는 사실은 기간이 말하므로, 역할 칸은 덱과 같이 씁니다.
    period: '2025.11 ~ 운영 중',
    team: '1인',
    role: '풀스택 · DevOps',
    repo: 'github.com/YonghoBae/monitoring-agent',
    oneLiner: deckOneLiner('AI 기반 홈서버 장애 관제'),
    stack: deckStack('AI 기반 홈서버 장애 관제', ['Spring Boot', 'Spring AI', 'Prometheus', 'Loki', 'Grafana', 'PGVector', 'Docker']),
    highlights: [
      {
        label: 'ReAct 에이전트 파이프라인 설계',
        text: 'Function Calling + PGVector(RAG) 연동, 승인 후 조치 실행',
      },
      {
        label: '프롬프트 엔지니어링으로 에이전트 행동 교정',
        // 이 A/B 수치는 원래 상단 「핵심 역량」 요약에 있었는데, 그 절이 아래 프로젝트
        // 경험과 중복이라 없앴습니다. 근거가 나올 자리는 원래 여기입니다.
        text: '역할·종료 기준 명시로 되묻던 편향 제거, 개선안의 통과율 회귀(66% → 11%)를 A/B 228회로 배포 전 적발',
      },
      {
        label: 'Docker 빌드 파이프라인 최적화',
        text: '이미지 728MB → 323MB, 캐시 재빌드 83초 → 1.2초',
      },
    ],
  },
];

/** 자기소개서 — 4문항. */
export const COVER_LETTER: { title: string; paragraphs: string[] }[] = [
  {
    title: '성장과정 및 가치관',
    paragraphs: [
      '분석 결과를 빠르게 내놓는 것과 그 결과를 믿고 쓸 수 있게 만드는 것은 다른 일이라고 생각하게 된 계기가 있습니다.',
      'AgentHub에서 GitHub 저장소를 분석하는 에이전트를 설계·구현할 때, README에 적힌 기능 설명을 그대로 요약해 보여주면 사용자는 그것을 누군가 확인한 결과로 받아들입니다. 실제로는 문서의 주장일 뿐인데 저장소를 채택할지 결정하는 판단에 그대로 쓰이게 됩니다. 그래서 README의 주장과 코드·설정 파일에서 확인되는 구현 단서를 나눠 보여주고, 근거가 부족하거나 분류가 애매한 결과는 확정 분석에서 빼 원본에서 더 확인할 지점을 함께 제시했습니다. 오류 제보도 기존 결과에 바로 반영하지 않고 재검토 대상으로 따로 두어, 아직 검토되지 않은 지적이 확정된 분석처럼 섞이지 않게 했습니다.',
      '이 기준은 지금도 작업 방식으로 남아 있습니다. 무엇을 만들든 확인된 것과 아직 확인이 필요한 것을 구분해 전달하고, 상대가 어디를 더 봐야 하는지 함께 남깁니다.',
    ],
  },
  {
    title: '성격의 장단점',
    paragraphs: [
      '기능이 정상 동작하는 코드에서도 구조를 그냥 지나치지 못하는 편입니다.',
      '우아한테크코스 프리코스의 코드 리뷰에서, 동작에는 문제가 없지만 특정 클래스의 책임이 다른 클래스에 구현돼 있고 클래스 간 직접 할당으로 결합도가 높아진 부분을 짚었습니다. 기능은 언제든 바꿀 수 있지만 구조가 잘못된 채로 쌓이면 나중에 수정 범위가 걷잡을 수 없이 커진다고 봤기 때문입니다. 데이터베이스 설계 과제에서도 정규화를 2NF·3NF까지 직접 따져가며 테이블을 나눴습니다. 남들이 넘어가는 지점에서 한 번 더 확인하는 쪽으로 손이 굳었습니다.',
      '같은 성향이 과해지면 착수가 늦어집니다. 이게 맞는 방식인지 오래 따지다 초기 진행이 지연된 적이 있습니다.',
      '그래서 지금은 일을 받으면 우선순위를 먼저 정하고, 각 작업에 짧은 마감을 스스로 걸어 그 안에 마무리합니다. 완성도를 끝까지 붙드는 대신, 확인이 필요한 범위와 지금 넘길 수 있는 범위를 먼저 갈라 놓습니다.',
    ],
  },
  {
    title: '직무역량 및 문제 해결 경험',
    paragraphs: [
      '관측할 수 없는 대상은 문제가 생겨도 원인을 짐작하게 됩니다.',
      '졸업작품 Leafy에서 백엔드 전반과 필요한 프론트엔드 연결부를 맡았습니다. 단일 모델이 공감과 판단을 동시에 수행하기 어렵다는 문제를 확인해 공감과 조언 역할을 분리하고, 단기 기억은 Redis, 장기 기억은 벡터 검색으로 나눈 구조를 설계·구현했습니다. 만든 서비스를 홈서버에 올려 운영하면서 남은 문제는 기능이 아니라, 문제를 사람이 눈치채야 알 수 있는 구조였습니다.',
      '그래서 관측 흐름을 먼저 만들었습니다. Prometheus로 서버와 컨테이너 지표를 모으다 원격 데스크톱 소프트웨어에서 막혔습니다. 내보내는 지표가 없어서, 로그를 파싱하는 방법은 필요한 상태값이 남지 않아 제외했고 debug 로그를 켜는 방법은 I/O 부담 때문에 접었습니다. 결국 C++ 소스를 읽어 내부에서 성능 데이터를 집계하는 지점을 찾아 외부에서 수집할 수 있는 형태로 노출했습니다.',
      '수집한 지표는 경보와 AI 분석, Discord 알림으로 연결했습니다. 관제 스택을 올린 뒤에는 지표를 수집하는 컨테이너가 서버 자원을 크게 쓰고 있는 것을 발견해, 수집 주기를 늘리고 쓰지 않는 지표 7종을 끄자 이 컨테이너의 CPU 점유가 41.7%에서 2.6%로 내려갔습니다. 관측 대상을 늘릴 때는 수집 비용을 먼저 확인합니다.',
    ],
  },
  {
    title: '지원동기 및 입사 후 포부',
    paragraphs: [
      '운영 환경에서 AI 기능이 믿고 쓸 수 있게 동작하도록 만드는 일을 하고 싶습니다.',
      '홈서버 관제에 AI 에이전트를 붙여 보면서, 모델이 지표와 과거 기록으로 원인 후보와 대응 순서를 내놓는 것까지는 어렵지 않지만 그다음이 문제라는 것을 겪었습니다. 그래서 컨테이너 재시작처럼 상태를 바꾸는 조치는 승인을 받은 뒤에만 실행되도록 막았습니다. 판단은 모델이 돕고 되돌리기 어려운 실행은 사람이 확인하는 경계가 있어야 운영에 쓸 수 있다고 봤습니다.',
      '입사 초기에는 서비스의 데이터 흐름과 예외 처리, 운영 지표를 코드와 문서로 대조해 파악하겠습니다. 장애를 다시 볼 때 모델의 응답을 재현할 수 있도록 입력과 출력이 남는지도 함께 확인하겠습니다.',
      '이후에는 모델의 답이 확정된 정보처럼 보이는 지점을 찾아 사람의 확인이 필요한 구간을 정리하고, 사용자가 처리 범위와 남은 확인 지점을 알 수 있는 제품 흐름을 구현하고 싶습니다.',
    ],
  },
];
