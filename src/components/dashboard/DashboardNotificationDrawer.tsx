"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DashboardCloseButton } from "@/components/dashboard/DashboardCloseButton";
import { DASHBOARD_DRAWER_ANIM_MS } from "@/lib/dashboard-drawer-anim";

const ANIM_MS = DASHBOARD_DRAWER_ANIM_MS;

export type DashboardNotification = {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  read?: boolean;
};

type DashboardNotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** 将来の通知配信用。未指定時は空表示 */
  notifications?: DashboardNotification[];
};

export function DashboardNotificationDrawer({
  open,
  onClose,
  notifications = [],
}: DashboardNotificationDrawerProps) {
  const t = useTranslations("dashboard.notifications");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }
    setVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
    }, ANIM_MS);
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${ANIM_MS}ms` }}
        onMouseDown={onClose}
      />

      <div className="pointer-events-none absolute right-0 top-0 h-full max-h-[100dvh] max-w-[92vw] w-[360px] min-h-0 overflow-hidden">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-drawer-title"
          className="pointer-events-auto flex h-full max-h-[100dvh] min-h-0 flex-col border-l shadow-[-6px_0_24px_rgba(0,0,0,0.08)]"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            transform: visible ? "translateX(0)" : "translateX(100%)",
            transition: `transform ${ANIM_MS}ms ease-out`,
            backgroundColor: "var(--dashboard-card)",
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text)",
          }}
        >
          <div
            className="flex h-16 shrink-0 items-center justify-between border-b px-4"
            style={{ borderColor: "var(--dashboard-border)" }}
          >
            <h2 id="notification-drawer-title" className="text-sm font-semibold">
              {t("title")}
            </h2>
            <DashboardCloseButton onClick={onClose} aria-label={tCommon("close")} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("empty")}
                </p>
                <p className="mt-2 max-w-[260px] text-xs leading-relaxed" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("hint")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {sorted.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-2xl border p-3 text-left text-sm"
                    style={{
                      borderColor: "var(--dashboard-border)",
                      backgroundColor: "var(--dashboard-bg)",
                      opacity: n.read ? 0.75 : 1,
                    }}
                  >
                    <div className="font-medium">{n.title}</div>
                    {n.body ? (
                      <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                        {n.body}
                      </p>
                    ) : null}
                    <time
                      className="mt-2 block text-[11px]"
                      style={{ color: "var(--dashboard-text-muted)" }}
                      dateTime={n.createdAt}
                    >
                      {(() => {
                        const d = new Date(n.createdAt);
                        return Number.isNaN(d.getTime())
                          ? n.createdAt
                          : d.toLocaleString(locale, {
                              dateStyle: "short",
                              timeStyle: "short",
                            });
                      })()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
