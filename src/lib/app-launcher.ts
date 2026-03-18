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
  SiTelegram,
  SiMoodle,
  SiZoom,
  SiTrello,
  SiFigma,
  SiJira,
  SiNpm,
  SiX,
  SiReddit,
  SiSpotify,
  SiDocker,
  SiApple,
  SiGoogle,
  SiOpenai,
  SiWikipedia,
} from "react-icons/si";

export const STORAGE_KEY_APP_LAUNCHER = "latlas-app-launcher-v1";

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

/** Preset Simple Icons for custom shortcuts (key must exist in LAUNCHER_SI_ICONS) */
export const CUSTOM_ICON_PRESETS: Array<{
  key: string;
  label: string;
  color: string;
}> = [
  { key: "SiGoogledrive", label: "Google Drive", color: "#4285F4" },
  { key: "SiGooglecalendar", label: "Google Calendar", color: "#EA4335" },
  { key: "SiGoogleclassroom", label: "Classroom", color: "#FBBC05" },
  { key: "SiSlack", label: "Slack", color: "#611F69" },
  { key: "SiGithub", label: "GitHub", color: "#181717" },
  { key: "SiGitlab", label: "GitLab", color: "#FC6D26" },
  { key: "SiNotion", label: "Notion", color: "#000000" },
  { key: "SiDiscord", label: "Discord", color: "#5865F2" },
  { key: "SiYoutube", label: "YouTube", color: "#FF0000" },
  { key: "SiGmail", label: "Gmail", color: "#EA4335" },
  { key: "SiWhatsapp", label: "WhatsApp", color: "#25D366" },
  { key: "SiTelegram", label: "Telegram", color: "#26A5E4" },
  { key: "SiMoodle", label: "Moodle", color: "#F98012" },
  { key: "SiZoom", label: "Zoom", color: "#2D8CFF" },
  { key: "SiTrello", label: "Trello", color: "#0052CC" },
  { key: "SiFigma", label: "Figma", color: "#F24E1E" },
  { key: "SiJira", label: "Jira", color: "#0052CC" },
  { key: "SiNpm", label: "npm", color: "#CB3837" },
  { key: "SiX", label: "X", color: "#000000" },
  { key: "SiReddit", label: "Reddit", color: "#FF4500" },
  { key: "SiSpotify", label: "Spotify", color: "#1DB954" },
  { key: "SiDocker", label: "Docker", color: "#2496ED" },
  { key: "SiApple", label: "Apple", color: "#000000" },
  { key: "SiGoogle", label: "Google", color: "#4285F4" },
  { key: "SiOpenai", label: "OpenAI", color: "#412991" },
  { key: "SiWikipedia", label: "Wikipedia", color: "#000000" },
];

export const LAUNCHER_SI_ICONS: Record<string, { Icon: IconType; defaultColor: string }> = {
  SiGoogledrive: { Icon: SiGoogledrive, defaultColor: "#4285F4" },
  SiGooglecalendar: { Icon: SiGooglecalendar, defaultColor: "#EA4335" },
  SiGoogleclassroom: { Icon: SiGoogleclassroom, defaultColor: "#FBBC05" },
  SiSlack: { Icon: SiSlack, defaultColor: "#611F69" },
  SiGithub: { Icon: SiGithub, defaultColor: "#181717" },
  SiGitlab: { Icon: SiGitlab, defaultColor: "#FC6D26" },
  SiNotion: { Icon: SiNotion, defaultColor: "#000000" },
  SiDiscord: { Icon: SiDiscord, defaultColor: "#5865F2" },
  SiYoutube: { Icon: SiYoutube, defaultColor: "#FF0000" },
  SiGmail: { Icon: SiGmail, defaultColor: "#EA4335" },
  SiWhatsapp: { Icon: SiWhatsapp, defaultColor: "#25D366" },
  SiTelegram: { Icon: SiTelegram, defaultColor: "#26A5E4" },
  SiMoodle: { Icon: SiMoodle, defaultColor: "#F98012" },
  SiZoom: { Icon: SiZoom, defaultColor: "#2D8CFF" },
  SiTrello: { Icon: SiTrello, defaultColor: "#0052CC" },
  SiFigma: { Icon: SiFigma, defaultColor: "#F24E1E" },
  SiJira: { Icon: SiJira, defaultColor: "#0052CC" },
  SiNpm: { Icon: SiNpm, defaultColor: "#CB3837" },
  SiX: { Icon: SiX, defaultColor: "#000000" },
  SiReddit: { Icon: SiReddit, defaultColor: "#FF4500" },
  SiSpotify: { Icon: SiSpotify, defaultColor: "#1DB954" },
  SiDocker: { Icon: SiDocker, defaultColor: "#2496ED" },
  SiApple: { Icon: SiApple, defaultColor: "#000000" },
  SiGoogle: { Icon: SiGoogle, defaultColor: "#4285F4" },
  SiOpenai: { Icon: SiOpenai, defaultColor: "#412991" },
  SiWikipedia: { Icon: SiWikipedia, defaultColor: "#000000" },
};

export const DEFAULT_LAUNCHER_ITEMS: LauncherItem[] = BUILTIN_IDS.map((id) => ({
  kind: "builtin" as const,
  id,
}));

/** External URLs for built-in shortcuts (not account / data) */
export const BUILTIN_EXTERNAL_URL: Partial<Record<BuiltinLauncherId, string>> = {
  google_drive: "https://drive.google.com/",
  onedrive: "https://onedrive.live.com/",
  google_calendar: "https://calendar.google.com/",
  outlook: "https://outlook.office.com/calendar/",
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
        const meta = LAUNCHER_SI_ICONS[c.iconKey];
        return {
          ...c,
          color: typeof c.color === "string" ? c.color : meta?.defaultColor ?? "#333333",
        };
      }) as LauncherItem[];
    return { items: items.length > 0 ? items : DEFAULT_LAUNCHER_ITEMS };
  } catch {
    return null;
  }
}

export function readLauncherConfig(): LauncherConfig {
  if (typeof window === "undefined") {
    return { items: [...DEFAULT_LAUNCHER_ITEMS] };
  }
  const parsed = parseConfig(localStorage.getItem(STORAGE_KEY_APP_LAUNCHER));
  return parsed ?? { items: [...DEFAULT_LAUNCHER_ITEMS] };
}

export function writeLauncherConfig(config: LauncherConfig): void {
  localStorage.setItem(STORAGE_KEY_APP_LAUNCHER, JSON.stringify(config));
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

export function createCustomLauncherItem(
  url: string,
  name: string,
  iconKey: string
): LauncherItem | null {
  const href = normalizeUrl(url);
  if (!href || !name.trim()) return null;
  const meta = LAUNCHER_SI_ICONS[iconKey] ?? LAUNCHER_SI_ICONS.SiGithub;
  return {
    kind: "custom",
    cid: crypto.randomUUID(),
    url: href,
    name: name.trim().slice(0, 40),
    iconKey: LAUNCHER_SI_ICONS[iconKey] ? iconKey : "SiGithub",
    color: meta.defaultColor,
  };
}

export function moveItem(items: LauncherItem[], index: number, dir: -1 | 1): LauncherItem[] {
  const j = index + dir;
  if (j < 0 || j >= items.length) return items;
  const next = [...items];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

export function removeItemAt(items: LauncherItem[], index: number): LauncherItem[] {
  return items.filter((_, i) => i !== index);
}
