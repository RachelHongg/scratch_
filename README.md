# Crypto Realtime Dashboard

CoinGecko API 기반 암호화폐 실시간 대시보드. 대량 데이터 처리와 실시간 데이터 갱신에 초점을 맞춘 프로젝트.

## 실행 방법

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 테스트
```bash
cd frontend
npm run test
```

## 아키텍처

```
Frontend (Vite + React + TS + Tailwind)
├── 컴포넌트: Atomic Design (atoms → molecules → organisms → templates → pages)
├── 서버 상태: React Query (TanStack Query) — 60초 폴링 + Structural Sharing
├── 클라이언트 상태: Context + useReducer × 3 (Connection, Confirm, Performance)
├── 파생 지표: Web Worker (변동성, 상위 변동 종목)
├── 필터/정렬: Web Worker 오프로딩 (메인 스레드 점유 0)
├── 대량 데이터: 가상 스크롤링 (@tanstack/react-virtual)
├── 리렌더 최적화: 커스텀 memo 비교함수 + Structural Sharing
├── 성능 모니터링: PerformanceContext + PerformanceMonitor 패널 (Test Mode)
└── URL 동기화: 검색/정렬 → query string (history.replaceState)

Backend (FastAPI)
├── GET /api/coins — CoinGecko 프록시 (연결 시뮬레이션 연동)
├── POST /api/confirm/{coin_id} — Confirm (연결 시뮬레이션 연동)
├── POST /api/connection/simulate — 연결 상태 시뮬레이션 설정
└── POST /api/connection/reset — 시뮬레이션 초기화
```

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 실시간 폴링 | React Query `refetchInterval: 60s`로 자동 갱신 |
| 검색/정렬 | 이름·심볼 필터링 + 가격 오름/내림차순 정렬, URL 동기화 |
| 연결 상태 시뮬레이션 | 서버 기반 Live/Error/Confirmed 전환, Refresh로 초기화 |
| Confirm 액션 | idle → pending → confirmed/failed 상태 전이, 시뮬레이션 상태 연동 |
| 파생 지표 | Web Worker에서 변동성 Top 5 / 상위 변동 종목 Top 5 계산 |
| 가상 스크롤링 | 5000개 행에서도 FPS 60 유지 |
| Test Mode | 네비게이션 바 토글로 진입. Data Scale + Performance Monitor 표시 |
| 스트레스 테스트 | Test Mode에서 1x~100x (50~5000개) 데이터 스케일 조절 |

## 연결 시뮬레이션

서버 기반으로 동작하며, 시뮬레이션 상태에 따라 `/api/coins`와 `/api/confirm` 응답이 달라짐.

| 버튼 | 서버 동작 | Confirm 결과 | 테이블 초기화 |
|------|----------|-------------|-------------|
| **Live** | 정상 응답 (`connection_status: "live"`) | 랜덤 (70% 성공) | X |
| **Error** | 503 에러 반환 | 항상 Failed | X |
| **Confirmed** | 정상 응답 (`connection_status: "confirmed"`) | 항상 Confirmed | X |
| **Refresh** | 시뮬레이션 해제 → Live로 복귀 | 랜덤 (70% 성공) | O (전체 초기화) |

## 성능 최적화 전략

### 대량 데이터 처리
- **가상 스크롤링**: DOM에 화면 + overscan 10개 행만 렌더링 → 5000개에서도 DOM 노드 ~500개 유지
- **Filter/Sort Worker 오프로딩**: 메인 스레드 점유 0ms → UI 블로킹 완전 제거
- **커스텀 memo 비교함수**: 코인 데이터의 실제 값을 비교하여 변경 없는 행은 리렌더 스킵
- **Structural Sharing**: React Query 폴링 응답에서 데이터 미변경 코인은 이전 객체 참조 재사용

### 실시간 데이터 처리
- **E2E Latency 추적**: fetch 완료 → DOM 페인트까지 시간 측정 (`requestAnimationFrame` 기반)
- **데이터 신선도**: 마지막 fetch 이후 경과 시간 실시간 표시
- **폴링 성공률**: fetch 성공/실패 비율 추적

## 성능 측정 결과

### 1차 최적화 (가상 스크롤링 + Worker 파생 지표)

| 지표 | 1x (50개) | 50x (2500개) | 100x (5000개) |
|------|-----------|-------------|--------------|
| FPS | 60 | 60 | 60 |
| Fetch Latency | 549ms | 1211ms | 1517ms |
| Render Time | 7.4ms | 9.6ms | 6.8ms |
| Filter/Sort (메인 스레드) | 0ms | 0.1ms | 0.3ms |
| Worker Compute | 45.8ms | 10.7ms | 17.6ms |

### 2차 최적화 (Structural Sharing + memo + Filter/Sort Worker)

| 지표 | 100x (5000개) 1차 | 100x (5000개) 2차 | 변화 |
|------|-------------------|-------------------|------|
| FPS | 60 | 60 | 유지 |
| Render Time | 6.8ms | 5.6ms | -18% 개선 |
| Filter/Sort | 0.3ms (메인 스레드) | 20ms (Worker) | 메인 스레드 해방 |
| E2E Latency | 미측정 | 27.5ms | 신규 지표 |
| JS Heap | 미측정 | 27.4MB | 신규 지표 |
| DOM 노드 | 미측정 | ~500개 (32행) | 5000개 중 32행만 렌더 |

## 트레이드오프

- **Context vs Zustand**: 3개의 독립 Context로 충분한 규모. 외부 의존성 최소화
- **Web Worker (파생 지표 + Filter/Sort)**: Worker 통신 오버헤드 < UI 블로킹 비용
- **FastAPI 프록시**: CORS 우회 + API key 미노출 + 서버 사이드 캐싱 확장 가능
- **가상 스크롤링 vs 페이지네이션**: 사용자 경험 우선. 끊김 없는 스크롤
- **서버 기반 시뮬레이션**: 프론트엔드 FORCE 방식 대신 서버가 실제 다른 응답을 반환하여 현실적 시나리오 재현

## API

### `GET /api/coins`
CoinGecko `/coins/markets` 프록시. 시뮬레이션 상태에 따라 응답 변경.
- Query: `vs_currency` (기본값: usd), `per_page` (기본값: 50), `multiply` (기본값: 1, 스트레스 테스트용)
- 응답: `{ "connection_status": "live" | "confirmed", "data": Coin[] }`
- Error 시뮬레이션 시: `503 Simulated connection error`

### `POST /api/confirm/{coin_id}`
Confirm 시뮬레이션. 연결 시뮬레이션 상태에 연동.
- Error 시뮬레이션 → 항상 `failed`, Confirmed 시뮬레이션 → 항상 `confirmed`, 그 외 → 70% 확률 성공
- 응답: `{ "coin_id": string, "status": "confirmed" | "failed" }`

### `POST /api/connection/simulate`
연결 시뮬레이션 상태 설정.
- Body: `{ "state": "live" | "error" | "confirmed" }`

### `POST /api/connection/reset`
시뮬레이션 초기화. Live 상태로 복귀.
