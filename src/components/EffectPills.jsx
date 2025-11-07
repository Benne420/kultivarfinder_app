import React from "react";

const DEFAULT_LIMIT = 6;

export default function EffectPills({ effects = [], limit = DEFAULT_LIMIT, className = "" }) {
  const safeEffects = Array.isArray(effects)
    ? effects.map((effect) => (effect || "").toString().trim()).filter(Boolean)
    : [];

  if (!safeEffects.length) {
    return <span className="empty-value">–</span>;
  }

  const items = Number.isFinite(limit) ? safeEffects.slice(0, limit) : safeEffects;

  return (
    <div className={`effect-pills ${className}`.trim()} role="list">
      {items.map((effect) => (
        <span key={effect} className="effect-pill" role="listitem">
          {effect}
        </span>
      ))}
    </div>
  );
}
