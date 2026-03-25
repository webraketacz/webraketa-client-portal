import localFont from "next/font/local";

export const nohemi = localFont({
  src: [
    {
      path: "../public/fonts/nohemi/Nohemi-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/nohemi/Nohemi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-nohemi",
  display: "swap",
  preload: true,
  fallback: ["Inter", "system-ui", "Arial", "sans-serif"],
});

export const appFontVariables = nohemi.variable;