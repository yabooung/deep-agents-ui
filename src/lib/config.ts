export interface StandaloneConfig {
  deploymentUrl: string;
  assistantId: string;
  langsmithApiKey?: string;
}

// 주석 처리: localStorage 기반 오버라이드는 서버 메모리 기반으로 변경됨

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

// 환경변수 기반 설정 로드 함수 (서버/클라이언트 공통)
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

/** 클라이언트에서 사용할 설정 (서버 API에서 가져옴) */
export async function getEffectiveConfig(): Promise<StandaloneConfig | null> {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 환경변수만 사용
    return getConfig();
  }
  
  // 클라이언트에서는 API를 통해 서버의 오버라이드 반영된 설정 가져오기
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (!res.ok) {
      return getConfig(); // API 실패 시 환경변수 기본값 사용
    }
    const data = await res.json();
    return {
      deploymentUrl: data.deploymentUrl,
      assistantId: data.assistantId,
      langsmithApiKey: data.langsmithApiKey,
    };
  } catch {
    return getConfig(); // 에러 시 환경변수 기본값 사용
  }
}
