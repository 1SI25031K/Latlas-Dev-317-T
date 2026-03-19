import type { IconType } from "react-icons";
import {
  SiGoogledrive,
  SiGooglecalendar,
  SiGoogleclassroom,
  SiSlack,
  SiGithub,
  SiGitlab,
  SiNotion,
  SiDiscord,
  SiYoutube,
  SiGmail,
  SiWhatsapp,
  SiMoodle,
  SiZoom,
  SiTrello,
  SiFigma,
  SiJira,
  SiNpm,
  SiSpotify,
  SiDocker,
  SiGoogle,
  SiOpenai,
  SiWikipedia,
  SiCanva,
  SiKahoot,
  SiMiro,
  SiGoogledocs,
  SiGooglesheets,
  SiGoogleslides,
  SiGoogleforms,
} from "react-icons/si";

export const STORAGE_KEY_APP_LAUNCHER = "latlas-app-launcher-v1";

/** Custom shortcut icon: neutral link (no brand logo) until user picks a preset */
export const LATLAS_GENERIC_SHORTCUT = "LATLAS_GENERIC_SHORTCUT";

export const BUILTIN_IDS = [
  "latlas_account",
  "latlas_data",
  "google_drive",
  "onedrive",
  "google_calendar",
  "outlook",
  "google_classroom",
  "teams",
  "slack",
] as const;

export type BuiltinLauncherId = (typeof BUILTIN_IDS)[number];

export type LauncherItem =
  | { kind: "builtin"; id: BuiltinLauncherId }
  | {
      kind: "custom";
      cid: string;
      url: string;
      name: string;
      iconKey: string;
      color: string;
    };

export type LauncherConfig = {
  items: LauncherItem[];
};

/** Lucide-based preset keys (colors only here; icons in launcher-extra-icons.tsx) */
export const LAUNCHER_LUCIDE_PRESET_COLORS: Record<string, string> = {
  LATLAS_MS_WORD: "#185ABD",
  LATLAS_MS_EXCEL: "#217346",
  LATLAS_MS_POWERPOINT: "#B7472A",
  LATLAS_MS_ONENOTE: "#7719AA",
  LATLAS_MS_WHITEBOARD: "#0078D4",
};

/** Preset icons for editor (key in LAUNCHER_SI_ICONS or LAUNCHER_EXTRA_ICONS / LAUNCHER_LUCIDE_PRESET_COLORS) */
export const CUSTOM_ICON_PRESETS: Array<{
  key: string;
  label: string;
  color: string;
  defaultUrl: string;
}> = [
  { key: "SiGoogledrive", label: "Google Drive", color: "#4285F4", defaultUrl: "https://drive.google.com/" },
  { key: "SiGooglecalendar", label: "Google Calendar", color: "#EA4335", defaultUrl: "https://calendar.google.com/" },
  { key: "SiGoogleclassroom", label: "Classroom", color: "#FBBC05", defaultUrl: "https://classroom.google.com/" },
  { key: "SiGoogledocs", label: "Google Docs", color: "#4285F4", defaultUrl: "https://docs.google.com/document/" },
  { key: "SiGooglesheets", label: "Google Sheets", color: "#0F9D58", defaultUrl: "https://docs.google.com/spreadsheets/" },
  { key: "SiGoogleslides", label: "Google Slides", color: "#F4B400", defaultUrl: "https://docs.google.com/presentation/" },
  { key: "SiGoogleforms", label: "Google Forms", color: "#7248B9", defaultUrl: "https://docs.google.com/forms/" },
  { key: "SiSlack", label: "Slack", color: "#611F69", defaultUrl: "https://slack.com/" },
  { key: "SiGithub", label: "GitHub", color: "#181717", defaultUrl: "https://github.com/" },
  { key: "SiGitlab", label: "GitLab", color: "#FC6D26", defaultUrl: "https://gitlab.com/" },
  { key: "SiNotion", label: "Notion", color: "#000000", defaultUrl: "https://www.notion.so/" },
  { key: "SiDiscord", label: "Discord", color: "#5865F2", defaultUrl: "https://discord.com/" },
  { key: "SiYoutube", label: "YouTube", color: "#FF0000", defaultUrl: "https://www.youtube.com/" },
  { key: "SiGmail", label: "Gmail", color: "#EA4335", defaultUrl: "https://mail.google.com/" },
  { key: "SiWhatsapp", label: "WhatsApp", color: "#25D366", defaultUrl: "https://web.whatsapp.com/" },
  { key: "SiMoodle", label: "Moodle", color: "#F98012", defaultUrl: "https://moodle.org/" },
  { key: "SiZoom", label: "Zoom", color: "#2D8CFF", defaultUrl: "https://zoom.us/" },
  { key: "SiTrello", label: "Trello", color: "#0052CC", defaultUrl: "https://trello.com/" },
  { key: "SiFigma", label: "Figma", color: "#F24E1E", defaultUrl: "https://www.figma.com/" },
  { key: "SiJira", label: "Jira", color: "#0052CC", defaultUrl: "https://www.atlassian.com/software/jira" },
  { key: "SiNpm", label: "npm", color: "#CB3837", defaultUrl: "https://www.npmjs.com/" },
  { key: "SiSpotify", label: "Spotify", color: "#1DB954", defaultUrl: "https://open.spotify.com/" },
  { key: "SiDocker", label: "Docker", color: "#2496ED", defaultUrl: "https://www.docker.com/" },
  { key: "SiGoogle", label: "Google", color: "#4285F4", defaultUrl: "https://www.google.com/" },
  { key: "SiOpenai", label: "OpenAI", color: "#412991", defaultUrl: "https://chatgpt.com/" },
  { key: "SiWikipedia", label: "Wikipedia", color: "#000000", defaultUrl: "https://www.wikipedia.org/" },
  { key: "SiCanva", label: "Canva", color: "#00C4CC", defaultUrl: "https://www.canva.com/" },
  { key: "SiKahoot", label: "Kahoot!", color: "#46178F", defaultUrl: "https://kahoot.com/" },
  { key: "SiMiro", label: "Miro", color: "#050038", defaultUrl: "https://miro.com/" },
  { key: "LATLAS_MS_WORD", label: "Word", color: "#185ABD", defaultUrl: "https://www.office.com/launch/word" },
  { key: "LATLAS_MS_EXCEL", label: "Excel", color: "#217346", defaultUrl: "https://www.office.com/launch/excel" },
  { key: "LATLAS_MS_POWERPOINT", label: "PowerPoint", color: "#B7472A", defaultUrl: "https://www.office.com/launch/powerpoint" },
  { key: "LATLAS_MS_ONENOTE", label: "OneNote", color: "#7719AA", defaultUrl: "https://www.onenote.com/notebooks" },
  { key: "LATLAS_MS_WHITEBOARD", label: "Microsoft Whiteboard", color: "#0078D4", defaultUrl: "https://whiteboard.microsoft.com/" },
];

export const LAUNCHER_SI_ICONS: Record<string, { Icon: IconType; defaultColor: string }> = {
  SiGoogledrive: { Icon: SiGoogledrive, defaultColor: "#4285F4" },
  SiGooglecalendar: { Icon: SiGooglecalendar, defaultColor: "#EA4335" },
  SiGoogleclassroom: { Icon: SiGoogleclassroom, defaultColor: "#FBBC05" },
  SiGoogledocs: { Icon: SiGoogledocs, defaultColor: "#4285F4" },
  SiGooglesheets: { Icon: SiGooglesheets, defaultColor: "#0F9D58" },
  SiGoogleslides: { Icon: SiGoogleslides, defaultColor: "#F4B400" },
  SiGoogleforms: { Icon: SiGoogleforms, defaultColor: "#7248B9" },
  SiSlack: { Icon: SiSlack, defaultColor: "#611F69" },
  SiGithub: { Icon: SiGithub, defaultColor: "#181717" },
  SiGitlab: { Icon: SiGitlab, defaultColor: "#FC6D26" },
  SiNotion: { Icon: SiNotion, defaultColor: "#000000" },
  SiDiscord: { Icon: SiDiscord, defaultColor: "#5865F2" },
  SiYoutube: { Icon: SiYoutube, defaultColor: "#FF0000" },
  SiGmail: { Icon: SiGmail, defaultColor: "#EA4335" },
  SiWhatsapp: { Icon: SiWhatsapp, defaultColor: "#25D366" },
  SiMoodle: { Icon: SiMoodle, defaultColor: "#F98012" },
  SiZoom: { Icon: SiZoom, defaultColor: "#2D8CFF" },
  SiTrello: { Icon: SiTrello, defaultColor: "#0052CC" },
  SiFigma: { Icon: SiFigma, defaultColor: "#F24E1E" },
  SiJira: { Icon: SiJira, defaultColor: "#0052CC" },
  SiNpm: { Icon: SiNpm, defaultColor: "#CB3837" },
  SiSpotify: { Icon: SiSpotify, defaultColor: "#1DB954" },
  SiDocker: { Icon: SiDocker, defaultColor: "#2496ED" },
  SiGoogle: { Icon: SiGoogle, defaultColor: "#4285F4" },
  SiOpenai: { Icon: SiOpenai, defaultColor: "#412991" },
  SiWikipedia: { Icon: SiWikipedia, defaultColor: "#000000" },
  SiCanva: { Icon: SiCanva, defaultColor: "#00C4CC" },
  SiKahoot: { Icon: SiKahoot, defaultColor: "#46178F" },
  SiMiro: { Icon: SiMiro, defaultColor: "#050038" },
};

export const DEFAULT_LAUNCHER_ITEMS: LauncherItem[] = [
  { kind: "builtin", id: "latlas_account" },
  { kind: "builtin", id: "onedrive" },
  { kind: "builtin", id: "google_classroom" },
  { kind: "builtin", id: "teams" },
  {
    kind: "custom",
    cid: "latlas-default-google",
    url: "https://www.google.com/",
    name: "Google",
    iconKey: "SiGoogle",
    color: "#4285F4",
  },
  {
    kind: "custom",
    cid: "latlas-default-chatgpt",
    url: "https://chatgpt.com/",
    name: "ChatGPT",
    iconKey: "SiOpenai",
    color: "#412991",
  },
  { kind: "builtin", id: "outlook" },
];

/** External URLs for built-in shortcuts (not account / data) */
export const BUILTIN_EXTERNAL_URL: Partial<Record<BuiltinLauncherId, string>> = {
  google_drive: "https://drive.google.com/",
  onedrive: "https://onedrive.live.com/",
  google_calendar: "https://calendar.google.com/",
  outlook: "https://outlook.office.com/mail/",
  google_classroom: "https://classroom.google.com/",
  teams: "https://teams.microsoft.com/",
  slack: "https://slack.com/",
};

function parseConfig(raw: string | null): LauncherConfig | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || !Array.isArray((data as LauncherConfig).items)) {
      return null;
    }
    const items = (data as LauncherConfig).items.filter((item) => {
      if (!item || typeof item !== "object") return false;
      if ((item as LauncherItem).kind === "builtin") {
        return BUILTIN_IDS.includes((item as { id: BuiltinLauncherId }).id);
      }
      if ((item as LauncherItem).kind === "custom") {
        const c = item as Record<string, unknown>;
        return (
          typeof c.cid === "string" &&
          typeof c.url === "string" &&
          typeof c.name === "string" &&
          typeof c.iconKey === "string"
        );
      }
      return false;
    })
      .map((item) => {
        if ((item as LauncherItem).kind !== "custom") return item as LauncherItem;
        const c = item as LauncherItem & { kind: "custom"; color?: string };
        if (c.iconKey === LATLAS_GENERIC_SHORTCUT) {
          return { ...c, color: typeof c.color === "string" ? c.color : "#888888" };
        }
        const meta = LAUNCHER_SI_ICONS[c.iconKey];
        const lucideC = LAUNCHER_LUCIDE_PRESET_COLORS[c.iconKey];
        return {
          ...c,
          color:
            typeof c.color === "string"
              ? c.color
              : meta?.defaultColor ?? lucideC ?? "#333333",
        };
      }) as LauncherItem[];
    return { items: items.length > 0 ? items : DEFAULT_LAUNCHER_ITEMS };
  } catch {
    return null;
  }
}

const LATLAS_ACCOUNT_ITEM: LauncherItem = { kind: "builtin", id: "latlas_account" };

/** Latlas Account は常に先頭1件のみ（移動・削除不可） */
export function ensureLatlasAccountFirst(items: LauncherItem[]): LauncherItem[] {
  const rest = items.filter(
    (i) => !(i.kind === "builtin" && i.id === "latlas_account")
  );
  return [LATLAS_ACCOUNT_ITEM, ...rest];
}

export function readLauncherConfig(): LauncherConfig {
  if (typeof window === "undefined") {
    return { items: ensureLatlasAccountFirst([...DEFAULT_LAUNCHER_ITEMS]) };
  }
  const parsed = parseConfig(localStorage.getItem(STORAGE_KEY_APP_LAUNCHER));
  const raw = parsed ?? { items: [...DEFAULT_LAUNCHER_ITEMS] };
  return { items: ensureLatlasAccountFirst(raw.items) };
}

export function writeLauncherConfig(config: LauncherConfig): void {
  const normalized = { items: ensureLatlasAccountFirst(config.items) };
  localStorage.setItem(STORAGE_KEY_APP_LAUNCHER, JSON.stringify(normalized));
}

export function normalizeUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  try {
    const u = new URL(t.includes("://") ? t : `https://${t}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export const LAUNCHER_ICONS_LIGHTEN_IN_DARK = new Set([
  "SiNotion",
  "SiGithub",
  "SiX",
  "SiWikipedia",
  "SiApple",
  "SiMiro",
]);

export function resolveBrandIconColor(
  iconKey: string,
  storedColor: string,
  isDark: boolean
): string {
  if (!isDark || !LAUNCHER_ICONS_LIGHTEN_IN_DARK.has(iconKey)) return storedColor;
  return "#e6edf3";
}

export function presetIconKeyInUse(items: LauncherItem[], presetKey: string): boolean {
  return items.some((i) => i.kind === "custom" && i.iconKey === presetKey);
}

export function createPresetShortcutItem(
  presetKey: string,
  items: LauncherItem[]
): LauncherItem | null {
  if (presetIconKeyInUse(items, presetKey)) return null;
  const p = CUSTOM_ICON_PRESETS.find((x) => x.key === presetKey);
  if (!p) return null;
  const href = normalizeUrl(p.defaultUrl);
  if (!href) return null;
  const meta = LAUNCHER_SI_ICONS[presetKey];
  const color = meta?.defaultColor ?? LAUNCHER_LUCIDE_PRESET_COLORS[presetKey] ?? p.color;
  return {
    kind: "custom",
    cid: crypto.randomUUID(),
    url: href,
    name: p.label.slice(0, 40),
    iconKey: presetKey,
    color,
  };
}

export function createCustomLauncherItem(
  url: string,
  name: string,
  iconKey: string
): LauncherItem | null {
  const href = normalizeUrl(url);
  if (!href || !name.trim()) return null;
  if (iconKey === LATLAS_GENERIC_SHORTCUT) {
    return {
      kind: "custom",
      cid: crypto.randomUUID(),
      url: href,
      name: name.trim().slice(0, 40),
      iconKey: LATLAS_GENERIC_SHORTCUT,
      color: "#888888",
    };
  }
  const meta = LAUNCHER_SI_ICONS[iconKey];
  const lucideC = LAUNCHER_LUCIDE_PRESET_COLORS[iconKey];
  if (!meta && lucideC === undefined) return null;
  return {
    kind: "custom",
    cid: crypto.randomUUID(),
    url: href,
    name: name.trim().slice(0, 40),
    iconKey,
    color: meta?.defaultColor ?? lucideC ?? "#333333",
  };
}

export function moveItem(items: LauncherItem[], index: number, dir: -1 | 1): LauncherItem[] {
  const j = index + dir;
  if (j < 0 || j >= items.length) return items;
  const next = [...items];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

/** Reorder item from fromIndex to toIndex (0-based). Index 0 is fixed (latlas_account). */
export function reorderItems(
  items: LauncherItem[],
  fromIndex: number,
  toIndex: number
): LauncherItem[] {
  if (fromIndex === 0 || toIndex === 0) return items;
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export function removeItemAt(items: LauncherItem[], index: number): LauncherItem[] {
  return items.filter((_, i) => i !== index);
}
