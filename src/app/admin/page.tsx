"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_VERIFIED_KEY = "admin_verified";
const ADMIN_PIN_KEY = "admin_pin";

interface SettingsData {
  deploymentUrl: string;
  assistantId: string;
  costLimit: number;
  totalCost: number;
  isExceeded: boolean;
}

export default function AdminPage() {
  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [costLimit, setCostLimit] = useState("");
  const [saveMessage, setSaveMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const v = typeof window !== "undefined" && sessionStorage.getItem(ADMIN_VERIFIED_KEY) === "1";
    setVerified(v);
    if (v) {
      const storedPin = sessionStorage.getItem(ADMIN_PIN_KEY);
      if (storedPin) setPin(storedPin);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "설정 조회 실패");
      setSettings(data);
      setDeploymentUrl(data.deploymentUrl ?? "");
      setCostLimit(String(data.costLimit ?? ""));
    } catch (e: any) {
      setSettings({ deploymentUrl: "", assistantId: "", costLimit: 0, totalCost: 0, isExceeded: false });
      setDeploymentUrl("");
      setCostLimit("");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (verified) loadSettings();
  }, [verified, loadSettings]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || "PIN이 올바르지 않습니다.");
        return;
      }
      sessionStorage.setItem(ADMIN_VERIFIED_KEY, "1");
      sessionStorage.setItem(ADMIN_PIN_KEY, pin);
      setVerified(true);
    } catch {
      setVerifyError("연결 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCostLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    const num = parseFloat(costLimit);
    if (Number.isNaN(num) || num < 0) {
      setSaveMessage({ type: "error", text: "비용 한도는 0 이상의 숫자여야 합니다." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, costLimit: num }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: "error", text: data.error || "저장 실패" });
        return;
      }
      setSaveMessage({ type: "ok", text: "비용 한도가 저장되었습니다. (서버 재시작 시 환경변수로 초기화됨)" });
      loadSettings();
    } catch {
      setSaveMessage({ type: "error", text: "연결 오류" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeploymentUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, deploymentUrl: deploymentUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: "error", text: data.error || "저장 실패" });
        return;
      }
      setSaveMessage({ type: "ok", text: "LangGraph 서버 주소가 저장되었습니다. (서버 재시작 시 환경변수로 초기화됨)" });
      loadSettings();
    } catch {
      setSaveMessage({ type: "error", text: "연결 오류" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
    sessionStorage.removeItem(ADMIN_PIN_KEY);
    setVerified(false);
    setPin("");
  };

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>관리자 로그인</CardTitle>
            <CardDescription>PIN을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="비밀번호"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
              {verifyError && (
                <p className="text-sm text-destructive">{verifyError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "확인 중..." : "입장"}
              </Button>
            </form>
            <p className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                ← 채팅으로 돌아가기
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">환경 설정</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">채팅으로</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>

        {saveMessage && (
          <p className={saveMessage.type === "ok" ? "text-sm text-green-600" : "text-sm text-destructive"}>
            {saveMessage.text}
          </p>
        )}

        {settingsLoading ? (
          <p className="text-muted-foreground">로딩 중...</p>
        ) : (
          <>
            {/* 비용 한도 조회 및 수정 */}
            <Card>
              <CardHeader>
                <CardTitle>비용 한도 (토큰/사용량)</CardTitle>
                <CardDescription>
                  현재 사용 비용과 일일 비용 한도를 조회·수정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings && (
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">현재 사용 비용: </span>
                    <span className={settings.isExceeded ? "font-medium text-destructive" : "font-medium"}>
                      ${settings.totalCost.toFixed(4)}
                    </span>
                    {settings.isExceeded && " (한도 초과)"}
                    <br />
                    <span className="text-muted-foreground">적용 한도: </span>
                    <span className="font-medium">${settings.costLimit}</span>
                  </div>
                )}
                <form onSubmit={handleSaveCostLimit} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="costLimit">비용 한도 ($)</Label>
                    <Input
                      id="costLimit"
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="예: 10"
                      value={costLimit}
                      onChange={(e) => setCostLimit(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "저장 중..." : "한도 적용"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* LangGraph 서버 주소 */}
            <Card>
              <CardHeader>
                <CardTitle>LangGraph 서버 연결 주소</CardTitle>
                <CardDescription>
                  기본값은 환경변수 NEXT_PUBLIC_DEPLOYMENT_URL입니다. 변경 시 전체 프론트엔드에 적용됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSaveDeploymentUrl} className="space-y-2">
                  <Label htmlFor="deploymentUrl">Deployment URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="deploymentUrl"
                      type="url"
                      placeholder="https://..."
                      value={deploymentUrl}
                      onChange={(e) => setDeploymentUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "저장 중..." : "주소 저장"}
                    </Button>
                  </div>
                </form>
                {settings?.deploymentUrlFromEnv && settings.deploymentUrlFromEnv !== settings.deploymentUrl && (
                  <p className="text-xs text-muted-foreground">
                    환경변수 기본값: {settings.deploymentUrlFromEnv}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
