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
    "Protección frente al estrés oxidativo y apoyo mitocondrial",
    "Respaldado por publicaciones en oncología y nutrición integrativa"
  ];

  const benefitsToShow = currentItem.keyBenefits && currentItem.keyBenefits.length > 0
    ? currentItem.keyBenefits
    : defaultBenefits;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '16px 45px',
      display: 'grid',
      gridTemplateColumns: '0.85fr 1.15fr',
      gap: '40px',
      alignItems: 'center',
      opacity: isFading ? 0.2 : 1,
      transform: isFading ? 'translateY(6px)' : 'translateY(0)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>
      {/* Columna Izquierda: Frasco Ilustrado + Consejos de Toma */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '320px',
          borderRadius: '24px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(2, 24, 19, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.65)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.3)',
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
                width: '90%',
                height: '90%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))'
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Emblema Solar */}
          <div style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(251, 191, 36, 0.8)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Caja de Consejos y Sinergias */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(2, 24, 19, 0.85)',
          border: '1.4px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '16px',
          padding: '14px 18px'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 800, marginBottom: '4px' }}>
            💡 FORMA DE CONSUMO & SINERGIAS:
          </div>
          <p style={{ fontSize: '0.98rem', color: '#e2e8f0', margin: '0 0 4px', lineHeight: 1.35 }}>
            {currentItem.usageTips || "Tomar junto a una comida principal para optimizar su absorción natural."}
          </p>
          <p style={{ fontSize: '0.88rem', color: '#a7f3d0', margin: 0, fontStyle: 'italic' }}>
            {currentItem.synergies || "Consulta posibles sinergias con otros nutrientes."}
          </p>
        </div>
      </div>

      {/* Columna Derecha: Detalles Clínicos, Beneficios y Criterio Médico */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              padding: '4px 16px',
              borderRadius: '14px',
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1.2px solid rgba(212, 175, 55, 0.5)',
              color: '#fde047',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '1.5px'
            }}>
              💊 GUÍA DE EVIDENCIA ({currentIndex + 1}/{supplements.length})
            </div>
            <span style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 700 }}>
              {currentItem.subtitle || "FICHA DE HOY"}
            </span>
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '2.35rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '2px',
            margin: '0 0 10px',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.5), 0 3px 8px rgba(0,0,0,0.9)'
          }}>
            {currentItem.name}
          </h1>

          <p style={{
            fontSize: '1.24rem',
            lineHeight: 1.48,
            color: '#f1f5f9',
            fontWeight: 500,
            textShadow: '0 1px 6px rgba(0,0,0,0.85)'
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Beneficios Fisiológicos Principales */}
        <div style={{
          background: 'rgba(2, 24, 19, 0.85)',
          border: '1.6px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '18px',
          padding: '18px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
            color: '#fef08a',
            fontSize: '1rem',
            fontWeight: 800
          }}>
            <span>🔬</span>
            <span className="font-cinzel" style={{ letterSpacing: '2px' }}>
              ACCIONES Y BENEFICIOS BIOLÓGICOS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {benefitsToShow.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#10b981', fontSize: '1.05rem', marginTop: '2px' }}>✔</span>
                <span style={{ fontSize: '1.02rem', color: '#f8fafc', lineHeight: 1.35, fontWeight: 500 }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cuadro de Descargo y Criterio Profesional */}
        <div style={{
          background: 'rgba(2, 18, 14, 0.9)',
          border: '1.6px solid rgba(251, 191, 36, 0.65)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div className="font-cinzel" style={{ fontSize: '0.88rem', color: '#fef08a', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '2px' }}>
              CRITERIO CLÍNICO RESPONSABLE
            </div>
            <p style={{ fontSize: '0.98rem', color: '#fde047', margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
              {currentItem.disclaimer || "Revisa niveles, dosis e interacciones con un profesional de la salud."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
