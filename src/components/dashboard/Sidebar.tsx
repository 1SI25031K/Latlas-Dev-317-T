"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Class } from "@/types/database";
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SidebarProps = {
  locale: string;
  classes: Class[];
  profileName: string | null;
};

export function Sidebar({ locale, classes, profileName }: SidebarProps) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  const navClass = (path: string) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === path || pathname.startsWith(path + "/")
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href="/dashboard" className={navClass("/dashboard")}>
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {t("title")}
        </Link>
        <div className="my-2 border-t border-gray-200" />
        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-gray-400">
          {t("classes")}
        </span>
        {classes.slice(0, 8).map((c) => (
          <Link
            key={c.id}
            href="/dashboard"
            className={navClass(`/dashboard`)}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="truncate">{c.name}</span>
          </Link>
        ))}
        <div className="my-2 border-t border-gray-200" />
        <Link href="/dashboard/monitoring" className={navClass("/dashboard/monitoring")}>
          <Activity className="h-5 w-5 shrink-0" />
          {t("monitoring")}
        </Link>
        <Link href="/dashboard/settings" className={navClass("/dashboard/settings")}>
          <Settings className="h-5 w-5 shrink-0" />
          {t("settings")}
        </Link>
      </div>
      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{profileName || t("profile")}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
