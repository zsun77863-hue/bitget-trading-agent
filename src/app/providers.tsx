"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { I18nProvider } from "@/i18n";
import { Toaster } from "@/components/ui/toaster";
import { RegisterSW } from "@/components/register-sw";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        {children}
        <Toaster />
        <RegisterSW />
      </I18nProvider>
    </NextThemesProvider>
  );
}
