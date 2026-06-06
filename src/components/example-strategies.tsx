"use client";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const EXAMPLES: { en: string; zh: string }[] = [
  { en: "Buy 500 USDT of BTC if RSI < 35 and ETF inflows are positive. TP 6%, SL 2%.",
    zh: "如果 BTC 的 RSI 低于 35 且 ETF 资金净流入为正，则买入 500 USDT，止盈 6%，止损 2%。" },
  { en: "Short 300 USDT of ETH when funding rate > 0.05% and sentiment turns bearish.",
    zh: "当 ETH 资金费率 > 0.05% 且情绪转空时，做空 300 USDT。" },
  { en: "Grid trade SOL between $130 and $160 with 10 levels, 200 USDT each.",
    zh: "在 130-160 美元区间网格交易 SOL，10 个网格，每个 200 USDT。" },
  { en: "DCA into BTC weekly, 100 USDT, pause if macro is risk-off.",
    zh: "每周定投 BTC 100 USDT，若宏观转为风险厌恶则暂停。" },
  { en: "Long BNB momentum breakout above 600 with 1000 USDT, trailing stop 3%.",
    zh: "当 BNB 突破 600 时做多 1000 USDT，移动止损 3%。" },
  { en: "Mean reversion on XRP: buy at -5% drop on 1H, sell at +3% rebound.",
    zh: "XRP 均值回归：1 小时下跌 5% 买入，反弹 3% 卖出。" },
];

export function ExampleStrategies({ onPick }: { onPick: (text: string) => void }) {
  const { lang, t } = useI18n();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>{t("examples")}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => {
          const text = lang === "zh" ? ex.zh : ex.en;
          return (
            <Button key={i} variant="outline" size="sm"
              className="h-auto py-1.5 text-xs whitespace-normal text-left leading-snug max-w-full"
              onClick={() => onPick(text)}>
              {text}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
