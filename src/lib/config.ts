export interface StandaloneConfig {
  deploymentUrl: string;
  assistantId: string;
  langsmithApiKey?: string;
}

// 주석 처리: 이전 localStorage 기반 설정 저장/로드 함수
// const CONFIG_KEY = "deep-agent-config";
//
// export function getConfig(): StandaloneConfig | null {
//   if (typeof window === "undefined") return null;
//
//   const stored = localStorage.getItem(CONFIG_KEY);
//   if (!stored) return null;
//
//   try {
//     return JSON.parse(stored);
//   } catch {
//     return null;
//   }
// }
//
// export function saveConfig(config: StandaloneConfig): void {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
// }

// 환경변수 기반 설정 로드 함수
export function getConfig(): StandaloneConfig | null {
  const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
  const langsmithApiKey = process.env.NEXT_PUBLIC_LANGSMITH_API_KEY;

  if (!deploymentUrl || !assistantId) {
    return null;
  }

  return {
    deploymentUrl,
    assistantId,
    langsmithApiKey,
  };
}
