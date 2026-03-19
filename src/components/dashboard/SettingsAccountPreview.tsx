"use client";

import { useTranslations } from "next-intl";
import { User } from "iconoir-react";

type SettingsAccountPreviewProps = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

function getManageUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_ACCOUNT_MANAGE_URL?.trim();
  if (!u) return null;
  try {
    new URL(u);
    return u;
  } catch {
    return null;
  }
}

export function SettingsAccountPreview({
  displayName,
  email,
  avatarUrl,
}: SettingsAccountPreviewProps) {
  const t = useTranslations("settings");
  const manageUrl = getManageUrl();

  return (
    <section
      className="mt-6 rounded-lg border p-4"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      <h2
        className="text-sm font-medium uppercase tracking-wider"
        style={{ color: "var(--dashboard-text-muted)" }}
      >
        {t("accountPreviewSection")}
      </h2>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="h-20 w-20 shrink-0 overflow-hidden rounded-full border"
          style={{
            borderColor: "var(--dashboard-border)",
            backgroundColor: "var(--dashboard-sidebar)",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10" style={{ color: "var(--dashboard-text-muted)" }} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-base font-semibold" style={{ color: "var(--dashboard-text)" }}>
            {displayName || t("profileNoName")}
          </p>
          {email && (
            <p className="mt-1 truncate text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
              {email}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4">
        {manageUrl ? (
          <a
            href={manageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
              backgroundColor: "var(--dashboard-sidebar)",
            }}
          >
            {t("manageAccount")}
          </a>
        ) : (
          <p className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("accountManageUrlUnset")}
          </p>
        )}
      </div>
    </section>
  );
}
