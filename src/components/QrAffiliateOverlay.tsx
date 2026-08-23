import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BoardState } from '../types/board';

interface QrAffiliateOverlayProps {
  state: BoardState;
  forceVisible?: boolean;
}

export const QrAffiliateOverlay: React.FC<QrAffiliateOverlayProps> = ({ state, forceVisible = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);

  const enabled = state.qrOverlayEnabled ?? true;
  const code = state.qrOverlayCode || "MBG0640";
  const intervalSec = Math.max(60, state.qrOverlayInterval || 600); // Mínimo 1 minuto, defecto 10 min
  const durationSec = Math.max(10, state.qrOverlayDuration || 35);   // Mínimo 10 seg, defecto 35 seg
  const title = state.qrOverlayTitle || "APOYA NUESTRA COMUNIDAD";
  const subtitle = state.qrOverlaySubtitle || "5% a 10% de DESCUENTO en iHerb";

  const targetUrl = `https://www.iherb.com/?rcode=${code}`;

  // Temporizador de ciclo
  useEffect(() => {
    if (!enabled && !forceVisible) {
      setIsVisible(false);
      return;
    }

    if (forceVisible) {
      setIsVisible(true);
      return;
    }

    // Intervalo de apariciones
    const triggerInterval = setInterval(() => {
      setIsVisible(true);
      setProgress(100);
    }, intervalSec * 1000);

    return () => clearInterval(triggerInterval);
  }, [enabled, forceVisible, intervalSec]);

  // Temporizador de duración visible
  useEffect(() => {
    if (!isVisible || forceVisible) return;

    const startTime = Date.now();
    const totalMs = durationSec * 1000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setProgress(remainingPct);

      if (elapsed >= totalMs) {
        setIsVisible(false);
        clearInterval(progressInterval);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isVisible, durationSec, forceVisible]);

  if (!enabled && !forceVisible) return null;
  if (!isVisible && !forceVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '88px', // Justo encima de las marquesinas
        right: '32px',
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(2, 26, 20, 0.94) 0%, rgba(1, 15, 12, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1.5px solid rgba(212, 175, 55, 0.65)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(212, 175, 55, 0.25)',
        animation: 'qrSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '430px',
        overflow: 'hidden'
      }}
    >
      {/* Contenedor QR en Blanco Puro para Alto Contraste */}
      <div
        style={{
          background: '#ffffff',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
          flexShrink: 0
        }}
      >
        <QRCodeSVG
          value={targetUrl}
          size={100}
          bgColor="#ffffff"
          fgColor="#021813"
          level="Q"
          includeMargin={false}
        />
      </div>

      {/* Textos y Llamado a la Acción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#d4af37',
              background: 'rgba(212, 175, 55, 0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            🌿 {title}
          </span>
        </div>

        <h4
          style={{
            margin: '2px 0 0 0',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2
          }}
        >
          {subtitle}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Cupón:</span>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#fef08a',
              background: 'rgba(234, 179, 8, 0.2)',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px dashed #eab308',
              letterSpacing: '0.5px'
            }}
          >
            {code}
          </span>
        </div>

        <p
          style={{
            margin: '3px 0 0 0',
            fontSize: '0.72rem',
            color: '#a7f3d0',
            lineHeight: 1.25,
            opacity: 0.95
          }}
        >
          📱 Escanea con tu cámara y ahorra en suplementación con evidencia médica.
        </p>
      </div>

      {/* Barra de progreso de tiempo restante */}
      {!forceVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #10b981, #d4af37)',
            transition: 'width 0.1s linear'
          }}
        />
      )}
    </div>
  );
};
