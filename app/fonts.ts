import {
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Manrope,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";

const fontUi = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const fontTechBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tech-body",
  display: "swap",
});

const fontTrustBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-trust-body",
  display: "swap",
});

const fontSoftBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-soft-body",
  display: "swap",
});

const fontCommerceBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-commerce-body",
  display: "swap",
});

const fontDisplayEditorial = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-editorial",
  display: "swap",
});

const fontDisplayLuxury = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-luxury",
  display: "swap",
});

const fontDisplayContrast = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-contrast",
  display: "swap",
});

export const appFontVariables = [
  fontUi.variable,
  fontTechBody.variable,
  fontTrustBody.variable,
  fontSoftBody.variable,
  fontCommerceBody.variable,
  fontDisplayEditorial.variable,
  fontDisplayLuxury.variable,
  fontDisplayContrast.variable,
].join(" ");