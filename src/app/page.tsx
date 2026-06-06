"use client";
import * as React from "react";
import { ChatPanel } from "@/components/panels/chat-panel";
import { PriceChart } from "@/components/panels/price-chart";
import { StrategyHistory } from "@/components/panels/strategy-history";
import { AssetOverview } from "@/components/panels/asset-overview";
import { useSettingsStore } from "@/store/settings-store";

export default function HomePage() {
  const [prompt, setPrompt] = React.useState<string | undefined>(undefined);
  const defaultSymbol = useSettingsStore((s) => s.defaultSymbol);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4 min-w-0">
        <ChatPanel initialPrompt={prompt} />
        <AssetOverview />
      </div>
      <div className="grid gap-4 min-w-0">
        <PriceChart defaultSymbol={defaultSymbol} />
        <StrategyHistory onRerun={(p) => setPrompt(p)} />
      </div>
    </div>
  );
}
