import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import {
  getCostLimitOverride,
  setCostLimitOverride,
  getDeploymentUrlOverride,
  setDeploymentUrlOverride,
} from "@/lib/admin-overrides";

const ADMIN_PIN_KEY = "ADMIN_PIN";

function getEffectiveCostLimit(): number {
  const override = getCostLimitOverride();
  if (override !== null) return override;
  const env =
    process.env.DAILY_COST_LIMIT || process.env.NEXT_PUBLIC_DAILY_COST_LIMIT;
  if (env !== undefined && env !== null && env !== "") {
    const n = parseFloat(env);
    if (!Number.isNaN(n)) return n;
  }
  return 10.0;
}

export async function GET(request: Request) {
  const config = getConfig();
  const costLimit = getEffectiveCostLimit();
  const deploymentUrlOverride = getDeploymentUrlOverride();
  const effectiveDeploymentUrl = deploymentUrlOverride ?? config?.deploymentUrl ?? "";

  try {
    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
        : new URL(request.url).origin;
    const usageRes = await fetch(`${baseUrl}/api/usage`, { cache: "no-store" });
    const usage = usageRes.ok ? await usageRes.json() : {};
    return NextResponse.json({
      deploymentUrl: effectiveDeploymentUrl,
      deploymentUrlFromEnv: config?.deploymentUrl ?? "",
      assistantId: config?.assistantId ?? "",
      costLimit,
      totalCost: usage.totalCost ?? 0,
      isExceeded: usage.isExceeded ?? false,
    });
  } catch {
    return NextResponse.json({
      deploymentUrl: effectiveDeploymentUrl,
      deploymentUrlFromEnv: config?.deploymentUrl ?? "",
      assistantId: config?.assistantId ?? "",
      costLimit,
      totalCost: 0,
      isExceeded: false,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, costLimit, deploymentUrl } = body ?? {};
    const expectedPin = process.env[ADMIN_PIN_KEY];

    if (!expectedPin) {
      return NextResponse.json(
        { error: "ADMIN_PIN 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (String(pin) !== String(expectedPin)) {
      return NextResponse.json({ error: "PIN이 일치하지 않습니다." }, { status: 401 });
    }

    if (costLimit !== undefined && costLimit !== null) {
      const num = typeof costLimit === "number" ? costLimit : parseFloat(costLimit);
      if (Number.isNaN(num) || num < 0) {
        return NextResponse.json(
          { error: "비용 한도는 0 이상의 숫자여야 합니다." },
          { status: 400 }
        );
      }
      setCostLimitOverride(num);
    }

    if (deploymentUrl !== undefined) {
      const url = typeof deploymentUrl === "string" ? deploymentUrl.trim() : null;
      setDeploymentUrlOverride(url && url.length > 0 ? url : null);
    }

    return NextResponse.json({
      ok: true,
      costLimit: getEffectiveCostLimit(),
      deploymentUrl: getDeploymentUrlOverride() ?? getConfig()?.deploymentUrl ?? "",
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
