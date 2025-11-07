import React, { useEffect, useState } from "react";
import { radarPathSvg } from "../utils/helpers";

export default function TerpeneRadarImage({
  cultivarName,
  className = "",
  style,
  lazy = true,
  altText,
}) {
  const [loadError, setLoadError] = useState(false);

  const safeName = (cultivarName || "").toString().trim();

  useEffect(() => {
    setLoadError(false);
  }, [safeName]);

  if (!safeName) {
    return <span className="empty-value">Netzdiagramm nicht verfügbar</span>;
  }

  const src = radarPathSvg(safeName);
  const alt = altText || `Terpen-Netzdiagramm für ${safeName}`;

  if (!src || loadError) {
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
