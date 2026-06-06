"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { useI18n } from "@/i18n";
import { SYMBOLS } from "@/lib/bitget";
import { useToast } from "@/lib/use-toast";
import { ModeSwitch } from "@/components/mode-switch";
import { useTradeStore } from "@/store/strategy-store";
import { KeyRound, RotateCcw, Github } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const { playbookApiKey, setPlaybookApiKey, defaultSymbol, setDefaultSymbol } = useSettingsStore();
  const clearTrades = useTradeStore((s) => s.clear);
  const { toast } = useToast();
  const [key, setKey] = React.useState(playbookApiKey);
  React.useEffect(() => setKey(playbookApiKey), [playbookApiKey]);

  return (
    <div className="grid gap-4 max-w-2xl">
      <Card>
        <CardHeader><CardTitle className="text-base">{t("settings")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 inline-flex items-center gap-1.5 text-xs"><KeyRound className="h-3.5 w-3.5" />{t("apiKey")}</Label>
            <div className="flex gap-2">
              <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="font-mono text-xs" />
              <Button onClick={() => { setPlaybookApiKey(key.trim()); toast({ title: t("keySaved") }); }}>{t("saveKey")}</Button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("apiKeyHelp")}</p>
          </div>

          <div>
            <Label className="mb-1.5 text-xs">{t("selectSymbol")}</Label>
            <Select value={defaultSymbol} onValueChange={setDefaultSymbol}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 text-xs">{t("mode")}</Label>
            <ModeSwitch />
          </div>

          <div className="pt-2 border-t">
            <Button variant="outline" onClick={() => { clearTrades(); toast({ title: "Reset" }); }} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />Reset demo balance & trades
            </Button>
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            <a href="https://github.com/Bitget-AI/agent_hub" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
              <Github className="h-3.5 w-3.5" /> Bitget Agent Hub
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
