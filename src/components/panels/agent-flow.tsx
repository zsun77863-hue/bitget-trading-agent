"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StrategyResult } from "@/types";
import { useI18n } from "@/i18n";
import { Activity, Brain, ListChecks, ShieldAlert, CheckCircle2 } from "lucide-react";

function SignalBadge({ s }: { s?: "bullish" | "bearish" | "neutral" }) {
  const { t } = useI18n();
  const map: Record<string, { label: string; cls: string }> = {
    bullish: { label: t("signalBullish"), cls: "bg-emerald-600 text-white" },
    bearish: { label: t("signalBearish"), cls: "bg-rose-600 text-white" },
    neutral: { label: t("signalNeutral"), cls: "bg-slate-500 text-white" },
  };
  const v = map[s ?? "neutral"];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.cls}`}>{v.label}</span>;
}

export function AgentFlow({ result }: { result: StrategyResult }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      {/* Perception */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />{t("perception")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {result.perception.map((p) => (
            <div key={p.skill} className="rounded-md border bg-muted/30 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{p.title}</div>
                <SignalBadge s={p.signal} />
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">{p.summary}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {t("confidence")}: <span className="font-mono">{((p.confidence ?? 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Decisions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-primary" />{t("analysis")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.decisions.map((d) => (
            <div key={d.step} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{d.step}</div>
              <div>
                <div className="font-medium text-sm">{d.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{d.reasoning}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Executions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><ListChecks className="h-4 w-4 text-primary" />{t("execution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="py-1 pr-2">{t("symbol")}</th>
                  <th className="py-1 pr-2">{t("side")}</th>
                  <th className="py-1 pr-2">{t("qty")}</th>
                  <th className="py-1 pr-2">{t("price")}</th>
                  <th className="py-1 pr-2">SL</th>
                  <th className="py-1 pr-2">TP</th>
                  <th className="py-1 pr-2">{t("pnl")}</th>
                </tr>
              </thead>
              <tbody>
                {result.executions.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-1.5 pr-2 font-medium">{e.symbol}</td>
                    <td className="py-1.5 pr-2">
                      <Badge variant={e.side === "buy" ? "success" : "destructive"}>{e.side.toUpperCase()}</Badge>
                    </td>
                    <td className="py-1.5 pr-2 font-mono">{e.qty}</td>
                    <td className="py-1.5 pr-2 font-mono">{e.price}</td>
                    <td className="py-1.5 pr-2 font-mono text-rose-500">{e.stopLoss}</td>
                    <td className="py-1.5 pr-2 font-mono text-emerald-500">{e.takeProfit}</td>
                    <td className={`py-1.5 pr-2 font-mono ${e.pnl != null && e.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {e.pnl?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risk */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4 text-amber-500" />{t("risk")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {result.riskNotes.map((r, i) => (
              <li key={i} className="flex gap-2"><span className="text-amber-500">•</span><span className="text-muted-foreground">{r}</span></li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Final */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="h-4 w-4 text-primary" />{t("finalSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{result.finalSummary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
