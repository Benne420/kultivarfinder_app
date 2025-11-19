import React from "react";
import EffectPills from "./EffectPills";
import TerpeneRadarImage from "./TerpeneRadarImage";
import { getCultivarEffects } from "../utils/helpers";

export const comparisonMetrics = [
  { label: "THC", accessor: "thc" },
  { label: "CBD", accessor: "cbd" },
  { label: "Terpengehalt", accessor: "terpengehalt" },
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
