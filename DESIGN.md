---
name: 05Timer High-Visibility Design System
description: Ultra-high visibility dark mode design system for offline loop timer & stopwatch
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
typography:
  display:
    fontFamily: "'Courier New', Courier, monospace, 'Consolas', 'Menlo', tabular-nums"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.9rem"
    lineHeight: "1.5"
  label:
    fontSize: "0.8rem"
  caption:
    fontSize: "0.72rem"
  kbd:
    fontSize: "0.65rem"
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
- **배경 (Backgrounds)**:
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

## Typography
- **시간 표시 숫자 (Display Clock)**:
  - 모노스페이스 계열: `'Courier New', Courier, monospace, 'Consolas', 'Menlo', tabular-nums`
  - 숫자가 바뀔 때 가로 흔들림(Jitter)이 발생하지 않도록 `tabular-nums` 적용.
  - 창 크기에 따라 JavaScript `adjustFontSizeToViewport` 함수가 뷰포트 너비/높이에 맞춰 동적으로 최적 폰트 크기 계산.
- **인터페이스 및 라벨 (UI Labels & Shortcuts)**:
  - 현대적 시스템 산세리프: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - 단축키 가이드 및 버튼 텍스트의 선명한 가독성 확보.

## Layout
- **Flexbox 기반 반응형 3단 수직 구조**:
  - 상단 (Top Bar): 모드 탭(타이머/스톱워치), 반복 루프 설정, 프리셋 버튼(1~30분), 맨 위 창 토글 버튼
  - 중앙 (Clock Viewport): 화면 영역을 최대로 활용하는 고가시성 시간 표시기
  - 하단 (Bottom Bar): 단일 1줄 레이아웃으로 제어 버튼(시작/정지, 리셋) 및 단축키 안내 스트립 배치
- **한 줄 보존 (No-Wrap Policy)**:
  - 상단 메뉴바와 하단 조작계는 `white-space: nowrap` 및 유연한 `flex-shrink`를 적용하여 작은 창에서도 줄바꿈으로 레이아웃이 깨지지 않도록 방어.

## Elevation & Depth
- 미니멀 글래스모피즘(Glassmorphism):
  - 반투명 패널: `rgba(255, 255, 255, 0.05)` 배경과 `1px solid rgba(255, 255, 255, 0.1)` 미세 보더
  - 부드러운 깊이감: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3)`

## Shapes
- 버튼 및 토글 스위치: `border-radius: 8px ~ 12px` (중간 라운드)
- 상태 뱃지 및 메인 액션 버튼: `border-radius: 9999px` (완전 필 형태 캡슐)
- PiP 안내 바: `border-radius: 12px`

## Components
1. **Clock Display (`.clock`)**:
   - 중앙에 위치하며 가로/세로 여백 100% 활용
   - 타이머 모드 시 Emerald, 스톱워치 모드 시 Cyan 테마 자동 전환
2. **Preset Pills (`.preset-btn`)**:
   - 1분, 2분, 3분, 5분, 8분, 10분, 15분, 30분
   - 활성 버튼 상태 강조 및 즉시 시간 세팅
3. **Control Buttons (`#start-btn`, `#reset-btn`, `#pip-btn`)**:
   - 최소 터치 타깃 44px 이상 준수
   - 포커스 잔류 방지(Space 키 클릭 시 blur 처리)
4. **Shortcut Strip (`.shortcut-strip`)**:
   - 하단에 단축키(Space, 화살표, R, T, 1~5) 직관적 표시

## Do's and Don'ts
- **DO**:
  - 모노스페이스 숫자 폰트의 tabular-nums 속성을 반드시 유지할 것.
  - 시간 숫자가 창 테두리를 벗어나거나 잘리지 않도록 동적 스케일링 비율을 유지할 것.
  - 상단 메뉴와 하단 컨트롤이 2줄 이상으로 꺾이지 않도록 nowrap 처리를 유지할 것.
  - 키보드 단축키(1~5, Space, R, T, 화살표)와의 인터랙션 정합성을 보장할 것.
- **DON'T**:
  - 뷰포트 크기를 줄였을 때 가로 스크롤바가 생기게 하지 말 것 (`overflow: hidden`).
  - 외부 웹 폰트(Google Fonts 등)나 CDN 오디오 라이브러리를 임포트하지 말 것 (100% 오프라인 동작 원칙).
  - 과도한 네온 글로우로 텍스트 가독성을 떨어뜨리지 말 것.
