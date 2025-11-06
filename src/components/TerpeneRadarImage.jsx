import React, { useState, useMemo } from "react";
import { radarPathSvg } from "../utils/helpers";

export default function TerpeneRadarImage({
  cultivarName,
  className = "",
  style,
  lazy = true,
  altText,
}) {
  const [loadError, setLoadError] = useState(false);

  const safeName = useMemo(() => {
    const value = (cultivarName || "").toString().trim();
    return value;
  }, [cultivarName]);

  const src = useMemo(() => (safeName ? radarPathSvg(safeName) : null), [safeName]);
  const alt = altText || (safeName ? `Terpen-Netzdiagramm für ${safeName}` : "Terpen-Netzdiagramm");

  if (!safeName || loadError || !src) {
    return <span className="empty-value">Netzdiagramm nicht verfügbar</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`terpene-radar-image ${className}`.trim()}
      style={style}
      loading={lazy ? "lazy" : undefined}
      decoding="async"
      onError={() => setLoadError(true)}
    />
  );
}
