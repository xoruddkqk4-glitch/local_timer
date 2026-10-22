# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

데스크톱 환경(Windows 등)에서 작업, 코딩, 공부, 발표, 운동 등의 시간 관리를 위해 별도 앱 설치나 인터넷 연결 없이 브라우저에서 직관적이고 시인성 높은 타이머 및 스톱워치를 필요로 하는 사용자.

## Product Purpose

네트워크 연결이나 외부 라이브러리 설치 없이 100% 오프라인 환경에서 즉시 구동되며, 1-Click 실행(`타이머실행.bat`) 및 Document PiP(Picture-in-Picture) 최상단 고정 기능을 통해 어떤 멀티태스킹 작업 환경에서도 시인성을 극대화한 고가시성 루프 타이머 & 스톱워치 제공.

## Positioning

- **1-Click 좌상단 1/4 전용 창 & 최상단 고정(Always-on-Top)**: `타이머실행.bat`으로 브라우저 주소창 없는 전용 앱 창 형태로 실행되며, `T` 키(또는 `P` 키)로 PiP 최상단 윈도우로 즉시 전환.
- **뷰포트 최적화 반응형 폰트 자동 스케일링**: 창 크기나 비율이 달라져도 텍스트 넘침(Overflow)이나 잘림 없이 시간 숫자가 화면에 최대 크기로 선명하게 자동 조절.
- **100% 순수 오프라인 & Web Audio API**: 외부 음원 파일이나 네트워크 CDN 요청 없이 Web Audio API 오실레이터로 깔끔한 신디사이저 알림음 생성.

## Operating Context

- Windows 데스크톱의 멀티태스킹 환경(코딩, 문서 작업, 화상 회의 등)에서 다른 창 위에 작게 띄워두거나 전체 화면으로 활용.
- 단축키 조작(Space: 시작/정지, R: 리셋, T: 맨 위 창, 화살표: 시간 증감, 1~5: 창 크기 조절)으로 마우스 조작 없이 제어 가능.

## Capabilities and Constraints

- **기능 (Capabilities)**:
  - 루프 타이머: 지정된 시간 카운트다운, 1회 완료 시 알림음 및 화면 점멸(Flash), 반복 횟수(루프) 카운트 및 자동 반복.
  - 정밀 스톱워치: 밀리초(.00) 단위 카운트업 제공 (모드 전환 시 반복 횟수 비활성화 처리).
  - 프리셋 버튼: 1분, 2분, 3분, 5분, 8분, 10분, 15분, 30분 빠른 설정.
  - Document Picture-in-Picture 최상단 창 지원 및 동적 크기 스케일링(1~4단계, 5단계 Fullscreen).
  - 키보드 단축키 체계 (스페이스바 포커스 자동 블러 처리로 오작동 방지).
- **기술적 제약 (Constraints)**:
  - 외부 종속성 완전 배제 (Pure Vanilla HTML, CSS, JavaScript).
  - 브라우저 보안 제약에 따른 Picture-in-Picture 창 최대 크기 한도(~50%) 준수.

## Brand Commitments

- 제품명: 05Timer (High-Visibility Offline Timer)
- 시각적 톤: 눈의 피로를 최소화하는 딥 다크 모드, 고대비 에메랄드/시안 네온 액센트

## Product Principles

1. **시인성 최우선 (High Visibility First)**: 시간 정보는 어떤 창 크기와 거리에서도 한눈에 파악되어야 한다.
2. **무설치 & 즉시 실행 (Zero Friction)**: 더블 클릭 한 번으로 설치나 인터넷 연결 없이 즉시 구동된다.
3. **방해 없는 직관성 (Non-Intrusive Utility)**: 작업 공간을 가리지 않는 컴팩트한 최상단 모드와 한눈에 들어오는 단축키를 제공한다.
4. **견고한 오프라인 안정성 (Offline Resilience)**: 외부 네트워크나 파일 경로에 의존하지 않는 독립형 웹 애플리케이션을 유지한다.

## Accessibility & Inclusion

- 고대비 다크모드 테마 (명도 대비 극대화)
- 44px 이상의 터치/클릭 타깃
- 직관적인 키보드 내비게이션 및 단축키 안내 스트립 상시 제공
- 오디오 알림과 함께 시각적 점멸(Visual Flash) 피드백 병행 제공
