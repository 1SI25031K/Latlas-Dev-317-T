"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useDashboardTimer,
  formatDurationMs,
  DEFAULT_TIMER_DURATION_MS,
} from "@/components/dashboard/DashboardTimerContext";

const PRESET_MS = [
  15_000, 30_000, 45_000,
  60_000, 3 * 60_000, 5 * 60_000, 10 * 60_000, 15 * 60_000, 30 * 60_000,
] as const;

function presetLabel(t: ReturnType<typeof useTranslations>, ms: number): string {
  if (ms < 60_000) return t("seconds", { n: ms / 1000 });
  return t("minutes", { n: ms / 60_000 });
}

export function TimerPageClient() {
  const t = useTranslations("timerPage");
  const {
    timerStatus,
    timerDurationMs,
    timerDisplayMs,
    timerSetDurationMs,
    timerStart,
    timerPause,
    timerResume,
    timerReset,
  } = useDashboardTimer();

  const canEditDuration = timerStatus === "idle" || timerStatus === "finished";
  const [h, setH] = useState(0);
  const [min, setMin] = useState(5);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (!canEditDuration) return;
    const total = timerDurationMs;
    setH(Math.floor(total / 3_600_000));
    setMin(Math.floor((total % 3_600_000) / 60_000));
    setSec(Math.floor((total % 60_000) / 1000));
  }, [timerDurationMs, canEditDuration]);

  function applyHms() {
    const hh = Math.min(23, Math.max(0, h));
    const mm = Math.min(59, Math.max(0, min));
    const ss = Math.min(59, Math.max(0, sec));
    const ms = hh * 3_600_000 + mm * 60_000 + ss * 1000;
    if (ms >= 1000) timerSetDurationMs(ms);
  }

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </header>

      <div
        className="mx-auto max-w-xl rounded-3xl border p-8 text-center sm:p-10"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
        }}
      >
        <div
          className="font-mono text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl"
          style={{ color: "var(--dashboard-text)" }}
        >
          {formatDurationMs(timerDisplayMs)}
        </div>
        {timerStatus === "finished" && (
          <p className="mt-4 text-lg font-medium text-green-500">{t("finished")}</p>
        )}

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("presets")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_MS.map((ms) => (
              <button
                key={ms}
                type="button"
                disabled={!canEditDuration}
                onClick={() => timerSetDurationMs(ms)}
                className="rounded-2xl border px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{
                  borderColor: "var(--dashboard-border)",
                  backgroundColor:
                    timerDurationMs === ms ? "var(--dashboard-nav-active-bg)" : "transparent",
                }}
              >
                {presetLabel(t, ms)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("hmsTitle")}
          </p>
          <div className="flex flex-wrap items-end justify-center gap-2">
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: "var(--dashboard-text-muted)" }}>{t("hours")}</span>
              <input
                type="number"
                min={0}
                max={23}
                disabled={!canEditDuration}
                value={h}
                onChange={(e) => setH(parseInt(e.target.value, 10) || 0)}
                className="w-14 rounded-xl border px-2 py-2 text-center tabular-nums disabled:opacity-40"
                style={{
                  borderColor: "var(--dashboard-border)",
                  backgroundColor: "var(--dashboard-bg)",
                  color: "var(--dashboard-text)",
                }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: "var(--dashboard-text-muted)" }}>{t("minutesShort")}</span>
              <input
                type="number"
                min={0}
                max={59}
                disabled={!canEditDuration}
                value={min}
                onChange={(e) => setMin(parseInt(e.target.value, 10) || 0)}
                className="w-14 rounded-xl border px-2 py-2 text-center tabular-nums disabled:opacity-40"
                style={{
                  borderColor: "var(--dashboard-border)",
                  backgroundColor: "var(--dashboard-bg)",
                  color: "var(--dashboard-text)",
                }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: "var(--dashboard-text-muted)" }}>{t("secondsShort")}</span>
              <input
                type="number"
                min={0}
                max={59}
                disabled={!canEditDuration}
                value={sec}
                onChange={(e) => setSec(parseInt(e.target.value, 10) || 0)}
                className="w-14 rounded-xl border px-2 py-2 text-center tabular-nums disabled:opacity-40"
                style={{
                  borderColor: "var(--dashboard-border)",
                  backgroundColor: "var(--dashboard-bg)",
                  color: "var(--dashboard-text)",
                }}
              />
            </label>
            <button
              type="button"
              disabled={!canEditDuration}
              onClick={applyHms}
              className="rounded-2xl border px-4 py-2 text-sm font-medium disabled:opacity-40"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              {t("applyHms")}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {timerStatus === "idle" && (
            <button
              type="button"
              onClick={() => timerSetDurationMs(DEFAULT_TIMER_DURATION_MS)}
              className="rounded-2xl border px-5 py-3 text-sm font-medium hover:opacity-90"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              {t("defaultDuration")}
            </button>
          )}
          {(timerStatus === "idle" || timerStatus === "finished") && (
            <button
              type="button"
              onClick={timerStart}
              className="rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              {t("start")}
            </button>
          )}
          {timerStatus === "running" && (
            <button
              type="button"
              onClick={timerPause}
              className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              {t("pause")}
            </button>
          )}
          {timerStatus === "paused" && (
            <>
              <button
                type="button"
                onClick={timerResume}
                className="rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                {t("resume")}
              </button>
              <button
                type="button"
                onClick={timerReset}
                className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("reset")}
              </button>
            </>
          )}
          {timerStatus === "finished" && (
            <button
              type="button"
              onClick={timerReset}
              className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              {t("reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
