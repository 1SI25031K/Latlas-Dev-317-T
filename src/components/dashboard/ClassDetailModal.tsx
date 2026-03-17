"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Class } from "@/types/database";
import { regenerateClassPassword } from "@/app/actions/classes";
import { ClassJoinQrCode } from "@/components/dashboard/ClassJoinQrCode";

type ClassDetailModalProps = {
  classId: string | null;
  classes: Class[];
  onClose: () => void;
};

export function ClassDetailModal({
  classId,
  classes,
  onClose,
}: ClassDetailModalProps) {
  const t = useTranslations("class");
  const [regeneratedPassword, setRegeneratedPassword] = useState<string | null>(
    null
  );
  const [regenerating, setRegenerating] = useState(false);

  if (classId == null) return null;

  const classItem = classes.find((c) => c.id === classId);
  if (!classItem) return null;

  async function handleRegeneratePassword() {
    setRegenerating(true);
    const result = await regenerateClassPassword(classId!);
    setRegenerating(false);
    if (result.error) return;
    if (result.password) setRegeneratedPassword(result.password);
  }

  const cardStyle = {
    backgroundColor: "var(--dashboard-card)",
    borderColor: "var(--dashboard-border)",
    color: "var(--dashboard-text)",
  };
  const mutedStyle = { color: "var(--dashboard-text-muted)" };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-detail-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border p-6 shadow-lg"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2
            id="class-detail-title"
            className="text-lg font-semibold"
            style={{ color: "var(--dashboard-text)" }}
          >
            {classItem.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-lg leading-none hover:opacity-80"
            style={mutedStyle}
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium" style={mutedStyle}>
              {t("accessCode")}
            </p>
            <p className="mt-0.5 font-mono text-sm">
              {classItem.access_code}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium" style={mutedStyle}>
              {t("password")}
            </p>
            {regeneratedPassword ? (
              <>
                <p className="mt-0.5 font-mono text-sm">
                  {regeneratedPassword}
                </p>
                <p className="mt-1 text-xs" style={mutedStyle}>
                  {t("passwordRegenerated")}
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm" style={mutedStyle}>
                  {t("passwordNotStored")}
                </p>
                <button
                  type="button"
                  onClick={handleRegeneratePassword}
                  disabled={regenerating}
                  className="mt-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  {regenerating ? "..." : t("regeneratePassword")}
                </button>
              </>
            )}
          </div>

          <div>
            <p className="text-sm font-medium" style={mutedStyle}>
              {t("qrCode")}
            </p>
            <p className="mt-0.5 text-xs" style={mutedStyle}>
              {t("scanToJoin")}
            </p>
            <div className="mt-2 flex justify-center">
              <ClassJoinQrCode
                accessCode={classItem.access_code}
                password={regeneratedPassword}
                size={200}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
