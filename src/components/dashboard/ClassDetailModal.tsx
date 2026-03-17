"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Class } from "@/types/database";
import type { ClassSchedule, ClassScheduleSlot } from "@/types/database";
import {
  regenerateClassPassword,
  regenerateClassAccessCode,
  updateClass,
  deleteClass,
} from "@/app/actions/classes";
import { ClassJoinQrCode } from "@/components/dashboard/ClassJoinQrCode";
import {
  CLASS_ICON_IDS,
  CLASS_ICON_MAP,
  DEFAULT_CLASS_ICON_ID,
  DEFAULT_CLASS_COLOR_HEX,
  type ClassIconId,
} from "@/lib/class-icon-options";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function emptySlot(): ClassScheduleSlot {
  return { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" };
}

function slotsFromSchedule(schedule: ClassSchedule | null | undefined): ClassScheduleSlot[] {
  if (schedule?.slots?.length) return schedule.slots;
  return [emptySlot()];
}

type ClassDetailModalProps = {
  classId: string | null;
  classes: Class[];
  onClose: () => void;
  initialEditMode?: boolean;
  initialDeleteConfirm?: boolean;
};

export function ClassDetailModal({
  classId,
  classes,
  onClose,
  initialEditMode = false,
  initialDeleteConfirm = false,
}: ClassDetailModalProps) {
  const t = useTranslations("class");
  const locale = useLocale();
  const router = useRouter();
  const [regeneratedPassword, setRegeneratedPassword] = useState<string | null>(null);
  const [localAccessCode, setLocalAccessCode] = useState<string | null>(null);
  const [localPassword, setLocalPassword] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingAccessCode, setRegeneratingAccessCode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconId, setIconId] = useState<ClassIconId>(DEFAULT_CLASS_ICON_ID);
  const [colorHex, setColorHex] = useState(DEFAULT_CLASS_COLOR_HEX);
  const [slots, setSlots] = useState<ClassScheduleSlot[]>([emptySlot()]);
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");

  if (classId == null) return null;

  const classItem = classes.find((c) => c.id === classId);
  if (!classItem) return null;

  useEffect(() => {
    setLocalAccessCode(null);
    setLocalPassword(null);
    setDeleteConfirm(initialDeleteConfirm);
  }, [classId, initialDeleteConfirm]);

  useEffect(() => {
    if (initialEditMode && classId) setEditing(true);
  }, [classId, initialEditMode]);

  useEffect(() => {
    if (!editing || !classItem) return;
    setName(classItem.name);
    setDescription(classItem.description ?? "");
    const validIcon = classItem.icon_id && CLASS_ICON_IDS.includes(classItem.icon_id as ClassIconId)
      ? (classItem.icon_id as ClassIconId)
      : DEFAULT_CLASS_ICON_ID;
    setIconId(validIcon);
    setColorHex(classItem.color_hex || DEFAULT_CLASS_COLOR_HEX);
    setSlots(slotsFromSchedule(classItem.schedule));
    const s = classItem.schedule;
    setTermStart(s?.termStart ?? "");
    setTermEnd(s?.termEnd ?? "");
  }, [editing, classItem]);

  async function handleRegeneratePassword() {
    setRegenerating(true);
    const result = await regenerateClassPassword(classId!);
    setRegenerating(false);
    if (result.error) return;
    if (result.password) setRegeneratedPassword(result.password);
  }

  async function handleRegenerateAccessCode() {
    setRegeneratingAccessCode(true);
    const result = await regenerateClassAccessCode(classId!);
    setRegeneratingAccessCode(false);
    if (result.error) return;
    if (result.accessCode) setLocalAccessCode(result.accessCode);
    if (result.password) {
      setLocalPassword(result.password);
      setRegeneratedPassword(result.password);
    }
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteClass(classId!);
    setDeleting(false);
    if (result.error) return;
    onClose();
    router.refresh();
  }

  function addSlot() {
    setSlots((s) => [...s, emptySlot()]);
  }

  function removeSlot(i: number) {
    setSlots((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, patch: Partial<ClassScheduleSlot>) {
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)));
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError(null);
    setSaving(true);
    const schedule: ClassSchedule | null =
      slots.length > 0
        ? {
            slots,
            termStart: termStart.trim() || undefined,
            termEnd: termEnd.trim() || undefined,
          }
        : null;
    const result = await updateClass(classId!, {
      name: name.trim(),
      description: description.trim() || null,
      icon_id: iconId,
      color_hex: colorHex,
      schedule,
    });
    setSaving(false);
    if (result.error) {
      setEditError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  const cardStyle = {
    backgroundColor: "var(--dashboard-card)",
    borderColor: "var(--dashboard-border)",
    color: "var(--dashboard-text)",
  };
  const mutedStyle = { color: "var(--dashboard-text-muted)" };
  const inputStyle = {
    borderColor: "var(--dashboard-border)",
    backgroundColor: "var(--dashboard-bg)",
    color: "var(--dashboard-text)",
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-detail-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-6 shadow-lg"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2
            id="class-detail-title"
            className="text-lg font-semibold"
            style={{ color: "var(--dashboard-text)" }}
          >
            {editing ? t("editClass") : classItem.name}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-2xl px-2 py-1 text-sm font-medium hover:opacity-90"
                style={{
                  borderColor: "var(--dashboard-border)",
                  color: "var(--dashboard-text)",
                  border: "1px solid",
                }}
              >
                {t("edit")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-lg leading-none hover:opacity-80"
              style={mutedStyle}
              aria-label={t("close")}
            >
              ×
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="mt-4 flex flex-col gap-4">
            {editError && (
              <p className="rounded-lg bg-red-500/20 p-2 text-sm text-red-400">{editError}</p>
            )}
            <div>
              <label htmlFor="edit-class-name" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                {t("name")}
              </label>
              <input
                id="edit-class-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="edit-class-desc" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                {t("description")}
              </label>
              <textarea
                id="edit-class-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={2}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>{t("icon")}</span>
              <div className="mt-2 flex max-w-[calc(3*2.5rem+2*0.5rem)] flex-nowrap gap-2 overflow-x-auto pb-2">
                {CLASS_ICON_IDS.map((id) => {
                  const Icon = CLASS_ICON_MAP[id];
                  const selected = iconId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIconId(id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors"
                      style={{
                        borderColor: selected ? colorHex : "var(--dashboard-border)",
                        backgroundColor: selected ? `${colorHex}20` : "var(--dashboard-bg)",
                      }}
                    >
                      <Icon size={20} style={{ color: selected ? colorHex : "var(--dashboard-text-muted)" }} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>{t("color")}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColorHex(hex)}
                    className="h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
                    style={{
                      backgroundColor: hex,
                      borderColor: colorHex === hex ? "var(--dashboard-text)" : "transparent",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>{t("schedule")}</span>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2 text-xs font-medium" style={mutedStyle}>
                  <span className="w-16">{t("repeat")}</span>
                  <span className="flex-1">{t("startTime")}</span>
                  <span className="flex-1">{t("endTime")}</span>
                  <span className="w-10" />
                </div>
                {slots.map((slot, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(i, { dayOfWeek: Number(e.target.value) })}
                      className="w-24 rounded-lg border px-2 py-1.5 text-sm"
                      style={inputStyle}
                    >
                      {DAY_NAMES.map((day, d) => (
                        <option key={d} value={d}>{t(day)}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      style={inputStyle}
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(i, { endTime: e.target.value })}
                      className="rounded-lg border px-2 py-1.5 text-sm"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      disabled={slots.length === 1}
                      className="rounded px-2 py-1 text-sm opacity-80 hover:opacity-100 disabled:opacity-40"
                      style={mutedStyle}
                    >
                      {t("removeSlot")}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSlot}
                  className="text-sm font-medium"
                  style={mutedStyle}
                >
                  + {t("addSlot")}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs" style={mutedStyle}>{t("termStartLabel")}</label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs" style={mutedStyle}>{t("termEndLabel")}</label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-2xl border px-4 py-2 text-sm hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)", color: "var(--dashboard-text)" }}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "..." : t("save")}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            {deleteConfirm ? (
              <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4">
                <p className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>{t("deleteClassConfirm")}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="rounded-2xl border px-3 py-1.5 text-sm font-medium hover:opacity-90"
                    style={{ borderColor: "var(--dashboard-border)", color: "var(--dashboard-text)" }}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-2xl bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? "..." : t("deleteClass")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium" style={mutedStyle}>{t("accessCode")}</p>
                  <p className="mt-0.5 font-mono text-sm">{localAccessCode ?? classItem.access_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={mutedStyle}>{t("password")}</p>
                  {(localPassword ?? regeneratedPassword) ? (
                    <>
                      <p className="mt-0.5 font-mono text-sm">{localPassword ?? regeneratedPassword}</p>
                      <p className="mt-1 text-xs" style={mutedStyle}>{t("passwordRegenerated")}</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-0.5 text-sm" style={mutedStyle}>{t("passwordNotStored")}</p>
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        disabled={regenerating}
                        className="mt-2 rounded-2xl border px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                        style={{ borderColor: "var(--dashboard-border)", color: "var(--dashboard-text)" }}
                      >
                        {regenerating ? "..." : t("regeneratePassword")}
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={mutedStyle}>{t("qrCode")}</p>
                  <p className="mt-0.5 text-xs" style={mutedStyle}>{t("scanToJoin")}</p>
                  <div className="mt-2 flex justify-center">
                    <ClassJoinQrCode
                      accessCode={localAccessCode ?? classItem.access_code}
                      password={localPassword ?? regeneratedPassword}
                      size={200}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(`/${locale}/dashboard/class/${classId}/qr`, "_blank", "width=520,height=560")}
                      className="rounded-2xl border px-3 py-1.5 text-sm font-medium hover:opacity-90"
                      style={{ borderColor: "var(--dashboard-border)", color: "var(--dashboard-text)" }}
                    >
                      {t("openQrInNewWindow")}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateAccessCode}
                      disabled={regeneratingAccessCode}
                      className="rounded-2xl border px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                      style={{ borderColor: "var(--dashboard-border)", color: "var(--dashboard-text)" }}
                    >
                      {regeneratingAccessCode ? "..." : t("regenerateQr")}
                    </button>
                  </div>
                </div>
                <div className="border-t pt-4" style={{ borderColor: "var(--dashboard-border)" }}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="rounded-2xl border border-red-500/50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/10"
                  >
                    {t("deleteClass")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
