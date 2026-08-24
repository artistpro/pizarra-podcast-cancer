import React, { useState, useEffect } from 'react';
import type { SupplementData, BoardState } from '../../types/board';

interface FullScreenSupplementProps {
  supplements: SupplementData[];
  rotationSpeed?: number;
  state: BoardState;
  effectiveTheme: 'day' | 'night';
}

export const FullScreenSupplement: React.FC<FullScreenSupplementProps> = ({
  supplements,
  rotationSpeed = 25
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (!supplements || supplements.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % supplements.length);
        setIsFading(false);
      }, 500);
    }, Math.max(10, rotationSpeed) * 1000);

    return () => clearInterval(interval);
  }, [supplements, rotationSpeed]);

  const currentItem = supplements && supplements.length > 0 ? supplements[currentIndex % supplements.length] : null;

  if (!currentItem) return null;

  const defaultBenefits = [
    "Modulación y equilibrio de la respuesta inmunitaria natural",
    "Protección frente al estrés oxidativo y apoyo mitocondrial celular",
    "Respaldado por publicaciones en oncología y nutrición integrativa"
  ];

  const benefitsToShow = currentItem.keyBenefits && currentItem.keyBenefits.length > 0
    ? currentItem.keyBenefits
    : defaultBenefits;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '8px 24px',
      display: 'grid',
      gridTemplateColumns: '0.85fr 1.15fr',
      gap: '28px',
      alignItems: 'center',
      opacity: isFading ? 0.2 : 1,
      transform: isFading ? 'translateY(6px)' : 'translateY(0)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>
      {/* Columna Izquierda: Frasco Ilustrado + Consejos Ocupando Todo el Alto */}
      <div style={{
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Contenedor del Frasco */}
        <div style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          borderRadius: '26px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(2, 24, 19, 0.98) 100%)',
          border: '2.5px solid rgba(212, 175, 55, 0.85)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 45px rgba(212, 175, 55, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {currentItem.imageSrc ? (
            <img
              src={currentItem.imageSrc}
              alt={currentItem.name}
              style={{
                width: '92%',
                height: '92%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.95))'
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Badge Superior Frasco */}
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            padding: '8px 22px',
            borderRadius: '20px',
            background: 'rgba(2, 24, 19, 0.95)',
            border: '1.8px solid #d4af37',
            color: '#fef3c7',
            fontSize: '1.15rem',
            fontWeight: 900,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 18px rgba(0,0,0,0.7)'
          }}>
            💊 SUPLEMENTO ({currentIndex + 1}/{supplements.length})
          </div>

          {/* Emblema Solar */}
          <div style={{
            position: 'absolute',
            bottom: '18px',
            right: '18px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 26px rgba(251, 191, 36, 0.95)'
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>
        </div>

        {/* Caja de Forma de Consumo */}
        <div style={{
          width: '100%',
          background: 'rgba(2, 24, 19, 0.96)',
          border: '2px solid rgba(212, 175, 55, 0.75)',
          borderRadius: '22px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.75)'
        }}>
          <div style={{ fontSize: '1.25rem', color: '#fbbf24', fontWeight: 900, marginBottom: '6px', letterSpacing: '1px' }}>
            💡 FORMA DE CONSUMO & SINERGIAS:
          </div>
          <p style={{ fontSize: '1.45rem', color: '#ffffff', margin: '0 0 6px', lineHeight: 1.35, fontWeight: 600 }}>
            {currentItem.usageTips || "Tomar junto a una comida principal para optimizar su absorción natural."}
          </p>
          <p style={{ fontSize: '1.25rem', color: '#a7f3d0', margin: 0, fontStyle: 'italic', fontWeight: 700 }}>
            {currentItem.synergies || "Consulta posibles sinergias con otros nutrientes."}
          </p>
        </div>
      </div>

      {/* Columna Derecha: Titular, Narrativa y Beneficios Extra Grandes */}
      <div style={{
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div>
          <div className="font-cinzel" style={{
            fontSize: '1.25rem',
            letterSpacing: '4px',
            color: '#d4af37',
            fontWeight: 900,
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            ✦ GUÍA DE EVIDENCIA CLÍNICA • {currentItem.subtitle || "FICHA DE HOY"} ✦
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '3.5rem',
            lineHeight: 1.15,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '1px',
            margin: '0 0 10px',
            textShadow: '0 0 32px rgba(212, 175, 55, 0.65), 0 4px 12px rgba(0,0,0,0.98)'
          }}>
            {currentItem.name}
          </h1>

          <p style={{
            fontSize: '1.75rem',
            lineHeight: 1.4,
            color: '#f8fafc',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0,0,0,0.95)',
            margin: 0
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Beneficios Fisiológicos Principales Extra Grandes */}
        <div style={{
          background: 'rgba(2, 24, 19, 0.94)',
          border: '2px solid rgba(212, 175, 55, 0.75)',
          borderRadius: '24px',
          padding: '18px 28px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.75)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            color: '#fef08a',
            fontSize: '1.35rem',
            fontWeight: 900
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔬</span>
            <span className="font-cinzel" style={{ letterSpacing: '3px' }}>
              ACCIONES Y BENEFICIOS BIOLÓGICOS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {benefitsToShow.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <span style={{ color: '#10b981', fontSize: '1.5rem', marginTop: '1px', fontWeight: 900 }}>✔</span>
                <span style={{ fontSize: '1.48rem', color: '#ffffff', lineHeight: 1.3, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cuadro de Descargo y Criterio Profesional Extra Grande */}
        <div style={{
          background: 'rgba(2, 18, 14, 0.96)',
          border: '2px solid rgba(251, 191, 36, 0.85)',
          borderRadius: '20px',
          padding: '14px 26px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
        }}>
          <span style={{ fontSize: '2.2rem' }}>⚠️</span>
          <div>
            <div className="font-cinzel" style={{ fontSize: '1.18rem', color: '#fef08a', fontWeight: 900, letterSpacing: '2px', marginBottom: '2px' }}>
              CRITERIO CLÍNICO RESPONSABLE
            </div>
            <p style={{ fontSize: '1.35rem', color: '#fde047', margin: 0, fontStyle: 'italic', fontWeight: 700 }}>
              {currentItem.disclaimer || "Revisa niveles, dosis e interacciones con un profesional de la salud."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
