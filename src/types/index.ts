export type Lang = "en" | "zh";

export interface Strategy {
  id: string;
  prompt: string;
  createdAt: number;
  result?: StrategyResult;
}

export interface SkillOutput {
  skill: string;
  title: string;
  summary: string;
  data: Record<string, any>;
  signal?: "bullish" | "bearish" | "neutral";
  confidence?: number; // 0-1
}

export interface DecisionStep {
  step: number;
  title: string;
  reasoning: string;
}

export interface ExecutionRecord {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  timestamp: number;
  mode: "simulated" | "live";
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  status: "filled" | "pending" | "cancelled";
}

export interface StrategyResult {
  perception: SkillOutput[];
  decisions: DecisionStep[];
  executions: ExecutionRecord[];
  riskNotes: string[];
  finalSummary: string;
}

export interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  unrealizedPnl: number;
}

export interface PricePoint {
  time: number;
  price: number;
  volume?: number;
}
