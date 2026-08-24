import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BoardState } from '../types/board';

interface QrAffiliateOverlayProps {
  state: BoardState;
  forceVisible?: boolean;
  inlinePreview?: boolean;
}

export const QrAffiliateOverlay: React.FC<QrAffiliateOverlayProps> = ({
  state,
  forceVisible = false,
  inlinePreview = false
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const lastForceTriggerRef = useRef<number>(0);

  const enabled = state.qrOverlayEnabled ?? true;
  const displayMode = state.qrOverlayDisplayMode || 'periodic';
  const code = state.qrOverlayCode || 'MBG0640';
  const intervalSec = Math.max(10, state.qrOverlayInterval || 600);
  const durationSec = Math.max(5, state.qrOverlayDuration || 35);
  const title = state.qrOverlayTitle || 'APOYA NUESTRA COMUNIDAD';
  const subtitle = state.qrOverlaySubtitle || '5% a 10% de DESCUENTO en iHerb';

  const targetUrl = `https://www.iherb.com/?rcode=${code}`;

  // 1. Si el modo es 'always' (Fijo Permanente) o forceVisible o inlinePreview -> Siempre visible
  const isAlwaysOn = displayMode === 'always' || forceVisible || inlinePreview;

  // 2. Detección de activación manual desde el admin
  useEffect(() => {
    if (state.qrOverlayForceTrigger && state.qrOverlayForceTrigger > lastForceTriggerRef.current) {
      lastForceTriggerRef.current = state.qrOverlayForceTrigger;
      setIsVisible(true);
      setProgress(100);
    }
  }, [state.qrOverlayForceTrigger]);

  // 3. Temporizador periódico + Primera aparición rápida al iniciar (2s después de cargar)
  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      return;
    }

    if (isAlwaysOn) {
      setIsVisible(true);
      return;
    }

    // Primera aparición rápida de bienvenida (2 seg)
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
      setProgress(100);
    }, 2000);

    // Ciclo periódico
    const cycleInterval = setInterval(() => {
      setIsVisible(true);
      setProgress(100);
    }, intervalSec * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(cycleInterval);
    };
  }, [enabled, isAlwaysOn, intervalSec]);

  // 4. Temporizador de duración visible y barra de progreso
  useEffect(() => {
    if (!isVisible || isAlwaysOn) return;

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
  }, [isVisible, durationSec, isAlwaysOn]);

  if (!enabled && !inlinePreview) return null;
  if (!isVisible && !isAlwaysOn) return null;

  const containerStyle: React.CSSProperties = inlinePreview
    ? {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        background: 'linear-gradient(135deg, rgba(2, 26, 20, 0.96) 0%, rgba(1, 15, 12, 0.98) 100%)',
        padding: '18px 22px',
        borderRadius: '20px',
        border: '1.8px solid rgba(212, 175, 55, 0.75)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
        maxWidth: '520px',
        overflow: 'hidden'
      }
    : {
        position: 'absolute',
        bottom: '210px',
        right: '36px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        background: 'linear-gradient(135deg, rgba(2, 26, 20, 0.96) 0%, rgba(1, 15, 12, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '18px 22px',
        borderRadius: '20px',
        border: '1.8px solid rgba(212, 175, 55, 0.75)',
        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.35)',
        animation: 'qrSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '520px',
        overflow: 'hidden'
      };

  return (
    <div style={containerStyle}>
      {/* Contenedor QR en Blanco Puro para Lectura Instantánea */}
      <div
        style={{
          background: '#ffffff',
          padding: '8px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          flexShrink: 0
        }}
      >
        <QRCodeSVG
          value={targetUrl}
          size={110}
          bgColor="#ffffff"
          fgColor="#021813"
          level="Q"
          includeMargin={false}
        />
      </div>

      {/* Textos y Detalles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#d4af37',
              background: 'rgba(212, 175, 55, 0.22)',
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(212, 175, 55, 0.5)'
            }}
          >
            🌿 {title}
          </span>
        </div>

        <h4
          style={{
            margin: '2px 0 0 0',
            fontSize: '1.22rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.25,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}
        >
          {subtitle}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <span style={{ fontSize: '0.92rem', color: '#cbd5e1', fontWeight: 600 }}>Cupón directo:</span>
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              color: '#fef08a',
              background: 'rgba(234, 179, 8, 0.28)',
              padding: '2px 9px',
              borderRadius: '6px',
              border: '1.2px dashed #eab308',
              letterSpacing: '0.8px'
            }}
          >
            {code}
          </span>
        </div>

        <p
          style={{
            margin: '3px 0 0 0',
            fontSize: '0.88rem',
            color: '#a7f3d0',
            lineHeight: 1.3,
            fontWeight: 500
          }}
        >
          📱 Apunta la cámara de tu celular para abrir iHerb con descuento directo.
        </p>
      </div>

      {/* Barra de progreso de tiempo restante (solo si no es Fijo Permanente ni vista previa) */}
      {!isAlwaysOn && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3.5px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #10b981, #d4af37)',
            transition: 'width 0.1s linear'
          }}
        />
      )}
    </div>
  );
};
