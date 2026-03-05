import "./globals.css";
import Script from "next/script";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "Klientská zóna | Webraketa.cz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className="dark">
      <head>
        {/* Iconify web component (kvůli <iconify-icon />) */}
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className={`${inter.className} text-zinc-400 min-h-screen relative overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200`}
      >
        {children}
      </body>
    </html>
  );
}
