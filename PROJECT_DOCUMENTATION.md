# 의료 규제 전문가 에이전트 - 프로젝트 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [주요 변경사항](#주요-변경사항)
3. [기술 스택](#기술-스택)
4. [환경변수 설정](#환경변수-설정)
5. [주요 기능](#주요-기능)
6. [비용 제한 시스템](#비용-제한-시스템)
7. [Docker 배포](#docker-배포)
8. [문제 해결 및 최적화](#문제-해결-및-최적화)

---

## 프로젝트 개요

이 프로젝트는 **Deep Agents UI**를 기반으로 한 **의료 규제 전문가 에이전트** 프론트엔드 애플리케이션입니다. LangGraph SDK를 사용하여 LangChain/LangGraph 에이전트와 상호작용하는 웹 인터페이스를 제공합니다.

### 프로젝트 목적

- 의료 규제 관련 질문에 대한 전문적인 답변 제공
- LangGraph 에이전트와의 실시간 대화 인터페이스
- 비용 제한 기능을 통한 사용량 관리
- 환경변수 기반의 간편한 설정 관리

---

## 주요 변경사항

### 1. 프로젝트 이름 변경
- **변경 전**: Deep Agents UI
- **변경 후**: 의료 규제 전문가 에이전트
- 애플리케이션 전체에 반영

### 2. UI 개선

#### 2.1 스레드 기록 기능 제거
- 이전 대화 스레드 목록 사이드바 제거
- `ThreadList` 컴포넌트 주석 처리
- 단일 대화 세션에 집중하는 UI로 변경

#### 2.2 설정 UI 제거
- `ConfigDialog` 컴포넌트 제거
- 환경변수 기반 설정으로 완전 전환
- 설정 버튼 및 관련 UI 요소 제거

#### 2.3 동적 스피너 추가
- 메시지 생성 중 로딩 상태 표시
- `Loader2` 컴포넌트를 사용한 시각적 피드백
- 마지막 AI 메시지 하단에 스피너 표시

### 3. 설정 관리 방식 변경

#### 변경 전: localStorage 기반
```typescript
// localStorage에 설정 저장
localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
```

#### 변경 후: 환경변수 기반
```typescript
// 환경변수에서 직접 읽기
const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
```

**장점:**
- 서버 재시작 없이 설정 변경 불가 (보안 강화)
- Docker/Kubernetes 등 컨테이너 환경에 적합
- 환경별 설정 관리 용이

### 4. 비용 제한 시스템 구현

#### 4.1 초기 구현: 토큰 제한
- LangSmith API를 통한 일일 토큰 사용량 추적
- 사용량 제한 초과 시 메시지 전송 차단
- **후속 변경**: 토큰 제한 기능 완전 제거

#### 4.2 최종 구현: 비용 제한
- LangSmith API의 `POST /api/v1/runs/stats` 엔드포인트 사용
- 누적 비용 추적 및 일일 비용 제한
- 캐싱을 통한 API 호출 최적화

---

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: SWR, React Context
- **Streaming**: @langchain/langgraph-sdk

### 백엔드/API
- **Runtime**: Node.js 20
- **API Routes**: Next.js API Routes
- **External API**: LangSmith API

### 배포
- **Containerization**: Docker, Docker Compose
- **Build Tool**: Next.js Standalone Mode

### 주요 라이브러리
```json
{
  "@langchain/langgraph-sdk": "^1.0.3",
  "next": "^16.1.6",
  "react": "19.1.0",
  "tailwindcss": "^3.4.4",
  "swr": "^2.3.6"
}
```

---

## 환경변수 설정

### 필수 환경변수

```env
# LangGraph 배포 URL
NEXT_PUBLIC_DEPLOYMENT_URL=http://your-deployment-url:port

# 에이전트 ID
NEXT_PUBLIC_ASSISTANT_ID=agent

# LangSmith API 키 (클라이언트/서버 공용)
NEXT_PUBLIC_LANGSMITH_API_KEY=lsv2_pt_xxxxx

# LangSmith 프로젝트 정보
NEXT_PUBLIC_LANGSMITH_PROJECT_NAME=your_project_name
NEXT_PUBLIC_LANGSMITH_PROJECT_ID=your_project_id
```

### 선택적 환경변수

```env
# 비용 제한 (기본값: 10.0)
DAILY_COST_LIMIT=10.0

# 서버 사이드 API 키 (클라이언트 키와 다를 경우)
LANGCHAIN_API_KEY=your_api_key
LANGSMITH_API_KEY=your_api_key

# 서버 사이드 프로젝트 ID
LANGCHAIN_PROJECT_ID=your_project_id
LANGSMITH_PROJECT_ID=your_project_id
```

### 환경변수 우선순위

서버 사이드 환경변수는 다음 순서로 확인됩니다:

1. `LANGCHAIN_API_KEY` / `LANGSMITH_API_KEY`
2. `NEXT_PUBLIC_LANGSMITH_API_KEY` (fallback)

---

## 주요 기능

### 1. 실시간 채팅 인터페이스

- **스트리밍 응답**: LangGraph SDK를 통한 실시간 메시지 스트리밍
- **메시지 표시**: 마크다운 렌더링 및 코드 하이라이팅
- **에러 처리**: 네트워크 오류 및 API 오류에 대한 사용자 친화적 메시지

### 2. 동적 로딩 상태 표시

```typescript
// ChatInterface.tsx
{isLoading && 
  processedMessages.length > 0 &&
  processedMessages[processedMessages.length - 1].message.type === "ai" && (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>처리 중...</span>
    </div>
  )
}
```

### 3. 비용 제한 시스템

메시지 전송 전 비용 제한 체크:

```typescript
// useChat.ts
const response = await fetch("/api/usage");
const data = await response.json();

if (data.isExceeded || data.totalCost >= data.costLimit) {
  throw new Error(`일일 비용 제한에 도달했습니다.`);
}
```

### 4. 에러 메시지 표시

- 입력창 상단에 에러 메시지 표시
- 자동 스크롤로 에러 메시지 가시성 확보
- 에러 발생 시 입력 텍스트 유지

---

## 비용 제한 시스템

### 아키텍처

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│  Next.js API │────────▶│ LangSmith   │
│  (Browser)  │         │   /api/usage │         │    API      │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │ 캐싱 (10분)
                              ▼
                        ┌──────────────┐
                        │ In-Memory    │
                        │   Cache      │
                        └──────────────┘
```

### API 엔드포인트: `/api/usage`

#### 요청
```http
GET /api/usage
```

#### 응답
```json
{
  "totalCost": 0.038124,
  "isExceeded": false,
  "costLimit": 10.0,
  "projectId": "6704697e-7ccd-4c7e-b52f-85a20fe2c192",
  "cached": false
}
```

### 구현 세부사항

#### 1. 캐싱 메커니즘

```typescript
// 10분간 캐시 유지 (429 에러 방지)
const CACHE_DURATION = 10 * 60 * 1000;

if (now - lastFetchTime < CACHE_DURATION && lastFetchTime !== 0) {
  return NextResponse.json({ 
    totalCost: cachedTotalCost, 
    cached: true 
  });
}
```

**이유:**
- LangSmith API의 Rate Limit 방지
- 불필요한 API 호출 감소
- 응답 속도 개선

#### 2. LangSmith API 통합

```typescript
const response = await fetch("https://api.smith.langchain.com/api/v1/runs/stats", {
  method: "POST",
  headers: {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "session": [PROJECT_ID],  // 배열 형식 필수
    "summary_metrics": ["total_cost"],
    "start_time": "2025-01-01T00:00:00Z"
  }),
});
```

**주요 포인트:**
- `session` 파라미터는 배열 형식이어야 함 (422 에러 방지)
- `summary_metrics`에 `total_cost` 지정
- `start_time`으로 누적 기간 설정

#### 3. 비용 파싱

```typescript
// LangSmith API 응답 구조 대응
const totalCost = typeof data.total_cost === 'number' 
  ? data.total_cost 
  : (data.total_cost?.sum || 0);
```

**이유:**
- API 응답 구조가 일관되지 않을 수 있음
- 숫자 직접 반환 또는 객체의 `sum` 속성 확인

#### 4. 에러 처리

```typescript
// 429 Rate Limit 처리
if (response.status === 429) {
  return NextResponse.json({ 
    totalCost: cachedTotalCost, 
    error: "Rate limit",
    cached: true
  });
}
```

**전략:**
- Rate Limit 발생 시 캐시된 값 반환
- 애플리케이션 중단 방지
- 사용자 경험 유지

### 비용 제한 값 설정

환경변수 `DAILY_COST_LIMIT`에서 읽어옵니다:

```typescript
// 0도 유효한 값으로 처리
const costLimitEnv = process.env.DAILY_COST_LIMIT || process.env.NEXT_PUBLIC_DAILY_COST_LIMIT;
const COST_LIMIT = costLimitEnv !== undefined && costLimitEnv !== null && costLimitEnv !== ""
  ? parseFloat(costLimitEnv)
  : 10.0;
```

**특징:**
- `0` 값도 유효하게 처리 (무제한 사용 방지)
- 기본값: `10.0` (USD)

---

## Docker 배포

### 파일 구조

```
.
├── Dockerfile                 # 멀티 스테이지 빌드
├── docker-compose.yml         # 개발/테스트용
├── docker-compose.prod.yml    # 프로덕션용
├── .dockerignore              # 빌드 제외 파일
└── README.docker.md          # Docker 사용 가이드
```

### 빌드 및 실행

#### 개발 환경
```bash
docker-compose up --build
```

#### 프로덕션 환경
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Dockerfile 특징

1. **멀티 스테이지 빌드**
   - `deps`: 의존성 설치
   - `builder`: 애플리케이션 빌드
   - `runner`: 최소한의 런타임 이미지

2. **Next.js Standalone 모드**
   ```typescript
   // next.config.ts
   output: 'standalone'
   ```
   - 최소한의 파일만 포함
   - 이미지 크기 최적화

3. **보안**
   - `nextjs` 사용자로 실행 (root 권한 방지)
   - 필요한 파일만 복사

### 환경변수 설정

Docker Compose에서 환경변수 자동 로드:

```yaml
env_file:
  - .env.local
```

또는 직접 지정:

```yaml
environment:
  - NEXT_PUBLIC_DEPLOYMENT_URL=${NEXT_PUBLIC_DEPLOYMENT_URL}
  - DAILY_COST_LIMIT=${DAILY_COST_LIMIT:-10.0}
```

### 헬스체크

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## 문제 해결 및 최적화

### 1. 깜빡임 문제 해결

**문제**: 대화 종료 시 화면이 깜빡임

**원인**: `onFinish` 콜백이 불필요한 리렌더링 유발

**해결**:
```typescript
// useChat.ts
// 깜빡임 방지를 위해 콜백 제거
// onFinish: onHistoryRevalidate,
// onError: onHistoryRevalidate,
// onCreated: onHistoryRevalidate,
```

### 2. LangSmith API 통합 문제

#### 문제 1: 422 Unprocessable Entity
**원인**: `session` 파라미터가 문자열로 전달됨

**해결**:
```typescript
// 배열 형식으로 변경
"session": [PROJECT_ID]
```

#### 문제 2: 비용 값 파싱 오류
**원인**: API 응답 구조 불일치

**해결**:
```typescript
const totalCost = typeof data.total_cost === 'number' 
  ? data.total_cost 
  : (data.total_cost?.sum || 0);
```

#### 문제 3: Rate Limit (429)
**원인**: 과도한 API 호출

**해결**: 10분 캐싱 메커니즘 구현

### 3. 환경변수 처리 최적화

**문제**: `DAILY_COST_LIMIT=0`이 기본값으로 처리됨

**해결**:
```typescript
// 0도 유효한 값으로 명시적 체크
const COST_LIMIT = costLimitEnv !== undefined && costLimitEnv !== null && costLimitEnv !== ""
  ? parseFloat(costLimitEnv)
  : 10.0;
```

### 4. 에러 처리 개선

- 네트워크 오류 시 사용자 친화적 메시지
- 에러 발생 시 입력 텍스트 유지
- 자동 스크롤로 에러 메시지 가시성 확보

---

## 개발 가이드

### 로컬 개발 환경 설정

1. **의존성 설치**
   ```bash
   yarn install
   ```

2. **환경변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local 파일 수정
   ```

3. **개발 서버 실행**
   ```bash
   yarn dev
   ```

4. **빌드 테스트**
   ```bash
   yarn build
   yarn start
   ```

### 코드 구조

```
src/
├── app/
│   ├── api/
│   │   └── usage/
│   │       └── route.ts          # 비용 조회 API
│   ├── components/
│   │   ├── ChatInterface.tsx     # 메인 채팅 인터페이스
│   │   ├── ChatMessage.tsx       # 메시지 컴포넌트
│   │   └── ...
│   ├── hooks/
│   │   └── useChat.ts            # 채팅 로직 훅
│   └── page.tsx                  # 메인 페이지
├── lib/
│   ├── config.ts                 # 설정 관리
│   └── utils.ts                  # 유틸리티 함수
└── providers/
    ├── ClientProvider.tsx        # LangGraph 클라이언트
    └── ChatProvider.tsx          # 채팅 컨텍스트
```

### 주요 컴포넌트

#### ChatInterface
- 메시지 입력 및 표시
- 스트리밍 응답 처리
- 에러 메시지 표시

#### useChat Hook
- 메시지 전송 로직
- 비용 제한 체크
- 스트림 관리

#### /api/usage Route
- LangSmith API 통합
- 비용 캐싱
- 에러 처리

---

## 배포 체크리스트

- [ ] 환경변수 설정 확인
- [ ] LangSmith API 키 유효성 확인
- [ ] 프로젝트 ID 확인
- [ ] 비용 제한 값 설정
- [ ] Docker 이미지 빌드 테스트
- [ ] 헬스체크 동작 확인
- [ ] 로그 모니터링 설정

---

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [LangGraph SDK 문서](https://github.com/langchain-ai/langgraph-sdk)
- [LangSmith API 문서](https://docs.smith.langchain.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)

---

## 라이선스

이 프로젝트는 원본 Deep Agents UI의 라이선스를 따릅니다.

---

**최종 업데이트**: 2026-02-12
