"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClass } from "@/app/actions/classes";

export function CreateClassForm() {
  const router = useRouter();
  const t = useTranslations("class");
  const tDash = useTranslations("dashboard");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ accessCode: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setLoading(true);
    const result = await createClass(name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.accessCode && result.password) {
      setCreated({ accessCode: result.accessCode, password: result.password });
      setName("");
      router.refresh();
      setTimeout(() => setCreated(null), 15000);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        {tDash("createClass")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border p-6 shadow-lg"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
              {t("createTitle")}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              {error && (
                <p className="rounded-lg bg-red-500/20 p-2 text-sm text-red-400">
                  {error}
                </p>
              )}
              {created && (
                <div
                  className="rounded-lg border p-3 text-sm"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    backgroundColor: "var(--dashboard-bg)",
                    color: "var(--dashboard-text-muted)",
                  }}
                >
                  <p className="font-medium" style={{ color: "var(--dashboard-text)" }}>{t("accessCode")}: <span className="font-mono">{created.accessCode}</span></p>
                  <p className="mt-1 font-medium" style={{ color: "var(--dashboard-text)" }}>{t("password")}: <span className="font-mono">{created.password}</span></p>
                  <p className="mt-2">保存してから閉じてください。</p>
                </div>
              )}
              <div>
                <label htmlFor="class-name" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                  {t("name")}
                </label>
                <input
                  id="class-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    backgroundColor: "var(--dashboard-bg)",
                    color: "var(--dashboard-text)",
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-4 py-2 hover:opacity-90"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "..." : t("createTitle")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
