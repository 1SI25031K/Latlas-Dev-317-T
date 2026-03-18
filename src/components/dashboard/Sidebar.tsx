"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Class } from "@/types/database";
import {
  Home,
  Book,
  Activity,
  Settings,
  ChatLines,
  Timer,
  ClockRotateRight,
} from "iconoir-react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

const CLASS_SIDEBAR_LIMIT = 7;

type SidebarProps = {
  locale: string;
  classes: Class[];
};

export function Sidebar({ locale, classes }: SidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const { iconAnimation, sidebarCollapsed } = useDashboardSettings();
  const [showAllClasses, setShowAllClasses] = useState(false);

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

  const navBase = sidebarCollapsed
    ? "flex items-center justify-center rounded-2xl px-2 py-2 text-sm font-medium transition-colors"
    : "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors";
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
          {!sidebarCollapsed && t("home")}
        </Link>

        <Link
          href="/dashboard/messages"
          className={`group ${navClass("/dashboard/messages")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:scale-110", <ChatLines className="h-5 w-5" />)}
          {!sidebarCollapsed && t("messages")}
        </Link>
        <Link
          href="/dashboard/timer"
          className={`group ${navClass("/dashboard/timer")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:scale-110", <Timer className="h-5 w-5" />)}
          {!sidebarCollapsed && t("timer")}
        </Link>
        <Link
          href="/dashboard/stopwatch"
          className={`group ${navClass("/dashboard/stopwatch")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap(
            "h-5 w-5",
            "group-hover:scale-110",
            <ClockRotateRight className="h-5 w-5" />
          )}
          {!sidebarCollapsed && t("stopwatch")}
        </Link>
        <Link
          href="/dashboard/monitoring"
          className={`group ${navClass("/dashboard/monitoring")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:scale-110", <Activity className="h-5 w-5" />)}
          {!sidebarCollapsed && t("monitoring")}
        </Link>

        {!sidebarCollapsed && (
          <>
            <div className="my-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />
            <div className="flex items-center justify-between px-3 py-1">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--dashboard-text-muted)" }}
              >
                {t("classes")}
              </span>
            </div>
            {(showAllClasses ? classes : classes.slice(0, CLASS_SIDEBAR_LIMIT)).map((c) => (
              <Link
                key={c.id}
                href="/dashboard"
                className={`group ${navBase} ${navInactive}`}
                style={{ color: "var(--dashboard-text)" }}
              >
                {iconWrap(
                  "h-4 w-4",
                  "group-hover:scale-105",
                  <Book className="h-4 w-4" style={{ color: "var(--dashboard-text-muted)" }} />
                )}
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
            {classes.length > CLASS_SIDEBAR_LIMIT && !showAllClasses && (
              <button
                type="button"
                onClick={() => setShowAllClasses(true)}
                className={`w-full rounded-2xl px-3 py-2 text-left text-xs font-medium transition-opacity hover:opacity-90 ${navInactive}`}
                style={{ color: "var(--dashboard-text-muted)" }}
              >
                {t("showAllClasses")}
              </button>
            )}
            <div className="my-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />
          </>
        )}
        <Link
          href="/dashboard/settings"
          className={`group ${navClass("/dashboard/settings")}`}
          style={{ color: "var(--dashboard-text)" }}
        >
          {iconWrap("h-5 w-5", "group-hover:rotate-90", <Settings className="h-5 w-5" />)}
          {!sidebarCollapsed && t("settings")}
        </Link>
      </div>

    </div>
  );
}
