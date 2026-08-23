import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BoardState } from '../types/board';

interface QrAffiliateOverlayProps {
  state: BoardState;
  forceVisible?: boolean;
}

export const QrAffiliateOverlay: React.FC<QrAffiliateOverlayProps> = ({ state, forceVisible = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const lastForceTriggerRef = useRef<number>(0);

  const enabled = state.qrOverlayEnabled ?? true;
  const code = state.qrOverlayCode || "MBG0640";
  const intervalSec = Math.max(10, state.qrOverlayInterval || 600); // Mínimo 10s para pruebas
  const durationSec = Math.max(5, state.qrOverlayDuration || 35);    // Mínimo 5s
  const title = state.qrOverlayTitle || "APOYA NUESTRA COMUNIDAD";
  const subtitle = state.qrOverlaySubtitle || "5% a 10% de DESCUENTO en iHerb";

  const targetUrl = `https://www.iherb.com/?rcode=${code}`;

  // 1. Detección de activación manual/forzada desde el admin
  useEffect(() => {
    if (state.qrOverlayForceTrigger && state.qrOverlayForceTrigger > lastForceTriggerRef.current) {
      lastForceTriggerRef.current = state.qrOverlayForceTrigger;
      setIsVisible(true);
      setProgress(100);
    }
  }, [state.qrOverlayForceTrigger]);

  // 2. Temporizador periódico + Primera aparición rápida al iniciar (4s después de montar)
  useEffect(() => {
    if (!enabled && !forceVisible) {
      setIsVisible(false);
      return;
    }

    if (forceVisible) {
      setIsVisible(true);
      return;
    }

    // Primera aparición rápida de bienvenida / prueba (4 seg después de cargar)
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
      setProgress(100);
    }, 4000);

    // Ciclo periódico continuo
    const cycleInterval = setInterval(() => {
      setIsVisible(true);
      setProgress(100);
    }, intervalSec * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(cycleInterval);
    };
  }, [enabled, forceVisible, intervalSec]);

  // 3. Temporizador de duración visible y barra de progreso
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
        bottom: '92px',
        right: '36px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(2, 26, 20, 0.96) 0%, rgba(1, 15, 12, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1.8px solid rgba(212, 175, 55, 0.75)',
        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.35)',
        animation: 'qrSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '440px',
        overflow: 'hidden'
      }}
    >
      {/* Contenedor QR en Blanco Puro para Lectura Instantánea */}
      <div
        style={{
          background: '#ffffff',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          flexShrink: 0
        }}
      >
        <QRCodeSVG
          value={targetUrl}
          size={105}
          bgColor="#ffffff"
          fgColor="#021813"
          level="Q"
          includeMargin={false}
        />
      </div>

      {/* Textos y Detalles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#d4af37',
              background: 'rgba(212, 175, 55, 0.18)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(212, 175, 55, 0.4)'
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
              background: 'rgba(234, 179, 8, 0.22)',
              padding: '1px 7px',
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
          📱 Apunta la cámara de tu celular para abrir iHerb con descuento directo.
        </p>
      </div>

      {/* Barra de progreso de tiempo restante */}
      {!forceVisible && (
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
