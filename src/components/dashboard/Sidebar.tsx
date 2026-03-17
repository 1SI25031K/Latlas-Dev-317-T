"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Class } from "@/types/database";
import { Home, Book, Activity, Settings } from "iconoir-react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

type SidebarProps = {
  locale: string;
  classes: Class[];
};

export function Sidebar({ locale, classes }: SidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const { iconAnimation } = useDashboardSettings();

  const iconWrap = (sizeClass: string, hoverClass: string, children: React.ReactNode) => (
    <span
      className={
        iconAnimation
          ? `inline-flex shrink-0 items-center justify-center ${sizeClass} transition-transform duration-200 ease-out ${hoverClass}`
          : `inline-flex shrink-0 items-center justify-center ${sizeClass}`
      }
    >
      {children}
    </span>
  );

  const navBase =
    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors";
  const navInactive = "hover:opacity-90";
  const navActive =
    "border-l-2 border-green-500 bg-[var(--dashboard-nav-active-bg)] text-green-500";

  function navClass(path: string, exact?: boolean) {
    const active = exact
      ? pathname === path
      : pathname === path || pathname.startsWith(path + "/");
    return `${navBase} ${active ? navActive : navInactive}`;
  }

  return (
    <div
      className="flex h-full w-full flex-col"
      style={{
        backgroundColor: "var(--dashboard-sidebar)",
        color: "var(--dashboard-text)",
      }}
    >
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        <Link href="/dashboard" className={`group ${navClass("/dashboard", true)}`} style={{ color: "var(--dashboard-text)" }}>
          {iconWrap("h-5 w-5", "group-hover:scale-110", <Home className="h-5 w-5" />)}
          {t("home")}
        </Link>

        <div className="my-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />
        <div className="flex items-center justify-between px-3 py-1">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--dashboard-text-muted)" }}
          >
            {t("classes")}
          </span>
        </div>
        {classes.slice(0, 8).map((c) => (
          <Link
            key={c.id}
            href="/dashboard"
            className={`group ${navBase} ${navInactive}`}
            style={{ color: "var(--dashboard-text)" }}
          >
            {iconWrap("h-4 w-4", "group-hover:scale-105", <Book className="h-4 w-4" style={{ color: "var(--dashboard-text-muted)" }} />)}
            <span className="truncate">{c.name}</span>
          </Link>
        ))}
        {classes.length > 8 && (
          <span
            className="px-3 py-1.5 text-xs"
            style={{ color: "var(--dashboard-text-muted)" }}
          >
            {t("showMore")}
          </span>
        )}
        <div className="my-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />

        <Link
          href="/dashboard/monitoring"
          className={`group ${navClass("/dashboard/monitoring")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:scale-110", <Activity className="h-5 w-5" />)}
          {t("monitoring")}
        </Link>
        <Link
          href="/dashboard/settings"
          className={`group ${navClass("/dashboard/settings")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:rotate-90", <Settings className="h-5 w-5" />)}
          {t("settings")}
        </Link>
      </div>

    </div>
  );
}
