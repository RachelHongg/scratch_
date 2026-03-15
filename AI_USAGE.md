# AI Usage

## 사용 도구
- **Claude Code** (Claude Opus 4.6, 1M context)
- 브라우저 자동화를 통한 실시간 검증 (Claude in Chrome 확장)

---

## 1단계: 전체 프로젝트 설계 및 초기 구현

### 프롬프트
사전에 작성한 상세 구현 계획(프로젝트 구조, 컴포넌트 설계, 상태 머신 정의, API 스펙 등)을 전달하여 전체 프로젝트를 일괄 구현 요청.

### AI 생성 결과
- FastAPI 백엔드 (CoinGecko 프록시 + Confirm mock API)
- Vite + React + TypeScript + Tailwind CSS 프론트엔드
- Atomic Design 컴포넌트 구조 (atoms 6개, molecules 4개, organisms 5개, templates 1개, pages 1개)
- Context + useReducer 기반 상태 관리 (Connection, Confirm)
- Web Worker 파생 지표 계산
- URL 동기화 (검색/정렬)
- Vitest 테스트 24개

### 채택
- **Atomic Design 패턴**: 컴포넌트 재사용성과 관심사 분리가 명확. 테스트 작성 시 atom/molecule 단위로 독립 테스트 가능
- **Context + useReducer 2개 분리**: Connection과 Confirm을 독립 Context로 분리하여 불필요한 리렌더 방지. Zustand 대비 외부 의존성 제로
- **React Query refetchInterval**: 폴링 기반 실시간 데이터. WebSocket 대비 구현 단순하고 CoinGecko 무료 API에 적합
- **Web Worker 파생 지표**: 메인 스레드 블로킹 없이 변동성/상위 변동 종목 계산
- **연결 상태 머신 (useReducer)**: connecting → live → reconnecting → error 전이를 순수 함수 리듀서로 구현. 시뮬레이션용 FORCE 액션 추가
- **URL 동기화 (history.replaceState)**: 검색/정렬 상태를 URL에 반영하여 공유 가능. pushState 대신 replaceState로 히스토리 오염 방지

### 수정
- **PriceText null 처리 추가**: CoinGecko API에서 `price_change_percentage_24h`가 null로 오는 케이스 발견 → `value == null` 가드 추가. Chrome 확장으로 실제 렌더링 시 에러 발견하여 즉시 수정
- **CoinRow market_cap null 방어**: `(coin.market_cap ?? 0).toLocaleString()`으로 null 안전 처리
- **useRef 초기값**: React 19 타입에서 `useRef<T>()` 사용 시 초기값 필수 → `useRef<T>(undefined)` 명시
- **Vite config test 속성**: `defineConfig`를 `vite`가 아닌 `vitest/config`에서 import하여 test 속성 타입 에러 해결
- **테스트 파일 미사용 import 제거**: `beforeEach`, `act`, `QueryClientProvider` 등 불필요 import로 TypeScript 에러 → 제거

### 폐기
- 없음 (초기 설계가 구체적이어서 대부분 그대로 채택)

---

## 2단계: 성능 측정 및 최적화

### 프롬프트
"대량 데이터 처리 역량, 실시간 데이터 처리를 측정할 수 있는 지표를 정의하고, 그 지표를 기준으로 최적화 작업"을 요청.

### AI 생성 결과
- 성능 측정 지표 정의 (FPS, 렌더 시간, Filter/Sort 시간, Worker 계산 시간, Fetch 지연, 데이터 신선도, 성공률)
- `usePerformanceMetrics` 훅 — requestAnimationFrame 기반 FPS 추적, 각 처리 단계 시간 계측
- `PerformanceContext` — 전역 성능 데이터 공유
- `PerformanceMonitor` — 화면 우하단 고정 패널로 실시간 지표 시각화 (색상 코딩: 정상/경고/위험)
- 가상 스크롤링 (`@tanstack/react-virtual`) 적용
- 백엔드 `multiply` 파라미터 — 데이터를 N배로 복제하여 스트레스 테스트 지원
- Data Scale UI — 1x(50개) ~ 100x(5000개) 버튼으로 프론트엔드에서 직접 조절

### 채택
- **가상 스크롤링 (@tanstack/react-virtual)**: 5000개 행에서도 FPS 60 유지. DOM에 화면 + overscan 10개 행만 렌더링. react-window 대신 TanStack 생태계 통일
- **Performance Monitor 패널**: 실시간으로 모든 지표를 한눈에 확인 가능. 색상 코딩으로 병목 즉시 식별
- **requestAnimationFrame FPS 추적**: 별도 라이브러리 없이 브라우저 네이티브 API로 정확한 FPS 측정
- **기존 훅(useCoins, useDerivedMetrics)에 계측 코드 삽입**: 별도 래퍼 없이 기존 로직에 `performance.now()` 기반 측정 추가
- **백엔드 multiply 파라미터**: 프론트엔드에서 실시간으로 데이터 규모를 조절하여 성능 한계점 탐색 가능

### 수정
- **CoinTable을 가상 스크롤링 구조로 전환**: 기존 `<table><tbody>` 단순 map 렌더링 → `useVirtualizer` + 절대 위치 기반 행 배치. thead는 고정, tbody 영역만 가상화
- **useCoins에 multiply 인자 추가**: queryKey에 multiply 포함하여 스케일 변경 시 자동 refetch
- **fetchCoins API에 multiply query param 전달**: 기존 파라미터 없는 호출 → 조건부 query string 추가

### 폐기
- 없음

---

## 검증 방법
- TypeScript 컴파일: `npx tsc -b` — 에러 0
- 테스트: `npx vitest run` — 24개 전체 통과
- Chrome 브라우저 자동화로 실제 동작 검증:
  - 데이터 로딩 및 테이블 렌더링
  - 검색 필터링 ("btc" → Bitcoin만 표시) + URL 동기화 확인
  - Confirm 버튼 클릭 → pending → failed + Retry 표시
  - 연결 상태 시뮬레이션 (Error → "Connection Error" 배너 + Retry)
  - 스트레스 테스트 (50x/100x에서 FPS 60 유지 확인)
