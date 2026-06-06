"use client";
import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/store/settings-store";
import { useI18n } from "@/i18n";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ModeSwitch() {
  const { mode, setMode } = useSettingsStore();
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleChange = (val: boolean) => {
    if (val) setConfirmOpen(true);
    else setMode("simulated");
  };

  return (
    <>
      <div className="inline-flex items-center gap-2 rounded-md border bg-background/60 px-2 py-1">
        <Label htmlFor="mode-switch" className="text-xs sm:text-sm text-muted-foreground">
          {t("mode")}
        </Label>
        <span className={`text-xs sm:text-sm font-medium ${mode === "simulated" ? "text-emerald-500" : "text-amber-500"}`}>
          {mode === "simulated" ? t("simulated") : t("live")}
        </span>
        <Switch id="mode-switch" checked={mode === "live"} onCheckedChange={handleChange} />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />{t("live")}</DialogTitle>
            <DialogDescription>{t("liveWarning")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={() => { setMode("live"); setConfirmOpen(false); }}>{t("confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
