import React from 'react';

interface BottomTickerProps {
  dailyReminder?: string;
  dailyReminders?: string[];
  dailyReminderLabel?: string;
  dailyReminderRotationSpeed?: number;
  
  nextLive?: string;
  nextLiveList?: string[];
  nextLiveLabel?: string;
  nextLiveRotationSpeed?: number;
}

const SEPARATOR_ICONS = ["✉️", "📢", "📰", "✨", "🌿"];

export const BottomTicker: React.FC<BottomTickerProps> = ({
  dailyReminder,
  dailyReminders,
  dailyReminderLabel = "HOY RECORDAMOS",
  dailyReminderRotationSpeed = 480,
  
  nextLive,
  nextLiveList,
  nextLiveLabel = "INVITACIÓN",
  nextLiveRotationSpeed = 390
}) => {
  // Lista 1: Recordatorios de vida
  const reminderList = dailyReminders && dailyReminders.length > 0
    ? dailyReminders
    : (dailyReminder ? [dailyReminder] : [
        "No eres un diagnóstico: eres una historia, una familia y un proyecto de vida",
        "El autocuidado y la serenidad son tus mayores aliados en cada paso del camino",
        "Celebrar los pequeños logros diarios fortalece tu sistema y tu bienestar interior",
        "¿Quieres ver tu mensaje o testimonio aquí en la pizarra? Más información en la descripción del directo"
      ]);

  // Lista 2: Invitaciones y directos
  const liveList = nextLiveList && nextLiveList.length > 0
    ? nextLiveList
    : (nextLive ? [nextLive] : [
        "Comprender para avanzar: preguntas esenciales que puedes llevar a tu consulta médica",
        "Taller de Nutrición Consciente: hábitos y alimentos que apoyan tu energía vital",
        "Espacio de Acompañamiento: testimonios de resiliencia y esperanza en comunidad",
        "¿Quieres participar con tu caso o pregunta? Escríbenos en los enlaces de la descripción"
      ]);

  // Duplicar elementos para un bucle continuo infinito y sin costuras
  const doubledReminders = [...reminderList, ...reminderList];
  const doubledLiveList = [...liveList, ...liveList];

  // Limpiar etiqueta de invitación si venía como "INVITACIÓN ESPECIAL"
  const formattedLiveLabel = (nextLiveLabel && nextLiveLabel.toUpperCase().includes("ESPECIAL"))
    ? "INVITACIÓN"
    : (nextLiveLabel || "INVITACIÓN");

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '0 32px 10px'
    }}>
      {/* Barra 1: HOY RECORDAMOS (Doble Tamaño 84px) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '84px',
        borderRadius: '42px',
        border: '2.5px solid rgba(212, 175, 55, 0.85)',
        background: 'linear-gradient(90deg, rgba(3, 30, 24, 0.98) 0%, rgba(2, 22, 17, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.35)'
      }}>
        {/* Badge Dorado Ampliado (340px) */}
        <div style={{
          width: '340px',
          minWidth: '340px',
          maxWidth: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '0 18px',
          borderRight: '2.2px solid rgba(212, 175, 55, 0.7)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.38) 0%, rgba(180, 140, 30, 0.25) 100%)',
          height: '100%',
          zIndex: 5
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="font-cinzel" style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '2.5px',
            color: '#fef3c7',
            textTransform: 'uppercase',
            textShadow: '0 0 16px rgba(212, 175, 55, 0.75)',
            whiteSpace: 'nowrap'
          }}>
            {dailyReminderLabel || "HOY RECORDAMOS"}
          </span>
        </div>

        {/* Pista de Desplazamiento Continuo Extra Grande */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)'
        }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              animation: `marquee ${Math.max(15, dailyReminderRotationSpeed)}s linear infinite`
            }}
          >
            {doubledReminders.map((msg, idx) => {
              const icon = SEPARATOR_ICONS[idx % SEPARATOR_ICONS.length];
              return (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '18px', paddingRight: '60px' }}>
                  <span style={{ fontSize: '2.1rem', opacity: 0.95 }}>{icon}</span>
                  <span style={{
                    fontSize: '2.25rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textShadow: '0 3px 12px rgba(0, 0, 0, 0.98)'
                  }}>
                    {msg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra 2: INVITACIÓN (Doble Tamaño 84px) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '84px',
        borderRadius: '42px',
        border: '2.5px solid rgba(16, 185, 129, 0.85)',
        background: 'linear-gradient(90deg, rgba(3, 30, 24, 0.98) 0%, rgba(2, 22, 17, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.75), 0 0 25px rgba(16, 185, 129, 0.35)'
      }}>
        {/* Badge Esmeralda Ampliado (340px) */}
        <div style={{
          width: '340px',
          minWidth: '340px',
          maxWidth: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '0 18px',
          borderRight: '2.2px solid rgba(16, 185, 129, 0.7)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.38) 0%, rgba(5, 150, 105, 0.25) 100%)',
          height: '100%',
          zIndex: 5
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-cinzel" style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '2.5px',
            color: '#a7f3d0',
            textTransform: 'uppercase',
            textShadow: '0 0 16px rgba(16, 185, 129, 0.75)',
            whiteSpace: 'nowrap'
          }}>
            {formattedLiveLabel}
          </span>
        </div>

        {/* Pista de Desplazamiento Continuo Extra Grande */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)'
        }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              animation: `marquee ${Math.max(15, nextLiveRotationSpeed)}s linear infinite`
            }}
          >
            {doubledLiveList.map((msg, idx) => {
              const icon = SEPARATOR_ICONS[(idx + 2) % SEPARATOR_ICONS.length];
              return (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '18px', paddingRight: '60px' }}>
                  <span style={{ fontSize: '2.1rem', opacity: 0.95 }}>{icon}</span>
                  <span style={{
                    fontSize: '2.25rem',
                    color: '#f8fafc',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textShadow: '0 3px 12px rgba(0, 0, 0, 0.98)'
                  }}>
                    {msg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
