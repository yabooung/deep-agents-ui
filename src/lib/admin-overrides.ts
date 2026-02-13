/**
 * 서버 메모리 상의 관리자 설정 오버라이드 (재시작 시 초기화됨)
 */
let costLimitOverride: number | null = null;
let deploymentUrlOverride: string | null = null;

export function getCostLimitOverride(): number | null {
  return costLimitOverride;
}

export function setCostLimitOverride(value: number | null): void {
  costLimitOverride = value;
}

export function getDeploymentUrlOverride(): string | null {
  return deploymentUrlOverride;
}

export function setDeploymentUrlOverride(value: string | null): void {
  deploymentUrlOverride = value;
}
