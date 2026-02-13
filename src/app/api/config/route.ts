import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getDeploymentUrlOverride } from "@/lib/admin-overrides";

export async function GET() {
  const config = getConfig();
  if (!config) {
    return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
  }

  const deploymentUrlOverride = getDeploymentUrlOverride();
  const effectiveDeploymentUrl = deploymentUrlOverride ?? config.deploymentUrl;

  return NextResponse.json({
    deploymentUrl: effectiveDeploymentUrl,
    assistantId: config.assistantId,
    langsmithApiKey: config.langsmithApiKey,
  });
}
