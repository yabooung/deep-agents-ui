import { NextResponse } from 'next/server';
import { getCostLimitOverride } from '@/lib/admin-overrides';

let cachedTotalCost = 0;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 429 방지를 위해 10분간 캐싱

function getCostLimit(): number {
  const override = getCostLimitOverride();
  if (override !== null) return override;
  const costLimitEnv = process.env.DAILY_COST_LIMIT || process.env.NEXT_PUBLIC_DAILY_COST_LIMIT;
  return costLimitEnv !== undefined && costLimitEnv !== null && costLimitEnv !== ""
    ? parseFloat(costLimitEnv)
    : 10.0;
}

export async function GET() {
  const API_KEY = process.env.LANGCHAIN_API_KEY || process.env.LANGSMITH_API_KEY || process.env.NEXT_PUBLIC_LANGSMITH_API_KEY;
  const PROJECT_ID = process.env.LANGCHAIN_PROJECT_ID || process.env.LANGSMITH_PROJECT_ID || process.env.NEXT_PUBLIC_LANGSMITH_PROJECT_ID;
  const COST_LIMIT = getCostLimit();
  
  console.log("[API USAGE] Cost limit:", COST_LIMIT);
  const now = Date.now();

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API_KEY not configured" },
      { status: 500 }
    );
  }

  // 1. 캐시 체크 (429 에러 방지의 핵심)
  if (now - lastFetchTime < CACHE_DURATION && lastFetchTime !== 0) {
    console.log("[API USAGE] Using cached value:", cachedTotalCost);
    return NextResponse.json({ 
      totalCost: cachedTotalCost, 
      isExceeded: cachedTotalCost >= COST_LIMIT, 
      costLimit: COST_LIMIT,
      cached: true 
    });
  }

  try {
    console.log("[API USAGE] Fetching stats from LangSmith API");
    console.log("[API USAGE] Project ID:", PROJECT_ID);

    const response = await fetch("https://api.smith.langchain.com/api/v1/runs/stats", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 422 에러 해결: 'session'은 배열(리스트) 형식이어야 함
        "session": [PROJECT_ID], 
        "summary_metrics": ["total_cost"],
        // 전체 누적 금액을 위해 넉넉한 기간 설정
        "start_time": "2025-01-01T00:00:00Z"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USAGE] LangSmith API error:", response.status, errorText);
      
      // 429 에러 발생 시 기존 캐시값이라도 반환하여 프론트가 죽지 않게 함
      if (response.status === 429) {
        console.warn("[API USAGE] Rate limit hit, returning cached value");
        return NextResponse.json({ 
          totalCost: cachedTotalCost, 
          isExceeded: cachedTotalCost >= COST_LIMIT, 
          costLimit: COST_LIMIT,
          error: "Rate limit",
          cached: true
        });
      }
      throw new Error(`LangSmith API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[API USAGE] Stats API response:", JSON.stringify(data, null, 2));
    
    // [수정 포인트] data.total_cost가 객체가 아니라 '숫자' 그 자체일 수 있습니다!
    const totalCost = typeof data.total_cost === 'number' 
      ? data.total_cost 
      : (data.total_cost?.sum || 0);
    
    cachedTotalCost = totalCost;
    lastFetchTime = now;

    console.log(`[API USAGE] 드디어 찾은 비용: $${totalCost.toFixed(4)}`);

    return NextResponse.json({
      totalCost: totalCost, // 여기서 0.04가 찍힐 겁니다.
      isExceeded: totalCost >= COST_LIMIT,
      costLimit: COST_LIMIT,
      projectId: PROJECT_ID
    });

  } catch (error: any) {
    console.error("[API USAGE] Error:", error.message);
    // 에러 발생 시에도 캐시된 값이 있으면 반환
    return NextResponse.json({ 
      totalCost: cachedTotalCost, 
      isExceeded: cachedTotalCost >= COST_LIMIT,
      costLimit: COST_LIMIT,
      error: error.message,
      cached: lastFetchTime !== 0,
      projectId: PROJECT_ID
    }, { status: 200 });
  }
}
