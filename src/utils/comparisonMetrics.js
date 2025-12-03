import React from "react";
import EffectPills from "../components/EffectPills";
import TerpeneRadarImage from "../components/TerpeneRadarImage";
import { getCultivarEffects } from "./helpers";

function getCultivarTerpeneProfile(cultivar) {
  if (!cultivar) return [];

  if (
    Array.isArray(cultivar.normalizedTerpenprofil) &&
    cultivar.normalizedTerpenprofil.length
  ) {
    return cultivar.normalizedTerpenprofil;
  }

  if (Array.isArray(cultivar.terpenprofil)) {
    return cultivar.terpenprofil
      .map((value) => (value || "").toString().trim())
      .filter(Boolean);
  }

  return [];
}

export const comparisonMetrics = [
  { label: "THC", accessor: "thc" },
  { label: "CBD", accessor: "cbd" },
  {
    label: "Terpenprofil",
    accessor: "terpenprofil",
    render: ({ cultivar, context }) => {
      const profile = getCultivarTerpeneProfile(cultivar);

      if (profile.length === 0) {
        return "–";
      }

      const limit = context === "panel" ? 4 : profile.length;
      const limitedProfile = profile.slice(0, limit);
      const remainingCount = Math.max(profile.length - limit, 0);

      return (
        <div
          className="comparison-panel__terpene-profile"
          role="group"
          aria-label="Terpenprofil"
        >
          <div className="comparison-panel__terpene-line">
            {limitedProfile.map((terpene, index) => (
              <span
                key={`${terpene}-${index}`}
                className={`comparison-panel__terpene-chip${
                  index === 0 ? " comparison-panel__terpene-chip--primary" : ""
                }`}
                aria-label={`${index + 1}. ${terpene}`}
              >
                <span className="comparison-panel__terpene-order" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="comparison-panel__terpene-label">{terpene}</span>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="comparison-panel__terpene-chip comparison-panel__terpene-chip--more">
                +{remainingCount} weitere
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    label: "Häufigste Wirkungen",
    accessor: "effects",
    render: ({ cultivar, context }) => (
      <EffectPills
        effects={getCultivarEffects(cultivar)}
        limit={context === "panel" ? 5 : Number.POSITIVE_INFINITY}
      />
    ),
  },
  {
    label: "Terpen-Radar",
    accessor: "terpeneRadar",
    includeInDetails: false,
    rowClassName: "comparison-panel__row--radar",
    cellClassName: "comparison-panel__cell--radar",
    render: ({ cultivar }) => (
      <div className="comparison-panel__radar-wrapper">
        <TerpeneRadarImage
          cultivarName={cultivar?.name}
          className="comparison-panel__radar-image"
        />
      </div>
    ),
  },
];

export function renderComparisonMetricValue(metric, cultivar, context, formatMetricValue) {
  if (typeof metric.render === "function") {
    return metric.render({ cultivar, context });
  }

  if (typeof formatMetricValue === "function") {
    return formatMetricValue(cultivar?.[metric.accessor]);
  }

  return cultivar?.[metric.accessor];
}
