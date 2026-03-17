"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClass } from "@/app/actions/classes";
import type { ClassSchedule, ClassScheduleSlot } from "@/types/database";
import {
  CLASS_ICON_IDS,
  CLASS_ICON_MAP,
  DEFAULT_CLASS_ICON_ID,
  DEFAULT_CLASS_COLOR_HEX,
  type ClassIconId,
} from "@/lib/class-icon-options";
import { ClassCalendarLinks } from "@/components/dashboard/ClassCalendarLinks";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function emptySlot(): ClassScheduleSlot {
  return { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" };
}

type CreatedState = {
  accessCode: string;
  password: string;
  className: string;
  classId?: string;
  classSchedule?: ClassSchedule | null;
};

export function CreateClassForm() {
  const router = useRouter();
  const t = useTranslations("class");
  const tDash = useTranslations("dashboard");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconId, setIconId] = useState<ClassIconId>(DEFAULT_CLASS_ICON_ID);
  const [colorHex, setColorHex] = useState(DEFAULT_CLASS_COLOR_HEX);
  const [slots, setSlots] = useState<ClassScheduleSlot[]>([emptySlot()]);
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [created, setCreated] = useState<CreatedState | null>(null);

  function addSlot() {
    setSlots((s) => [...s, emptySlot()]);
  }

  function removeSlot(i: number) {
    setSlots((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, patch: Partial<ClassScheduleSlot>) {
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setLoading(true);
    const schedule: ClassSchedule | null =
      slots.length > 0
        ? {
            slots,
            termStart: termStart.trim() || undefined,
            termEnd: termEnd.trim() || undefined,
          }
        : null;
    const result = await createClass({
      name,
      description: description.trim() || null,
      icon_id: iconId,
      color_hex: colorHex,
      schedule,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.accessCode && result.password) {
      setCreated({
        accessCode: result.accessCode,
        password: result.password,
        className: name,
        classId: result.classId,
        classSchedule: result.classSchedule ?? null,
      });
      setName("");
      setDescription("");
      setIconId(DEFAULT_CLASS_ICON_ID);
      setColorHex(DEFAULT_CLASS_COLOR_HEX);
      setSlots([emptySlot()]);
      setTermStart("");
      setTermEnd("");
      router.refresh();
      setTimeout(() => setCreated(null), 30000);
    }
  }

  const cardStyle = {
    backgroundColor: "var(--dashboard-card)",
    borderColor: "var(--dashboard-border)",
    color: "var(--dashboard-text)",
  };
  const inputStyle = {
    borderColor: "var(--dashboard-border)",
    backgroundColor: "var(--dashboard-bg)",
    color: "var(--dashboard-text)",
  };

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
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border p-6 shadow-lg"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
              {t("createTitle")}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              {error && (
                <p className="rounded-lg bg-red-500/20 p-2 text-sm text-red-400">{error}</p>
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
                  <p className="font-medium" style={{ color: "var(--dashboard-text)" }}>
                    {t("accessCode")}: <span className="font-mono">{created.accessCode}</span>
                  </p>
                  <p className="mt-1 font-medium" style={{ color: "var(--dashboard-text)" }}>
                    {t("password")}: <span className="font-mono">{created.password}</span>
                  </p>
                  <p className="mt-2">{t("saveAndClose")}</p>
                  <ClassCalendarLinks
                    className={created.className}
                    schedule={created.classSchedule ?? undefined}
                  />
                </div>
              )}

              {!created && (
                <>
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
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="class-desc" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                      {t("description")}
                    </label>
                    <textarea
                      id="class-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("descriptionPlaceholder")}
                      rows={2}
                      className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                      {t("icon")}
                    </span>
                    <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-8">
                      {CLASS_ICON_IDS.map((id) => {
                        const Icon = CLASS_ICON_MAP[id];
                        const selected = iconId === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setIconId(id)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                            style={{
                              borderColor: selected ? colorHex : "var(--dashboard-border)",
                              backgroundColor: selected ? `${colorHex}20` : "var(--dashboard-bg)",
                            }}
                          >
                            <Icon className="h-5 w-5" style={{ color: selected ? colorHex : "var(--dashboard-text-muted)" }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                      {t("color")}
                    </span>
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
                    <span className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                      {t("schedule")}
                    </span>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2 text-xs font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
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
                              <option key={d} value={d}>
                                {t(day)}
                              </option>
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
                            style={{ color: "var(--dashboard-text-muted)" }}
                          >
                            {t("removeSlot")}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSlot}
                        className="text-sm font-medium"
                        style={{ color: "var(--dashboard-text-muted)" }}
                      >
                        + {t("addSlot")}
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                          {t("termStartLabel")}
                        </label>
                        <input
                          type="date"
                          value={termStart}
                          onChange={(e) => setTermStart(e.target.value)}
                          className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                          {t("termEndLabel")}
                        </label>
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
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
                      {t("preview")}
                    </span>
                    <div
                      className="mt-2 flex items-center gap-3 rounded-lg border p-3"
                      style={{
                        borderColor: "var(--dashboard-border)",
                        backgroundColor: "var(--dashboard-bg)",
                      }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${colorHex}30` }}
                      >
                        {(() => {
                          const Icon = CLASS_ICON_MAP[iconId];
                          return <Icon className="h-5 w-5" style={{ color: colorHex }} />;
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium" style={{ color: "var(--dashboard-text)" }}>
                          {name || t("namePlaceholder")}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setCreated(null);
                  }}
                  className="rounded-lg border px-4 py-2 hover:opacity-90"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  {t("cancel")}
                </button>
                {!created ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "..." : t("createTitle")}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
