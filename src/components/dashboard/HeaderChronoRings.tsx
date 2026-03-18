"use client";

import { Link } from "@/i18n/navigation";
import {
  formatDurationMs,
  useDashboardTimer,
} from "@/components/dashboard/DashboardTimerContext";

const CX = 24;
const CY = 24;
const R = 19;
const C = 2 * Math.PI * R;
const SIZE = 48;
const VB = 48;

function ringStroke(isDark: boolean) {
  return isDark ? "#ffffff" : "#111111";
}

/** Countdown ring: arc shrinks counter-clockwise as time runs out */
export function HeaderTimerRingLink({
  isDark,
  title,
}: {
  isDark: boolean;
  title: string;
}) {
  const {
    timerStatus,
    timerDisplayMs,
    timerSessionTotalMs,
    timerChipActive,
  } = useDashboardTimer();

  if (!timerChipActive) return null;

  const total = Math.max(1, timerSessionTotalMs);
  const ratio =
    timerStatus === "finished" ? 0 : Math.min(1, timerDisplayMs / total);
  const dash = ratio * C;
  const stroke = ringStroke(isDark);

  return (
    <Link
      href="/dashboard/timer"
      className="flex shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
      style={{
        width: SIZE,
        height: SIZE,
      }}
      title={title}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VB} ${VB}`}
        className="shrink-0"
      >
        <g transform={`translate(${VB} 0) scale(-1 1)`}>
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="2.75"
            strokeOpacity="0.2"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        </g>
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current text-[11px] font-bold tabular-nums"
          style={{
            fill: stroke,
          }}
        >
          {formatDurationMs(timerDisplayMs).replace(/^0:/, "")}
        </text>
      </svg>
    </Link>
  );
}

/** Stopwatch ring: arc grows clockwise every 60s */
export function HeaderStopwatchRingLink({
  isDark,
  title,
}: {
  isDark: boolean;
  title: string;
}) {
  const { swElapsedMs, swChipActive } = useDashboardTimer();

  if (!swChipActive) return null;

  const ratio = (swElapsedMs % 60000) / 60000;
  const dash = ratio * C;
  const stroke = ringStroke(isDark);

  return (
    <Link
      href="/dashboard/stopwatch"
      className="flex shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
      style={{
        width: SIZE,
        height: SIZE,
      }}
      title={title}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VB} ${VB}`}
        className="shrink-0"
      >
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="2.75"
          strokeOpacity="0.2"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[11px] font-bold tabular-nums"
          style={{ fill: stroke }}
        >
          {formatDurationMs(swElapsedMs).replace(/^0:/, "")}
        </text>
      </svg>
    </Link>
  );
}
