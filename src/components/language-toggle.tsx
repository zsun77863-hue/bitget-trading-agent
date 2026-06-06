"use client";
import { Globe } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      aria-label="Toggle language"
      className="gap-1.5"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium uppercase">{lang === "en" ? "EN" : "中"}</span>
    </Button>
  );
}
