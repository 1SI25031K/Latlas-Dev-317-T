"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { User, Settings, LogOut, EditPencil, Bell } from "iconoir-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { DashboardCustomizeDrawer } from "@/components/dashboard/DashboardCustomizeDrawer";
import { DashboardNotificationDrawer } from "@/components/dashboard/DashboardNotificationDrawer";
import {
  readLauncherConfig,
  DEFAULT_LAUNCHER_ITEMS,
  type LauncherConfig,
} from "@/lib/app-launcher";
import { AppLauncherGrid } from "@/components/dashboard/AppLauncherGrid";
import { AppLauncherEditorModal } from "@/components/dashboard/AppLauncherEditorModal";
import { HeaderClock } from "@/components/dashboard/HeaderClock";
import {
  HeaderStopwatchRingLink,
  HeaderTimerRingLink,
} from "@/components/dashboard/HeaderChronoRings";

type DashboardHeaderProps = {
  locale: string;
  profileName: string | null;
  userEmail: string | null;
  avatarUrl?: string | null;
};

export function DashboardHeader({
  locale,
  profileName,
  userEmail,
  avatarUrl,
}: DashboardHeaderProps) {
  const t = useTranslations("dashboard");
  const tLauncher = useTranslations("dashboard.appLauncher");
  const pathname = usePathname();
  const [launcherCfg, setLauncherCfg] = useState<LauncherConfig>(() => ({
    items: [...DEFAULT_LAUNCHER_ITEMS],
  }));
  const [appLauncherEditOpen, setAppLauncherEditOpen] = useState(false);

  useEffect(() => {
    setLauncherCfg(readLauncherConfig());
  }, []);
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    resolvedTheme,
  } = useDashboardSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const launcherBtnRef = useRef<HTMLButtonElement>(null);
  const launcherPanelRef = useRef<HTMLDivElement>(null);
  const [launcherFixed, setLauncherFixed] = useState<{ top: number; right: number } | null>(null);

  const supabase = createClient();
  const isDarkHeader = resolvedTheme === "dark";

  const [headerWide, setHeaderWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const u = () => setHeaderWide(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const accountName = profileName || userEmail || t("profile");

  function getPageLabel(): string {
    if (pathname === "/dashboard" || pathname === "/dashboard/") return t("home");
    if (pathname.startsWith("/dashboard/settings")) return t("settings");
    if (pathname.startsWith("/dashboard/monitoring")) return t("monitoring");
    if (pathname.startsWith("/dashboard/messages")) return t("messages");
    if (pathname.startsWith("/dashboard/timer")) return t("timer");
    if (pathname.startsWith("/dashboard/stopwatch")) return t("stopwatch");
    return t("home");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!customizeOpen) return;
    setDropdownOpen(false);
    setNotificationsOpen(false);
  }, [customizeOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    setDropdownOpen(false);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!appsOpen) return;
    setDropdownOpen(false);
    setNotificationsOpen(false);
  }, [appsOpen]);

  useEffect(() => {
    if (notificationsOpen) {
      setCustomizeOpen(false);
      setAppsOpen(false);
      setLauncherFixed(null);
    }
  }, [notificationsOpen]);

  useEffect(() => {
    if (!appsOpen) return;

    function repositionLauncher() {
      const el = launcherBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setLauncherFixed({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    repositionLauncher();
    window.addEventListener("resize", repositionLauncher);
    window.addEventListener("scroll", repositionLauncher, true);

    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node;
      if (appsRef.current?.contains(t) || launcherPanelRef.current?.contains(t)) return;
      setAppsOpen(false);
      setLauncherFixed(null);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAppsOpen(false);
        setLauncherFixed(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", repositionLauncher);
      window.removeEventListener("scroll", repositionLauncher, true);
    };
  }, [appsOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  return (
    <>
      <header
        className="relative flex h-16 shrink-0 items-center justify-between border-b px-5"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
        }}
      >
        <HeaderClock locale={locale} />
      <div className="relative z-20 flex min-w-0 max-w-[42%] items-center gap-3 md:max-w-[38%]">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-opacity hover:opacity-90"
          style={{
            color: "var(--dashboard-text)",
          }}
          aria-label="Menu"
          aria-pressed={sidebarCollapsed}
        >
          <span className="flex flex-col gap-1">
            <span className="block h-1 w-5 rounded-full bg-current" />
            <span className="block h-1 w-5 rounded-full bg-current" />
            <span className="block h-1 w-5 rounded-full bg-current" />
          </span>
        </button>
        <span className="truncate text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
          {getPageLabel()}
        </span>
      </div>

      <div className="relative z-20 flex max-w-[min(42vw,14rem)] shrink-0 items-center gap-1.5 sm:gap-2 md:max-w-none">
        {headerWide && (
          <div className="flex min-w-0 items-center gap-1.5">
            <HeaderTimerRingLink isDark={isDarkHeader} title={t("timer")} />
            <HeaderStopwatchRingLink isDark={isDarkHeader} title={t("stopwatch")} />
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            setAppsOpen(false);
            setLauncherFixed(null);
            setNotificationsOpen(false);
            setCustomizeOpen((o) => !o);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-opacity hover:opacity-90"
          style={{
            color: customizeOpen ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
          }}
          aria-label="Customize"
          aria-pressed={customizeOpen}
        >
          <EditPencil className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            setCustomizeOpen(false);
            setAppsOpen(false);
            setLauncherFixed(null);
            setNotificationsOpen((o) => !o);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-opacity hover:opacity-90"
          style={{
            color: notificationsOpen ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
          }}
          aria-label={t("notificationsAria")}
          aria-pressed={notificationsOpen}
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* 9-dot launcher */}
        <div className="relative" ref={appsRef}>
          <button
            ref={launcherBtnRef}
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setNotificationsOpen(false);
              setCustomizeOpen(false);
              setAppsOpen((o) => {
                if (o) {
                  setLauncherFixed(null);
                  return false;
                }
                const el = launcherBtnRef.current;
                if (el) {
                  const r = el.getBoundingClientRect();
                  setLauncherFixed({ top: r.bottom + 4, right: window.innerWidth - r.right });
                }
                return true;
              });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl transition-opacity hover:opacity-90"
            style={{
              color: appsOpen ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
            }}
            aria-label="Apps"
            aria-pressed={appsOpen}
          >
            <span className="grid h-5 w-5 grid-cols-3 gap-[2px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="block h-1 w-1 rounded-full bg-current" />
              ))}
            </span>
          </button>
        </div>

        {appsOpen && launcherFixed != null && (
          <div
            ref={launcherPanelRef}
            className="fixed z-[200] rounded-2xl border p-5 shadow-lg"
            style={{
              top: launcherFixed.top,
              right: launcherFixed.right,
              width: "min(440px, calc(100vw - 12px))",
              maxWidth: "calc(100vw - 12px)",
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="max-h-[min(72vh,560px)] overflow-y-auto overflow-x-hidden">
              <AppLauncherGrid
                items={launcherCfg.items}
                avatarUrl={avatarUrl}
                onNavigate={() => {
                  setAppsOpen(false);
                  setLauncherFixed(null);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setAppLauncherEditOpen(true)}
              className="mt-3 w-full rounded-2xl border py-2.5 text-xs font-medium transition-opacity hover:opacity-90"
              style={{
                borderColor: "var(--dashboard-border)",
                color: "var(--dashboard-text)",
              }}
            >
              {tLauncher("edit")}
            </button>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--dashboard-bg)",
              borderColor: "var(--dashboard-border)",
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label={accountName}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5" style={{ color: "var(--dashboard-text-muted)" }} />
            )}
          </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full z-30 mt-1 w-[260px] rounded-2xl border py-2 shadow-lg"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
            }}
          >
            <div className="px-4 pb-3">
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--dashboard-border)", backgroundColor: "var(--dashboard-bg)" }}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border"
                    style={{
                      borderColor: "var(--dashboard-border)",
                      backgroundColor: "var(--dashboard-card)",
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6" style={{ color: "var(--dashboard-text-muted)" }} />
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--dashboard-text)" }}>
                    {accountName}
                  </p>
                  {userEmail && (
                    <p className="truncate text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm hover:opacity-90 hover:bg-[var(--dashboard-nav-active-bg)]"
                style={{ color: "var(--dashboard-text)" }}
              >
                <User className="h-5 w-5" style={{ color: "var(--dashboard-text-muted)" }} />
                {t("profile")}
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm hover:opacity-90 hover:bg-[var(--dashboard-nav-active-bg)]"
                style={{ color: "var(--dashboard-text)" }}
              >
                <Settings className="h-4 w-4" style={{ color: "var(--dashboard-text-muted)" }} />
                {t("settings")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-2 text-left text-sm hover:opacity-90 hover:bg-[var(--dashboard-nav-active-bg)]"
                style={{ color: "var(--dashboard-text-muted)" }}
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      </header>
      <DashboardCustomizeDrawer open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
      <DashboardNotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <AppLauncherEditorModal
        open={appLauncherEditOpen}
        onClose={() => setAppLauncherEditOpen(false)}
        onSaved={() => setLauncherCfg(readLauncherConfig())}
        avatarUrl={avatarUrl}
      />
    </>
  );
}
