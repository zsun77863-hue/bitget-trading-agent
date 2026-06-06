"use client";
import * as React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { SYMBOLS } from "@/lib/bitget";
import type { PricePoint } from "@/types";
import { TrendingUp, Loader2 } from "lucide-react";

export function PriceChart({ defaultSymbol = "BTCUSDT" }: { defaultSymbol?: string }) {
  const { t } = useI18n();
  const [symbol, setSymbol] = React.useState(defaultSymbol);
  const [data, setData] = React.useState<PricePoint[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/market?symbol=${symbol}&kind=klines`)
      .then((r) => r.json())
      .then((j) => { if (alive) setData(j.data ?? []); })
      .catch(() => alive && setData([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [symbol]);

  const last = data.at(-1)?.price ?? 0;
  const first = data[0]?.price ?? 0;
  const change = first ? ((last - first) / first) * 100 : 0;
  const positive = change >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("priceChart")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-xl sm:text-2xl font-semibold font-mono">{last ? last.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-"}</span>
          <span className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-rose-500"}`}>
            {positive ? "+" : ""}{change.toFixed(2)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px] sm:h-[280px] w-full">
          {loading ? (
            <div className="grid h-full place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })} fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={["auto", "auto"]} fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)} width={48} />
                <Tooltip
                  labelFormatter={(v) => new Date(v as number).toLocaleString()}
                  formatter={(v: any) => [Number(v).toLocaleString(), t("price")]}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#priceFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
