"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link2, Database, Cloud, Mail, Users, GripVertical } from "lucide-react";
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
  reorderItems,
  removeItemAt,
  writeLauncherConfig,
  readLauncherConfig,
  ensureLatlasAccountFirst,
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
  const [items, setItems] = useState<LauncherItem[]>(() =>
    ensureLatlasAccountFirst(
      typeof window !== "undefined"
        ? readLauncherConfig().items
        : [...DEFAULT_LAUNCHER_ITEMS]
    )
  );
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
  const initialItemsRef = useRef<LauncherItem[]>([]);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragStartIndexRef = useRef<number>(0);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LAUNCHER_EDITOR_ANIM_MS = 360;

  useEffect(() => {
    if (!open) return;
    const loaded = ensureLatlasAccountFirst(readLauncherConfig().items);
    setItems(loaded);
    initialItemsRef.current = loaded;
    setUrl("");
    setName("");
    setGenericSelected(true);
    setError(null);
    setFlyPending(null);
    setFlying(null);
    setConfirmExitOpen(false);
    setDragOverIndex(null);
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      setVisible(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

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

  function hasUnsavedChanges(): boolean {
    const initial = initialItemsRef.current;
    if (initial.length !== items.length) return true;
    return JSON.stringify(initial) !== JSON.stringify(items);
  }

  function doClose() {
    setVisible(false);
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = setTimeout(() => {
      onClose();
      exitTimeoutRef.current = null;
    }, LAUNCHER_EDITOR_ANIM_MS);
  }

  function requestClose() {
    if (hasUnsavedChanges()) {
      setConfirmExitOpen(true);
      return;
    }
    doClose();
  }

  function handleSave() {
    if (items.length === 0) {
      setError(t("needOneItem"));
      return;
    }
    writeLauncherConfig({ items: ensureLatlasAccountFirst(items) });
    initialItemsRef.current = ensureLatlasAccountFirst(items);
    onSaved();
    doClose();
  }

  function handleReset() {
    setItems(ensureLatlasAccountFirst([...DEFAULT_LAUNCHER_ITEMS]));
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
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-label={t("close")}
        onClick={requestClose}
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
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-5 shadow-xl sm:p-6 transition-[transform,opacity] ease-out"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
          transform: visible ? "translateY(0)" : "translateY(40px)",
          opacity: visible ? 1 : 0,
          transitionDuration: `${LAUNCHER_EDITOR_ANIM_MS}ms`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="app-launcher-editor-title" className="min-w-0 flex-1 text-lg font-semibold">
            {t("title")}
          </h2>
          <DashboardCloseButton onClick={requestClose} aria-label={t("close")} />
        </div>

        <ul className="mt-4 space-y-2">
          <li
            className="flex items-center gap-2 rounded-2xl border px-2 py-2 text-sm"
            style={{
              borderColor: "var(--dashboard-border)",
              backgroundColor: "var(--dashboard-nav-active-bg)",
            }}
          >
            {rowLeadingIcon(items[0])}
            <div className="min-w-0 flex-1 truncate">
              <span className="font-medium">{itemLabel(items[0])}</span>
              <span
                className="ml-2 text-xs"
                style={{ color: "var(--dashboard-text-muted)" }}
              >
                ({t("latlasAccountFixed")})
              </span>
            </div>
          </li>
          {items.slice(1).map((item, i) => {
            const index = i + 1;
            const isDropTarget = dragOverIndex === index;
            return (
              <li
                key={item.kind === "custom" ? item.cid : item.id}
                data-editor-launcher-cid={item.kind === "custom" ? item.cid : undefined}
                draggable
                onDragStart={(e) => {
                  dragStartIndexRef.current = index;
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(index));
                  e.dataTransfer.setData("application/json", JSON.stringify({ index }));
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex((prev) => (prev === index ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = dragStartIndexRef.current;
                  if (from != null && from !== index) {
                    setItems((prev) => reorderItems(prev, from, index));
                  }
                  setDragOverIndex(null);
                }}
                onDragEnd={() => setDragOverIndex(null)}
                className="flex cursor-grab active:cursor-grabbing items-center gap-2 rounded-2xl border px-2 py-2 text-sm"
                style={{
                  borderColor: isDropTarget ? "var(--dashboard-text-muted)" : "var(--dashboard-border)",
                  backgroundColor: isDropTarget ? "var(--dashboard-nav-active-bg)" : undefined,
                }}
              >
                <span className="shrink-0 touch-none" aria-hidden style={{ color: "var(--dashboard-text-muted)" }}>
                  <GripVertical className="size-4" />
                </span>
                {rowLeadingIcon(item)}
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{itemLabel(item)}</span>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl px-2 py-1 text-xs text-red-600 hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems((prev) => removeItemAt(prev, index));
                    setError(null);
                  }}
                  aria-label={t("remove")}
                >
                  {t("remove")}
                </button>
              </li>
            );
          })}
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
            onClick={requestClose}
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

      {confirmExitOpen && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="app-launcher-confirm-exit-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmExitOpen(false)}
            aria-hidden
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-2xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="app-launcher-confirm-exit-title" className="text-lg font-semibold">
              {t("confirmExitTitle")}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("confirmExitMessage")}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="rounded-2xl border px-4 py-2 text-sm"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("confirmExitStay")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  doClose();
                }}
                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t("confirmExitDiscard")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
