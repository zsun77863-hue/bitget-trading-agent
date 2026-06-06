"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import { useSettingsStore } from "@/store/settings-store";
import { useStrategyStore, useTradeStore } from "@/store/strategy-store";
import { ExampleStrategies } from "@/components/example-strategies";
import { AgentFlow } from "@/components/panels/agent-flow";
import { HelpDialog } from "@/components/help-dialog";
import { useToast } from "@/lib/use-toast";
import type { Strategy, StrategyResult } from "@/types";
import { shortId } from "@/lib/utils";
import { KeyRound, Send, Loader2, Bot } from "lucide-react";

export function ChatPanel({ initialPrompt }: { initialPrompt?: string }) {
  const { t } = useI18n();
  const { mode, playbookApiKey, setPlaybookApiKey } = useSettingsStore();
  const addStrategy = useStrategyStore((s) => s.addStrategy);
  const updateStrategy = useStrategyStore((s) => s.updateStrategy);
  const addExecution = useTradeStore((s) => s.addExecution);
  const { toast } = useToast();

  const [prompt, setPrompt] = React.useState(initialPrompt ?? "");
  const [keyInput, setKeyInput] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<StrategyResult | null>(null);

  React.useEffect(() => { if (initialPrompt) setPrompt(initialPrompt); }, [initialPrompt]);
  React.useEffect(() => { setKeyInput(playbookApiKey); }, [playbookApiKey]);

  const run = async () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setResult(null);
    const id = shortId();
    const s: Strategy = { id, prompt, createdAt: Date.now() };
    addStrategy(s);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode, apiKey: playbookApiKey || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "failed");
      const data = json.data as StrategyResult;
      setResult(data);
      updateStrategy(id, { result: data });
      data.executions.forEach(addExecution);
      toast({ title: t("runComplete"), description: data.finalSummary });
    } catch (e: any) {
      toast({ title: t("runFailed"), description: String(e?.message || e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const saveKey = () => {
    setPlaybookApiKey(keyInput.trim());
    toast({ title: t("keySaved") });
  };

  return (
    <div className="grid gap-4">
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> {t("appName")}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>
            </div>
            <HelpDialog />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="min-h-[120px] resize-y text-sm"
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
          />

          <ExampleStrategies onPick={(text) => setPrompt(text)} />

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="key" className="mb-1.5 inline-flex items-center gap-1.5 text-xs">
                <KeyRound className="h-3.5 w-3.5" /> {t("apiKey")}
              </Label>
              <div className="flex gap-2">
                <Input id="key" type="password" value={keyInput} placeholder={t("enterApiKey")}
                       onChange={(e) => setKeyInput(e.target.value)} className="font-mono text-xs" />
                <Button variant="outline" onClick={saveKey}>{t("saveKey")}</Button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{t("apiKeyHelp")}</p>
            </div>
            <Button onClick={run} disabled={running || !prompt.trim()} size="lg" className="min-w-[140px]">
              {running ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("running")}</> : <><Send className="h-4 w-4" /> {t("sendStrategy")}</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && <AgentFlow result={result} />}
    </div>
  );
}
