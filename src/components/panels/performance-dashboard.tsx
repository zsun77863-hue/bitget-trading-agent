"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTradeStore } from "@/store/strategy-store";
import { useI18n } from "@/i18n";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { Target, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv } from "@/lib/csv";

function calcMetrics(pnls: number[]) {
  if (!pnls.length) return { winRate: 0, total: 0, maxDD: 0, sharpe: 0 };
  let cum = 0; let peak = 0; let maxDD = 0;
  const equity = pnls.map((p) => (cum += p));
  for (const e of equity) { if (e > peak) peak = e; const dd = peak - e; if (dd > maxDD) maxDD = dd; }
  const wins = pnls.filter((p) => p > 0).length;
  const winRate = wins / pnls.length;
  const total = equity.at(-1) ?? 0;
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const variance = pnls.reduce((a, b) => a + (b - mean) ** 2, 0) / pnls.length;
  const std = Math.sqrt(variance);
  const sharpe = std === 0 ? 0 : (mean / std) * Math.sqrt(252);
  return { winRate, total, maxDD, sharpe };
}

export function PerformanceDashboard() {
  const { t } = useI18n();
  const executions = useTradeStore((s) => s.executions);
  const pnls = executions.map((e) => e.pnl ?? 0).slice().reverse();
  const m = calcMetrics(pnls);
  let cum = 0;
  const equity = pnls.map((p, i) => ({ idx: i + 1, equity: +(cum += p).toFixed(2) }));

  // Bucket trades per day
  const daily = new Map<string, number>();
  executions.forEach((e) => {
    const d = new Date(e.timestamp).toISOString().slice(0, 10);
    daily.set(d, (daily.get(d) ?? 0) + 1);
  });
  const dailyArr = Array.from(daily.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([day, count]) => ({ day: day.slice(5), count }));

  const exportTrades = () => {
    const rows = executions.map((e) => ({
      id: e.id, symbol: e.symbol, side: e.side, qty: e.qty, price: e.price,
      stopLoss: e.stopLoss, takeProfit: e.takeProfit, pnl: e.pnl, mode: e.mode,
      status: e.status, time: new Date(e.timestamp).toISOString(),
    }));
    downloadCsv(`bitget-trades-${Date.now()}.csv`, toCsv(rows));
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Activity className="h-4 w-4 text-primary" />} label={t("winRate")} value={`${(m.winRate * 100).toFixed(1)}%`} />
        <Stat icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} label={t("totalPnl")} value={`${m.total >= 0 ? "+" : ""}${m.total.toFixed(2)}`} tone={m.total >= 0 ? "good" : "bad"} />
        <Stat icon={<TrendingDown className="h-4 w-4 text-rose-500" />} label={t("maxDrawdown")} value={`-${m.maxDD.toFixed(2)}`} tone="bad" />
        <Stat icon={<Target className="h-4 w-4 text-primary" />} label={t("sharpe")} value={m.sharpe.toFixed(2)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">{t("equityCurve")}</CardTitle>
          <Button variant="outline" size="sm" onClick={exportTrades} disabled={!executions.length}>{t("exportCsv")}</Button>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="idx" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" width={48} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{t("tradesPerDay")}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyArr} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" width={32} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
        <div className={`mt-1 text-lg sm:text-xl font-semibold font-mono ${tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-rose-500" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
