"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useQueryState } from "nuqs";
import { getConfig, getEffectiveConfig, StandaloneConfig } from "@/lib/config";
// import { ConfigDialog } from "@/app/components/ConfigDialog"; // 주석 처리: 환경변수 사용으로 제거
import { Button } from "@/components/ui/button";
import { Assistant } from "@langchain/langgraph-sdk";
import { ClientProvider, useClient } from "@/providers/ClientProvider";
import Link from "next/link";
import { SquarePen, Settings } from "lucide-react";
// import { Settings, MessagesSquare } from "lucide-react"; // 주석 처리: Settings 버튼 제거
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
// import { ThreadList } from "@/app/components/ThreadList"; // 주석 처리: 스레드 기록 기능 제거
import { ChatProvider } from "@/providers/ChatProvider";
import { ChatInterface } from "@/app/components/ChatInterface";

interface HomePageInnerProps {
  config: StandaloneConfig;
  // configDialogOpen: boolean; // 주석 처리: ConfigDialog 제거
  // setConfigDialogOpen: (open: boolean) => void; // 주석 처리: ConfigDialog 제거
  // handleSaveConfig: (config: StandaloneConfig) => void; // 주석 처리: ConfigDialog 제거
}

function HomePageInner({ config }: HomePageInnerProps) {
  const client = useClient();
  const [threadId, setThreadId] = useQueryState("threadId");
  // const [sidebar, setSidebar] = useQueryState("sidebar"); // 주석 처리: 스레드 사이드바 제거
  // const [mutateThreads, setMutateThreads] = useState<(() => void) | null>(null); // 주석 처리: 스레드 기능 제거
  // const [interruptCount, setInterruptCount] = useState(0); // 주석 처리: 스레드 기능 제거

  const [assistant, setAssistant] = useState<Assistant | null>(null);

  const fetchAssistant = useCallback(async () => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        config.assistantId
      );

    if (isUUID) {
      // We should try to fetch the assistant directly with this UUID
      try {
        const data = await client.assistants.get(config.assistantId);
        setAssistant(data);
      } catch (error) {
        console.error("Failed to fetch assistant:", error);
        setAssistant({
          assistant_id: config.assistantId,
          graph_id: config.assistantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          config: {},
          metadata: {},
          version: 1,
          name: "Assistant",
          context: {},
        });
      }
    } else {
      try {
        // We should try to list out the assistants for this graph, and then use the default one.
        // TODO: Paginate this search, but 100 should be enough for graph name
        const assistants = await client.assistants.search({
          graphId: config.assistantId,
          limit: 100,
        });
        const defaultAssistant = assistants.find(
          (assistant) => assistant.metadata?.["created_by"] === "system"
        );
        if (defaultAssistant === undefined) {
          throw new Error("No default assistant found");
        }
        setAssistant(defaultAssistant);
      } catch (error) {
        console.error(
          "Failed to find default assistant from graph_id: try setting the assistant_id directly:",
          error
        );
        setAssistant({
          assistant_id: config.assistantId,
          graph_id: config.assistantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          config: {},
          metadata: {},
          version: 1,
          name: config.assistantId,
          context: {},
        });
      }
    }
  }, [client, config.assistantId]);

  useEffect(() => {
    fetchAssistant();
  }, [fetchAssistant]);


  return (
    <>
      {/* 주석 처리: ConfigDialog 제거 - 환경변수 사용으로 변경 */}
      {/* <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={handleSaveConfig}
        initialConfig={config}
      /> */}
      <div className="flex h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">의료 규제 전문가 에이전트</h1>
            {/* 주석 처리: Threads 버튼 제거 - 스레드 기록 기능 제거 */}
            {/* {!sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebar("1")}
                className="rounded-md border border-border bg-card p-3 text-foreground hover:bg-accent"
              >
                <MessagesSquare className="mr-2 h-4 w-4" />
                Threads
                {interruptCount > 0 && (
                  <span className="ml-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                    {interruptCount}
                  </span>
                )}
              </Button>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Assistant:</span>{" "}
              {config.assistantId}
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                관리자
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setThreadId(null)}
              disabled={!threadId}
              className="border-[#2F6868] bg-[#2F6868] text-white hover:bg-[#2F6868]/80"
            >
              <SquarePen className="mr-2 h-4 w-4" />
              New Thread
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="standalone-chat"
          >
            {/* 주석 처리: ThreadList 사이드바 제거 - 스레드 기록 기능 제거 */}
            {/* {sidebar && (
              <>
                <ResizablePanel
                  id="thread-history"
                  order={1}
                  defaultSize={25}
                  minSize={20}
                  className="relative min-w-[380px]"
                >
                  <ThreadList
                    onThreadSelect={async (id) => {
                      await setThreadId(id);
                    }}
                    onMutateReady={(fn) => setMutateThreads(() => fn)}
                    onClose={() => setSidebar(null)}
                    onInterruptCountChange={setInterruptCount}
                  />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )} */}

            <ResizablePanel
              id="chat"
              className="relative flex flex-col"
              order={1}
            >
              <ChatProvider
                activeAssistant={assistant}
                // onHistoryRevalidate={() => mutateThreads?.()} // 주석 처리: 스레드 기능 제거
              >
                <ChatInterface assistant={assistant} />
              </ChatProvider>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
}

function HomePageContent() {
  const [config, setConfig] = useState<StandaloneConfig | null>(null);
  // const [configDialogOpen, setConfigDialogOpen] = useState(false); // 주석 처리: ConfigDialog 제거
  const [assistantId, setAssistantId] = useQueryState("assistantId");

  // Load config from environment variables
  // 주석 처리: 이전 localStorage 기반 설정 로직
  // useEffect(() => {
  //   const savedConfig = getConfig();
  //   if (savedConfig) {
  //     setConfig(savedConfig);
  //     if (!assistantId) {
  //       setAssistantId(savedConfig.assistantId);
  //     }
  //   } else {
  //     setConfigDialogOpen(true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    const loadConfig = async () => {
      const envConfig = getConfig();
      if (envConfig) {
        const effective = await getEffectiveConfig();
        setConfig(effective ?? envConfig);
        if (!assistantId) {
          setAssistantId((effective ?? envConfig).assistantId);
        }
      }
    };
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If config changes, update the assistantId
  useEffect(() => {
    if (config && !assistantId) {
      setAssistantId(config.assistantId);
    }
  }, [config, assistantId, setAssistantId]);

  // 주석 처리: 이전 설정 저장 함수
  // const handleSaveConfig = useCallback((newConfig: StandaloneConfig) => {
  //   saveConfig(newConfig);
  //   setConfig(newConfig);
  // }, []);

  const langsmithApiKey =
    config?.langsmithApiKey || process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || "";

  if (!config) {
    return (
      <>
        {/* 주석 처리: ConfigDialog 제거 - 환경변수 사용으로 변경 */}
        {/* <ConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onSave={handleSaveConfig}
        /> */}
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">의료 규제 전문가 에이전트</h1>
            <p className="mt-2 text-muted-foreground">
              환경변수를 설정해주세요: NEXT_PUBLIC_DEPLOYMENT_URL, NEXT_PUBLIC_ASSISTANT_ID
            </p>
            {/* 주석 처리: ConfigDialog 열기 버튼 제거 */}
            {/* <Button
              onClick={() => setConfigDialogOpen(true)}
              className="mt-4"
            >
              Open Configuration
            </Button> */}
          </div>
        </div>
      </>
    );
  }

  return (
    <ClientProvider
      deploymentUrl={config.deploymentUrl}
      apiKey={langsmithApiKey}
    >
      <HomePageInner config={config} />
      {/* <HomePageInner
        config={config}
        configDialogOpen={configDialogOpen}
        setConfigDialogOpen={setConfigDialogOpen}
        handleSaveConfig={handleSaveConfig}
      /> */}
    </ClientProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
