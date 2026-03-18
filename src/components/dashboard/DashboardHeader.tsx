"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { User, Settings, LogOut, EditPencil } from "iconoir-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { DashboardCustomizeDrawer } from "@/components/dashboard/DashboardCustomizeDrawer";

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
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useDashboardSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const supabase = createClient();

  const accountName = profileName || userEmail || t("profile");

  function getPageLabel(): string {
    if (pathname === "/dashboard" || pathname === "/dashboard/") return t("home");
    if (pathname.startsWith("/dashboard/settings")) return t("settings");
    if (pathname.startsWith("/dashboard/monitoring")) return t("monitoring");
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
  }, [customizeOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  return (
    <>
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b px-5"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
        }}
      >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--dashboard-bg)",
            borderColor: "var(--dashboard-border)",
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
        <span className="text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
          {getPageLabel()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            setCustomizeOpen((o) => !o);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--dashboard-bg)",
            borderColor: "var(--dashboard-border)",
            color: customizeOpen ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
          }}
          aria-label="Customize"
          aria-pressed={customizeOpen}
        >
          <EditPencil className="h-5 w-5" />
        </button>

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
    </>
  );
}
