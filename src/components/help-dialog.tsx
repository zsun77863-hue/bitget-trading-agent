"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export function HelpDialog() {
  const { t } = useI18n();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5"><HelpCircle className="h-4 w-4" />{t("help")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("help")}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{t("helpContent")}</div>
        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
          <li>Bitget Agent Hub: <a className="underline" href="https://github.com/Bitget-AI/agent_hub" target="_blank" rel="noreferrer">github.com/Bitget-AI/agent_hub</a></li>
          <li>Skill Hub: macro-analyst, sentiment-analyst, technical-analysis, news-briefing, market-intel</li>
          <li>Configure API keys in <code>.env.local</code> or under Settings.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
