# Architecture Decisions

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

## 4. Web Worker 파생 지표 계산

변동성 Top 5, 상위 변동 종목 Top 5를 Web Worker에서 계산.

- **근거**: 메인 스레드 블로킹 방지. 5000개 데이터에서도 UI가 멈추지 않음
- **트레이드오프**: Worker 통신 오버헤드(postMessage 직렬화) < 메인 스레드에서 동기 계산 시 프레임 드롭 비용
- **측정 결과**: Worker Compute 10~45ms 수준으로 사용자 체감 지연 없음

## 5. 가상 스크롤링 (@tanstack/react-virtual)

CoinTable에 가상 스크롤링 적용. DOM에 화면 + overscan 10개 행만 렌더링.

- **근거**: 5000개 행 렌더링 시 일반 map은 DOM 노드 폭증으로 FPS 급락. 가상 스크롤링으로 FPS 60 유지
- **대안 검토**: react-window — 기능적으로 유사하나 TanStack 생태계 통일 (react-query + react-virtual)과 더 유연한 API 제공
- **대안 검토**: 페이지네이션 — UX 측면에서 끊김 없는 스크롤이 대시보드에 더 적합

## 6. 성능 모니터링 체계

Performance Monitor 패널로 실시간 지표 추적.

- **측정 지표**:
  - 실시간 처리: FPS, 데이터 신선도(초), Fetch Latency(ms), 성공률(%)
  - 대량 처리: Render Time(ms), Filter/Sort Time(ms), Worker Compute Time(ms), 리렌더 횟수, 아이템 수
- **근거**: 최적화 효과를 정량적으로 검증하기 위한 계측 인프라. 색상 코딩(녹/황/적)으로 병목 즉시 식별
- **구현**: requestAnimationFrame 기반 FPS, performance.now() 기반 각 단계 소요 시간 측정

## 7. URL 동기화

검색어(`q`)와 정렬(`sort`)을 URL query parameter로 관리.

- **근거**: 상태가 URL에 반영되어 공유 가능한 링크 제공. 새로고침 시 상태 복원
- **history.replaceState 선택**: pushState는 뒤로 가기 시 매 타이핑마다 히스토리 생성. replaceState로 히스토리 오염 방지
- **검색 debounce 300ms**: 타이핑 중 과도한 URL 업데이트 방지

## 8. 연결 상태 머신

useReducer 기반 유한 상태 머신으로 연결 상태 관리.

- **상태**: connecting → live → reconnecting → error
- **근거**: 상태 전이를 순수 함수로 정의하여 테스트 용이. 무효 전이는 자동 무시 (no-op)
- **시뮬레이션 지원**: FORCE 액션으로 데모 시 임의 상태 강제 전환 가능

## 향후 개선 계획

- WebSocket 실시간 스트리밍 (폴링 → 푸시 전환)
- Redis 캐싱 레이어 (백엔드 응답 캐싱)
- E2E 테스트 (Playwright)
- 다크모드 지원
- Performance Monitor 프로덕션 조건부 렌더링 (환경변수 기반)
- 서버 사이드 필터링/정렬 (대량 데이터 시 네트워크 비용 절감)
