import React, { useState, useEffect, useRef } from 'react';
import { subscribeLiveAlert } from '../firebase';
import type { LiveAlert } from '../types/board';

interface LiveAlertsOverlayProps {
  initialAlert?: LiveAlert | null;
}

export const LiveAlertsOverlay: React.FC<LiveAlertsOverlayProps> = ({ initialAlert: _initialAlert }) => {
  const [currentAlert, setCurrentAlert] = useState<LiveAlert | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const processedAlertsRef = useRef<Set<string>>(new Set());

  // Escuchar alertas en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = subscribeLiveAlert((alert) => {
      if (!alert || !alert.id) return;

      // Evitar reproducir la misma alerta más de una vez
      if (processedAlertsRef.current.has(alert.id)) return;
      processedAlertsRef.current.add(alert.id);

      // Si la alerta tiene más de 60 segundos de antigüedad, no la mostramos al cargar de cero
      const ageMs = Date.now() - (alert.timestamp || 0);
      if (ageMs > 60000) return;

      // Disparar alerta
      setCurrentAlert(alert);
      setIsVisible(true);

      const durationMs = Math.max(5, alert.durationSec || (alert.type === 'welcome' ? 9 : 14)) * 1000;

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentAlert(null);
        }, 600);
      }, durationMs);

      return () => clearTimeout(timer);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (!currentAlert || !isVisible) return null;

  const isWelcome = currentAlert.type === 'welcome';

  // 1. Alerta de Bienvenida (Telegram) -> ARRIBA A LA DERECHA (top: 88px, right: 36px)
  if (isWelcome) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '88px',
          right: '36px',
          zIndex: 9998,
          width: '450px',
          maxWidth: '90vw',
          background: 'linear-gradient(135deg, rgba(3, 35, 28, 0.98) 0%, rgba(2, 22, 17, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '2.2px solid #d4af37',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.45)',
          animation: 'alertSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Ícono Circular Radiante */}
        <div style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #10b981 0%, #047857 100%)',
          border: '2px solid #fef08a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          flexShrink: 0,
          boxShadow: '0 0 18px rgba(16, 185, 129, 0.7)'
        }}>
          🌿
        </div>

        {/* Contenido de la Bienvenida */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontSize: '0.86rem',
            fontWeight: 900,
            letterSpacing: '1.2px',
            color: '#a7f3d0',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <span>✨</span>
            <span>{currentAlert.title || "¡BIENVENIDO(A) A LA COMUNIDAD!"}</span>
          </div>

          <div className="font-cinzel" style={{
            fontSize: '1.55rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.8px',
            textShadow: '0 0 16px rgba(212, 175, 55, 0.8), 0 2px 8px rgba(0,0,0,0.95)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentAlert.name}
          </div>

          <div style={{
            fontSize: '0.96rem',
            color: '#fef3c7',
            fontWeight: 600,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentAlert.subtitle || "se unió a nuestro Telegram de apoyo y vida 🤍"}
          </div>
        </div>
      </div>
    );
  }

  // 2. Alerta de Regalos / Super Chats de YouTube -> ABAJO A LA IZQUIERDA (bottom: 210px, left: 36px)
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '210px',
        left: '36px',
        zIndex: 9998,
        width: '520px',
        maxWidth: '90vw',
        background: 'linear-gradient(135deg, rgba(42, 28, 6, 0.98) 0%, rgba(20, 14, 3, 0.98) 100%)',
        backdropFilter: 'blur(18px)',
        borderRadius: '24px',
        border: '2.5px solid #fef08a',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(254, 240, 138, 0.55)',
        animation: 'alertSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Ícono de Regalo / Estrella */}
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f59e0b 0%, #b45309 100%)',
        border: '2.5px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.1rem',
        flexShrink: 0,
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)'
      }}>
        🎁
      </div>

      {/* Contenido del Regalo / Donación */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{
          fontSize: '0.94rem',
          fontWeight: 900,
          letterSpacing: '1.8px',
          color: '#fef08a',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>⭐</span>
          <span>{currentAlert.title || "¡GRACIAS POR TU REGALO / APOYO!"}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <span className="font-cinzel" style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.8px',
            textShadow: '0 0 18px rgba(212, 175, 55, 0.9), 0 2px 8px rgba(0,0,0,0.95)'
          }}>
            {currentAlert.name}
          </span>
          {currentAlert.amount && (
            <span style={{
              padding: '3px 10px',
              borderRadius: '12px',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 900,
              boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}>
              {currentAlert.amount}
            </span>
          )}
        </div>

        {currentAlert.message ? (
          <div style={{
            fontSize: '1.15rem',
            color: '#fef3c7',
            fontStyle: 'italic',
            fontWeight: 600,
            marginTop: '2px',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)'
          }}>
            "{currentAlert.message}"
          </div>
        ) : (
          <div style={{
            fontSize: '1.05rem',
            color: '#fde68a',
            fontWeight: 600
          }}>
            {currentAlert.subtitle || "Tu generosidad sostiene este espacio de esperanza 🤍"}
          </div>
        )}
      </div>
    </div>
  );
};
