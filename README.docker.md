# Docker 배포 가이드

## 사전 요구사항

- Docker 및 Docker Compose 설치
- 환경변수 파일 설정

## 빠른 시작

### 1. 환경변수 설정

`.env.local` 파일을 생성하거나 수정하세요:

```bash
# Next.js 공개 환경변수
NEXT_PUBLIC_DEPLOYMENT_URL=http://your-domain.com:3000
NEXT_PUBLIC_ASSISTANT_ID=agent
NEXT_PUBLIC_LANGSMITH_API_KEY=your_langsmith_api_key
NEXT_PUBLIC_LANGSMITH_PROJECT_NAME=your_project_name
NEXT_PUBLIC_LANGSMITH_PROJECT_ID=your_project_id
NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER=false
NEXT_PUBLIC_DAILY_TOKEN_LIMIT=1

# 서버 사이드 환경변수
DAILY_COST_LIMIT=10.0
LANGCHAIN_API_KEY=your_langchain_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT_ID=your_project_id
LANGSMITH_PROJECT_ID=your_project_id
```

### 2. 실행

**개발 환경 (포그라운드 - 로그 확인 가능)**
```bash
docker compose up --build
```

**프로덕션 환경 (백그라운드)**
```bash
# -d 플래그로 백그라운드에서 실행
docker compose up --build -d

# 로그 확인
docker compose logs -f app
```

## 주요 명령어

### 컨테이너 시작
```bash
docker compose up -d
```

### 컨테이너 중지
```bash
docker compose down
```

### 로그 확인
```bash
docker compose logs -f app
```

### 컨테이너 재빌드
```bash
docker compose up --build -d
```

### 컨테이너 내부 접속
```bash
docker compose exec app sh
```

## 포트 변경

포트를 변경하려면 `docker-compose.yml`의 `ports` 섹션을 수정하세요:

```yaml
ports:
  - "8080:3000"  # 호스트포트:컨테이너포트
```

## 헬스체크

컨테이너는 자동으로 헬스체크를 수행합니다. 상태 확인:

```bash
docker-compose ps
```

## 문제 해결

### 빌드 실패
- Node.js 버전 확인 (20 이상 필요)
- 의존성 설치 확인: `yarn install`

### 환경변수 문제
- `.env.local` 파일이 올바른 위치에 있는지 확인
- 환경변수가 올바르게 설정되었는지 확인

### 포트 충돌
- 다른 서비스가 3000 포트를 사용 중인지 확인
- `docker-compose.yml`에서 포트 변경
