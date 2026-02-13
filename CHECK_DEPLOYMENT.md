# 배포 확인 가이드

## 접속 주소
```
http://34.46.39.109:8333/
```

## 접속이 안 될 때 체크리스트

### 1. 컨테이너 상태 확인
```bash
docker compose ps
```

**정상 상태:**
```
NAME              STATUS          PORTS
deep-agents-ui    Up X minutes    0.0.0.0:8333->3001/tcp
```

### 2. 컨테이너 로그 확인
```bash
docker compose logs -f app
```

**정상 로그:**
- "Ready on http://0.0.0.0:3001" 메시지가 보여야 함
- 에러 메시지가 없어야 함

### 3. 포트 확인
```bash
# 컨테이너 내부 포트 확인
docker compose exec app netstat -tulpn | grep 3001

# 호스트 포트 확인
sudo netstat -tulpn | grep 8333
```

### 4. 방화벽 확인
```bash
# 방화벽 상태 확인
sudo ufw status

# 8333 포트 열기 (필요시)
sudo ufw allow 8333/tcp
```

### 5. 컨테이너 내부에서 직접 테스트
```bash
# 컨테이너 내부 접속
docker compose exec app sh

# 컨테이너 내부에서 curl 테스트
curl http://localhost:3001
```

### 6. 호스트에서 로컬 테스트
```bash
# 호스트에서 직접 테스트
curl http://localhost:8333
```

## 문제 해결

### 컨테이너가 시작되지 않는 경우
```bash
# 로그 확인
docker compose logs app

# 재시작
docker compose restart
```

### 포트가 열리지 않는 경우
```bash
# 방화벽 설정
sudo ufw allow 8333/tcp
sudo ufw reload

# 또는 iptables 사용 시
sudo iptables -A INPUT -p tcp --dport 8333 -j ACCEPT
```

### 애플리케이션이 응답하지 않는 경우
```bash
# 컨테이너 재빌드
docker compose down
docker compose up --build -d

# 환경변수 확인
docker compose exec app env | grep NEXT_PUBLIC
```

## 정상 작동 확인

브라우저에서 접속 시:
- ✅ 페이지가 로드됨
- ✅ "의료 규제 전문가 에이전트" 제목이 보임
- ✅ 채팅 인터페이스가 표시됨
