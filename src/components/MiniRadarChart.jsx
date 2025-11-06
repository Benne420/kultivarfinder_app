import React, { useMemo } from "react";

const pastelPalette = ["#90caf9", "#a5d6a7", "#ffcc80", "#b39ddb", "#80deea", "#ffe082"];

export const DEFAULT_TERPENE_AXES = [
  "β-Myrcen",
  "β-Caryophyllen",
  "Limonen",
  "Linalool",
  "Humulen",
  "Terpinolen",
];

const normalizeKey = (label) =>
  typeof label === "string" ? label.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";

function buildPresenceValues(axes, activeLabels) {
  if (!axes.length) {
    return [];
  }
  const activeSet = new Set(activeLabels.map((label) => normalizeKey(label)));
  return axes.map((axisLabel) => (activeSet.has(normalizeKey(axisLabel)) ? 0.95 : 0.18));
}

function buildPolygonPoints(values, size) {
  const radius = size / 2 - 6;
  const center = size / 2;
  const angleStep = (Math.PI * 2) / values.length;
  return values
    .map((value, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const r = radius * value;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function MiniRadarChart({ axes = DEFAULT_TERPENE_AXES, activeLabels = [], size = 96, title = "" }) {
  const safeAxes = useMemo(() => {
    if (Array.isArray(axes) && axes.length) {
      return axes.filter(Boolean).slice(0, 6);
    }
    return DEFAULT_TERPENE_AXES;
  }, [axes]);

  const values = useMemo(() => buildPresenceValues(safeAxes, Array.isArray(activeLabels) ? activeLabels : []), [
    safeAxes,
    activeLabels,
  ]);
  const polygonPoints = useMemo(() => buildPolygonPoints(values, size), [values, size]);
  const gridCircles = [0.3, 0.6, 0.9];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={title || "Terpen-Radar"}
      className="mini-radar-chart"
    >
      <title>{title || "Terpen-Radar"}</title>
      <defs>
        {safeAxes.map((label, index) => (
          <linearGradient
            key={label}
            id={`radar-gradient-${label.replace(/[^a-z0-9]/gi, "").toLowerCase()}-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={pastelPalette[index % pastelPalette.length]} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>
        ))}
      </defs>
      {gridCircles.map((factor) => (
        <circle
          key={factor}
          cx={size / 2}
          cy={size / 2}
          r={(size / 2 - 6) * factor}
          fill="none"
          stroke="#d0d7e2"
          strokeWidth="0.5"
        />
      ))}
      {safeAxes.map((label, index) => {
        const angle = ((Math.PI * 2) / safeAxes.length) * index - Math.PI / 2;
        const x = size / 2 + (size / 2 - 6) * Math.cos(angle);
        const y = size / 2 + (size / 2 - 6) * Math.sin(angle);
        const textX = size / 2 + (size / 2 - 2) * Math.cos(angle);
        const textY = size / 2 + (size / 2 - 2) * Math.sin(angle);
        return (
          <g key={label}>
            <line
              x1={size / 2}
              y1={size / 2}
              x2={x}
              y2={y}
              stroke="#c4cedd"
              strokeWidth="0.5"
            />
            <text x={textX} y={textY} textAnchor="middle" fontSize="8" fill="#5a6b7d">
              {label.split(" ")[0]}
            </text>
          </g>
        );
      })}
      <polygon
        points={polygonPoints}
        fill="rgba(144, 202, 249, 0.55)"
        stroke="#64b5f6"
        strokeWidth="1"
      />
    </svg>
  );
}
