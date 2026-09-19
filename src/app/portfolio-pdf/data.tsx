// A4 가로 덱용 데이터. 출처: 노션 「포트폴리오」(배용호 · Backend / AI Agent)와
// 「디자이너 포트폴리오 : Designer Portfolio」의 최근 수행 프로젝트 DB · Skiis DB.
// 웹 세로판은 ../portfolio/data.ts 를 따로 씁니다.
//
// 문체 규칙 — 덱 본문은 전부 개조식입니다. 노션 원문이 개조식이고, 같은 폭에
// 서술형 완성문의 두 배가 들어갑니다. 존댓말 완성문으로 풀어 쓰면 지면이
// 모자라 내용을 지우게 됩니다(실제로 한 번 그렇게 됐습니다). 종결은 명사형
// 또는 한다체로 통일하고, 한 줄에 사실 하나만 담습니다.

export const PROFILE = {
  name: '배용호',
  nameEn: 'Bae Yongho',
  role: 'Backend · AI Agent Developer',
  roleKo: '백엔드 · AI 에이전트 개발자',
  email: 'dyddyd134@naver.com',
  github: 'github.com/YonghoBae',
  githubUrl: 'https://github.com/YonghoBae',
  blog: 'ohgnoy-digitalgarden.vercel.app',
  blogUrl: 'https://ohgnoy-digitalgarden.vercel.app',
  /** 이 덱이 배포되는 주소. 블로그(digitalgarden)와 다른 사이트입니다 —
   *  이력서가 블로그 도메인 뒤에 `/portfolio-pdf` 를 붙여 두어 404 였습니다. */
  portfolio: 'ohgnoy.vercel.app/portfolio-pdf',
  portfolioUrl: 'https://ohgnoy.vercel.app/portfolio-pdf',
  // 표지 첫 줄은 태도, 바로 아래 `summary`가 성과입니다 — 한때 첫 줄도 성과로
  // 바꿨다가(e186d4e) 같은 말을 두 번 하게 되어 되돌렸습니다. 수치는 summary에
  // 다 있으니 첫 줄까지 성과로 쓸 자리가 없습니다.
  lead: '약점을 숨기지 않고 정면으로 부딪힙니다.',
  summary:
    '사내 LLM Wiki · GitHub 저장소 분석 에이전트 · 홈서버 장애 관제를 설계·구현했습니다. 위키 각주 616개를 원문과 대조해 기계로 판정했고, 프롬프트 개선을 시나리오 38종 · 228회 A/B로 재서 통과율이 11%로 회귀한 판본을 배포 전에 걸러냈습니다.',
};

// ----------------------------------------------------------------------------
// p1 — 이력 요약
// ----------------------------------------------------------------------------
export const EXPERIENCE_HEADLINE =
  '팀 프로젝트 3건 · 개인 프로젝트 2건 · 홈서버 운영 중';

/**
 * 연대기 겸 목차. `project`는 PROJECTS의 name과 맞춰 두고, 상세 페이지 번호는
 * page.tsx가 덱을 조립하면서 계산합니다 — 여기에 번호를 적으면 페이지를 넣거나
 * 뺄 때마다 어긋납니다.
 */
export const TIMELINE: {
  project?: string;
  title: string;
  period: string;
  meta: string;
  note: string;
}[] = [
  {
    project: 'AJT',
    title: 'AJT: 사내 LLM Wiki 및 일정 관리',
    period: '2026.07 ~ 08',
    meta: 'SSAFY 팀 프로젝트 · 6인 · AI 파트',
    note: '흩어진 사내 문서를 위키로 재구성하고, 권한 범위 안에서 챗봇으로 답하는 사내 지식 시스템',
  },
  {
    project: 'AI 기반 홈서버 장애 관제',
    title: 'AI 기반 홈서버 장애 관제',
    period: '2025.11 ~ 운영 중',
    meta: '개인 프로젝트 1인 · 풀스택 · DevOps',
    note: '장애 알림이 뜨면 스스로 관측 데이터를 조회해 원인을 분석하고, 위험한 조치는 승인 후 실행하는 1차 대응 시스템',
  },
  {
    title: '온프레미스 홈서버 구축·운영',
    period: '2025 ~ 운영 중',
    meta: '개인 · 1인 · 컨테이너 27종 상시 가동',
    note: '위 세 프로젝트가 실제로 도는 실행 환경',
  },
  {
    project: 'AgentHub',
    title: 'AgentHub: GitHub 저장소 분석',
    period: '2026.05 ~ 07',
    meta: 'SSAFY 팀 프로젝트 · 2인 · 분석 에이전트 단독',
    note: 'GitHub 오픈소스를 수집·분석해, AI 분석 결과와 커뮤니티 신호를 함께 주는 기술 탐색 서비스',
  },
  {
    project: 'Leafy',
    title: 'Leafy: AI 정서 케어 · AR 멀티플레이',
    period: '2025.03 ~ 11',
    meta: '3인 팀 · 팀장 · 백엔드와 AI 파이프라인',
    note: '1인 가구가 AR 반려식물과 대화하며 감정을 나누고, AI가 그 기록을 정리해 주는 정서 교감 앱',
  },
];

// ----------------------------------------------------------------------------
// p2~p5 — 대표 프로젝트 (페이지당 1건)
// ----------------------------------------------------------------------------
/** 노션 프로젝트 상세 페이지에서 받아온 다이어그램·화면 캡처. */
export type DeckImage = {
  src: string;
  caption: string;
  /** 이 이미지가 무엇을 증명하는지 한 줄. 헤더 바로 아래에 작게 들어갑니다. */
  note?: string;
  /**
   * 'full'(기본) — 이미지가 페이지를 꽉 채웁니다. 가로형(비율 1.3 이상)에 씁니다.
   * 'split'  — 왼쪽 이미지 + 오른쪽 설명. 세로형은 가로형 페이지에서 폭이 남으므로
   *            남는 폭을 설명으로 채웁니다.
   */
  layout?: 'full' | 'split';
  /** layout: 'split'에서 이미지 오른쪽에 들어가는 본문. */
  details?: { heading: string; points: string[] }[];
  /**
   * 벡터 임베드. 있으면 PNG(src) 대신 이 HTML을 iframe으로 렌더합니다.
   * PNG는 PDF 안에서 래스터 한 장이 되어 뷰어가 4~5배 축소할 때 얇은 획과
   * 작은 글자가 깨집니다. HTML을 그대로 인쇄하면 글자가 벡터로 나갑니다.
   * 캔버스 크기는 여기 적지 않습니다 — page.tsx가 빌드 시 HTML에서 읽습니다.
   * 도판을 잘라낼 때마다 두 곳을 맞춰야 하는 중복이 되기 때문입니다.
   */
  vector?: { src: string };
  /**
   * 전체 구조를 보여주는 도판. 프로젝트 요약 다음, 담당 범위 앞에 놓입니다.
   * 캡션 문자열로 추측하지 않고 여기서 지정합니다.
   */
  isArchitecture?: boolean;
};

export type DeckProject = {
  name: string;
  subtitle: string;
  period: string;
  team: string;
  role: string;
  repo?: string;
  /** 한 줄 담당 요약. 목차·웹판에서 쓰고, 덱 본문에서는 「담당 역할」이 대신합니다. */
  summary: string;
  /**
   * 서비스 한 줄 정의. 개요 장의 첫 문장입니다 — 「무슨 서비스인가」에 답하지 못한 채
   * 목적·기능으로 넘어가면 나머지가 읽히지 않습니다.
   * 출처: 각 프로젝트의 시스템정의서·요구사항정의서.
   */
  oneLiner: string;
  /**
   * 주요 기능. **서비스가 무엇을 하는가**이지 내가 무엇을 했는가가 아닙니다 —
   * 개요에 담당·성과를 섞으면 프로젝트 소개가 아니라 자기 소개가 됩니다.
   * 출처: 정의서의 「주요 기능」·「세부 목표」·「범위 포함」.
   */
  features: { name: string; detail: string }[];
  /**
   * 왜 만들었는가. `oneLiner`·`features`가 «무엇인가»라면 이쪽은 «어떤 문제를 풀려고
   * 만들었는가»입니다 — 개요 장은 이 둘이 같이 있어야 읽힙니다.
   *
   * 전부 프로젝트 자신의 기획 문서에서 가져옵니다. 그럴듯한 문제 정의는 얼마든지
   * 지어낼 수 있고 실제로 한 번 지어냈다가 걸렀습니다 — 출처는 `purposeSource`에
   * 적고, 문서가 없으면 이 필드를 비워 두지 임의로 채우지 않습니다.
   */
  purpose: string[];
  /**
   * `purpose`의 출처 문서. **화면에는 인쇄하지 않습니다** — 덱을 읽는 사람은 열어볼 수
   * 없는 사내 문서 이름이라 군더더기입니다. 여기 남겨 두는 이유는 순전히 제 쪽의
   * 안전장치입니다: 이 줄을 채울 수 없으면 `purpose`를 쓰지 않는다는 규칙.
   * 출처 전체 목록은 `docs/portfolio-sources.md`.
   */
  purposeSource: string;
  /** 기간·팀 구성. 헤더의 한 줄보다 자세히, 팀 안에서 본인이 어디였는지까지. */
  teamMakeup: string[];
  /**
   * 담당 역할과 범위. 「담당 범위」 페이지를 따로 두던 것을 여기로 합쳤습니다 —
   * 두 목록이 거의 같은 말이었고, 개요에서 한 번에 읽는 편이 낫습니다.
   * 도판의 «진한 테두리 = 본인 담당» 표시와 이름을 맞춰 둡니다.
   */
  contribution: string[];
  /**
   * 주요 기술과 «왜 그걸 골랐는지». 이유를 근거로 댈 수 없는 기술은 여기 넣지 않고
   * `stack` 칩으로만 둡니다 — 고른 이유를 지어내면 면접에서 되돌아옵니다.
   */
  /**
   * 기술 선택. 한 줄에 «고를 때의 요구»와 «기각한 대안»만 담습니다 — 대안 비교가
   * 「왜 굳이 이걸」에 답하는 부분이고, 치른 비용까지 칸을 따로 두면 행마다 성격이
   * 섞여(포기한 것 / 추가로 한 일) 칸 이름부터 애매해집니다. 한계는 `detail`에.
   */
  techChoices: { name: string; why: string }[];
  /**
   * 문제 해결. 한 건이 한 페이지이고, 페이지 안은 문제 → 원인 → 해결 → 결과
   * 네 소제목으로 고정입니다. 줄 수 제한을 두지 않는 것이 이 양식의 요점 —
   * 두 칸짜리 페이지에 세 건을 욱여넣던 시절엔 건당 세 줄로 잘렸습니다.
   */
  problems: {
    title: string;
    problem: string[];
    cause: string[];
    solution: string[];
    result: string[];
    /** 이 건의 근거 문서. `purposeSource`와 같은 이유로 화면에는 인쇄하지 않습니다. */
    source?: string;
  }[];
  stack: string[];
  /** 이미지 하나가 페이지 하나. 텍스트 페이지 뒤에 순서대로 붙습니다. */
  imagePages?: DeckImage[];
};

export const PROJECTS: DeckProject[] = [
  {
    name: 'AJT',
    subtitle: '사내 LLM Wiki 및 일정 관리',
    period: '2026.07 ~ 2026.08',
    team: 'SSAFY 팀 프로젝트 · 6인',
    role: 'AI 파트',
    repo: 'github.com/YonghoBae/ajt-llm-wiki',
    summary:
      '편집 에이전트 런타임 · 문서 파싱 파이프라인 · 권한 기반 챗봇 담당. 에이전트 동작에 걸린 백엔드·프론트 수정까지 직접 처리.',
    oneLiner:
      '사내에 흩어진 공지·규정·인수인계 문서를 LLM Wiki로 재구성하고, 권한 범위 안에서 챗봇으로 묻고 답하는 사내 지식 시스템',
    features: [
      {
        name: '문서 업로드와 추출',
        detail:
          'TXT·MD·PDF·DOCX 위키 원본문서와 일정 문서를 올리면 텍스트를 추출, 스캔된 이미지 문서는 OCR로 분기',
      },
      {
        name: '위키 자동 생성',
        detail:
          '에이전트가 문서를 읽어 생성·수정·병합·제거 변경안을 만들어 반영. 관리자는 작업 요약을 확인하고 채팅으로 사후 수정',
      },
      {
        name: '위키 관계 관리',
        detail:
          '위키–원본문서와 위키–위키 관계를 유지해, 어떤 내용이 어느 문서에서 왔는지 따라갈 수 있음',
      },
      {
        name: '권한 기반 챗봇',
        detail:
          '열람 권한 안의 위키·일정에 멀티턴으로 답하고 답변의 출처를 함께 제시',
      },
      {
        name: '일정 관리',
        detail:
          '일정 문서에서 초안을 추출하고 관리자가 승인한 일정만 공개 · 전체·부서·개인 범위',
      },
    ],
    purpose: [
      '전체·부서·개인 일정을 관리하고, 권한에 맞는 지식과 일정에 챗봇으로 질의응답',
      '사원은 권한 내 문서·Wiki·일정만 조회하고 챗봇 답변의 근거를 확인할 수 있어야 함',
    ],
    purposeSource: '요구사항정의서 v2.24 「1. 문서 목적」·「2. 프로젝트 개요」',
    teamMakeup: [
      '2026.07.07 ~ 08.11 (약 5주) · SSAFY 2학기 자율 프로젝트',
      '6인 팀 · 본인은 AI 파트',
      '에이전트 동작에 걸린 백엔드·프론트 수정까지 직접 처리',
    ],
    contribution: [
      '**위키 편집 에이전트** — deepagents(LangChain) 런타임에 MCP로 도구 연결 · 도구 계층을 별도 프로세스에서 in-process로 전환',
      '**문서 파싱과 일정 추출** — PDF는 PyMuPDF · DOCX는 python-docx · XLSX는 openpyxl, 스캔본은 Gemini 비전 OCR · 문서에서 일정 초안을 뽑아 조회 API로 제공',
      '**열람 권한** — 오픈소스의 개인 vault 권한 모델을 사내 부서 권한으로 교체 · 권한이 같은 위키끼리 한 공간(scope)으로 묶어 본문 링크가 범위를 넘지 못하게 함',
      '**질의응답 챗봇** — 권한 범위 안의 위키·일정에만 답하고 출처를 함께 반환',
      '**검색과 근거 검증** — 위키 본문 전문 검색 색인 설계(PostgreSQL 전문검색, 한국어는 pg_bigm 2-gram) · 각주 검증기로 인용 위치와 원문 문자열 대조',
      '**연동 계약과 팀 작업** — FastAPI–Spring 조회 API 10종과 상태·오류 매핑 · Jira · Git Flow · 팀원 MR 리뷰',
    ],
    techChoices: [
      {
        name: '자율형 에이전트 구조',
        why: '문서 상태에 따라 생성·수정·병합·삭제로 할 일이 갈려 분기를 미리 정할 수 없음 — 고정 워크플로우 대신 도구만 열어 두고 순서는 에이전트가 정하게 함',
      },
      {
        name: 'deepagents · MCP',
        why: '에이전트 런타임(도구 등록·대화 상태·재시도)을 5주에 직접 만들 수 없음 — Apache 2.0 구현을 기반으로 쓰고, 손댈 곳을 권한 모델 한 곳으로 좁힘',
      },
      {
        name: 'Spring Boot',
        why: '문서 하나가 위키 여러 건·카테고리·관계를 한 번에 바꾸고 부서별 열람 권한이 걸림 — 쓰기를 파이썬에 두면 트랜잭션·권한을 직접 조립해야 해 자바로 가름 (`@Transactional`·Spring Security)',
      },
      {
        name: '한국어 검색 색인 2-gram',
        why: '한국어는 공백으로 끊으면 조사가 붙어 색인이 어긋남(「연차」로 「연차를」이 안 걸림) — 색인 방식 8가지를 재서 2글자 n-gram으로. 어절 단위로 묶으려던 원래 설계는 측정이 뒤집었다',
      },
    ],
    problems: [
      {
        title: '원본 문서의 타이포그래피 함정을 찾아 40턴 → 12턴',
        problem: [
          '문서 하나를 위키로 바꾸는 작업이 **4회 연속 실패** — 매번 모델 호출 한도에 걸려 중단, 비용 **$11**',
        ],
        cause: [
          '원본 문서에 곧은·굽은 따옴표와 `*Established*` 같은 **마크다운 문법이 섞여 있었음**',
          '원문을 그대로 인용해도 이 차이 때문에 검사기가 **불일치로 판정**',
        ],
        solution: [
          '대조하기 전에 따옴표를 한 종류로 통일하고 마크다운 강조를 벗겨내는 **정규화**를 넣음',
          '비싼 재실행을 돌리기 전에, 실패했던 5건이 정규화 후 전부 매치되는지 스크립트로 먼저 확인',
          '글자까지 같은지는 경고로, 그 위치가 실제로 있는지는 오류로 — 요구사항이 요구한 건 근거의 **존재**였음',
          '프롬프트에 「안 없어지면 넘어가라」고 적어도 안 지켜짐 → **검사 도구가 뱉는 문구**에 「오류 0건이면 끝」을 박아 넣음',
        ],
        result: [
          '같은 문서가 **3분 54초**에 성공 — 모델 호출 **40턴 → 12턴**',
          '완성된 위키의 각주 50개를 원문과 대조 — **43개(86%)**가 글자까지 일치',
          '나머지 7개도 지어낸 것이 아니라 떨어져 있는 두 문장을 이어 붙인 것',
        ],
        source:
          'ai/docs/findings/2026-08-02-wiki-e2e-stability-test.md §2-3 · 2026-08-03-live-stack-verification.md §1',
      },
      {
        title: '위키 각주 616개를 기계 검증하고, 챗봇 출처는 서버가 확정',
        problem: [
          '모델이 쓴 위키는 문장이 그럴듯해도 그 근거가 원문에 실제로 있는지는 알 수 없음',
          '출처를 사람이 일일이 확인해야 한다면 사내 지식으로 쓸 수 없음',
        ],
        cause: [
          '기반 오픈소스의 검사는 인용된 **파일이 있는지만** 봄 — 내용이 달라도 통과',
          '챗봇은 어느 자료를 썼는지를 모델의 말 그대로 저장 — 모델이 제목을 바꿔 써도 그대로 남음',
        ],
        solution: [
          '**위키** — 각주가 가리키는 위치의 원문을 꺼내 글자까지 대조하는 검사를 추가',
          '**챗봇** — 모델이 신고한 출처를 버리고, 서버가 실제로 넘겨준 자료 목록으로 교체',
        ],
        result: [
          '문서 12건의 **각주 616개 전부** 위치가 확인되고, **613개**는 원문과 글자까지 일치',
          '챗봇은 지어낸 출처를 낼 수 없게 됨 — 다만 **안 본 자료를 봤다고 하는 것**은 못 막음',
          '기계로 검증되는 곳(위키 각주)과 모델의 말에 기대는 곳(챗봇 출처)을 나눠 문서에 남김',
        ],
        source: '요구사항정의서 FR-QNA-006·007 · docs/ai-handoff.md',
      },
      {
        title: '한국어가 조용히 깨지던 세 곳을 측정으로 특정',
        problem: [
          '기반 오픈소스가 영어를 전제로 만들어져, 한국어에서는 **오류 없이 조용히 틀린 답**을 냄',
          '예외가 안 나니 재보기 전에는 무엇이 깨졌는지조차 알 수 없었음',
        ],
        cause: [
          '**검색** — 띄어쓰기로 잘라 색인하니 "연차"로 검색해도 "연차를"이 안 걸림',
          '**토큰 계산** — 한국어를 1/4로 세어 긴 결과를 잘라내는 처리가 발동하지 않음',
          '**파일명** — 자모를 푸느냐 합치느냐로 다른 문자열이라 한글 파일 각주가 해석 안 됨',
        ],
        solution: [
          '고칠 방법을 고르기 전에, 한국어 위키 100장과 질의 40개로 **색인 방식 8가지를 실제로 재봄**',
          '**2글자씩 잘라 색인**하는 방식을 채택 — 3글자는 연차·이월·승인 같은 두 글자 핵심어를 통째로 놓침',
          '어절 단위로 묶으려던 원래 설계는 재보고 폐기 — 오히려 **0.60 → 0.57**로 나빠졌음',
          '토큰 계산은 실제 토큰 수를 쓰도록 고치고, 파일명은 한 방식으로 통일해 저장·조회',
        ],
        result: [
          '상위 5건 재현율 **0.33 → 0.60** — 0건이던 질의가 40개 중 **26 → 7개**',
          '질의를 두 집합으로 나눠 0.60 / 0.55 로 재확인하고, 회귀 테스트로 값을 고정',
        ],
        source: 'ai/experiments/INDEX.md · corpus-ko/README.md',
      },
    ],
    stack: ['Python', 'FastAPI', 'deepagents', 'MCP', 'Spring Boot', 'PostgreSQL', 'React', 'Jenkins', 'Docker', 'LangSmith'],
    imagePages: [
      {
        src: '/portfolio/ajt-architecture.png',
        vector: {
          src: '/portfolio/diagrams/ajt-architecture.html',
        },
        caption: '런타임 아키텍처',
        isArchitecture: true,
        note: '진한 테두리 = 본인 담당 · ①②③ = 핵심 성과 위치',
      },
      {
        src: '/portfolio/ajt-verification-path.png',
        vector: {
          src: '/portfolio/diagrams/ajt-verification-path.html',
        },
        caption: '근거 검증 경로 — 담당 범위',
        note: '진한 테두리 = 본인 담당 · 「각주 616개 중 613개 일치」가 나온 경로',
      },
    ],
  },
  {
    name: 'AI 기반 홈서버 장애 관제',
    subtitle: '메트릭·로그를 스스로 조회하는 관제 에이전트',
    period: '2025.11 ~ 운영 중',
    team: '개인 프로젝트 · 1인',
    role: '풀스택 · DevOps',
    repo: 'github.com/YonghoBae/monitoring-agent',
    summary:
      '1인 프로젝트로 전 구성 요소 직접 구축. 컨테이너 27종이 함께 도는 실제 운영 환경에서 동작.',
    oneLiner:
      '홈서버에 장애 알림이 뜨면 에이전트가 관측 데이터를 스스로 조회해 원인을 분석하고, 위험한 조치는 Discord 승인을 거쳐 실행하는 1차 대응 시스템',
    features: [
      {
        name: '자율 알람 분석',
        detail:
          '웹훅을 받으면 Prometheus 메트릭·Loki 로그·과거 사례(RAG)를 스스로 조회해 원인과 조치를 분석',
      },
      {
        name: 'ChatOps',
        detail:
          '분석 결과를 Discord로 보내고, 운영자의 추가 질문에 대화 맥락을 유지한 채 응답',
      },
      {
        name: '승인 워크플로',
        detail:
          '조치가 필요해도 직접 실행하지 않고 확인을 요청 · 허가된 명령 패턴만 실행',
      },
      {
        name: '과거 사례 학습',
        detail:
          '운영자가 남긴 해결 방법과 오탐 표시를 임베딩해 두고 유사 알람에서 먼저 참조',
      },
      {
        name: '품질 자동 채점',
        detail:
          '매 분석 후 별도 Judge LLM이 응답 품질을 4개 차원으로 채점해 적재',
      },
    ],
    purpose: [
      '알림 수신 → 접속 → 메트릭·로그 확인 → 과거 사례 기억 → 조치를 전부 수동으로 거쳐야 함',
      '문제는 둘 — 자고 있거나 자리를 비우면 알림을 놓치고, 단계마다 도구를 바꿔가며 작업해야 함',
    ],
    purposeSource: 'monitoring-agent `docs/01-프로젝트-개요.md` 「배경 및 문제 인식」',
    teamMakeup: [
      '2025.11 ~ 운영 중 · 1인 개인 프로젝트',
      '풀스택 · DevOps — 에이전트·평가 하네스·인프라 전 구성 요소 직접 구축',
      '실행 환경(온프레미스 홈서버) 자체도 본인이 구축·운영',
    ],
    contribution: [
      '**장애 분석 에이전트** — Spring AI ReAct(Gemini 2.5-flash) · 근거가 부족하면 다시 조사하는 Reflection 루프',
      '**알람 수신과 재검증** — Alertmanager 웹훅을 받아 알람 유효성을 다시 확인하는 파이프라인',
      '**관측 데이터 조회 도구** — Prometheus 메트릭·Loki 로그를 에이전트가 직접 조회',
      '**과거 사례 검색(RAG)** — PGVector에 적재, 임베딩은 Ollama all-minilm 로컬 실행',
      '**승인 워크플로** — Discord 봇(JDA) · 상태를 바꾸는 조치는 승인 후에만 실행',
      '**품질 자동 채점과 회귀 측정** — G-Eval 방식 Judge 모델 4차원 채점 · 시나리오 38종으로 프롬프트 A/B',
      '**운영 환경 구축** — 온프레미스 홈서버 컨테이너 27종, Nginx 리버스 프록시·HTTPS · Docker 멀티스테이지 + GitHub Actions',
    ],
    techChoices: [
      {
        name: 'Spring AI',
        why: '`@Tool` 어노테이션으로 등록하면 `ChatClient`가 호출·결과 반환 루프를 처리 — REST 직접 호출은 그 루프를 손으로 짜야 함 (LangChain4j는 Spring 통합이 별도 모듈)',
      },
      {
        name: 'ReAct 패턴',
        why: '장애 원인은 실시간 메트릭·로그에 있는데 단순 호출은 닿지 못함 — CoT는 추론만 개선되고 데이터 부재는 그대로',
      },
      {
        name: 'PGVector',
        why: '쓰던 PostgreSQL에 확장만 추가 — 해결 기록과 임베딩이 같은 트랜잭션에 들어감 (Pinecone·Chroma는 서비스가 하나 늚)',
      },
      {
        name: 'Gemini 2.5-flash',
        why: '알람마다 메트릭·로그를 컨텍스트에 실어 토큰 사용량이 빠르게 늚 — GPT-4o·Claude 대비 입력 단가가 낮아 개인 운영 부담이 없음',
      },
      {
        name: 'Java 21',
        why: 'Spring AI 1.1.0 일부 기능이 21에서만 동작 · Virtual Thread로 조회 대기 개선 — 올리는 비용이 설정 3줄이라 감수',
      },
    ],
    problems: [
      {
        title: '조사하지 않고 되묻던 에이전트를 자율 분석으로',
        problem: [
          '"서버 상태 어때?"에 **조사 대신 세 가지를 되물음** — 어떤 서버인지, 알람이 있는지, 더 알려달라고',
          '`verify_alert`·`query_prometheus`를 부르면 즉시 아는 것을 사람에게 묻고 있었음',
        ],
        cause: [
          'RLHF 정렬 편향 — 「불확실하면 질문하는」 응답이 높은 점수를 받도록 학습된 모델의 기본 성향',
          '기존 프롬프트의 「근거가 불충분하면 질문해서 보완해」가 그 편향을 오히려 강화',
          '역할 프레이밍 부재 — 누구로서 무엇을 하는지가 없으면 기본 대화 상대 모드로 동작',
        ],
        solution: [
          '"질문하지 마"를 붙이는 대신 OpenAI 가이드의 **Tool-Over-Ask**(묻기 전에 도구를)를 검토',
          "원인 셋에 각각 대응 — 역할을 '1차 대응자'로 정의, 묻기 전에 조회하도록 지시, 관측값 2~3개가 맞아떨어지면 결론을 내도록 종료 기준을 명시",
        ],
        result: [
          '같은 질문에 **되묻지 않고** `verify_alert`·`query_prometheus`를 먼저 호출한 뒤 답함',
          'CPU 12% · 메모리 58% · 디스크 43% 처럼 수집한 근거를 붙여 판정',
          '프롬프트 변경의 효과는 이후 감이 아니라 평가 하네스로 판본 간 비교 (다음 장)',
        ],
        source: 'docs/04-프롬프트-엔지니어링.md',
      },
      {
        title: '개선했다고 생각한 프롬프트의 회귀를 A/B로 적발',
        problem: [
          '분석 결과가 자연스러운 문장인지만으로는 품질을 판단할 수 없음',
          '프롬프트를 바꿔도 좋아졌는지 나빠졌는지 말할 근거가 없었음',
        ],
        cause: [
          '근거 사용 여부·도구 사용 적절성·실행 가능성·안전 범위 준수를 각각 볼 기준이 없었음',
          '재현 가능한 입력이 없어 같은 조건으로 다시 돌릴 수도 없었음',
        ],
        solution: [
          '응답 확신도(PPL)는 상용 API가 토큰 확률을 안 줘 기각 → G-Eval 4차원 자동 채점',
          '고정 장애 시나리오 **38종**에 정답 기준을 YAML로 정의 (`must_check`·`forbidden_actions`)',
          'Judge는 평가 대상보다 큰 별도 모델로 분리(temperature 0) — 자기 채점 편향 차단',
      '채점기를 직접 만든 이상 그 점수만으로는 순환논증이라, 판본을 가린 사람 채점 시트를 실행마다 같이 뽑게 해 둠 (표본 15건)',
          '프롬프트 두 판본을 3회씩 돌려 228회를 비교',
        ],
        result: [
          '개선안 통과율 **66% → 11%** 붕괴 — 도구 호출이 8.1 → 3.1회로 줄고 실행 가능성이 3.2로',
          '운영 프롬프트를 되돌리고 다시 써서 기준선 수준으로 회복 — 같은 실행에서 64%, 기준선 65%',
          '배포 전 회귀 측정을 상시 절차로 정착',
        ],
        source: 'docs/EVAL.md · docs/06-에이전트-성능-평가.md',
      },
    ],
    stack: ['Java 21', 'Spring Boot', 'Spring AI', 'PGVector', 'Prometheus', 'Loki', 'Grafana', 'Docker', 'GitHub Actions'],
    imagePages: [
      {
        src: '/portfolio/monitoring-architecture.png',
        vector: {
          src: '/portfolio/diagrams/monitoring-architecture.html',
        },
        caption: '전체 시스템 아키텍처',
        isArchitecture: true,
        note: '알림 → 자체 조회 → 판정 → 승인 → Discord 보고',
      },
      {
        src: '/portfolio/monitoring-agent-pipeline.png',
        vector: {
          src: '/portfolio/diagrams/monitoring-agent-pipeline.html',
        },
        caption: '장애 분석 파이프라인 상세',
        note: 'ReAct 루프가 도구를 골라 원인을 좁힌다',
      },
      {
        src: '/portfolio/homeserver-infrastructure.png',
        vector: {
          src: '/portfolio/diagrams/homeserver-infrastructure.html',
        },
        caption: '실행 환경: 온프레미스 홈서버 인프라',
        note: '컨테이너 27종 상시 가동 · 수집기 CPU 41.7% → 1~2%',
      },
    ],
  },
  {
    name: 'AgentHub',
    subtitle: 'GitHub 저장소 분석 에이전트',
    period: '2026.05 ~ 2026.07',
    team: 'SSAFY 팀 프로젝트 · 2인',
    role: '분석 에이전트 단독',
    repo: 'github.com/finalyongoh/agenttrace',
    summary:
      '분석·요약 에이전트 설계와 구현 전부, 산출물 문서 11종과 검토 하네스, 저장소 수집 배치·분석 연동 담당.',
    oneLiner:
      '개인 개발자가 빠르게 변하는 AI Agent 생태계를 따라갈 수 있도록, GitHub 오픈소스를 수집·분석하고 AI 분석 결과와 커뮤니티 신호를 함께 주는 기술 탐색 서비스',
    features: [
      {
        name: '저장소 수집',
        detail:
          'Agent·MCP·Skill·Eval 관련 GitHub 저장소를 지속적으로 모으고 주간 스타 증가폭 등으로 정렬',
      },
      {
        name: '근거 분석',
        detail:
          'README의 주장과 실제 구현 근거를 구분해 8개 영역으로 분석하고, 주장마다 파일 경로와 행 범위를 붙임',
      },
      {
        name: '팔로우업 가이드',
        detail:
          '어디부터 봐야 하는지 안내 · Agent Engineering 관점의 유형·구현 신호·위험 신호를 요약',
      },
      {
        name: '커뮤니티 신호',
        detail:
          '북마크·읽음·댓글·사용 후기를 AI 분석 결과와 분리해 제공 · 근거 보완 제안과 오류 제보도 접수',
      },
    ],
    purpose: [
      '기존 Trending·star 탐색은 인기만 보여줄 뿐 Agent 관점에서 왜 중요한지를 설명하지 않음',
      'README의 주장과 실제 구현 근거를 구분하지 않고, MCP·Skill·Tool-use·Eval·Risk 같은 분석 축도 없음',
      '→ 인기 순위가 아니라 «무엇부터 팔로우업할지»를 근거와 함께 알려주는 것이 목표',
    ],
    purposeSource: 'AgentHub 시스템정의서 「2. 배경과 문제 정의」',
    teamMakeup: [
      '2026.05 ~ 07 (약 6주, 아이디어 선정 후 구현 5주) · SSAFY 1학기 최종 프로젝트',
      '2인 팀 · 분석 에이전트(AgentTrace)는 본인 단독',
      '산출물 문서 11종과 검토 하네스, 저장소 수집 배치·분석 연동도 본인',
    ],
    contribution: [
      '**저장소 분석 파이프라인** — LangGraph 10단계 · 단계마다 중단 분기와 상태를 그래프 정의에 둠',
      '**코드 구조 색인** — tree-sitter로 함수·클래스를 뽑고 Personalized PageRank로 중요도 (NetworkX 없이 직접)',
      '**근거 검증 계층** — 파일 경로·행 범위·원문 해시를 대조해 주장마다 근거를 붙임',
      '**작업 큐와 캐시** — 브로커 없이 PostgreSQL `FOR UPDATE SKIP LOCKED` · 분석 결과 캐시와 동일 요청 중복 제어',
      '**수집 배치와 연동** — Spring Batch 저장소 수집(외부 서비스·GitHub API 이중 경로) · 비동기 분석 트리거와 콜백 수신',
      '**산출물 문서 11종과 검토 하네스** — 판정은 JSON 스키마 5종, 기준은 판본 붙은 정책 파일',
      '**전체 아키텍처 설계와 팀 기술 의사결정 주도**',
    ],
    techChoices: [
      {
        name: 'LangGraph',
        why: '분석이 여러 단계로 나뉘고 단계마다 LLM 호출이 끼어 중간 실패가 잦음 — 함수로 이으면 상태와 중단 처리를 단계마다 넣어야 해 그래프 정의에 맡김',
      },
      {
        name: 'tree-sitter + PageRank',
        why: '파일 300개를 그냥 잘라 넣으면 중요한 정의가 잘림 — tree-sitter로 함수·클래스를 뽑고 Personalized PageRank로 중요도를 매겨 추림 (Aider 조사 후 채택)',
      },
      {
        name: 'PostgreSQL 단독',
        why: '2인 5주에 Redis·RabbitMQ를 얹으면 운영할 컴포넌트가 늘어남 — 큐에 필요한 건 «중복 없이 하나씩»뿐이라 `SKIP LOCKED`로 충분',
      },
      {
        name: 'Spring Boot',
        why: '인증·조회·배치까지 분석과 같은 파이썬에 두면 에이전트와 데이터 경계가 흐려짐 — 자바로 갈라 재시작·청크 커밋이 든 Spring Batch를 그대로 씀',
      },
    ],
    problems: [
      {
        title: '모든 결과가 대체 문구였던 파이프라인을 실제로 동작하게',
        problem: [
          '저장소 2곳으로 돌린 결과가 **완료로 끝나는데** 8개 영역 문구와 보고서 11개 섹션이 전부 같음',
          '근거 식별자가 모두 `fallback-ref-*` — **모델이 한 번도 호출되지 않았음**',
        ],
        cause: [
          '저장소 구조를 넘겨야 할 자리를 **어느 단계도 채우지 않음** — 분석이 빈 지도로 시작',
          '에이전트가 파일을 하나씩 열어보며 찾아다니다 **128K 한도를 넘겨** 호출이 실패',
          '그나마 실린 파일도 `package.json` 같은 설정뿐 — **소스는 한 건도 안 실림**',
        ],
        solution: [
          '구조를 넘기는 자리를 채우고, 설정 파일은 최대 3건까지만 싣도록 소스와 분리',
          '**찾아다니는 방식을 걷어냄** — 중요도 순으로 고른 파일을 미리 실어 한 번에 호출',
          '도구 결과 상한 축소(파일 읽기 20,000 → 8,000자), 호출량 초과 시 20·40·60초 재시도',
          '대체 경로는 남기되 확인됨 상태를 가질 수 없게 테스트로 고정',
        ],
        result: [
          '저장소 2곳 모두 확인된 영역 **0/8 → 5/8 · 8/8**',
          '전부 자리표시자였던 근거 참조 12건이 실제 참조 **16건 · 17건**으로',
          '보고서 본문 약 1,500자 → **7,532자 · 6,086자**',
          '실행 시간 170초 → 75초 · 165초 — 빨랐던 게 아니라 아무 일도 안 하고 있었음',
        ],
        source: 'agenttrace/docs/analysis_pipeline_improvements.md',
      },
      {
        title: '2인 5주를 감당하려고 문서 검토를 도구로 돌림',
        problem: [
          '2인이 **5주**에 끝내야 하는데 산출물 문서가 **11종**',
          '문서와 코드가 어긋난 채로 개발하면 되돌리는 비용이 더 큼',
        ],
        cause: [
          '사람이 매번 읽어 검토하면 **볼 때마다 지적이 달라지고** 무엇을 봤는지도 안 남음',
          '기준 없이 «잘 썼나»를 묻는 검토는 재현되지 않음',
        ],
        solution: [
          '검토 → 수정안 → 재검 → 사람 결정을 JSON 스키마 5종으로 규정',
          '평가 기준을 코드에서 떼어내 판본 붙은 정책 파일로 분리 — 최종 11판',
          '실행마다 기준·프롬프트 판본의 SHA-256을 manifest에 기록해 같은 판정을 다시 만들 수 있게',
          '설계 문서의 영역·섹션 수를 코드 상수와 대조하는 테스트 — **문서만 고치면 깨짐**',
        ],
        result: [
          '**실행 15회**의 입력·기준·지적·사람 결정이 전부 남아 판정 근거를 되짚을 수 있음',
          '기준을 11판까지 고치며 같은 문서를 재검토 — 판정이 흔들리면 **기준이 바뀐 것**',
        ],
        source: '_run/docs/harness/ (runs · policies · schemas)',
      },
    ],
    stack: ['Python', 'LangGraph', 'LangChain', 'FastAPI', 'tree-sitter', 'BM25', 'PostgreSQL', 'Java 21', 'Spring Boot', 'Spring Batch', 'JPA'],
    imagePages: [
      {
        src: '/portfolio/agenthub-analysis-pipeline.png',
        vector: {
          src: '/portfolio/diagrams/agenthub-analysis-pipeline.html',
        },
        caption: '저장소 분석 파이프라인 (1/2)',
        note: '진한 테두리 = 본인 담당 · 초록 = 정상 통과 · 붉은색 = 중단 · 점선 = 대체 경로',
        isArchitecture: true,
      },
      {
        src: '/portfolio/agenthub-evidence-verification.png',
        vector: {
          src: '/portfolio/diagrams/agenthub-evidence-verification.html',
        },
        caption: '근거 판정 경로 (2/2)',
        note: '모델은 위치만 말하고 판정은 코드가 합니다 — 확인됨 / 부분 확인 / 미확인 / 차단',
        isArchitecture: true,
      },
    ],
  },
  {
    name: 'Leafy',
    subtitle: 'AI 정서 케어 · AR 멀티플레이',
    period: '2025.03 ~ 2025.11',
    team: '3인',
    role: '팀장',
    repo: 'github.com/InnerEcho/API',
    summary:
      '팀장으로 백엔드·AI 파이프라인·AR/실시간 클라이언트를 담당하고 배포 자동화를 구축.',
    oneLiner:
      '1인 가구가 AR 반려식물과 대화하며 감정을 나누고, AI가 그 기록을 정리해 돌려주는 정서 교감 앱',
    features: [
      {
        name: 'AR 반려식물',
        detail:
          '평면과 앵커에 화분을 배치하고 터치·제스처·음성으로 상호작용 · 표정이 실시간 변화',
      },
      {
        name: '감정 분석과 원인 추론',
        detail:
          '감정 분류·강도에 더해 대화 맥락·과거 로그·행동 데이터로 «왜 그런 감정인지»를 근거와 함께 제시',
      },
      {
        name: '개인화 미션',
        detail:
          '온보딩 설문·대화 로그·행동 패턴으로 미션을 생성하고 완료율에 따라 난이도와 빈도를 조절',
      },
      {
        name: '성장 일지 자동 기록',
        detail:
          '물주기·대화·미션·AR 상호작용을 타임스탬프와 함께 기록해 일별 타임라인으로 보여줌',
      },
      {
        name: '커뮤니티',
        detail:
          '식물 사진·감정 일지·미션 성과를 공유하고, 친구를 AR 공간에 초대해 공동 미션을 수행',
      },
    ],
    purpose: [
      '1인 가구의 우울증 문제를 다루기 위한 HCI 프로젝트 — 정서적 상호작용이 긍정적 경험을 만드는 과정을 연구하고 구현',
      '단순 챗봇을 넘어 AR 반려식물·미션 구조·식물 캐릭터를 결합',
      '→ 사용자가 자신의 감정을 외부로 투사(Externalization)하고 상호작용에 몰입할 수 있는 환경',
    ],
    purposeSource: 'Leafy API readme 「Project Overview (HCI Perspective)」',
    teamMakeup: [
      '2025.03 ~ 11 · 충북대 산학프로젝트 3인 (InnerEcho), 지도교수 면담 4회',
      '본인(팀장) — 회의 총괄과 일정 조율, API 개발·테스팅, AR/3D',
      '팀원 — UI 디자인과 AI 기능 / 문서 작성과 DB 설계·데이터 처리',
    ],
    contribution: [
      '**멀티 에이전트 대화 파이프라인** — LangChain.js · 응답 생성과 안전 검토(SafetyModerator)를 역할로 분리',
      '**하이브리드 기억 계층** — Redis에 최근 200개 원문, 그 이전은 Upstash Vector 의미 검색 상위 20건',
      '**AR 멀티플레이 통신 서버** — Socket.IO WebSocket · 입장 시 상태 동기화와 Heartbeat',
      '**AR·실시간 클라이언트** — React Native + ViroReact 반려식물 화면 · OpenAI Realtime API(WebRTC) 음성',
      '**배포 자동화** — Docker + GitHub Actions · Swagger API 명세와 팀 문서 저장소 운영',
      '**팀장** — 3인 팀, 주 1회 정기 회의로 진행 상황과 방향성 조율',
    ],
    techChoices: [
      {
        name: 'Redis + Upstash Vector',
        why: 'Redis만 쓰면 오래된 대화를 버려야 하고 벡터 DB만 쓰면 방금 한 말도 검색에 맡기게 됨 — 최근 대화는 Redis에서 순서대로, 그 이전은 벡터 검색으로 나눔',
      },
      {
        name: 'LangChain.js',
        why: '모델 호출·프롬프트 템플릿·체인 조합을 직접 만들면 용도별 체인을 늘릴 때마다 같은 배선을 반복해야 함 — 체인 추상화를 가져다 쓰고 뒤에 안전 검토 체인을 덧붙일 여지를 둠',
      },
    ],
    problems: [
      {
        title: '대화가 길어져도 토큰이 선형으로만 늘게 함',
        problem: [
          '정서 케어 대화는 길수록 맥락이 중요한데, 다 실으면 누적 토큰이 **제곱으로** 늘어남',
          '오래된 대화를 그냥 버리면 의미적으로 필요한 내용이 유실됨',
        ],
        cause: [
          '토큰 비용 상한과 검색 유실 방지는 한 가지 저장소만으로는 동시에 만족할 수 없음',
        ],
        solution: [
          '최근 대화 **200개**는 Redis에 원문 그대로 두고 항상 실음',
          '그 이전은 질문과 의미가 가까운 **상위 20건만** 벡터 검색으로 꺼내 실음',
        ],
        result: [
          '턴당 들어가는 양이 상수로 고정돼 누적 토큰 복잡도가 **O(N²) → O(N)**',
          '한계 — 절감률을 수치로 재두지 않음. 구조상 이득은 코드로 확인되지만 실측 기록이 없음',
        ],
        source: 'API/readme.md 「Memory Hierarchy」',
      },
      {
        title: '생성과 검토를 나눠 정서적으로 위험한 답을 차단',
        problem: [
          '위로가 필요한 사용자에게 정서적으로 위험한 답이 **한 번이라도 나가면 안 됨**',
          '공감·조언·안전 판단을 한 프롬프트에 다 얹으니 무엇 때문에 답이 이상해졌는지 짚을 수 없었음',
        ],
        cause: [
          '만들기와 거르기를 한 호출에서 하면 위험 판정이 나도 **어느 문장이 문제인지 안 남음**',
        ],
        solution: [
          '답을 만드는 에이전트와 검토하는 에이전트를 **역할로 분리** — 생성 · 판정 · 수정 3단계',
          '위험 판정이 나도 전체를 다시 만들지 않고 **지적된 문장만** 고침',
        ],
        result: [
          '위험한 답이 사용자에게 가기 전에 걸러지고, 무엇이 왜 걸렸는지가 판정으로 남음',
          '검토 단계를 넣고도 응답 왕복은 한 번만 늘어남',
          '실시간성을 일부 내주고 안전성을 택한 구조 — 다만 **분리 전후를 수치로 재둔 기록은 없음**',
        ],
        source: 'API/readme.md 「Technical Deep Dive」 3',
      },
    ],
    stack: ['Node.js', 'TypeScript', 'LangChain.js', 'MySQL', 'Redis', 'Upstash Vector', 'Socket.IO', 'React Native', 'ViroReact', 'Docker', 'Nginx', 'GitHub Actions'],
    imagePages: [
      {
        src: '/portfolio/leafy-architecture.png',
        vector: {
          src: '/portfolio/diagrams/leafy-architecture.html',
        },
        caption: '전체 시스템 아키텍처',
        isArchitecture: true,
        note: 'AR 클라이언트 · 실시간 동기화 · AI 파이프라인',
      },
      {
        src: '/portfolio/leafy-ai-pipeline.png',
        vector: {
          src: '/portfolio/diagrams/leafy-ai-pipeline.html',
        },
        caption: 'AI 대화 파이프라인 상세',
        note: '하이브리드 메모리 + 생성·검토 분리 Reflection',
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// p6 — 스킬 / 학력 / 자격
// ----------------------------------------------------------------------------
// 노션 Skiis DB의 Level은 ★★★★☆ · ★★★☆☆ 두 단계만 실제로 쓰이고 있어
// 범례도 그 두 단계만 표기합니다.
/**
 * 등급의 뜻. 페이지 맨 위 범례에만 두면 행을 읽을 때 왜 그 점수인지 알 수 없으므로,
 * `short`를 각 기술 행에 함께 인쇄하고 근거 문장이 그 등급의 증거가 되게 씁니다.
 */
export const SKILL_LEVELS: Record<number, { short: string; text: string }> = {
  5: { short: '설계 주도', text: '설계와 트러블슈팅을 주도해봄' },
  4: { short: '구현·문제 해결', text: '직접 구현하고 문제 원인까지 찾아 고쳐봄' },
  3: { short: '프로젝트 적용', text: '프로젝트에 적용해봄' },
};

/** note = 노션 Skiis DB의 Details를 한 줄로 압축한 근거. */
export type Skill = { name: string; level: number; note: string };

export const SKILL_GROUPS: { category: string; skills: Skill[] }[] = [
  {
    category: 'Backend',
    skills: [
      {
        name: 'Spring Boot',
        level: 4,
        note: '팩토리 패턴으로 도구 인스턴스 분리 — 다중 알람 동시 분석 시 싱글톤 Bean 충돌 제거',
      },
      {
        name: 'Python · FastAPI',
        level: 4,
        note: 'AgentTrace·LLM Wiki AI 서버의 런타임과 도구 계층 · 근거를 원문과 대조하는 검증 계층',
      },
      {
        name: 'Java',
        level: 4,
        note: '관제·AJT·AgentHub 백엔드 전부 Java·Spring · 원시값을 객체로 포장해 생성 시점에 검증',
      },
      {
        name: 'Node.js · TypeScript',
        level: 3,
        note: 'Leafy API — 독립 I/O를 Promise.all로 병렬화, 대화 분석·저장은 Fire-and-Forget',
      },
      {
        name: 'Socket.IO · WebSocket',
        level: 3,
        note: '간헐 단절을 프로토콜·인프라·앱 3계층으로 분해 · 30초 Heartbeat + 입장 시 상태 snapshot',
      },
      {
        name: 'pytest · JUnit5 · Vitest',
        level: 3,
        note: '설계 문서를 파싱해 코드 상수와 대조하는 테스트 · 관제 핵심 로직 단위 테스트 15종',
      },
    ],
  },
  {
    category: 'AI / Agent',
    skills: [
      {
        name: 'Spring AI',
        level: 4,
        note: '관제의 ReAct 루프·오케스트레이터 직접 구현 · 에이전트와 채점 모델을 설정으로 분리',
      },
      {
        name: 'LangGraph · LangChain',
        level: 4,
        note: 'AgentTrace 10단계 파이프라인은 LangGraph, Leafy 멀티 에이전트는 LangChain.js',
      },
      {
        name: 'ReAct · Tool Calling',
        level: 4,
        note: '도구 자유도를 언제 줄일지 — 관제는 회귀로 롤백, AgentTrace는 단일 호출로 되돌림',
      },
      {
        name: 'MCP · deepagents',
        level: 3,
        note: '오픈소스의 개인 vault 권한 모델을 사내 부서 권한 모델로 교체 + Spring 연동 계층 신규',
      },
      {
        name: 'LLM 평가',
        level: 3,
        note: 'G-Eval 4차원 자동 채점 하네스 설계 · 시나리오 38종 228회 A/B 로 11% 회귀를 배포 전에 적발',
      },
    ],
  },
  {
    category: 'Data / Search',
    skills: [
      {
        name: 'PostgreSQL · pgvector',
        level: 3,
        note: '브로커 없이 Postgres 단독 작업 큐(SKIP LOCKED) · 관제 RAG의 벡터 검색 저장소',
      },
      {
        name: 'Redis',
        level: 3,
        note: '최근 200개는 Redis, 그 이전은 벡터 상위 20건 — 누적 토큰 O(N²) → O(N)',
      },
      {
        name: 'BM25 · n-gram 색인',
        level: 3,
        note: '공백 분리 색인을 2글자 n-gram으로 교체 — 상위 5건 재현율 0.33 → 0.60',
      },
      {
        name: 'tree-sitter',
        level: 3,
        note: '4개 언어 AST 파싱 + Personalized PageRank로 구조 지도 · 그래프 라이브러리 없이 직접',
      },
      {
        name: '문서 파싱 · OCR',
        level: 3,
        note: 'PDF·DOCX·CSV·XLSX 단일 진입점 · 스캔 문서는 비전 OCR 분기, 무료 티어로 전환',
      },
    ],
  },
  {
    category: 'Infra / Observability',
    skills: [
      {
        name: 'Docker',
        level: 4,
        note: 'BuildKit 캐시로 재빌드 83초 → 1.2초 · Alpine 런타임으로 이미지 728MB → 323MB',
      },
      {
        name: 'Prometheus · Loki · Grafana',
        level: 3,
        note: '컨테이너 27종 관제 · 수집 주기 조정과 미사용 메트릭 7종 비활성화로 CPU 41.7% → 1~2%',
      },
      {
        name: 'GitHub Actions · Jenkins',
        level: 3,
        note: '홈서버 배포 자동화 · Leafy 파이프라인 실행 34건 중앙값 1.5분',
      },
      {
        name: 'Nginx',
        level: 3,
        note: '리버스 프록시로 서브도메인 라우팅·HTTPS · Upgrade 헤더 누락과 유휴 타임아웃 해결',
      },
    ],
  },
];

/** 범례에 인쇄할 등급 — 실제로 쓰인 것만, 높은 쪽부터. */
export const SKILL_LEVEL_LEGEND = [
  ...new Set(SKILL_GROUPS.flatMap((g) => g.skills.map((s) => s.level))),
].sort((a, b) => b - a);

export const SKILLS_FOOTNOTE =
  '필요한 만큼 구현해본 것: React(위키 참조 그래프 뷰어 단독) · React Native · ViroReact · WebRTC · STT · TTS · MySQL';

/**
 * 코딩 에이전트 운용 방식. 전부 본인 저장소의 실제 규칙 파일에서 가져온 것이고,
 * 파일 경로를 근거로 함께 적습니다 — 여기에 검증할 수 없는 문구를 넣지 않습니다.
 */
export const AI_PRACTICE: {
  title: string;
  /**
   * 무엇을 했고 왜 필요한지, 처음 보는 사람 기준으로 두 문장. 아래 항목은
   * 한 줄에 한 가지만 적습니다 — 한 줄에 사실이 두 개 들어가면 안 읽힙니다.
   */
  why: string;
  points: string[];
}[] = [
  {
    title: '하네스 엔지니어링',
    why: 'AI에게 문서 검토를 맡기고, 그 과정을 사람이 다시 볼 수 있게 도구를 만들었습니다. 그냥 맡기면 볼 때마다 지적이 달라집니다.',
    points: [
      '넣은 문서와 채점 기준, AI의 지적, 사람의 결정을 함께 저장',
      '같은 문서를 같은 기준으로 다시 돌려 결과가 달라졌는지 확인',
      'AI가 바로 고쳐도 되는 것과 사람 승인이 필요한 것을 분리',
      '코드 2,000줄 · 테스트 3,300줄 · 실제 실행 기록 15건',
    ],
  },
  {
    title: '컨텍스트창 관리',
    why: '모델에게 무엇을 볼지 정해서 넘깁니다. 코드를 다 넣으면 정작 필요한 내용이 밀려 나갑니다.',
    points: [
      '파일을 통째로 넣지 않고 검색해서 필요한 부분만 적재',
      '고칠 때도 파일 전체를 다시 쓰지 않고 바뀌는 곳만 교체',
      '같은 내용을 여러 문서에 적지 않고 한 곳에만 유지',
    ],
  },
  {
    title: '에이전트 지침',
    why: '저장소마다 AI가 지켜야 할 규칙을 문서로 적어 둡니다. 그냥 맡기면 시키지 않은 파일까지 고쳐 놓습니다.',
    points: [
      '내가 맡은 폴더 밖은 무엇을 어떻게 바꿀지 먼저 보고하게 함',
      '여러 사람이 함께 쓰는 DB 컬럼·API 필드는 사람이 확인',
      '한 번에 시키는 일은 함수 하나 정도 크기로 분할',
    ],
  },
  {
    title: '스킬 · 플러그인',
    why: '자주 하는 작업은 순서째로 묶어 둡니다. 매번 말로 설명하면 순서가 조금씩 달라집니다.',
    points: [
      '위 검토 도구를 쓰는 순서를 묶어 늘 같은 순서로 실행',
      '손글씨 노트 사진을 데이터와 웹페이지로 바꾸는 작업도 묶음',
    ],
  },
];

export const EDUCATION = {
  school: '충북대학교 소프트웨어학과',
  note: '2026.02 졸업',
  extra: [
    {
      title: 'SSAFY (삼성 청년 SW 아카데미) — Java 트랙',
      detail: '1학기 수료 (2026.01.07 ~ 06.26) · 2학기 진행 중',
    },
    {
      // 근로계약이 아니라 교육부 고시 기반 현장실습이라 경력이 아니라 이 자리에 둡니다
      // (협약서 제2조 9항: 별도의 근로계약서를 체결하지 않는다).
      // 「QA」·「요구분석 담당」으로 쓰지 않습니다 — 실제로 한 것은 사용자 관점의 결함 목록화입니다.
      title: '㈜케이아이에스 자율 현장실습학기제 (충북대)',
      detail:
        '2024.06.24 ~ 07.19 · 4주 80시간 · 프로토타입의 결함·미비점을 요구사항 정의서 형식으로 정리, 교육용 콘텐츠 제작과 문서화',
    },
    {
      title: '충북대 SW중심대학사업단 SW개발자과정 몰입교육 수료',
      detail:
        'Full Stack AI 과정 (2024.07.22 ~ 08.26) · 5주간 1일 8시간 대면 · Node·Express·Next.js·LangChain·RAG',
    },
  ],
};

export const CERTIFICATIONS = [
  { name: '정보처리기사', issuer: '한국산업인력공단', date: '2025.09' },
  { name: 'SQLD', issuer: '한국데이터산업진흥원', date: '2025.06' },
];
