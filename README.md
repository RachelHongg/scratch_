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
├── 서버 상태: React Query (TanStack Query) — 60초 폴링
├── 클라이언트 상태: Context + useReducer × 2 (Connection, Confirm)
├── 파생 지표: Web Worker (변동성, 상위 변동 종목)
├── 대량 데이터: 가상 스크롤링 (@tanstack/react-virtual)
├── 성능 모니터링: PerformanceContext + PerformanceMonitor 패널
└── URL 동기화: 검색/정렬 → query string (history.replaceState)

Backend (FastAPI)
├── GET /api/coins — CoinGecko 프록시 (multiply 파라미터로 스트레스 테스트 지원)
└── POST /api/confirm/{coin_id} — Confirm 시뮬레이션 (0.6~1.2초 지연, 70% 성공)
```

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 실시간 폴링 | React Query `refetchInterval: 60s`로 자동 갱신 |
| 검색/정렬 | 이름·심볼 필터링 + 가격 오름/내림차순 정렬, URL 동기화 |
| 연결 상태 머신 | connecting → live → reconnecting → error 전이 + 시뮬레이션 |
| Confirm 액션 | idle → pending → confirmed/failed 상태 전이, Retry 지원 |
| 파생 지표 | Web Worker에서 변동성 Top 5 / 상위 변동 종목 Top 5 계산 |
| 가상 스크롤링 | 5000개 행에서도 FPS 60 유지 |
| 성능 모니터 | FPS, 렌더 시간, Fetch 지연, 데이터 신선도 등 실시간 추적 |
| 스트레스 테스트 | 1x~100x (50~5000개) 데이터 스케일 조절 UI |

## 성능 측정 결과

| 지표 | 1x (50개) | 50x (2500개) | 100x (5000개) |
|------|-----------|-------------|--------------|
| FPS | 60 | 60 | 60 |
| Fetch Latency | 549ms | 1211ms | 1517ms |
| Render Time | 7.4ms | 9.6ms | 6.8ms |
| Filter/Sort | 0ms | 0.1ms | 0.3ms |
| Worker Compute | 45.8ms | 10.7ms | 17.6ms |

## 트레이드오프

- **Context vs Zustand**: 2개의 독립 Context로 충분한 규모. 외부 의존성 최소화
- **Web Worker**: 파생 지표 계산 오프로딩. Worker 통신 오버헤드 < UI 블로킹 비용
- **FastAPI 프록시**: CORS 우회 + API key 미노출 + 서버 사이드 캐싱 확장 가능
- **가상 스크롤링 vs 페이지네이션**: 사용자 경험 우선. 스크롤만으로 전체 데이터 탐색 가능
- **Performance Monitor**: 개발/데모 시 성능 가시성 확보. 프로덕션에서는 조건부 렌더링 필요

## API

### `GET /api/coins`
CoinGecko `/coins/markets` 프록시
- Query: `vs_currency` (default: usd), `per_page` (default: 50), `multiply` (default: 1, 스트레스 테스트용)

### `POST /api/confirm/{coin_id}`
Confirm 시뮬레이션
- Body (optional): `{ "force_result": "confirmed" | "failed" }`
- 응답: `{ "coin_id": string, "status": "confirmed" | "failed" }`
