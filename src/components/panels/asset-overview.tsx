"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTradeStore } from "@/store/strategy-store";
import { useI18n } from "@/i18n";
import { Wallet, Layers } from "lucide-react";

export function AssetOverview() {
  const { t } = useI18n();
  const balance = useTradeStore((s) => s.balance);
  const executions = useTradeStore((s) => s.executions);

  // Synthesize a positions snapshot from recent executions (long-only mark-to-last).
  const positions = React.useMemo(() => {
    const map = new Map<string, { qty: number; cost: number }>();
    executions.slice().reverse().forEach((e) => {
      const cur = map.get(e.symbol) ?? { qty: 0, cost: 0 };
      const dir = e.side === "buy" ? 1 : -1;
      cur.qty += dir * e.qty;
      cur.cost += dir * e.qty * e.price;
      map.set(e.symbol, cur);
    });
    return Array.from(map.entries())
      .filter(([, v]) => Math.abs(v.qty) > 1e-8)
      .map(([symbol, v]) => ({
        symbol,
        qty: +v.qty.toFixed(6),
        avgPrice: +(v.cost / (v.qty || 1)).toFixed(4),
      }));
  }, [executions]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4 text-primary" />{t("balance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold font-mono">{balance.toLocaleString()} <span className="text-base text-muted-foreground">USDT</span></div>
          <p className="mt-1 text-xs text-muted-foreground">Demo sub-account balance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Layers className="h-4 w-4 text-primary" />{t("positions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-1">{t("symbol")}</th>
                    <th className="py-1">{t("qty")}</th>
                    <th className="py-1">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.symbol} className="border-t">
                      <td className="py-1.5 font-medium">{p.symbol}</td>
                      <td className={`py-1.5 font-mono ${p.qty >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{p.qty}</td>
                      <td className="py-1.5 font-mono">{p.avgPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
