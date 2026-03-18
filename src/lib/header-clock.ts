import type { ResolvedThemeId } from "@/lib/theme-constants";

/** Google Fonts family names (order = font id 0..19) */
export const HEADER_CLOCK_FONT_FAMILIES = [
  "Orbitron",
  "Bebas Neue",
  "Pacifico",
  "Lobster",
  "Audiowide",
  "Press Start 2P",
  "Rubik Mono One",
  "DM Mono",
  "Righteous",
  "Bangers",
  "Permanent Marker",
  "Comfortaa",
  "Exo 2",
  "Russo One",
  "Black Ops One",
  "Caveat",
  "Satisfy",
  "VT323",
  "Bungee",
  "Monoton",
] as const;

export const HEADER_CLOCK_FONT_COUNT = HEADER_CLOCK_FONT_FAMILIES.length;

export type HeaderClockFontId = number;

export function clampClockFontId(n: number): HeaderClockFontId {
  const max = HEADER_CLOCK_FONT_COUNT - 1;
  return Math.max(0, Math.min(max, Math.floor(n)));
}

/** Light theme → dark text, dark theme → light text */
export function getHeaderClockTextColor(resolvedTheme: ResolvedThemeId): string {
  return resolvedTheme === "light" ? "#111111" : "#ffffff";
}

/** Two Stylesheet URLs (Google Fonts batch limit workaround) */
export function headerClockGoogleFontHrefs(): string[] {
  return [
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Bebas+Neue&family=Pacifico&family=Lobster&family=Audiowide&family=Press+Start+2P&family=Rubik+Mono+One&family=DM+Mono:wght@400;500&family=Righteous&family=Bangers&display=swap",
    "https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Comfortaa:wght@400;700&family=Exo+2:wght@400;700&family=Russo+One&family=Black+Ops+One&family=Caveat:wght@400;700&family=Satisfy&family=VT323&family=Bungee&family=Monoton&display=swap",
  ];
}

export function headerClockFontFamily(fontId: HeaderClockFontId): string {
  const id = clampClockFontId(fontId);
  const name = HEADER_CLOCK_FONT_FAMILIES[id];
  return name.includes(" ") ? `"${name}", sans-serif` : `${name}, sans-serif`;
}

/** Font ids that need smaller preview / display size */
const COMPACT_FONT_IDS = new Set([5, 14, 17, 18, 19]);
export function headerClockIsCompactFont(fontId: number): boolean {
  return COMPACT_FONT_IDS.has(clampClockFontId(fontId));
}
