"use client";

import { useTranslations } from "next-intl";
import {
  useDashboardTimer,
  formatDurationMs,
} from "@/components/dashboard/DashboardTimerContext";

export function StopwatchPageClient() {
  const t = useTranslations("stopwatchPage");
  const {
    swStatus,
    swElapsedMs,
    swLaps,
    swStart,
    swPause,
    swResume,
    swReset,
    swLap,
    swRemoveLapAt,
  } = useDashboardTimer();

  async function copyLap(ms: number) {
    try {
      await navigator.clipboard.writeText(formatDurationMs(ms));
    } catch {
      /* ignore */
    }
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
          {formatDurationMs(swElapsedMs)}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {swStatus === "idle" && (
            <button
              type="button"
              onClick={swStart}
              className="rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              {t("start")}
            </button>
          )}
          {swStatus === "running" && (
            <>
              <button
                type="button"
                onClick={swPause}
                className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("pause")}
              </button>
              <button
                type="button"
                onClick={swLap}
                className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("lap")}
              </button>
            </>
          )}
          {swStatus === "paused" && (
            <>
              <button
                type="button"
                onClick={swResume}
                className="rounded-2xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                {t("resume")}
              </button>
              <button
                type="button"
                onClick={swLap}
                className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("lap")}
              </button>
              <button
                type="button"
                onClick={swReset}
                className="rounded-2xl border px-8 py-3 text-sm font-semibold hover:opacity-90"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {t("reset")}
              </button>
            </>
          )}
        </div>

        {swLaps.length > 0 && (
          <div
            className="mt-10 max-h-56 overflow-y-auto rounded-2xl border text-left"
            style={{ borderColor: "var(--dashboard-border)" }}
          >
            <ul className="divide-y" style={{ borderColor: "var(--dashboard-border)" }}>
              {swLaps.map((ms, i) => (
                <li
                  key={`${i}-${ms}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm tabular-nums"
                >
                  <span className="min-w-[3rem]" style={{ color: "var(--dashboard-text-muted)" }}>
                    {t("lapN", { n: i + 1 })}
                  </span>
                  <span className="flex-1 font-medium">{formatDurationMs(ms)}</span>
                  <button
                    type="button"
                    onClick={() => copyLap(ms)}
                    className="shrink-0 rounded-lg border px-2 py-1 text-xs hover:opacity-90"
                    style={{ borderColor: "var(--dashboard-border)" }}
                  >
                    {t("copyLap")}
                  </button>
                  <button
                    type="button"
                    onClick={() => swRemoveLapAt(i)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-600 hover:opacity-90"
                  >
                    {t("removeLap")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
