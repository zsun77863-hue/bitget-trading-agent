import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Bitget Trading Agent",
  description: "Natural-language crypto trading agent powered by Bitget Agent Hub.",
  manifest: "/manifest.json",
  applicationName: "Bitget Trading Agent",
  appleWebApp: { capable: true, title: "Bitget Agent", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 pb-24 pt-4 sm:pt-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
