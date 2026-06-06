import { NextRequest, NextResponse } from "next/server";
import { getSpotPrice, getKlines } from "@/lib/bitget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const kind = searchParams.get("kind") || "klines";
  if (kind === "price") {
    const price = await getSpotPrice(symbol);
    return NextResponse.json({ data: { symbol, price } });
  }
  const data = await getKlines(symbol);
  return NextResponse.json({ data });
}
