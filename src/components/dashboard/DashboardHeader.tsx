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
  const {
    backgroundMode,
    backgroundColor,
    setBackgroundMode,
    setBackgroundColor,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useDashboardSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const accountName = profileName || userEmail || t("profile");

  const BACKGROUND_COLORS: Array<{ label: string; hex: string }> = [
    { label: "Blue", hex: "#3B82F6" },
    { label: "Purple", hex: "#A855F7" },
    { label: "Pink", hex: "#EC4899" },
    { label: "Red", hex: "#EF4444" },
    { label: "Orange", hex: "#F97316" },
    { label: "Yellow", hex: "#FBBF24" },
    { label: "Green", hex: "#10B981" },
    { label: "Mint", hex: "#2DD4BF" },
    { label: "Teal", hex: "#0D9488" },
    { label: "Cyan", hex: "#06B6D4" },
    { label: "Indigo", hex: "#6366F1" },
    { label: "Brown", hex: "#78716C" },
    { label: "Gray", hex: "#6B7280" },
    { label: "Slate", hex: "#475569" },
    { label: "Zinc", hex: "#71717A" },
    { label: "Rose", hex: "#FB7185" },
  ];

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
    if (!bgPickerOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target as Node)) {
        setBgPickerOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setBgPickerOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [bgPickerOpen]);

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
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--dashboard-bg)",
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text-muted)",
          }}
          aria-label="Menu"
          aria-pressed={sidebarCollapsed}
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
        <span className="text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
          {getPageLabel()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={bgPickerRef}>
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setBgPickerOpen((o) => !o);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
            style={{
              backgroundColor: backgroundMode === "theme" ? "var(--dashboard-bg)" : "var(--dashboard-border)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text-muted)",
            }}
            aria-label={t("wallpaper")}
            aria-pressed={backgroundMode !== "theme"}
            aria-expanded={bgPickerOpen}
          >
            <MediaImage className="h-5 w-5" />
          </button>

          {bgPickerOpen && (
            <div
              className="absolute right-0 top-full z-40 mt-1 w-56 rounded-2xl border p-3 shadow-lg"
              style={{
                backgroundColor: "var(--dashboard-card)",
                borderColor: "var(--dashboard-border)",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_COLORS.map((c) => {
                  const selected = backgroundMode === "solid" && backgroundColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setBackgroundColor(c.hex);
                        setBackgroundMode("solid");
                        setBgPickerOpen(false);
                      }}
                      className="h-8 w-8 rounded-2xl border transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: selected ? "var(--dashboard-text)" : "var(--dashboard-border)",
                      }}
                      aria-label={c.label}
                      aria-pressed={selected}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setBackgroundMode("daily");
                  setBgPickerOpen(false);
                }}
                className="mt-3 w-full rounded-2xl border px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                style={{
                  borderColor: "var(--dashboard-border)",
                  color: "var(--dashboard-text)",
                  backgroundColor: backgroundMode === "daily" ? "var(--dashboard-border)" : "transparent",
                }}
              >
                {t("dailyWallpaper")}
              </button>
            </div>
          )}
        </div>

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
