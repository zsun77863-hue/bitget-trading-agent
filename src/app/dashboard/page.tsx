"use client";
import { PerformanceDashboard } from "@/components/panels/performance-dashboard";
import { PriceChart } from "@/components/panels/price-chart";
import { AssetOverview } from "@/components/panels/asset-overview";
import { useSettingsStore } from "@/store/settings-store";
import { useI18n } from "@/i18n";

export default function DashboardPage() {
  const defaultSymbol = useSettingsStore((s) => s.defaultSymbol);
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <h1 className="text-xl sm:text-2xl font-semibold">{t("perfDashboard")}</h1>
      <AssetOverview />
      <div className="grid gap-4 lg:grid-cols-2">
        <PriceChart defaultSymbol={defaultSymbol} />
        <PriceChart defaultSymbol={defaultSymbol === "ETHUSDT" ? "BTCUSDT" : "ETHUSDT"} />
      </div>
      <PerformanceDashboard />
    </div>
  );
}
