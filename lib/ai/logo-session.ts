export type BrandLogoAsset = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export const AI_WEBGEN_LOGO_KEY = "ai_webgen_brand_logo";

export function saveBrandLogoToSession(logo: BrandLogoAsset | null) {
  if (typeof window === "undefined") return;

  if (!logo) {
    sessionStorage.removeItem(AI_WEBGEN_LOGO_KEY);
    return;
  }

  sessionStorage.setItem(AI_WEBGEN_LOGO_KEY, JSON.stringify(logo));
}

export function loadBrandLogoFromSession(): BrandLogoAsset | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(AI_WEBGEN_LOGO_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BrandLogoAsset;

    if (
      !parsed ||
      typeof parsed.name !== "string" ||
      typeof parsed.mimeType !== "string" ||
      typeof parsed.dataUrl !== "string" ||
      !parsed.dataUrl.startsWith("data:image/")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearBrandLogoFromSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AI_WEBGEN_LOGO_KEY);
}

export function fileToBrandLogoAsset(file: File): Promise<BrandLogoAsset> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Soubor není obrázek."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl.startsWith("data:image/")) {
        reject(new Error("Soubor se nepodařilo převést na data URL."));
        return;
      }

      resolve({
        name: file.name,
        mimeType: file.type || "image/png",
        dataUrl,
      });
    };

    reader.onerror = () => reject(new Error("Načtení loga selhalo."));
    reader.readAsDataURL(file);
  });
}