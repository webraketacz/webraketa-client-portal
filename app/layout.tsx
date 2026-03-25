import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { appFontVariables } from "./fonts";

export const metadata: Metadata = {
  title: "Zyvia | AI Web Builder",
  description: "Prémiový AI builder pro generování moderních webů.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="cs"
      className={`dark ${appFontVariables}`}
      data-theme-preset="saas-dark"
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>

      <body className="min-h-screen overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-violet-500/30 selection:text-violet-100 antialiased">
        {children}
      </body>
    </html>
  );
}