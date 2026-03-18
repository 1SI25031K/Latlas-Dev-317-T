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

/** Preset Simple Icons for custom shortcuts (key must exist in LAUNCHER_SI_ICONS) */
export const CUSTOM_ICON_PRESETS: Array<{
  key: string;
  label: string;
  color: string;
  /** Filled when user picks this preset in the editor */
  defaultUrl: string;
}> = [
  { key: "SiGoogledrive", label: "Google Drive", color: "#4285F4", defaultUrl: "https://drive.google.com/" },
  { key: "SiGooglecalendar", label: "Google Calendar", color: "#EA4335", defaultUrl: "https://calendar.google.com/" },
  { key: "SiGoogleclassroom", label: "Classroom", color: "#FBBC05", defaultUrl: "https://classroom.google.com/" },
  { key: "SiSlack", label: "Slack", color: "#611F69", defaultUrl: "https://slack.com/" },
  { key: "SiGithub", label: "GitHub", color: "#181717", defaultUrl: "https://github.com/" },
  { key: "SiGitlab", label: "GitLab", color: "#FC6D26", defaultUrl: "https://gitlab.com/" },
  { key: "SiNotion", label: "Notion", color: "#000000", defaultUrl: "https://www.notion.so/" },
  { key: "SiDiscord", label: "Discord", color: "#5865F2", defaultUrl: "https://discord.com/" },
  { key: "SiYoutube", label: "YouTube", color: "#FF0000", defaultUrl: "https://www.youtube.com/" },
  { key: "SiGmail", label: "Gmail", color: "#EA4335", defaultUrl: "https://mail.google.com/" },
  { key: "SiWhatsapp", label: "WhatsApp", color: "#25D366", defaultUrl: "https://web.whatsapp.com/" },
  { key: "SiTelegram", label: "Telegram", color: "#26A5E4", defaultUrl: "https://web.telegram.org/" },
  { key: "SiMoodle", label: "Moodle", color: "#F98012", defaultUrl: "https://moodle.org/" },
  { key: "SiZoom", label: "Zoom", color: "#2D8CFF", defaultUrl: "https://zoom.us/" },
  { key: "SiTrello", label: "Trello", color: "#0052CC", defaultUrl: "https://trello.com/" },
  { key: "SiFigma", label: "Figma", color: "#F24E1E", defaultUrl: "https://www.figma.com/" },
  { key: "SiJira", label: "Jira", color: "#0052CC", defaultUrl: "https://www.atlassian.com/software/jira" },
  { key: "SiNpm", label: "npm", color: "#CB3837", defaultUrl: "https://www.npmjs.com/" },
  { key: "SiX", label: "X", color: "#000000", defaultUrl: "https://x.com/" },
  { key: "SiReddit", label: "Reddit", color: "#FF4500", defaultUrl: "https://www.reddit.com/" },
  { key: "SiSpotify", label: "Spotify", color: "#1DB954", defaultUrl: "https://open.spotify.com/" },
  { key: "SiDocker", label: "Docker", color: "#2496ED", defaultUrl: "https://www.docker.com/" },
  { key: "SiApple", label: "Apple", color: "#000000", defaultUrl: "https://www.apple.com/" },
  { key: "SiGoogle", label: "Google", color: "#4285F4", defaultUrl: "https://www.google.com/" },
  { key: "SiOpenai", label: "OpenAI", color: "#412991", defaultUrl: "https://chatgpt.com/" },
  { key: "SiWikipedia", label: "Wikipedia", color: "#000000", defaultUrl: "https://www.wikipedia.org/" },
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
        if (c.iconKey === LATLAS_GENERIC_SHORTCUT) {
          return { ...c, color: typeof c.color === "string" ? c.color : "#888888" };
        }
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
  if (!meta) return null;
  return {
    kind: "custom",
    cid: crypto.randomUUID(),
    url: href,
    name: name.trim().slice(0, 40),
    iconKey,
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
