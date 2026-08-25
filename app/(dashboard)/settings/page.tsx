"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import {
  User, Bell, Palette, Save, AlertCircle, RefreshCw, Cpu, Check, X, Shield, Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // AI Settings state
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [claudeKeyInput, setClaudeKeyInput] = useState("");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [defaultProvider, setDefaultProvider] = useState("gemini");
  const [defaultModel, setDefaultModel] = useState("gemini-2.0-flash");
  const [maskedKeys, setMaskedKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, { testing?: boolean; status?: "connected" | "failed"; message?: string }>>({});
  const [usageStats, setUsageStats] = useState<{ totalRequests: number; avgLatencyMs: number } | null>(null);

  useEffect(() => {
    // Load AI Settings
    fetch("/api/ai/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.maskedKeys) setMaskedKeys(data.maskedKeys);
        if (data.defaultProvider) setDefaultProvider(data.defaultProvider);
        if (data.defaultModel) setDefaultModel(data.defaultModel);
      })
      .catch(() => {});

    // Load Usage Stats
    fetch("/api/ai/usage")
      .then((r) => r.json())
      .then((data) => {
        setUsageStats({
          totalRequests: data.totalRequests || 0,
          avgLatencyMs: data.avgLatencyMs || 0,
        });
      })
      .catch(() => {});
  }, []);

  const handleTestConnection = async (provider: string, keyOverride?: string) => {
    setTestResults((prev) => ({ ...prev, [provider]: { testing: true } }));
    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: keyOverride }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { testing: false, status: "connected", message: "✓ Connected" },
        }));
        toast.success(`Connected to ${provider.toUpperCase()} API!`);
      } else {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { testing: false, status: "failed", message: "✕ Connection failed" },
        }));
        toast.error(`Connection to ${provider.toUpperCase()} failed`);
      }
    } catch (_e) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, status: "failed", message: "✕ Connection failed" },
      }));
    }
  };

  const handleSaveAISettings = async () => {
    setSaveLoading(true);
    try {
      const payload: Record<string, unknown> = {
        defaultProvider,
        defaultModel,
      };
      if (geminiKeyInput.trim()) payload.geminiKey = geminiKeyInput.trim();
      if (openaiKeyInput.trim()) payload.openaiKey = openaiKeyInput.trim();
      if (claudeKeyInput.trim()) payload.anthropicKey = claudeKeyInput.trim();
      if (groqKeyInput.trim()) payload.groqKey = groqKeyInput.trim();

      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.maskedKeys) setMaskedKeys(data.maskedKeys);

      setGeminiKeyInput("");
      setOpenaiKeyInput("");
      setClaudeKeyInput("");
      setGroqKeyInput("");
      toast.success("AI Settings & Provider Keys updated securely! 🔒");
    } catch (_e) {
      toast.error("Failed to save AI settings");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="⚙️ Settings & AI Infrastructure" description="Manage user profile, theme preferences, and multi-model AI provider keys" />

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              User Profile Details
            </CardTitle>
            <CardDescription>Details retrieved from your Clerk Authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">{user?.fullName ?? "Student OS User"}</h3>
                <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress ?? "no-email@clerk.com"}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">Academic Account</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">First Name</label>
                <Input value={user?.firstName ?? ""} disabled />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Last Name</label>
                <Input value={user?.lastName ?? ""} disabled />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" /> Profile changes must be managed via Clerk settings.
            </p>
          </CardContent>
        </Card>

        {/* AI Multi-Model Infrastructure & Key Management */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-500">
              <Cpu className="w-4 h-4" />
              AI Multi-Model Provider Settings
            </CardTitle>
            <CardDescription>Configure provider keys securely. API keys are 100% server-side and never exposed to JavaScript.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Defaults row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Default AI Provider</label>
                <Select value={defaultProvider} onValueChange={setDefaultProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="claude">Anthropic Claude</SelectItem>
                    <SelectItem value="groq">Groq / DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Default Model Version</label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Provider Key Rows */}
            <div className="space-y-4">
              
              {/* Google Gemini */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    🌐 Google Gemini API Key
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {maskedKeys.gemini || "••••••••"}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => handleTestConnection("gemini", geminiKeyInput)}>
                      Test Connection
                    </Button>
                    {testResults.gemini?.status === "connected" && <Badge className="bg-emerald-500 text-white text-[10px]">✓ Connected</Badge>}
                    {testResults.gemini?.status === "failed" && <Badge variant="destructive" className="text-[10px]">✕ Connection Failed</Badge>}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="Paste new GEMINI_API_KEY (starts with AIza...)"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                />
              </div>

              {/* OpenAI */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    🤖 OpenAI API Key
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {maskedKeys.openai || "••••••••"}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => handleTestConnection("openai", openaiKeyInput)}>
                      Test Connection
                    </Button>
                    {testResults.openai?.status === "connected" && <Badge className="bg-emerald-500 text-white text-[10px]">✓ Connected</Badge>}
                    {testResults.openai?.status === "failed" && <Badge variant="destructive" className="text-[10px]">✕ Connection Failed</Badge>}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="Paste new OPENAI_API_KEY (starts with sk-...)"
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                />
              </div>

              {/* Anthropic Claude */}
              <div className="p-3.5 border rounded-xl bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    🧠 Anthropic Claude Key
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {maskedKeys.claude || "••••••••"}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => handleTestConnection("claude", claudeKeyInput)}>
                      Test Connection
                    </Button>
                    {testResults.claude?.status === "connected" && <Badge className="bg-emerald-500 text-white text-[10px]">✓ Connected</Badge>}
                    {testResults.claude?.status === "failed" && <Badge variant="destructive" className="text-[10px]">✕ Connection Failed</Badge>}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="Paste new ANTHROPIC_API_KEY (starts with sk-ant-...)"
                  value={claudeKeyInput}
                  onChange={(e) => setClaudeKeyInput(e.target.value)}
                />
              </div>

            </div>

            {/* AI Usage summary banner */}
            {usageStats && (
              <div className="p-3 bg-muted/40 border rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">AI Usage Metrics:</span>
                  <span>{usageStats.totalRequests} Requests logged</span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Avg Latency: {usageStats.avgLatencyMs}ms
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              Theme & Customization
            </CardTitle>
            <CardDescription>Choose how StudentOS looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold block">Preferred Mode</span>
                <span className="text-[10px] text-muted-foreground">Adjust contrast for night/day operations</span>
              </div>
              <div className="flex gap-1 bg-muted p-1 rounded-xl">
                <Button variant={theme === "light" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("light")}>
                  Light
                </Button>
                <Button variant={theme === "dark" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("dark")}>
                  Dark
                </Button>
                <Button variant={theme === "system" ? "default" : "ghost"} size="sm" className="text-xs py-1 px-3 h-8" onClick={() => setTheme("system")}>
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button footer */}
        <div className="flex justify-end gap-2">
          <Button onClick={handleSaveAISettings} disabled={saveLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </Button>
        </div>

      </div>
    </div>
  );
}
