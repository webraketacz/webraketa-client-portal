import { Fraunces, Inter, Manrope, Playfair_Display } from "next/font/google";

const fontUi = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const fontBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-sans",
  display: "swap",
});

const fontDisplaySerif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-serif",
  display: "swap",
});

const fontDisplayEditorial = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-editorial",
  display: "swap",
});

export const appFontVariables = [
  fontUi.variable,
  fontBody.variable,
  fontDisplaySerif.variable,
  fontDisplayEditorial.variable,
].join(" ");