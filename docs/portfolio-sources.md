# 포트폴리오 덱 — 출처 색인

`/portfolio-pdf`에 적힌 문장은 전부 어딘가에 근거가 있습니다. **여기를 먼저 보고,
그래도 없으면 그때 "자료가 없다"고 말합니다.** 근거를 찾기 전에 사용자에게 어디 있느냐고
묻지 않습니다 — 실제로 그러다 한 번 문장을 지어냈고, 같은 질문을 반복해서 되물었습니다.

## 프로젝트별 1차 출처

### AJT — 사내 LLM Wiki (`~/workspace/AJT/ajt-llm-wiki`)

| 무엇 | 어디 |
| --- | --- |
| 프로젝트 목적·범위 | `docs/requirements/요구사항정의서.md` 「1. 문서 목적」·「2. 프로젝트 개요」 |
| 요구사항 ID(FR-·DR-·NFR-)와 개정 이력 | 같은 파일 상단의 «변경 요약» 목록 |
| DB 타입 규칙·JSON 컬럼 | `docs/db/erd.sql`, 요구사항정의서 DR-022 |
| **한국어 검색 수치의 정본** | `ai/experiments/INDEX.md` 「한국어 검색 — 색인·질의 방식」 |
| 코퍼스의 성격과 한계 | `ai/experiments/corpus-ko/README.md` |
| 실험 회차별 기록 | `ai/experiments/<날짜-이름>/` |
| E2E 안정성·비용 조사 | `ai/docs/findings/` — **두 문서를 같이 읽어야 합니다** |
| 설계 판단과 뒤집은 근거 | `docs/superpowers/specs/`, `docs/ai-handoff.md` 「왜」 표 |
| 배포·인프라 | `docs/infra/deployment-runbook.md`, `docs/superpowers/plans/2026-07-31-docker-jenkins-deploy.md` |
| 컨벤션 | `docs/conventions/` |

기술 스택 **선택 근거 문서는 없습니다.** 스택 이유는 사용자 구술 + `erd.sql` 주석 +
`specs/2026-07-30-wiki-space-relations-design.md`의 `JSON_TABLE` 기각에서 나옵니다.

> `erd.sql` 208행 주석의 «공백 0.38 · 3글자 0.50»은 정본(`INDEX.md`)과 어긋납니다.
> 정본은 공백 AND 0.33 / 공백 OR 0.38 / 3글자 OR 0.35 / 2글자 OR 0.60입니다.

### AgentHub (`~/workspace/AgentHub`)

| 무엇 | 어디 |
| --- | --- |
| **해결하려는 문제·목표·대상 사용자** | `agenthub-backend/docs/시스템정의서.md` 「2. 배경과 문제 정의」 |
| 요구사항·유즈케이스·설계 | `agenthub-backend/docs/` 나머지 3종 |
| tree-sitter + PageRank 채택 근거 | `agenttrace/docs/algorithm.md` (Aider Repository Map 조사 보고서) |
| 근거 판정 정책 | `agenttrace/docs/analysis_evidence_policy.md` |
| 실행 기록 계약 | `agenttrace/docs/analysis_run_artifact_contract.md` |
| 파이프라인 개선·병목 | `agenttrace/docs/analysis_pipeline_improvements.md` |
| 트러블슈팅 | `agenttrace/docs/troubleshooting_learnings.md` |
| 에이전트 운용 규칙 | `agenttrace/AGENTS.md` |
| 문서 검토 하네스와 실행 기록 | `_run/docs/harness/`, `_run/docs/artifacts/` |

### AI 기반 홈서버 장애 관제 (`~/workspace/monitoring/monitoring-agent`)

| 무엇 | 어디 |
| --- | --- |
| **배경 및 문제 인식** | `docs/01-프로젝트-개요.md` |
| **기술 스택 선택 근거 (대안 비교 포함)** | `docs/02-기술-스택-선택-근거.md` — 네 프로젝트 중 유일하게 완비 |
| 파이프라인 | `docs/03-에이전트-파이프라인.md` |
| 프롬프트 | `docs/04-프롬프트-엔지니어링.md` |
| 트러블슈팅 | `docs/05-트러블슈팅.md` |
| 평가 하네스·A/B·Judge 검증 | `docs/06-에이전트-성능-평가.md` |

### Leafy (`~/workspace/Leafy`)

문서가 **HWP**라 그냥은 안 읽힙니다. `scripts/hwp2txt.py`로 뽑습니다:

```bash
python3 scripts/hwp2txt.py ~/workspace/Leafy/Specification/*.hwp
```

| 무엇 | 어디 |
| --- | --- |
| **팀 3인의 역할과 책임** | `Specification/1-12프로젝트관리계획서(2.0).hwp` 「3.2 역할 및 책임」·「3.3 팀원별 목표」 |
| 팀 구성·지도교수·문서 이력 | `Specification/1-12시스템정의서(2.0).hwp` |
| 프로젝트 정의·지도교수 면담 4회 | `Specification/1-12프로젝트결과보고서(2.0).hwp` |
| 기능·비기능 요구사항 | `Specification/1-12요구사항정의서(2.0).hwp` |
| 시험 결과 | `Specification/1-12소프트웨어시험결과서(2.0).hwp` |
| 초기 기획 (2024-10-29 1차 회의) | `Document/1차 회의(24-10-29)/*.hwp` |
| HCI 관점 개요·메모리 계층·역할 분리 | `API/readme.md` |
| AI 실험 결과 | `AI/FINAL_RESULTS.md`, `AI/DETAILED_METRICS.md`, `AI/ENSEMBLE_RESULTS_AND_NEXT_STEPS.md` |

### 노션

| 무엇 | 어디 |
| --- | --- |
| 덱 본문의 1차 출처 | 「포트폴리오」 (page `3793bf6b7ea981c798d0d5b193cc87ac`) |
| 도판·화면 캡처, Skiis DB | 「디자이너 포트폴리오 : Designer Portfolio」 |

노션이 **오래된** 것으로 확인된 값: 자격증 날짜, tree-sitter 언어 수, Java 등급.

**노션 안에서도 판본이 갈립니다.** 같은 프로젝트 글이 네 곳에 있고 내용이 서로 다릅니다:
`[구버전] 포트폴리오 모음` → `개발자를 위한 포트폴리오` → `포트폴리오` →
**`디자이너 포트폴리오 : Designer Portfolio` (최신)**. Leafy 수치를 이 순서로
추적하니, 최신 페이지에서는 본인이 이미 `[Limit] 절감률을 수치로 재두지 않았다` 로
바꿔 둔 것을 옛 페이지에서 도로 가져온 상태였습니다. **최신 페이지를 기준으로 삼고,
`[Limit]` 항목은 덱에도 한계로 옮깁니다.**
노션이 **맞는** 것으로 확인된 값: 컨테이너 27종, cAdvisor CPU 41.7% → 1~2%.

### 도판

Obsidian vault의 `portfolio-diagrams`가 정본이고, `public/portfolio/diagrams/*.html`과
`public/portfolio/*.png`가 사본입니다. 노션의 홈서버 CI/CD 도판(p14)만 vault에 원본이
없습니다.

## 아직 어디에도 없는 것

- AJT·Leafy의 기술 스택 **선택 근거 문서**
- AgentHub·관제·Leafy의 기여도 수치 (AJT만 MR 85/79·리뷰 80건이 있음)
- 홈서버 CI/CD 도판 원본
- 관제의 **「자율 도구 호출 0회 → 평균 3회」** — 한때 덱에 있었으나 근거가 없습니다.
  `docs/04-프롬프트-엔지니어링.md` 에는 개선 전후 대화 전문만 있고,
  `docs/blog/06-에이전트-시뮬레이션-결과.md` 는 5종 전부 **도구 호출 4회**,
  서버 eval(`build/eval/run-20260813-170409`)은 v1 평균 **8.1회** 입니다.
  셋 다 그 수치를 뒷받침하지 않으므로 **다시 넣지 마세요.** 프롬프트 개선의 효과는
  대화 전문(도구를 부르지 않고 되묻던 것 → `verify_alert`·`query_prometheus` 선호출)으로만
  말할 수 있고, 정량 비교는 A/B 하네스 쪽 수치를 씁니다.

- 관제의 **「사람 채점 15건 방향 0.84 일치 · 채점기 평균 +1.8점 후함」** — 한때 덱에 있었으나
  근거가 없습니다. `docs/EVAL.md` 가 표본 15건·blind 시트·「N건 중 M건 방향 일치」 형식까지
  정해 뒀고 시트도 실행 11회분 전부 생성돼 있지만, **채점이 한 건도 채워져 있지 않습니다**
  (홈서버 `build/eval/run-*/human-grading.md` 전부 채점행 0, `human-grading-key.csv` 는
  정답 키만). `0.84` 는 `eval-dataset-v2.yml` 의 테스트 픽스처 값이고 `+1.83` 은
  `run-20260813-161810` 한 시나리오의 v1/v2 차이입니다 — 둘 다 사람 채점과 무관합니다.
  **설계는 했지만 실행하지 않은 것을 실행한 것처럼 쓰지 마세요.** 지금은 「판본을 가린 사람
  채점 시트를 실행마다 같이 뽑게 해 둠」까지만 적습니다. 실제로 채점하면 그때 EVAL.md 가
  지정한 「N건 중 M건 방향 일치」 형식으로 넣습니다.

## findings 문서를 읽는 법 (한 번 틀렸던 곳)

`ai/docs/findings/2026-08-02-wiki-e2e-stability-test.md` 는 시점 기록이고, **결론이 그
문서 안에서 여러 번 뒤집힙니다.** 앞부분만 읽으면 정반대로 읽힙니다.

- §2-1 인용문 검사를 `error` → `warn` 으로 내림 → **부족했음**
- §2-2 「error 없으면 끝」 종료 신호 추가 → **그래도 실패**
- §2-3 **진짜 근본 원인** — 원본 문서의 곧은/굽은 따옴표 혼용과 마크다운 강조
- 213행과 256행에 **나중에 추가된** `[해소됨 — 2026-08-03]` 표시, 그리고 후속 문서
  `2026-08-03-live-stack-verification.md` §1 에 job 23 의 실제 수치

「재측정은 아직 안 함」이라는 줄이 문서 중간에 여러 번 나오는데, 전부 그 시점의 말이고
뒤에서 해소됩니다. **끝까지 읽고 후속 문서까지 본 뒤에 판단합니다.**

## 관제 — 저장소가 여러 곳에 있습니다

`~/workspace/monitoring/monitoring-agent` 로컬 클론이 **10커밋 이상 뒤처져 있던 적**이
있습니다. 그 상태로 대조해 「저장소에 없는 수치」라고 두 번 단정했는데, GitHub 에는 전부
있었습니다 (`docs/EVAL.md`, `eval-dataset-v2.yml`, Judge 분리 커밋, 프롬프트 롤백 커밋).

- **대조 전에 `git fetch` 하고 `HEAD..origin/main` 을 먼저 본다.**
- A/B 실행 결과는 저장소가 아니라 **홈서버에만** 있습니다:
  `wolyong@100.91.255.31:~/deploy/monitoring-agent/build/eval/run-*/summary.md`
  (228건 실행 5회분, arm 별 pass rate·차원별 점수·도구 호출 수)
- 운영 DB: `docker exec monitoring-agent-db psql -U monitoring_user -d monitoring_agent`
  (`alert_event`, `agent_evaluation`, `resolution_record`)
