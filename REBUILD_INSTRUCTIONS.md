# 재빌드 가이드

## 문제: 빌드 캐시로 인해 환경변수가 반영되지 않음

모든 단계가 `CACHED`로 표시되면 이전 빌드 캐시를 사용하고 있어서 새로운 환경변수가 반영되지 않습니다.

## 해결 방법

### 방법 1: 캐시 없이 재빌드 (권장)

```bash
# 기존 컨테이너 중지
docker compose down

# 캐시 없이 재빌드
docker compose build --no-cache

# 재시작
docker compose up -d

# 로그 확인
docker compose logs -f app
```

### 방법 2: 이미지까지 완전히 제거 후 재빌드

```bash
# 컨테이너 및 이미지 제거
docker compose down --rmi all

# 재빌드 및 시작
docker compose up --build -d
```

### 방법 3: 환경변수 확인 후 재빌드

```bash
# .env.local 파일 확인
cat .env.local

# 환경변수가 제대로 있는지 확인
docker compose config | grep NEXT_PUBLIC

# 캐시 없이 재빌드
docker compose build --no-cache
docker compose up -d
```

## 환경변수 확인

빌드 후 컨테이너 내부에서 환경변수 확인:

```bash
# 컨테이너 내부 접속
docker compose exec app sh

# 환경변수 확인
env | grep NEXT_PUBLIC
```

## 빌드 로그 확인

빌드 시 환경변수가 전달되는지 확인:

```bash
docker compose build --no-cache --progress=plain 2>&1 | grep NEXT_PUBLIC
```
