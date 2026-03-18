"use client";

import { useTranslations } from "next-intl";
import {
  useDashboardTimer,
  formatDurationMs,
  DEFAULT_TIMER_DURATION_MS,
} from "@/components/dashboard/DashboardTimerContext";

const PRESETS_MIN = [1, 3, 5, 10] as const;

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

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
          {t("subtitle")}
        </p>
      </header>

      <div
        className="mx-auto max-w-xl rounded-3xl border p-10 text-center"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
        }}
      >
        <div
          className="font-mono text-6xl font-bold tabular-nums sm:text-7xl"
          style={{ color: "var(--dashboard-text)" }}
        >
          {formatDurationMs(timerDisplayMs)}
        </div>
        {timerStatus === "finished" && (
          <p className="mt-4 text-lg font-medium text-green-500">{t("finished")}</p>
        )}

        <div className="mt-10">
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("presets")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS_MIN.map((m) => (
              <button
                key={m}
                type="button"
                disabled={!canEditDuration}
                onClick={() => timerSetDurationMs(m * 60 * 1000)}
                className="rounded-2xl border px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{
                  borderColor: "var(--dashboard-border)",
                  backgroundColor:
                    timerDurationMs === m * 60 * 1000
                      ? "var(--dashboard-nav-active-bg)"
                      : "transparent",
                }}
              >
                {t("minutes", { n: m })}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--dashboard-text-muted)" }}>{t("customMinutes")}</span>
            <input
              type="number"
              min={1}
              max={1440}
              disabled={!canEditDuration}
              defaultValue={Math.round(timerDurationMs / 60000)}
              key={timerStatus === "idle" ? timerDurationMs : "run"}
              className="w-20 rounded-xl border px-2 py-1.5 text-center tabular-nums disabled:opacity-40"
              style={{
                borderColor: "var(--dashboard-border)",
                backgroundColor: "var(--dashboard-bg)",
                color: "var(--dashboard-text)",
              }}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v) && v > 0) timerSetDurationMs(v * 60 * 1000);
              }}
            />
          </label>
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
