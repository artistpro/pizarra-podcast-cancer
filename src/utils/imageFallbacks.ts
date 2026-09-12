import React from 'react';

export const SAFE_ART_FALLBACK = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85";
export const SAFE_SUPPLEMENT_FALLBACK = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&h=675&q=85";
export const FALLBACK_SUPPLEMENT_IMAGE = SAFE_SUPPLEMENT_FALLBACK;

// Infalible SVG offline data-URI con marco y gradiente esmeralda/oro:
export const OFFLINE_ART_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23021813"/><stop offset="50%" stop-color="%2304382e"/><stop offset="100%" stop-color="%2301130f"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23g)"/><circle cx="600" cy="400" r="180" fill="%23d4af37" opacity="0.12"/><text x="600" y="390" fill="%23d4af37" font-family="serif" font-size="44" font-weight="bold" text-anchor="middle" letter-spacing="4">EL ARTE QUE SANA</text><text x="600" y="440" fill="%23a7f3d0" font-family="sans-serif" font-size="24" text-anchor="middle" opacity="0.8">Comunidad Sanante · Serenidad &amp; Vida</text></svg>`;

export const OFFLINE_SUPPLEMENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23021813"/><stop offset="50%" stop-color="%23053d33"/><stop offset="100%" stop-color="%2301130f"/></linearGradient></defs><rect width="1200" height="675" fill="url(%23g2)"/><circle cx="600" cy="337" r="160" fill="%2310b981" opacity="0.1"/><text x="600" y="325" fill="%23d4af37" font-family="serif" font-size="40" font-weight="bold" text-anchor="middle" letter-spacing="3">EVIDENCIA &amp; SALUD INTEGRATIVA</text><text x="600" y="375" fill="%23a7f3d0" font-family="sans-serif" font-size="22" text-anchor="middle" opacity="0.85">El Podcast del Cáncer · Ficha Informativa</text></svg>`;

export const handleSafeImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  type: 'art' | 'supplement' = 'art'
) => {
  const target = e.currentTarget;
  const primaryFallback = type === 'art' ? SAFE_ART_FALLBACK : SAFE_SUPPLEMENT_FALLBACK;
  const offlineSvg = type === 'art' ? OFFLINE_ART_SVG : OFFLINE_SUPPLEMENT_SVG;

  if (target.src !== primaryFallback && !target.dataset.triedBackup) {
    target.dataset.triedBackup = "true";
    target.src = primaryFallback;
  } else {
    target.onerror = null;
    target.src = offlineSvg;
  }
};
