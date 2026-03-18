"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  type LauncherConfig,
  type LauncherItem,
  DEFAULT_LAUNCHER_ITEMS,
  CUSTOM_ICON_PRESETS,
  createCustomLauncherItem,
  moveItem,
  removeItemAt,
  writeLauncherConfig,
  readLauncherConfig,
  LAUNCHER_SI_ICONS,
  type BuiltinLauncherId,
} from "@/lib/app-launcher";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function builtinLabelKey(id: BuiltinLauncherId): string {
  return `builtin_${id}`;
}

export function AppLauncherEditorModal({ open, onClose, onSaved }: Props) {
  const t = useTranslations("dashboard.appLauncher");
  const [items, setItems] = useState<LauncherItem[]>([]);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState(CUSTOM_ICON_PRESETS[0]?.key ?? "SiGithub");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setItems([...readLauncherConfig().items]);
    setUrl("");
    setName("");
    setIconKey(CUSTOM_ICON_PRESETS[0]?.key ?? "SiGithub");
    setError(null);
  }, [open]);

  if (!open) return null;

  function itemLabel(item: LauncherItem): string {
    if (item.kind === "custom") return item.name;
    try {
      return t(builtinLabelKey(item.id));
    } catch {
      return item.id;
    }
  }

  function handleSave() {
    if (items.length === 0) {
      setError(t("needOneItem"));
      return;
    }
    writeLauncherConfig({ items });
    onSaved();
    onClose();
  }

  function handleReset() {
    setItems([...DEFAULT_LAUNCHER_ITEMS]);
    setError(null);
  }

  function handleAdd() {
    const created = createCustomLauncherItem(url, name, iconKey);
    if (!created) {
      setError(t("invalidUrlOrName"));
      return;
    }
    setItems((prev) => [...prev, created]);
    setUrl("");
    setName("");
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-launcher-editor-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border p-5 shadow-xl"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="app-launcher-editor-title" className="text-lg font-semibold">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
          {t("description")}
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={item.kind === "custom" ? item.cid : item.id}
              className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              <div className="min-w-0 flex-1 truncate">
                <span className="font-medium">{itemLabel(item)}</span>
                {item.kind === "custom" && (
                  <span
                    className="ml-2 truncate text-xs"
                    style={{ color: "var(--dashboard-text-muted)" }}
                  >
                    {item.url}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="rounded-xl px-2 py-1 text-xs hover:opacity-80"
                  style={{ backgroundColor: "var(--dashboard-nav-active-bg)" }}
                  onClick={() => setItems((prev) => moveItem(prev, index, -1))}
                  disabled={index === 0}
                  aria-label={t("moveUp")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-xl px-2 py-1 text-xs hover:opacity-80"
                  style={{ backgroundColor: "var(--dashboard-nav-active-bg)" }}
                  onClick={() => setItems((prev) => moveItem(prev, index, 1))}
                  disabled={index === items.length - 1}
                  aria-label={t("moveDown")}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-xl px-2 py-1 text-xs text-red-600 hover:opacity-80"
                  onClick={() => {
                    setItems((prev) => removeItemAt(prev, index));
                    setError(null);
                  }}
                  aria-label={t("remove")}
                >
                  {t("remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--dashboard-border)" }}>
          <h3 className="text-sm font-semibold">{t("addShortcut")}</h3>
          <label className="mt-2 block text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("url")}
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--dashboard-border)",
                backgroundColor: "var(--dashboard-bg)",
                color: "var(--dashboard-text)",
              }}
            />
          </label>
          <label className="mt-2 block text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("name")}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--dashboard-border)",
                backgroundColor: "var(--dashboard-bg)",
                color: "var(--dashboard-text)",
              }}
            />
          </label>
          <p className="mt-2 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("icon")}
          </p>
          <div className="mt-2 grid max-h-36 grid-cols-6 gap-2 overflow-y-auto p-1">
            {CUSTOM_ICON_PRESETS.map((p) => {
              const sel = iconKey === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setIconKey(p.key)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-opacity hover:opacity-90"
                  style={{
                    borderColor: sel ? "var(--dashboard-text)" : "var(--dashboard-border)",
                    backgroundColor: "var(--dashboard-bg)",
                  }}
                  title={p.label}
                  aria-label={p.label}
                  aria-pressed={sel}
                >
                  <span className="pointer-events-none inline-flex size-[22px] shrink-0 items-center justify-center">
                    {(() => {
                      const Ic = LAUNCHER_SI_ICONS[p.key]?.Icon;
                      return Ic ? <Ic size={22} color={p.color} className="shrink-0" /> : null;
                    })()}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 w-full rounded-2xl bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            {t("addButton")}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-2xl border px-4 py-2 text-sm"
            style={{ borderColor: "var(--dashboard-border)" }}
          >
            {t("reset")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-2 text-sm"
            style={{ borderColor: "var(--dashboard-border)" }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto rounded-2xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
