"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BarChart3, MessageSquare, History, Settings, Menu, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeSwitch } from "@/components/mode-switch";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function Nav() {
  const { t } = useI18n();
  const path = usePathname();
  const [open, setOpen] = React.useState(false);

  const items = [
    { href: "/", label: t("chat"), icon: MessageSquare },
    { href: "/dashboard", label: t("dashboard"), icon: BarChart3 },
    { href: "/history", label: t("history"), icon: History },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline gradient-text">{t("appName")}</span>
        </Link>

        <nav className="ml-2 hidden md:flex items-center gap-1">
          {items.map((it) => {
            const active = path === it.href;
            return (
              <Link key={it.href} href={it.href}
                className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                <it.icon className="h-4 w-4" />{it.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden sm:block"><ModeSwitch /></div>
          <LanguageToggle />
          <ThemeToggle />
          <a href="https://github.com/Bitget-AI/agent_hub" target="_blank" rel="noreferrer"
             className="hidden md:inline-flex h-9 items-center justify-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
            <Github className="h-4 w-4" />
          </a>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-7xl px-3 py-2 flex flex-col gap-1">
            {items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  path === it.href ? "bg-secondary" : "hover:bg-accent")}>
                <it.icon className="h-4 w-4" />{it.label}
              </Link>
            ))}
            <div className="pt-2"><ModeSwitch /></div>
          </div>
        </div>
      )}
    </header>
  );
}
