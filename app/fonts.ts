import { Fraunces, Inter, Manrope, Playfair_Display } from "next/font/google";

export const fontUi = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const fontBody = Manrope({
  subsets: ["latin"],
  variable: "--font-body-sans",
  display: "swap",
});

export const fontDisplaySerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-serif",
  display: "swap",
});

export const fontDisplayEditorial = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display-editorial",
  display: "swap",
});

export const appFontVariables = [
  fontUi.variable,
  fontBody.variable,
  fontDisplaySerif.variable,
  fontDisplayEditorial.variable,
].join(" ");