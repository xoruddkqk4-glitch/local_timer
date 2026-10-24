---
name: 05Timer High-Visibility Design System
description: Ultra-high visibility multi-theme design system for offline loop timer & stopwatch
colors:
  bg-deep: "#020617"
  bg-surface: "#0f172a"
  bg-gradient-mid: "#1e1b4b"
  panel-bg: "rgba(255, 255, 255, 0.05)"
  panel-border: "rgba(255, 255, 255, 0.1)"
  text-main: "#f8fafc"
  text-muted: "#94a3b8"
  accent-timer: "#10b981"
  accent-stopwatch: "#06b6d4"
  accent-current: "#10b981"
  danger: "#ef4444"
  warning: "#f59e0b"
  alarm-flash: "#991b1b"
  overlay-dark-1: "rgba(0, 0, 0, 0.2)"
  overlay-dark-2: "rgba(0, 0, 0, 0.25)"
  overlay-dark-3: "rgba(0, 0, 0, 0.3)"
  # Curated 8 Theme Color Palette
  theme-slate-border: "#e2e8f0"
  theme-slate-bg: "#f1f5f9"
  theme-slate-green: "#059669"
  theme-apple-blue: "#0066cc"
  theme-apple-bg: "#f5f5f7"
  theme-8bit-black: "#050508"
  theme-8bit-dark: "#05050a"
  theme-8bit-green: "#22c55e"
  theme-8bit-gold: "#f59e0b"
  theme-win-teal: "#008080"
  theme-win-teal-dark: "#005050"
  theme-win-gray: "#c0c0c0"
  theme-win-navy: "#000080"
  theme-cyber-dark: "#03071e"
  theme-cyber-blue: "#1e3a8a"
  theme-cyber-cyan: "#38bdf8"
  theme-mono-charcoal: "#333333"
  theme-mono-nearblack: "#0d0d0d"
  theme-sakura-pink-light: "#fdf2f8"
  theme-sakura-pink-mid: "#fce7f3"
  theme-sakura-pink-border: "#fbcfe8"
  theme-sakura-rose: "#f43f5e"
typography:
  display:
    fontFamily: "'Courier New', Courier, monospace, 'Consolas', 'Menlo', tabular-nums"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontSize: "1.25rem"
  action:
    fontSize: "1.1rem"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.9rem"
    lineHeight: "1.5"
  label:
    fontSize: "0.8rem"
  caption:
    fontSize: "0.75rem"
  kbd:
    fontSize: "0.75rem"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  display-timer:
    backgroundColor: "transparent"
    textColor: "{colors.accent-current}"
  button-primary:
    backgroundColor: "{colors.accent-current}"
    textColor: "{colors.bg-deep}"
    rounded: "{rounded.full}"
    padding: "8px 24px"
  button-preset:
    backgroundColor: "{colors.panel-bg}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

# Design System: 05Timer

## Overview
05Timer는 작업에 몰입 중인 사용자가 곁눈질이나 원거리에서도 남은 시간을 즉시 확인할 수 있도록 설계된 **초고가시성 다크 테마(High-Contrast Dark Theme)** 디자인 시스템입니다.
Document Picture-in-Picture(PiP) 미니 창부터 4K 전체 화면까지 시간 텍스트가 뷰포트에 완벽히 맞춤 스케일링되며, 한 줄 레이아웃 보존과 직관적인 네온 그린/시안 액센트 컬러를 사용합니다.

## Colors
- **기본 다크 배경 (Base Dark Canvas)**:
  - Deep Dark Canvas: `#020617` (슬레이트 950 계열의 극저반사 배경)
  - Gradient Background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)`
  - Glass Panel: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(12px)`
- **전경 및 텍스트 (Typography Colors)**:
  - 메인 텍스트: `#f8fafc` (Slate 50)
  - 보조/안내 텍스트: `#94a3b8` (Slate 400)
- **상태 액센트 (State Accents)**:
  - 타이머 모드: `#10b981` (Emerald 500) - 안정적이고 시인성 높은 집중 컬러
  - 스톱워치 모드: `#06b6d4` (Cyan 500) - 정밀 카운트업을 상징하는 테크니컬 컬러
  - 경고 및 점멸: `#ef4444` (Red 500) / Alarm Flash: `#991b1b` (Red 800)

## 🎨 8가지 큐레이티드 테마 시스템 (Curated Themes)
1. **05Timer 딥 다크 (`default-dark`)**: 딥 슬레이트와 에메랄드/시안의 정밀 고대비 다크
2. **05Timer 슬레이트 데이 (`default-light`)**: 눈부심을 억제한 슬레이트 그레이 기반 주간 라이트
3. **Apple Minimal (`apple`)**: 애플 특유의 정제된 오프화이트와 클린 블루 액센트
4. **8-Bit Retro Orbit (`retro-8bit`)**: 레트로 오락실 감성의 오렌지/앰버 & 그린 픽셀 스타일
5. **Windows 95 Classic (`retro-win`)**: 90년대 클래식 틸(`#008080`)과 그레이 베벨 윈도우 UI
6. **Cobalt Cyber (`cobalt-grid`)**: 사이버펑크 네온 블루 & 일렉트릭 시안의 미래지향 그리드
7. **Monochrome (`monochrome`)**: 군더더기 없는 순수 흑백 고대비 하이 콘트라스트
8. **Sakura Chroma (`sakura`)**: 부드러운 파스텔 핑크와 로즈 악센트 테마

## 🔔 타이머 알람 오디오 시스템 (10 Sound Presets)
1. **야르송 알람 (`mp3/야르송알람.mp3`)**: 경쾌한 멜로디 알림음
2. **L을 가져가 - 셀카 (`mp3/L을 가져가-셀카.mp3`)**: 보이스 음성 알람 (셀카)
3. **L을 가져가 - 야채 (`mp3/L을 가져가-야채.mp3`)**: 보이스 음성 알람 (야채)
4. **L을 가져가 - 크리스크로스 (`mp3/L을 가져가-크리스크로스.mp3`)**: 보이스 음성 알람 (크리스크로스)
5. **L을 가져가 - 크림치즈허니 (`mp3/L을 가져가-크림치즈허니.mp3`)**: 보이스 음성 알람 (크림치즈허니)
6. **맑은 차임벨 (`mp3/맑은차임.mp3`)**: 은은한 4화음 맑은 벨
7. **디지털 비프 (`mp3/디지털비프.mp3`)**: 클래식 전자 시계 비프음
8. **우든 마림바 (`mp3/마림바.mp3`)**: 따뜻하고 경쾌한 어쿠스틱 타음
9. **긴급 사이렌 (`mp3/긴급사이렌.mp3`)**: 집중 환기용 펄스 경보음
10. **기본 신스음 (Web Audio)**: 무결 작동 100% 오프라인 오실레이터 합성음

## Typography
- **시간 표시 숫자 (Display Clock)**:
  - 모노스페이스 계열: `'Courier New', Courier, monospace, 'Consolas', 'Menlo', tabular-nums`
  - 숫자가 바뀔 때 가로 흔들림(Jitter)이 발생하지 않도록 `tabular-nums` 적용.
  - 창 크기에 따라 JavaScript `adjustFontSizeToViewport` 함수가 뷰포트 너비/높이에 맞춰 동적으로 최적 폰트 크기 계산.
- **인터페이스 및 라벨 (UI Labels & Shortcuts)**:
  - 현대적 시스템 산세리프: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - 최소 가독 폰트 12px(`0.75rem`) 이상 유지로 고해상도 환경 시인성 보장.

## Layout
- **Flexbox 기반 반응형 3단 수직 구조**:
  - 상단 (Top Bar): 모드 탭, 반복 루프 제어, 창 크기/테마/알람 제어 액션
  - 중앙 (Clock Viewport): 화면 영역을 최대로 활용하는 고가시성 시간 표시기
  - 하단 (Bottom Bar): 단일 1줄 레이아웃 제어 버튼 및 단축키 안내 스트립
- **한 줄 보존 (No-Wrap Policy)**:
  - `white-space: nowrap` 및 유연한 축소로 작은 창에서도 레이아웃 깨짐 방어.

## Elevation & Depth
- 미니멀 글래스모피즘(Glassmorphism):
  - 반투명 패널: `rgba(255, 255, 255, 0.05)` 배경과 `1px solid rgba(255, 255, 255, 0.1)` 미세 보더
  - 부드러운 깊이감: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3)`

## Shapes
- 닫기 버튼 및 미니 컨트롤: `28px x 28px`, `border-radius: 6px` 터치 타깃 확보
- 프리셋 및 일반 버튼: `border-radius: 10px`
- 메인 액션 버튼 및 뱃지: `border-radius: 9999px` 완전 필 캡슐

## Do's and Don'ts
- **DO**:
  - 모노스페이스 숫자 폰트의 tabular-nums 속성을 반드시 유지할 것.
  - 시간 숫자가 창 테두리를 벗어나거나 잘리지 않도록 동적 스케일링 비율을 유지할 것.
  - 텍스트 크기는 최소 12px(`0.75rem`) 이상을 유지하여 가독성을 보장할 것.
  - 키보드 단축키(1~5, Space, R, T, M, A, 화살표)와의 인터랙션 정합성을 보장할 것.
- **DON'T**:
  - 뷰포트 크기를 줄였을 때 가로 스크롤바가 생기게 하지 말 것 (`overflow: hidden`).
  - 외부 웹 폰트나 CDN 오디오 라이브러리를 임포트하지 말 것 (100% 오프라인 동작 원칙).
  - 12px 미만의 극소 텍스트를 무분별하게 사용하지 말 것.
