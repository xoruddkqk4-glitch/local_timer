# 05Timer - 오프라인 고가시성 타이머 (High-Visibility Timer)

외부 라이브러리 및 네트워크 연결 없이 웹 브라우저에서 100% 오프라인으로 작동하는 **고가시성 루프 타이머 & 스톱워치** 애플리케이션입니다.

---

## 🌟 주요 기능 및 특징

### 1. `타이머실행.bat` 1-Click 최상단 실행 (폴더 이동 완전 지원)
- **좌상단 1/4 크기 전용 앱 창**: `타이머실행.bat` 더블 클릭 시 주소창 없는 깔끔한 전용 앱 창 형태로 화면 왼쪽 상단(0,0)에 1/4 크기(가로 50%, 세로 50%)로 띄워집니다.
- **Windows OS 및 Document PiP 지원**: 📌 `맨 위 창 (T)` 버튼 또는 `T` 키 입력 시 브라우저 최상단 고정 팝업(Document Picture-in-Picture) 창으로 즉시 전환됩니다.
- **폴더 이동 및 크롬 경로 탐색 강화**: 폴더 위치 변경 시 발생하던 매개변수 오류(MSN 홈 페이지 연결)를 `[System.Uri]` 완전 URI 인코딩으로 해결하였으며, `AppData\Local` 내 사용자 전용 Chrome 경로까지 자동으로 탐색합니다.

### 2. 고가시성 대형 시간 표기
- **동적 자동 폰트 스케일링**: 하단 영역 요소를 1줄로 최소화하고, 시간 숫자(`05:00`) 크기가 화면 폭 및 높이에 맞춰 이탈(Overflow) 없이 가득 차도록 정밀한 감싸기 뷰포트 비율로 동적으로 자동 조절됩니다.

### 3. 두 가지 작동 모드
- **루프 타이머 (Loop Timer)**: 반복 횟수(기본값 1회) 지정 가능. 1회 완료 시 Web Audio API 알림음 및 화면 반짝임(Flash) 효과 발생 후 자동으로 다음 루프를 실행합니다.
- **스톱워치 (Stopwatch)**: 밀리초(.00) 단위 정밀 카운트업 제공. 스톱워치 모드 전환 시 상단 `반복 횟수` 조절기가 사라지지 않고 자연스럽게 비활성화(Grayed-out) 처리됩니다.

### 4. 직관적인 상단 메뉴바 & 빠른 설정 (Preset Buttons)
- **빠른 설정 버튼**: `1분`, `2분`, `2분 30초`, `3분`, `5분`, `8분`, `10분`, `15분`, `30분` 지원. 클릭 한 번으로 원하시는 시간을 즉시 설정할 수 있습니다.
- **좌측 정렬 모드 탭**: `루프 타이머`, `스톱워치`, `반복 횟수` 조절기가 상단 좌측에 차례대로 그룹화되어 정렬됩니다.
- **줄바꿈 방지**: 상단 메뉴바의 모든 버튼 텍스트가 창 크기에 상관없이 절대로 두 줄로 잘리지 않고 언제나 깔끔하게 한 줄로 보존됩니다.

### 5. 키보드 단축키 지원 (원래 창 & 맨 위 창 모두 완벽 지원)
- `Space`: 시작 / 일시정지 (버튼 포커스 자동 제거로 이중 실행 및 맨 위 창 닫힘 방지)
- `→` (오른쪽 화살표): +10초
- `←` (왼쪽 화살표): -10초
- `↑` (위쪽 화살표): +1분 (+60초)
- `↓` (아래쪽 화살표): -1분 (-60초)
- `R`: 리셋
- `T` (또는 `P`): 맨 위 창 고정 토글 (Always-on-Top / Picture-in-Picture)
- `1` ~ `4`: 창 크기 단계적 조절
  - **복원 모드**: `1` (35%), `2` (50%), `3` (65%), `4` (80%)
  - **맨 위 창 모드**: Chromium 보안 최댓값 한도(~50%)에 맞춰 `1` (25%), `2` (33%), `3` (42%), `4` (50% 최댓값) 단계별 스케일링 적용
- `5` (또는 `F`): 맨 위 창 모드에서도 매끄럽게 여백 없이 전환되는 100% Fullscreen 전체 화면

### 6. 100% 오프라인 동작 & Web Audio API
- 외부 오디오 파일이나 CDN 의존성 없이 순수 Web Audio API 신디사이저로 알림음을 생성하여 완벽하게 오프라인에서 동작합니다.

---

## 📁 프로젝트 구조

```text
05timer/
├── PRODUCT.md        # 제품 정의, 대상 사용자 및 핵심 기능 명세 (Impeccable Product Truth)
├── DESIGN.md         # 고가시성 다크 테마 디자인 토큰 및 UI 가이드라인 (Design Truth)
├── index.html        # 메인 HTML 마크업 및 단축키 안내 스트립
├── style.css         # 다크모드, 한 줄 보존(nowrap) & 고가시성 극대화 스타일
├── app.js            # 타이머/스톱워치 로직, 뷰포트 맞춤 폰트 스케일링, PiP & 단축키(1~5/Space/R/T)
├── 타이머실행.bat     # 더블 클릭 시 화면 좌상단 1/4 크기 최상단 고정 앱 창 실행 스크립트
├── launch.ps1        # PowerShell URI 인코딩 & Chrome 경로 자동 탐색 헬퍼
└── .agents/          # 에이전트 커스텀 규칙 및 스킬 정의
    ├── rules/
    │   └── rules.md  # 터미널 전용 고속 검증 및 커맨드 정책 (Rule 1 ~ 9)
    └── skills/
        ├── apply/           # /apply: 계획서 소스 코드 즉시 반영 스킬
        ├── ask/             # /ask: 코드 수정 없는 질의응답 및 구현 계획서 수립 스킬
        ├── git-commit/      # /git-commit: README 누적 업데이트 및 Git 커밋/푸시 스킬
        ├── impeccable/      # /impeccable: 프론트엔드 디자인 시스템 구축 & 리파인먼트 스킬
        ├── impeccable-all/  # /impeccable-all: 25대 기준 전수 디자인 검증 & 계획서 자동 생성 스킬
        └── scratchpad/      # /scratchpad: 브라우저 시각 검증 전용 모드 스킬
```

---

## 🤖 AI 에이전트 커스텀 스킬 & 슬래시 명령어

프로젝트 내 작업 생산성과 디자인 품질 관리를 위한 에이전트 커스텀 스킬 및 명령어 세트입니다:

| 명령어 | 스킬 경로 | 설명 및 주요 동작 |
| :--- | :--- | :--- |
| **`/impeccable [command]`** | `.agents/skills/impeccable/` | 프론트엔드 디자인 품질 고도화 (`audit`, `polish`, `typeset`, `bolder`, `quieter`, `document`, `harden` 등 세부 명령 제공) |
| **`/impeccable-all`** | `.agents/skills/impeccable-all/` | 6대 도메인 25개 전수 평가 축 검사, `implementation_plan.md` 계획서 자동 생성 후 `/apply` 대기 (코드 직접 수정 없음) |
| **`/ask`** | `.agents/skills/ask/` | 소스 코드를 수정하지 않고 질문에 답변하거나 기술 구현 계획서(`implementation_plan.md`) 작성 |
| **`/apply`** | `.agents/skills/apply/` | 최신 구현 계획서의 변경 사항을 소스 코드에 즉시 단계별 반영 |
| **`/scratchpad`** | `.agents/skills/scratchpad/` | 브라우저 인스턴스를 직접 띄워 화면 및 UI 인터랙션을 시각적으로 검증 |
| **`/git-commit`** | `.agents/skills/git-commit/` | 작업 내역 및 검증 결과를 `README.md` 하단에 누적 기록하고 상세 커밋 메시지와 함께 GitHub 원격 저장소 푸시 |

---

## 🚀 사용 방법

1. **1-Click 권장 실행 방법**: [`타이머실행.bat`](file:///c:/Users/user/Desktop/local/05timer/타이머실행.bat) 파일만 더블 클릭하면 화면 좌측 상단 1/4 크기로 주소창 없이 깔끔하게 열립니다.
2. **일반 브라우저 실행**: [`index.html`](file:///c:/Users/user/Desktop/local/05timer/index.html)을 웹 브라우저에서 직접 연 후 `T` 키를 누르면 맨 위 창으로 고정할 수 있습니다.

---

## [2026-10-22 10:04] 업데이트 이력 (Commit ID: 75d88d2)

- **수정 내용**:
  - `impeccable` 및 `impeccable-all` 스킬을 프로젝트에 공식 통합 (`.agents/rules/rules.md`에 Rule 8, 9 추가 반영)
  - `PRODUCT.md` (Product Truth) 및 `DESIGN.md` (Design Truth 토큰 스키마 & 규격) 신규 작성
  - `/impeccable-all` 실행을 통해 6대 도메인 25개 평가 축 전수 진단 및 `implementation_plan.md` 발행
  - `/apply` 실행을 통해 UI 디자인 시스템 고도화 및 리파인먼트 적용:
    - **P1**: `time-display` 및 버튼의 `[dark-glow]` 제로 오프셋 형광 후광 제거 -> 고대비 폰트 스무딩 및 은은한 소프트 깊이감 그림자(`text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6)`) 적용
    - **P2**: 8단계로 분산되었던 `border-radius`를 4단계(`sm: 6px`, `md: 10px`, `lg: 14px`, `full: 9999px`)로 통일, 스텝 버튼(20px -> 26px) 및 아이콘 버튼(28px -> 32px) 클릭/터치 타깃 영역 보강
    - **P3**: 폰트 단계를 3단계(`--font-size-xs: 0.72rem`, `--font-size-sm: 0.8rem`, `--font-size-base: 0.9rem`)로 통합, 인라인 투명도 색상을 `:root` 전역 토큰(`--overlay-dark-1`, `--overlay-dark-2`, `--overlay-dark-3`)으로 변수화
  - `README.md` 프로젝트 구조 및 에이전트 커스텀 명령어 안내 섹션 보강
- **검증 결과**:
  - `impeccable detect .`: **0 anti-patterns found, 0 advisory notes** (안티패턴 및 경고 0건 완전 통과)
  - `node -c app.js`: 구문 오류 없음 (Exit Code: 0)

---

## [2026-10-22 10:48] 업데이트 이력 (Commit ID: 71ba620)

- **수정 내용**:
  - 타이머 빠른 설정(프리셋)에 **2분 30초** 추가 및 기능 구현
  - `index.html`: `2분`과 `3분` 사이에 `2분 30초`(`data-seconds="150"`, `data-minutes="2.5"`) 프리셋 버튼 추가
  - `app.js`:
    - `getButtonSeconds(btn)` 헬퍼 함수를 추가하여 분 단위뿐만 아니라 `data-seconds`를 통한 초 단위 프리셋 지원
    - `setPresetTime(totalSeconds, customLabel)` 함수를 구현하여 150초(`02:30`) 설정, 활성 버튼 하이라이트(`active-preset`), 상태 텍스트("2분 30초 설정됨") 출력 연동
    - 프리셋 버튼 클릭 이벤트 리스너를 연동하여 '2분 30초' 클릭 시 타이머가 02:30으로 즉시 세팅되도록 구현
  - `style.css`:
    - 프리셋 바(`.preset-bar`)에 `max-width: 100%`, `overflow-x: auto`, 스크롤바 숨김(`scrollbar-width: none`) 속성을 추가하여 작은 창(맨 위 창 / PiP 1단계 등)에서도 레이아웃 깨짐 없이 안전하게 수평 스크롤 지원
  - `PRODUCT.md` 및 `README.md`:
    - 프리셋 지원 목록에 `2분 30초` 추가 반영
- **검증 결과**:
  - `node -c app.js`: 구문 오류 없음 (Exit Code: 0)

