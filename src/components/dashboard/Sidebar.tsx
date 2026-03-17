"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Class } from "@/types/database";
import {
  Home,
  Book,
  Activity,
  Settings,
  User,
  LogOut,
} from "iconoir-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

type SidebarProps = {
  locale: string;
  classes: Class[];
  profileName: string | null;
  userEmail: string | null;
};

export function Sidebar({ locale, classes, profileName, userEmail }: SidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const supabase = createClient();
  const { iconAnimation } = useDashboardSettings();

  const accountName = profileName || userEmail || t("profile");

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  const navBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const navInactive = "hover:opacity-90";
  const navActive =
    "border-l-2 border-blue-500 bg-[var(--dashboard-nav-active-bg)] text-blue-500";

  function navClass(path: string, exact?: boolean) {
    const active = exact
      ? pathname === path
      : pathname === path || pathname.startsWith(path + "/");
    return `${navBase} ${active ? navActive : navInactive}`;
  }

  return (
    <aside
      className="flex h-full w-64 flex-col border-r"
      style={{
        backgroundColor: "var(--dashboard-sidebar)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      {/* Account block (GitHub-style) */}
      <div className="border-b p-3" style={{ borderColor: "var(--dashboard-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
            }}
          >
            {iconWrap("h-4 w-4", "", <User className="h-4 w-4" style={{ color: "var(--dashboard-text-muted)" }} />)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
              {accountName}
            </p>
            <p className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("accountSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-2">
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

      <div className="border-t p-3" style={{ borderColor: "var(--dashboard-border)" }}>
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90"
          style={{ color: "var(--dashboard-text-muted)" }}
        >
          {iconWrap("h-4 w-4", "group-hover:translate-x-0.5", <LogOut className="h-4 w-4" />)}
          Sign out
        </button>
      </div>
    </aside>
  );
}
