# CORS 문제 해결 가이드

## 문제
브라우저에서 `http://34.46.39.109:8333`에서 `http://34.46.39.109:8300`로 직접 요청 시 CORS 에러 발생

## 해결 방법

### 방법 1: LangGraph 서버에서 CORS 허용 (권장)

LangGraph 서버를 실행할 때 CORS를 허용하도록 설정해야 합니다.

**LangGraph Dev 서버 실행 시:**
```bash
langgraph dev --host 0.0.0.0 --port 8300 --cors-allowed-origins "*"
```

또는 특정 origin만 허용:
```bash
langgraph dev --host 0.0.0.0 --port 8300 --cors-allowed-origins "http://34.46.39.109:8333"
```

**LangGraph 설정 파일 (`langgraph.json`)에 추가:**
```json
{
  "graphs": {
    "agent": "./agent.py:agent"
  },
  "dev": {
    "host": "0.0.0.0",
    "port": 8300,
    "cors_allowed_origins": ["*"]
  }
}
```

### 방법 2: Next.js API Route로 프록시 (대안)

LangGraph 서버 설정을 변경할 수 없는 경우, Next.js API Route를 통해 프록시를 만들 수 있습니다.

**`src/app/api/langgraph/[...path]/route.ts` 생성:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const LANGGRAPH_URL = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || 'http://34.46.39.109:8300';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const url = new URL(request.url);
  const targetPath = path.join('/');
  const targetUrl = `${LANGGRAPH_URL}/${targetPath}${url.search}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // API 키가 있으면 추가
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const body = method === 'POST' ? await request.text() : undefined;

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

하지만 이 방법은 LangGraph SDK의 WebSocket 연결 등 복잡한 기능을 지원하지 않을 수 있습니다.

## 권장 해결책

**LangGraph 서버에서 CORS를 허용하는 것이 가장 간단하고 효과적입니다.**

LangGraph Dev 서버를 실행하는 서버에서:
```bash
# 기존 서버 중지 후 CORS 허용 옵션으로 재시작
langgraph dev --host 0.0.0.0 --port 8300 --cors-allowed-origins "*"
```

또는 환경변수로:
```bash
export LANGGRAPH_CORS_ALLOWED_ORIGINS="*"
langgraph dev --host 0.0.0.0 --port 8300
```
