"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export function formatDurationMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const sec = s % 60;
  const min = m % 60;
  if (h > 0)
    return `${h}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

type TimerStatus = "idle" | "running" | "paused" | "finished";
type StopwatchStatus = "idle" | "running" | "paused";

type DashboardTimerContextValue = {
  timerStatus: TimerStatus;
  timerDurationMs: number;
  timerDisplayMs: number;
  timerSetDurationMs: (ms: number) => void;
  timerStart: () => void;
  timerPause: () => void;
  timerResume: () => void;
  timerReset: () => void;
  timerChipActive: boolean;
  /** Denominator for header ring (set when countdown segment starts) */
  timerSessionTotalMs: number;
  swStatus: StopwatchStatus;
  swElapsedMs: number;
  swLaps: number[];
  swStart: () => void;
  swPause: () => void;
  swResume: () => void;
  swReset: () => void;
  swLap: () => void;
  swRemoveLapAt: (index: number) => void;
  swChipActive: boolean;
};

const Ctx = createContext<DashboardTimerContextValue | null>(null);

export const DEFAULT_TIMER_DURATION_MS = 5 * 60 * 1000;

export function DashboardTimerProvider({ children }: { children: ReactNode }) {
  const [timerDurationMs, setTimerDurationMsState] = useState(
    DEFAULT_TIMER_DURATION_MS
  );
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [timerEndAt, setTimerEndAt] = useState<number | null>(null);
  const [timerRemainingMs, setTimerRemainingMs] = useState(
    DEFAULT_TIMER_DURATION_MS
  );
  const [timerSessionTotalMs, setTimerSessionTotalMs] = useState(
    DEFAULT_TIMER_DURATION_MS
  );

  const [swStatus, setSwStatus] = useState<StopwatchStatus>("idle");
  const [swSegmentStart, setSwSegmentStart] = useState<number | null>(null);
  const [swAccumulatedMs, setSwAccumulatedMs] = useState(0);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timerStatus !== "running" || timerEndAt == null) return;
    if (Date.now() >= timerEndAt) {
      setTimerStatus("finished");
      setTimerEndAt(null);
      setTimerRemainingMs(0);
    }
  }, [tick, timerStatus, timerEndAt]);

  const timerDisplayMs = useMemo(() => {
    if (timerStatus === "idle") return timerDurationMs;
    if (timerStatus === "running" && timerEndAt != null) {
      void tick;
      return Math.max(0, timerEndAt - Date.now());
    }
    return timerRemainingMs;
  }, [
    timerStatus,
    timerEndAt,
    timerRemainingMs,
    timerDurationMs,
    tick,
  ]);

  const timerChipActive = timerStatus !== "idle";

  const swElapsedMs = useMemo(() => {
    void tick;
    if (swStatus === "idle") return 0;
    const seg =
      swSegmentStart != null ? Date.now() - swSegmentStart : 0;
    return swAccumulatedMs + seg;
  }, [swStatus, swSegmentStart, swAccumulatedMs, tick]);

  const swChipActive = swStatus !== "idle";

  const timerSetDurationMs = useCallback(
    (ms: number) => {
      const capped = Math.max(1000, Math.min(ms, 24 * 60 * 60 * 1000));
      setTimerDurationMsState(capped);
      if (timerStatus === "idle") {
        setTimerRemainingMs(capped);
        setTimerSessionTotalMs(capped);
      }
    },
    [timerStatus]
  );

  const timerStart = useCallback(() => {
    if (timerStatus === "running") return;
    const ms =
      timerStatus === "paused"
        ? timerRemainingMs
        : timerStatus === "finished"
          ? timerDurationMs
          : timerDurationMs;
    if (ms <= 0) return;
    setTimerSessionTotalMs(ms);
    setTimerEndAt(Date.now() + ms);
    setTimerStatus("running");
  }, [timerStatus, timerRemainingMs, timerDurationMs]);

  const timerPause = useCallback(() => {
    if (timerStatus !== "running" || timerEndAt == null) return;
    setTimerRemainingMs(Math.max(0, timerEndAt - Date.now()));
    setTimerEndAt(null);
    setTimerStatus("paused");
  }, [timerStatus, timerEndAt]);

  const timerResume = useCallback(() => {
    if (timerStatus !== "paused") return;
    if (timerRemainingMs <= 0) return;
    setTimerSessionTotalMs(timerRemainingMs);
    setTimerEndAt(Date.now() + timerRemainingMs);
    setTimerStatus("running");
  }, [timerStatus, timerRemainingMs]);

  const timerReset = useCallback(() => {
    setTimerStatus("idle");
    setTimerEndAt(null);
    setTimerRemainingMs(timerDurationMs);
    setTimerSessionTotalMs(timerDurationMs);
  }, [timerDurationMs]);

  const swStart = useCallback(() => {
    if (swStatus === "running") return;
    if (swStatus === "idle") {
      setSwAccumulatedMs(0);
      setSwLaps([]);
      setSwSegmentStart(Date.now());
      setSwStatus("running");
    } else if (swStatus === "paused") {
      setSwSegmentStart(Date.now());
      setSwStatus("running");
    }
  }, [swStatus]);

  const swPause = useCallback(() => {
    if (swStatus !== "running" || swSegmentStart == null) return;
    setSwAccumulatedMs((a) => a + Date.now() - swSegmentStart);
    setSwSegmentStart(null);
    setSwStatus("paused");
  }, [swStatus, swSegmentStart]);

  const swResume = swStart;

  const swReset = useCallback(() => {
    setSwStatus("idle");
    setSwSegmentStart(null);
    setSwAccumulatedMs(0);
    setSwLaps([]);
  }, []);

  const swLap = useCallback(() => {
    if (swStatus === "idle") return;
    const seg =
      swSegmentStart != null ? Date.now() - swSegmentStart : 0;
    const elapsed = swAccumulatedMs + seg;
    setSwLaps((laps) => [...laps, elapsed]);
  }, [swStatus, swSegmentStart, swAccumulatedMs]);

  const swRemoveLapAt = useCallback((index: number) => {
    setSwLaps((laps) => laps.filter((_, i) => i !== index));
  }, []);

  const value = useMemo(
    () => ({
      timerStatus,
      timerDurationMs,
      timerDisplayMs,
      timerSetDurationMs,
      timerStart,
      timerPause,
      timerResume,
      timerReset,
      timerChipActive,
      timerSessionTotalMs,
      swStatus,
      swElapsedMs,
      swLaps,
      swStart,
      swPause,
      swResume,
      swReset,
      swLap,
      swRemoveLapAt,
      swChipActive,
    }),
    [
      timerStatus,
      timerDurationMs,
      timerDisplayMs,
      timerSetDurationMs,
      timerStart,
      timerPause,
      timerResume,
      timerReset,
      timerChipActive,
      timerSessionTotalMs,
      swStatus,
      swElapsedMs,
      swLaps,
      swStart,
      swPause,
      swResume,
      swReset,
      swLap,
      swRemoveLapAt,
      swChipActive,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardTimer() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDashboardTimer needs DashboardTimerProvider");
  return v;
}
