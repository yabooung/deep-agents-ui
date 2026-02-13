# 멀티 스테이지 빌드를 사용하여 최적화된 이미지 생성
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.json과 yarn.lock 복사
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경변수 설정 (빌드 시 필요)
ENV NEXT_TELEMETRY_DISABLED=1

# 빌드 타임 환경변수 (ARG로 받아서 ENV로 설정)
ARG NEXT_PUBLIC_DEPLOYMENT_URL
ARG NEXT_PUBLIC_ASSISTANT_ID
ARG NEXT_PUBLIC_LANGSMITH_API_KEY
ARG NEXT_PUBLIC_LANGSMITH_PROJECT_NAME
ARG NEXT_PUBLIC_LANGSMITH_PROJECT_ID
ARG NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER=false
ARG NEXT_PUBLIC_DAILY_TOKEN_LIMIT=1

ENV NEXT_PUBLIC_DEPLOYMENT_URL=${NEXT_PUBLIC_DEPLOYMENT_URL}
ENV NEXT_PUBLIC_ASSISTANT_ID=${NEXT_PUBLIC_ASSISTANT_ID}
ENV NEXT_PUBLIC_LANGSMITH_API_KEY=${NEXT_PUBLIC_LANGSMITH_API_KEY}
ENV NEXT_PUBLIC_LANGSMITH_PROJECT_NAME=${NEXT_PUBLIC_LANGSMITH_PROJECT_NAME}
ENV NEXT_PUBLIC_LANGSMITH_PROJECT_ID=${NEXT_PUBLIC_LANGSMITH_PROJECT_ID}
ENV NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER=${NEXT_PUBLIC_USE_MOCK_TOKEN_COUNTER}
ENV NEXT_PUBLIC_DAILY_TOKEN_LIMIT=${NEXT_PUBLIC_DAILY_TOKEN_LIMIT}

# Next.js 빌드
RUN yarn build

# 프로덕션 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
