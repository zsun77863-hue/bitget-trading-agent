"use client";
import * as React from "react";
import { useStrategyStore } from "@/store/strategy-store";
import { useI18n } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Play, ScrollText, BarChart2 } from "lucide-react";
import Link from "next/link";

export function StrategyHistory({ onRerun }: { onRerun?: (prompt: string) => void }) {
  const { t } = useI18n();
  const strategies = useStrategyStore((s) => s.strategies);
  const removeStrategy = useStrategyStore((s) => s.removeStrategy);
  const clearAll = useStrategyStore((s) => s.clearAll);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><ScrollText className="h-4 w-4 text-primary" />{t("history")} ({strategies.length})</CardTitle>
        <div className="flex gap-2">
          <Link href="/dashboard"><Button variant="outline" size="sm" className="gap-1.5"><BarChart2 className="h-4 w-4" />{t("dashboard")}</Button></Link>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={!strategies.length}>{t("deleteAll")}</Button>
        </div>
      </CardHeader>
      <CardContent>
        {strategies.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
        ) : (
          <div className="grid gap-2">
            {strategies.map((s) => (
              <div key={s.id} className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug break-words">{s.prompt}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{new Date(s.createdAt).toLocaleString()}</span>
                      {s.result && <span>• {s.result.executions.length} {t("trades")}</span>}
                      {s.result && s.result.executions[0]?.pnl != null && (
                        <span className={s.result.executions[0].pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                          {s.result.executions[0].pnl >= 0 ? "+" : ""}{s.result.executions[0].pnl.toFixed(2)} {t("pnl")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {onRerun && <Button size="icon" variant="ghost" onClick={() => onRerun(s.prompt)} aria-label={t("rerun")}><Play className="h-4 w-4" /></Button>}
                    <Button size="icon" variant="ghost" onClick={() => removeStrategy(s.id)} aria-label={t("delete")}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
