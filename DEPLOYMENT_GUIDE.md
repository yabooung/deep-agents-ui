# 배포 가이드

## 서버에서 배포 시 발생하는 문제 해결

### 문제 1: 환경변수 경고

**증상:**
```
WARN[0000] The "NEXT_PUBLIC_DEPLOYMENT_URL" variable is not set. Defaulting to a blank string.
```

**원인:** 서버에 `.env.local` 파일이 없거나 Docker Compose가 읽지 못함

**해결 방법:**

1. 서버에 `.env.local` 파일 생성:
```bash
# 서버에서 실행
cd ~/202602deepagentui
nano .env.local
```

2. 다음 내용 입력:
```env
NEXT_PUBLIC_DEPLOYMENT_URL=http://34.46.39.109:8300
NEXT_PUBLIC_ASSISTANT_ID=agent
NEXT_PUBLIC_LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY
NEXT_PUBLIC_LANGSMITH_PROJECT_NAME="20260212"
NEXT_PUBLIC_LANGSMITH_PROJECT_ID=6704697e-7ccd-4c7e-b52f-85a20fe2c192
NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER=false
NEXT_PUBLIC_DAILY_TOKEN_LIMIT=1
DAILY_COST_LIMIT=10.0
```

3. 파일 권한 확인:
```bash
chmod 600 .env.local
```

### 문제 2: 포트 충돌

**증상:**
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**원인:** 포트 3000이 이미 사용 중

**해결 방법 1: 기존 컨테이너 중지**
```bash
# 실행 중인 컨테이너 확인
docker ps

# 기존 컨테이너 중지 및 제거
docker stop deep-agents-ui
docker rm deep-agents-ui

# 또는 Docker Compose로 중지
docker compose down
```

**해결 방법 2: 다른 포트 사용**

환경변수로 설정:
```bash
export PORT=8400
docker compose up --build -d
```

## 전체 배포 절차

### 1. 서버 접속 및 프로젝트 디렉토리 이동
```bash
ssh horusr8@instance-20260102-022103
cd ~/202602deepagentui
```

### 2. 환경변수 파일 생성
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_DEPLOYMENT_URL=http://34.46.39.109:8300
NEXT_PUBLIC_ASSISTANT_ID=agent
NEXT_PUBLIC_LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY
NEXT_PUBLIC_LANGSMITH_PROJECT_NAME="20260212"
NEXT_PUBLIC_LANGSMITH_PROJECT_ID=6704697e-7ccd-4c7e-b52f-85a20fe2c192
NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER=false
NEXT_PUBLIC_DAILY_TOKEN_LIMIT=1
DAILY_COST_LIMIT=10.0
EOF

chmod 600 .env.local
```

### 3. 기존 컨테이너 정리 (필요시)
```bash
docker compose down
docker ps -a | grep deep-agents-ui
```

### 4. 배포 실행
```bash
# 백그라운드 실행
docker compose up --build -d

# 또는 포트 지정
export PORT=8400
docker compose up --build -d
```

### 5. 배포 확인
```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f app

# 헬스체크 확인
docker compose exec app node -e "require('http').get('http://localhost:3000', (r) => {console.log('Status:', r.statusCode)})"
```

## 포트 변경 방법

환경변수로 설정:
```bash
export PORT=8400
docker compose up --build -d
```

## 문제 해결 체크리스트

- [ ] `.env.local` 파일이 서버에 존재하는가?
- [ ] `.env.local` 파일 권한이 올바른가? (600 권장)
- [ ] 포트 3000이 사용 중인가? (`netstat -tulpn | grep 3000` 또는 `lsof -i :3000`)
- [ ] 기존 컨테이너가 실행 중인가? (`docker ps`)
- [ ] Docker Compose 버전이 최신인가? (`docker compose version`)

## 유용한 명령어

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 특정 포트 사용 중인 프로세스 확인
sudo lsof -i :3000
# 또는
sudo netstat -tulpn | grep 3000

# 컨테이너 로그 실시간 확인
docker compose logs -f

# 컨테이너 재시작
docker compose restart

# 컨테이너 중지 및 제거
docker compose down

# 이미지까지 제거
docker compose down --rmi all
```
