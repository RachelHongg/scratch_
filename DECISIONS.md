# 아키텍처 결정 기록

## 1. Atomic Design 패턴

컴포넌트를 atoms / molecules / organisms / templates / pages 5단계로 분류.

- **근거**: 각 레벨의 책임이 명확하여 테스트·재사용이 용이. Badge, Button 같은 atom은 프로젝트 전반에서 일관된 스타일 제공
- **대안 검토**: Feature 기반 폴더 구조 — 규모가 작은 현재 프로젝트에서는 Atomic이 컴포넌트 관계를 더 직관적으로 표현

## 2. Context 분리 전략 (Connection / Confirm / Performance)

3개의 독립 Context로 상태를 분리.

- **근거**: 각 Context는 서로 다른 컴포넌트 집합을 구독. Connection은 ConnectionBanner + SimulationControls, Confirm은 CoinRow만, Performance는 CoinTable + Monitor만 리렌더
- **대안 검토**: Zustand — 단일 스토어로 모든 상태 관리 시 셀렉터 최적화 필요. 현재 규모에서는 Context + useReducer로 충분하고 외부 의존성 제로

## 3. FastAPI 프록시 서버

CoinGecko API를 직접 호출하지 않고 FastAPI를 거치는 구조.

- **근거**: CORS 제약 해결, API key를 서버에서만 관리, 응답 캐싱·변환 레이어 확장 가능
- **추가 기능**: `multiply` 파라미터로 데이터를 N배 복제하여 대량 데이터 스트레스 테스트 지원 (프론트엔드에서 1x~100x 조절)

## 4. Web Worker 활용 (파생 지표 + Filter/Sort)

변동성 Top 5, 상위 변동 종목 Top 5 계산과 Filter/Sort 연산을 Web Worker에서 수행.

- **근거**: 메인 스레드 블로킹 방지. 5000개 데이터에서도 UI가 멈추지 않음
- **트레이드오프**: Worker 통신 오버헤드(postMessage 직렬화)가 있으나, 메인 스레드 점유 0ms 달성이 더 중요
- **측정 결과**: Worker Compute 10~45ms, Filter/Sort 20ms — 비동기이므로 사용자 체감 지연 없음
- **설계**: 하나의 Worker 파일에서 `COMPUTE_METRICS`와 `FILTER_SORT` 두 가지 메시지 타입을 처리. 별도 Worker 파일 분리 대신 재사용으로 리소스 절약

## 5. 가상 스크롤링 (@tanstack/react-virtual)

CoinTable에 가상 스크롤링 적용. DOM에 화면 + overscan 10개 행만 렌더링.

- **근거**: 5000개 행 렌더링 시 일반 map은 DOM 노드 폭증으로 FPS 급락. 가상 스크롤링으로 FPS 60 유지, DOM 노드 ~500개 유지
- **대안 검토**: react-window — 기능적으로 유사하나 TanStack 생태계 통일 (react-query + react-virtual)과 더 유연한 API 제공
- **대안 검토**: 페이지네이션 — UX 측면에서 끊김 없는 스크롤이 대시보드에 더 적합

## 6. 리렌더 최적화 (Structural Sharing + 커스텀 memo)

React Query의 Structural Sharing과 CoinRow 커스텀 memo 비교함수를 조합.

- **문제**: 60초 폴링마다 React Query가 새 배열/객체 참조를 생성 → `React.memo` 기본 shallow compare가 무력화 → 데이터 변경 없어도 전체 CoinRow 리렌더
- **해결 1 - Structural Sharing**: React Query `structuralSharing` 콜백에서 이전/신규 코인 데이터를 필드 단위로 비교. 동일하면 이전 객체 참조를 재사용하여 불필요한 상태 변경 전파 차단
- **해결 2 - 커스텀 memo**: `React.memo`에 `current_price`, `market_cap`, `price_change_percentage_24h` 등 핵심 필드를 비교하는 함수 전달. Structural Sharing이 참조를 보존하면 비교 자체를 건너뜀
- **측정 결과**: Render Time 6.8ms → 5.6ms (18% 개선)

## 7. 성능 모니터링 체계

Performance Monitor 패널로 실시간 지표 추적.

- **측정 지표**:
  - 실시간 처리: FPS, 데이터 신선도(초), Fetch Latency(ms), E2E Latency(ms), 성공률(%)
  - 대량 처리: Render Time(ms), Filter/Sort (Worker, ms), Metrics (Worker, ms), 리렌더 횟수, 스킵된 렌더(memo), 아이템 수
  - 리소스: JS Heap(MB)
- **근거**: 최적화 효과를 정량적으로 검증하기 위한 계측 인프라. 색상 코딩(녹/황/적)으로 병목 즉시 식별
- **구현**: requestAnimationFrame 기반 FPS, performance.now() 기반 각 단계 소요 시간 측정, performance.memory 기반 메모리 추적
- **E2E Latency**: fetch 완료 시점 기록 → 정렬 완료 후 `requestAnimationFrame` 콜백에서 실제 DOM 페인트 시점과의 차이 계산

## 8. URL 동기화

검색어(`q`)와 정렬(`sort`)을 URL query parameter로 관리.

- **근거**: 상태가 URL에 반영되어 공유 가능한 링크 제공. 새로고침 시 상태 복원
- **history.replaceState 선택**: pushState는 뒤로 가기 시 매 타이핑마다 히스토리 생성. replaceState로 히스토리 오염 방지
- **검색 debounce 300ms**: 타이핑 중 과도한 URL 업데이트 방지

## 9. 서버 기반 연결 시뮬레이션

시뮬레이션 상태를 서버에서 관리하고, API 응답을 실제로 변경하는 구조.

- **상태**: connecting → live | confirmed | error (서버 응답에 의해 결정)
- **근거**: 초기에는 프론트엔드 `FORCE` 액션으로 구현했으나, 폴링의 자동 dispatch가 강제 상태를 즉시 덮어쓰는 버그 발생. 시뮬레이션 모드 플래그로 우회하는 것보다 서버가 직접 응답을 바꾸는 것이 더 현실적이고 Confirm API와도 자연스럽게 연동
- **Refresh = 초기화 액션**: 시뮬레이션 해제 + Confirm 상태 전체 리셋. 시뮬레이션 버튼(Live/Error/Confirmed)은 테이블 Confirm 상태를 유지

## 10. Test Mode 분리

Data Scale(스트레스 테스트)과 Performance Monitor를 Test Mode로 분리.

- **근거**: 일반 사용자에게는 불필요한 개발/테스트 도구. 네비게이션 바 토글로 진입하여 필요할 때만 표시
- **구현**: App 레벨 `testMode` 상태 → DashboardLayout에 토글 버튼, Dashboard에 조건부 Data Scale 렌더링, PerformanceMonitor 조건부 마운트
- **일반 모드**: 항상 1x(50개) 데이터 사용, Performance Monitor 숨김

## 향후 개선 계획

- WebSocket 실시간 스트리밍 (폴링 → 푸시 전환)
- Redis 캐싱 레이어 (백엔드 응답 캐싱)
- E2E 테스트 (Playwright)
- 다크모드 지원
- Performance Monitor 프로덕션 조건부 렌더링 (환경변수 기반)
- 서버 사이드 필터링/정렬 (대량 데이터 시 네트워크 비용 절감)
- SharedArrayBuffer 활용 Worker 통신 최적화
