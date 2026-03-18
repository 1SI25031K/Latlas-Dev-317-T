"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User } from "iconoir-react";
import { Database, Cloud, Mail, Users, Link2 } from "lucide-react";
import {
  SiGoogledrive,
  SiGooglecalendar,
  SiGoogleclassroom,
  SiSlack,
} from "react-icons/si";
import {
  type LauncherItem,
  BUILTIN_EXTERNAL_URL,
  LATLAS_GENERIC_SHORTCUT,
  resolveBrandIconColor,
  type BuiltinLauncherId,
} from "@/lib/app-launcher";
import { getLauncherIconMeta } from "@/lib/launcher-extra-icons";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

const LAUNCHER_TILE =
  "flex w-full min-w-0 max-w-full flex-col items-center gap-2 rounded-2xl px-1.5 py-2.5 transition-opacity hover:opacity-90";
/** Fixed box so SVGs are never squeezed by grid column width */
const ICON_SHELL =
  "mx-auto flex size-10 shrink-0 items-center justify-center overflow-hidden [&_svg]:!h-7 [&_svg]:!w-7 [&_svg]:shrink-0";
const LABEL_WRAP =
  "flex min-h-[2.5rem] w-full max-w-full items-start justify-center px-0.5";
const LABEL_CLASS =
  "line-clamp-2 w-full max-w-full break-words text-center text-xs leading-tight";

type Props = {
  items: LauncherItem[];
  avatarUrl?: string | null;
  onNavigate: () => void;
};

function Label({ children }: { children: ReactNode }) {
  return (
    <div className={LABEL_WRAP}>
      <span className={LABEL_CLASS} style={{ color: "var(--dashboard-text-muted)" }}>
        {children}
      </span>
    </div>
  );
}

export function AppLauncherGrid({ items, avatarUrl, onNavigate }: Props) {
  const t = useTranslations("dashboard.appLauncher");
  const { resolvedTheme } = useDashboardSettings();
  const isDark = resolvedTheme === "dark";

  function builtinLabel(id: BuiltinLauncherId): string {
    return t(`builtin_${id}` as Parameters<typeof t>[0]);
  }

  return (
    <div
      className="grid w-full gap-x-4 gap-y-5"
      style={{
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      }}
    >
      {items.map((item) => {
        if (item.kind === "custom") {
          if (item.iconKey === LATLAS_GENERIC_SHORTCUT) {
            return (
              <a
                key={item.cid}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={LAUNCHER_TILE}
                aria-label={item.name}
              >
                <div className={ICON_SHELL}>
                  <Link2 className="size-6 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
                </div>
                <Label>{item.name}</Label>
              </a>
            );
          }
          const meta = getLauncherIconMeta(item.iconKey);
          if (!meta) {
            return (
              <a
                key={item.cid}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={LAUNCHER_TILE}
                aria-label={item.name}
              >
                <div className={ICON_SHELL}>
                  <Link2 className="size-6 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
                </div>
                <Label>{item.name}</Label>
              </a>
            );
          }
          const Icon = meta.Icon;
          const iconColor = resolveBrandIconColor(item.iconKey, item.color, isDark);
          return (
            <a
              key={item.cid}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={LAUNCHER_TILE}
              aria-label={item.name}
            >
              <div className={ICON_SHELL}>
                <Icon size={24} color={iconColor} className="shrink-0" />
              </div>
              <Label>{item.name}</Label>
            </a>
          );
        }

        const id = item.id;
        if (id === "latlas_account") {
          return (
            <Link
              key={id}
              href="/dashboard/settings"
              onClick={onNavigate}
              className={LAUNCHER_TILE}
              aria-label={builtinLabel(id)}
            >
              <div className={ICON_SHELL}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-6 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
                )}
              </div>
              <Label>{builtinLabel(id)}</Label>
            </Link>
          );
        }

        if (id === "latlas_data") {
          return (
            <button
              key={id}
              type="button"
              disabled
              className={`${LAUNCHER_TILE} cursor-not-allowed opacity-50 hover:opacity-50`}
              style={{ color: "var(--dashboard-text-muted)" }}
              aria-label={builtinLabel(id)}
            >
              <div className={ICON_SHELL}>
                <Database className="size-6 shrink-0" style={{ color: "#60A5FA" }} aria-hidden />
              </div>
              <Label>{builtinLabel(id)}</Label>
            </button>
          );
        }

        const href = BUILTIN_EXTERNAL_URL[id];
        if (!href) return null;

        const common = (
          <>
            <div className={ICON_SHELL}>{builtinIcon(id)}</div>
            <Label>{builtinLabel(id)}</Label>
          </>
        );

        return (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={LAUNCHER_TILE}
            aria-label={builtinLabel(id)}
          >
            {common}
          </a>
        );
      })}
    </div>
  );
}

function builtinIcon(id: BuiltinLauncherId): ReactNode {
  switch (id) {
    case "google_drive":
      return <SiGoogledrive size={24} color="#4285F4" className="shrink-0" />;
    case "onedrive":
      return <Cloud className="size-6 shrink-0" style={{ color: "#0078D4" }} aria-hidden />;
    case "google_calendar":
      return <SiGooglecalendar size={24} color="#EA4335" className="shrink-0" />;
    case "outlook":
      return <Mail className="size-6 shrink-0" style={{ color: "#0078D4" }} aria-hidden />;
    case "google_classroom":
      return <SiGoogleclassroom size={24} color="#FBBC05" className="shrink-0" />;
    case "teams":
      return <Users className="size-6 shrink-0" style={{ color: "#6264A7" }} aria-hidden />;
    case "slack":
      return <SiSlack size={24} color="#611F69" className="shrink-0" />;
    default:
      return null;
  }
}
