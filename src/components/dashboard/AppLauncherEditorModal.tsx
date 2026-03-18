"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link2, Database, Cloud, Mail, Users } from "lucide-react";
import { User } from "iconoir-react";
import {
  SiGoogledrive,
  SiGooglecalendar,
  SiGoogleclassroom,
  SiSlack,
} from "react-icons/si";
import {
  type LauncherItem,
  DEFAULT_LAUNCHER_ITEMS,
  CUSTOM_ICON_PRESETS,
  createCustomLauncherItem,
  createPresetShortcutItem,
  moveItem,
  removeItemAt,
  writeLauncherConfig,
  readLauncherConfig,
  LATLAS_GENERIC_SHORTCUT,
  resolveBrandIconColor,
  type BuiltinLauncherId,
} from "@/lib/app-launcher";
import { getLauncherIconMeta } from "@/lib/launcher-extra-icons";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { DashboardCloseButton } from "@/components/dashboard/DashboardCloseButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  avatarUrl?: string | null;
};

function builtinLabelKey(id: BuiltinLauncherId): string {
  return `builtin_${id}`;
}

type FlyPending = {
  r0: DOMRect;
  cid: string;
  presetKey: string;
  color: string;
};

export function AppLauncherEditorModal({ open, onClose, onSaved, avatarUrl }: Props) {
  const t = useTranslations("dashboard.appLauncher");
  const { resolvedTheme } = useDashboardSettings();
  const isDark = resolvedTheme === "dark";
  const [items, setItems] = useState<LauncherItem[]>([]);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [genericSelected, setGenericSelected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flyPending, setFlyPending] = useState<FlyPending | null>(null);
  const [flying, setFlying] = useState<{
    x: number;
    y: number;
    tx: number;
    ty: number;
    presetKey: string;
    color: string;
    move: boolean;
  } | null>(null);
  const flyClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setItems([...readLauncherConfig().items]);
    setUrl("");
    setName("");
    setGenericSelected(true);
    setError(null);
    setFlyPending(null);
    setFlying(null);
  }, [open]);

  useLayoutEffect(() => {
    if (!flyPending) return;
    const row = document.querySelector(`[data-editor-launcher-cid="${flyPending.cid}"]`);
    if (!row) {
      setFlyPending(null);
      return;
    }
    const r1 = row.getBoundingClientRect();
    const size = 28;
    const x = flyPending.r0.left + flyPending.r0.width / 2 - size / 2;
    const y = flyPending.r0.top + flyPending.r0.height / 2 - size / 2;
    const tx = r1.left + 6;
    const ty = r1.top + r1.height / 2 - size / 2;
    setFlying({
      x,
      y,
      tx,
      ty,
      presetKey: flyPending.presetKey,
      color: flyPending.color,
      move: false,
    });
    setFlyPending(null);
  }, [flyPending, items]);

  useEffect(() => {
    if (!flying || flying.move) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlying((f) => (f ? { ...f, move: true } : null)));
    });
    return () => cancelAnimationFrame(id);
  }, [flying]);

  useEffect(() => {
    if (!flying?.move) return;
    if (flyClearRef.current) clearTimeout(flyClearRef.current);
    flyClearRef.current = setTimeout(() => {
      setFlying(null);
      flyClearRef.current = null;
    }, 360);
    return () => {
      if (flyClearRef.current) clearTimeout(flyClearRef.current);
    };
  }, [flying?.move]);

  if (!open) return null;

  function itemLabel(item: LauncherItem): string {
    if (item.kind === "custom") return item.name;
    try {
      return t(builtinLabelKey(item.id) as Parameters<typeof t>[0]);
    } catch {
      return item.id;
    }
  }

  function rowLeadingIcon(item: LauncherItem): ReactNode {
    const shell = "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border [&_svg]:shrink-0";
    const border = { borderColor: "var(--dashboard-border)" };
    if (item.kind === "custom") {
      if (item.iconKey === LATLAS_GENERIC_SHORTCUT) {
        return (
          <div className={shell} style={border}>
            <Link2 className="size-5 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
          </div>
        );
      }
      const meta = getLauncherIconMeta(item.iconKey);
      if (!meta) {
        return (
          <div className={shell} style={border}>
            <Link2 className="size-5 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
          </div>
        );
      }
      const Icon = meta.Icon;
      const col = resolveBrandIconColor(item.iconKey, item.color, isDark);
      return (
        <div className={shell} style={border}>
          <Icon size={22} color={col} />
        </div>
      );
    }
    const id = item.id;
    if (id === "latlas_account") {
      return (
        <div className={shell} style={border}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" />
          ) : (
            <User className="size-5 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
          )}
        </div>
      );
    }
    if (id === "latlas_data") {
      return (
        <div className={shell} style={border}>
          <Database className="size-5 shrink-0" style={{ color: "#60A5FA" }} aria-hidden />
        </div>
      );
    }
    switch (id) {
      case "google_drive":
        return (
          <div className={shell} style={border}>
            <SiGoogledrive size={22} color="#4285F4" />
          </div>
        );
      case "onedrive":
        return (
          <div className={shell} style={border}>
            <Cloud className="size-5 shrink-0" style={{ color: "#0078D4" }} aria-hidden />
          </div>
        );
      case "google_calendar":
        return (
          <div className={shell} style={border}>
            <SiGooglecalendar size={22} color="#EA4335" />
          </div>
        );
      case "outlook":
        return (
          <div className={shell} style={border}>
            <Mail className="size-5 shrink-0" style={{ color: "#0078D4" }} aria-hidden />
          </div>
        );
      case "google_classroom":
        return (
          <div className={shell} style={border}>
            <SiGoogleclassroom size={22} color="#FBBC05" />
          </div>
        );
      case "teams":
        return (
          <div className={shell} style={border}>
            <Users className="size-5 shrink-0" style={{ color: "#6264A7" }} aria-hidden />
          </div>
        );
      case "slack":
        return (
          <div className={shell} style={border}>
            <SiSlack size={22} color="#611F69" />
          </div>
        );
      default:
        return (
          <div className={shell} style={border}>
            <Link2 className="size-5 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
          </div>
        );
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

  function handleAddCustom() {
    const created = createCustomLauncherItem(url, name, LATLAS_GENERIC_SHORTCUT);
    if (!created) {
      setError(t("invalidUrlOrName"));
      return;
    }
    setItems((prev) => [...prev, created]);
    setUrl("");
    setName("");
    setError(null);
  }

  function handlePresetClick(e: React.MouseEvent<HTMLButtonElement>, p: (typeof CUSTOM_ICON_PRESETS)[0]) {
    const created = createPresetShortcutItem(p.key, items);
    if (!created || created.kind !== "custom") return;
    const r0 = e.currentTarget.getBoundingClientRect();
    setItems((prev) => [...prev, created]);
    setFlyPending({ r0, cid: created.cid, presetKey: p.key, color: p.color });
    setError(null);
  }

  const availablePresets = CUSTOM_ICON_PRESETS.filter((p) => !items.some((i) => i.kind === "custom" && i.iconKey === p.key));

  const FlyIcon = flying ? getLauncherIconMeta(flying.presetKey)?.Icon : null;
  const flyColor = flying
    ? resolveBrandIconColor(flying.presetKey, flying.color, isDark)
    : "";

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
      {flying && FlyIcon && (
        <div
          className="pointer-events-none fixed z-[70] flex size-7 items-center justify-center transition-[left,top,opacity,transform] duration-300 ease-out"
          style={{
            left: flying.move ? flying.tx : flying.x,
            top: flying.move ? flying.ty : flying.y,
            opacity: flying.move ? 0.95 : 1,
            transform: flying.move ? "scale(0.92)" : "scale(1)",
          }}
        >
          <FlyIcon size={26} color={flyColor} className="shrink-0 drop-shadow-md" />
        </div>
      )}
      <div
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-5 shadow-xl sm:p-6"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="app-launcher-editor-title" className="min-w-0 flex-1 text-lg font-semibold">
            {t("title")}
          </h2>
          <DashboardCloseButton onClick={onClose} aria-label={t("close")} />
        </div>

        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={item.kind === "custom" ? item.cid : item.id}
              data-editor-launcher-cid={item.kind === "custom" ? item.cid : undefined}
              className="flex items-center gap-2 rounded-2xl border px-2 py-2 text-sm"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              {rowLeadingIcon(item)}
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
          <div className="mt-2 grid max-h-52 grid-cols-5 gap-2.5 overflow-y-auto p-1 sm:grid-cols-6">
            <button
              type="button"
              onClick={() => {
                setGenericSelected(true);
              }}
              className="flex aspect-square min-h-[2.75rem] w-full max-w-[3rem] items-center justify-center justify-self-center rounded-xl border-2 transition-opacity hover:opacity-90"
              style={{
                borderColor: genericSelected ? "var(--dashboard-text)" : "var(--dashboard-border)",
                backgroundColor: "var(--dashboard-bg)",
              }}
              title={t("genericIcon")}
              aria-label={t("genericIcon")}
              aria-pressed={genericSelected}
            >
              <Link2 className="size-6 shrink-0" style={{ color: "var(--dashboard-text-muted)" }} />
            </button>
            {availablePresets.map((p) => {
              const Ic = getLauncherIconMeta(p.key)?.Icon;
              const col = resolveBrandIconColor(p.key, p.color, isDark);
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={(e) => handlePresetClick(e, p)}
                  className="flex aspect-square min-h-[2.75rem] w-full max-w-[3rem] items-center justify-center justify-self-center rounded-xl border-2 transition-opacity hover:opacity-90"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    backgroundColor: "var(--dashboard-bg)",
                  }}
                  title={p.label}
                  aria-label={p.label}
                >
                  <span className="pointer-events-none inline-flex size-6 shrink-0 items-center justify-center sm:size-7">
                    {Ic ? <Ic size={24} color={col} className="shrink-0" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-3 block text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
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
          <button
            type="button"
            onClick={handleAddCustom}
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
