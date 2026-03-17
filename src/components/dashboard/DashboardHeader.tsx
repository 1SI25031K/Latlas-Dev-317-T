"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { User, Settings, LogOut, MediaImage } from "iconoir-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

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
  const { wallpaperOn, setWallpaperOn } = useDashboardSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b px-5"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Latlas icon placeholder (replace with logo later) */}
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-bold"
          style={{
            backgroundColor: "var(--dashboard-bg)",
            border: "1px solid var(--dashboard-border)",
            color: "var(--dashboard-text-muted)",
          }}
        >
          L
        </span>
        <span className="text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
          {getPageLabel()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWallpaperOn(!wallpaperOn)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
          style={{
            backgroundColor: wallpaperOn ? "var(--dashboard-border)" : "var(--dashboard-bg)",
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text-muted)",
          }}
          aria-label={t("wallpaper")}
          aria-pressed={wallpaperOn}
        >
          <MediaImage className="h-5 w-5" />
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
            className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-2xl border py-1 shadow-lg"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
            }}
          >
            <div className="border-b px-3 py-2" style={{ borderColor: "var(--dashboard-border)" }}>
              <p className="truncate text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                {accountName}
              </p>
              <p className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                {t("accountSubtitle")}
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:opacity-90"
              style={{ color: "var(--dashboard-text)" }}
            >
              <User className="h-5 w-5" style={{ color: "var(--dashboard-text-muted)" }} />
              {t("profile")}
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:opacity-90"
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
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:opacity-90"
              style={{ color: "var(--dashboard-text-muted)" }}
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
