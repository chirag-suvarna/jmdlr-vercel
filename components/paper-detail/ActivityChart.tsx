"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ActivityChartProps = {
  labels: string[];
  values: number[];
  loading?: boolean;
};

export default function ActivityChart({ labels, values, loading }: ActivityChartProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActivePoint(null);
    setDragging(false);
  }, [labels, values]);

  const linePoints = useMemo(() => {
    if (!values.length) return "";
    const lastIndex = Math.max(values.length - 1, 1);
    return values
      .map((value, index) => {
        const x = (index / lastIndex) * 100;
        const y = 100 - value;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values]);

  const xTicks = useMemo(() => {
    if (labels.length === 0) return [];
    if (labels.length <= 5) return labels;
    const last = labels.length - 1;
    const positions = [
      0,
      Math.floor(last / 4),
      Math.floor(last / 2),
      Math.floor((3 * last) / 4),
      last,
    ];
    return Array.from(new Set(positions.map((pos) => labels[pos])));
  }, [labels]);

  const updateActivePoint = (clientX: number) => {
    if (!chartRef.current || values.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = rect.width ? x / rect.width : 0;
    const index = Math.round(ratio * (values.length - 1));
    setActivePoint(index);
  };

  if (loading) {
    return (
      <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
        Loading activity data...
      </p>
    );
  }

  if (!values.length) {
    return (
      <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
        No activity data yet.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-stretch gap-3">
        <div className="flex w-8 flex-col justify-between text-[10px] text-[color:var(--color-text-secondary)]">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        <div className="flex-1">
          <div
            ref={chartRef}
            className="relative h-28 w-full select-none"
            onPointerDown={(event) => {
              setDragging(true);
              updateActivePoint(event.clientX);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (dragging) {
                updateActivePoint(event.clientX);
              }
            }}
            onPointerUp={() => {
              setDragging(false);
              setActivePoint(null);
            }}
            onPointerLeave={() => {
              if (dragging) {
                setDragging(false);
                setActivePoint(null);
              }
            }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="metrics-line" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="rgba(148, 210, 189, 0.3)" strokeWidth="0.5">
                <line x1="0" y1="25" x2="100" y2="25" />
                <line x1="0" y1="50" x2="100" y2="50" />
                <line x1="0" y1="75" x2="100" y2="75" />
              </g>
              <polyline
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="0.35"
                points={linePoints}
              />
              <polyline
                fill="url(#metrics-line)"
                stroke="none"
                points={`0,100 ${linePoints} 100,100`}
              />
              {activePoint !== null ? (
                <line
                  x1={(activePoint / Math.max(values.length - 1, 1)) * 100}
                  x2={(activePoint / Math.max(values.length - 1, 1)) * 100}
                  y1="0"
                  y2="100"
                  stroke="var(--color-accent)"
                  strokeWidth="0.18"
                  strokeDasharray="3 3"
                />
              ) : null}
              {values.map((value, index) => {
                const lastIndex = Math.max(values.length - 1, 1);
                const x = (index / lastIndex) * 100;
                const y = 100 - value;
                return (
                  <circle
                    key={`metric-dot-${index}`}
                    cx={x}
                    cy={y}
                    r={activePoint === index ? "1.1" : "0.6"}
                    fill={activePoint === index ? "var(--color-accent-hover)" : "var(--color-accent)"}
                  />
                );
              })}
            </svg>
            {activePoint !== null ? (
              <div
                className="absolute -top-8 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-secondary-80)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)]"
                style={{
                  left: `${(activePoint / Math.max(values.length - 1, 1)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {labels[activePoint] ?? activePoint + 1} · {values[activePoint]}
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[color:var(--color-text-secondary)]">
            {xTicks.map((tick) => (
              <span key={`tick-${tick}`}>{tick}</span>
            ))}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            Time
          </div>
        </div>
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        Activity
      </div>
    </div>
  );
}
