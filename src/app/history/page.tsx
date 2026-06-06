"use client";
import * as React from "react";
import { StrategyHistory } from "@/components/panels/strategy-history";
import { ChatPanel } from "@/components/panels/chat-panel";

export default function HistoryPage() {
  const [prompt, setPrompt] = React.useState<string | undefined>(undefined);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <ChatPanel initialPrompt={prompt} />
      <StrategyHistory onRerun={(p) => setPrompt(p)} />
    </div>
  );
}
