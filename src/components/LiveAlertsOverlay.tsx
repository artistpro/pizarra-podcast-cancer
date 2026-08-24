import React, { useState, useEffect, useRef } from 'react';
import { subscribeLiveAlert } from '../firebase';
import type { LiveAlert, BoardState } from '../types/board';
import { DEFAULT_INCENTIVE_NAMES } from '../types/board';

interface LiveAlertsOverlayProps {
  state?: BoardState;
  initialAlert?: LiveAlert | null;
}

const SAMPLE_GIFT_AMOUNTS = [
  "Super Chat $5.00",
  "Super Chat $10.00",
  "Regalo YouTube 🎁",
  "Super Thanks $5.00",
  "Super Chat $15.00"
];

const SAMPLE_GIFT_MESSAGES = [
  "Con mucho amor y gratitud para toda la comunidad 🤍",
  "Gracias por este espacio de esperanza y serenidad diaria ✨",
  "Bendiciones y fortaleza para todos en el proceso 🙏",
  "Un abrazo fraterno para toda la Comunidad Sanante 🌿",
  "Por la salud, la vitalidad y la paz de cada familia 🤍"
];

export const LiveAlertsOverlay: React.FC<LiveAlertsOverlayProps> = ({ state, initialAlert: _initialAlert }) => {
  const [currentAlert, setCurrentAlert] = useState<LiveAlert | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const processedAlertsRef = useRef<Set<string>>(new Set());
  const lastAlertTimeRef = useRef<number>(Date.now());
  const lastRealWelcomeRef = useRef<string | null>(state?.lastRealWelcomeName || null);
  const lastRealDonorRef = useRef<string | null>(state?.lastRealDonorName || null);
  const incentiveIndexRef = useRef<number>(0);
  const nextIncentiveTypeRef = useRef<'welcome' | 'gift'>('welcome');

  // 1. Escuchar alertas en tiempo real desde Firebase (Eventos reales de Telegram / YouTube)
  useEffect(() => {
    const unsubscribe = subscribeLiveAlert((alert) => {
      if (!alert || !alert.id) return;

      // Evitar reproducir la misma alerta más de una vez
      if (processedAlertsRef.current.has(alert.id)) return;
      processedAlertsRef.current.add(alert.id);

      // Si la alerta tiene más de 60 segundos de antigüedad, no la mostramos al cargar de cero
      const ageMs = Date.now() - (alert.timestamp || 0);
      if (ageMs > 60000) return;

      // Actualizar último timestamp y nombre real registrado
      lastAlertTimeRef.current = Date.now();
      if (alert.type === 'welcome' && alert.name) {
        lastRealWelcomeRef.current = alert.name;
      } else if ((alert.type === 'donation' || alert.type === 'gift' || alert.type === 'superchat') && alert.name) {
        lastRealDonorRef.current = alert.name;
      }

      // Disparar alerta en pantalla
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

  // 2. Motor Autónomo de Incentivo Comunitario (Cada 30 minutos mientras no haya alertas reales)
  useEffect(() => {
    const isEnabled = state?.enablePeriodicIncentiveAlerts !== false;
    const intervalMinutes = Math.max(1, state?.incentiveAlertsIntervalMinutes || 30);
    const intervalMs = intervalMinutes * 60 * 1000;
    const namesPool = (state?.incentiveNamesPool && state.incentiveNamesPool.length > 0)
      ? state.incentiveNamesPool
      : DEFAULT_INCENTIVE_NAMES;

    const intervalTimer = setInterval(() => {
      if (!isEnabled) return;

      const elapsed = Date.now() - lastAlertTimeRef.current;
      if (elapsed >= intervalMs) {
        // Reiniciar cronómetro
        lastAlertTimeRef.current = Date.now();

        const type = nextIncentiveTypeRef.current;
        nextIncentiveTypeRef.current = type === 'welcome' ? 'gift' : 'welcome';

        // Obtener el siguiente nombre del pool de 9 nombres
        const currentIdx = incentiveIndexRef.current % namesPool.length;
        const candidateName = namesPool[currentIdx];
        incentiveIndexRef.current += 1;

        let simulatedAlert: LiveAlert;

        if (type === 'welcome') {
          // Si tenemos un miembro real reciente, podemos saludarlo de forma especial
          const isRealMember = lastRealWelcomeRef.current && Math.random() > 0.6;
          const memberName = isRealMember ? lastRealWelcomeRef.current! : candidateName;

          simulatedAlert = {
            id: `incentive_welcome_${Date.now()}`,
            type: 'welcome',
            title: isRealMember ? "SALUDAMOS A NUESTRO MIEMBRO RECIENTE" : "¡BIENVENIDO(A) A LA COMUNIDAD!",
            name: memberName,
            subtitle: "se unió a nuestro Telegram de apoyo y vida 🤍",
            timestamp: Date.now(),
            durationSec: 9
          };
        } else {
          // Alerta de Regalo / Super Chat de YouTube
          const isRealDonor = lastRealDonorRef.current && Math.random() > 0.6;
          const donorName = isRealDonor ? lastRealDonorRef.current! : candidateName;
          const randomAmount = SAMPLE_GIFT_AMOUNTS[Math.floor(Math.random() * SAMPLE_GIFT_AMOUNTS.length)];
          const randomMsg = SAMPLE_GIFT_MESSAGES[Math.floor(Math.random() * SAMPLE_GIFT_MESSAGES.length)];

          simulatedAlert = {
            id: `incentive_gift_${Date.now()}`,
            type: 'gift',
            title: "¡GRACIAS POR TU REGALO / APOYO!",
            name: donorName,
            amount: randomAmount,
            message: randomMsg,
            timestamp: Date.now(),
            durationSec: 15
          };
        }

        // Mostrar en pantalla
        setCurrentAlert(simulatedAlert);
        setIsVisible(true);

        const durationMs = (simulatedAlert.durationSec || 9) * 1000;
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setCurrentAlert(null);
          }, 600);
        }, durationMs);
      }
    }, 15000); // Chequea cada 15 segundos

    return () => clearInterval(intervalTimer);
  }, [state?.enablePeriodicIncentiveAlerts, state?.incentiveAlertsIntervalMinutes, state?.incentiveNamesPool]);

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
