import React, { useState, useEffect } from 'react';
import type { SupplementData } from '../types/board';

interface SupplementCardProps {
  supplement?: SupplementData;
  supplements?: SupplementData[];
  rotationSpeed?: number;
}

export const SupplementCard: React.FC<SupplementCardProps> = ({
  supplement,
  supplements,
  rotationSpeed = 25
}) => {
  const supList = supplements && supplements.length > 0 ? supplements : (supplement ? [supplement] : []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (!supList || supList.length <= 1) return;

    const intervalTime = Math.max(10, rotationSpeed) * 1000;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % supList.length);
        setIsFading(false);
      }, 500);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [supList, rotationSpeed]);

  const currentItem = supList.length > 0 ? supList[currentIndex % supList.length] : null;

  if (!currentItem) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1.8px solid rgba(212, 175, 55, 0.65)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65), inset 0 0 28px rgba(0, 0, 0, 0.45)',
      background: 'rgba(3, 26, 21, 0.9)',
      backdropFilter: 'blur(18px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 28px 14px',
      justifyContent: 'space-between'
    }}>
      {/* Header: Título de Sección + Badge Información Responsable & Contador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        borderBottom: '1.5px solid rgba(212, 175, 55, 0.3)',
        paddingBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.55rem' }}>💊</span>
          <h2 className="font-cinzel" style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#fef3c7',
            textTransform: 'uppercase',
            textShadow: '0 0 14px rgba(212, 175, 55, 0.45)'
          }}>
            {currentItem.sectionTitle || "SUPLEMENTOS Y EVIDENCIA"}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 22px',
          borderRadius: '18px',
          border: '1.4px solid rgba(212, 175, 55, 0.6)',
          background: 'rgba(0, 0, 0, 0.65)',
          fontSize: '0.95rem',
          fontWeight: 800,
          letterSpacing: '1.5px',
          color: '#fde047',
          textTransform: 'uppercase',
          boxShadow: '0 0 14px rgba(212, 175, 55, 0.3)'
        }}>
          <span>{currentItem.badge || "INFORMACIÓN RESPONSABLE"}</span>
          {supList.length > 1 && (
            <span style={{ fontSize: '0.85rem', opacity: 0.95, color: '#a7f3d0' }}>
              • ({currentIndex + 1}/{supList.length})
            </span>
          )}
        </div>
      </div>

      {/* Contenido en 3 Columnas con Transición Suave */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'auto 1.7fr 1.15fr',
        alignItems: 'center',
        gap: '28px',
        minHeight: 0,
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        {/* Columna 1: Gráfico de Frasco/Gotas + Icono Solar */}
        <div style={{
          width: '155px',
          height: '100%',
          maxHeight: '145px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(2, 20, 16, 0.9) 100%)',
          border: '1.6px solid rgba(212, 175, 55, 0.55)',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 6px 18px rgba(0,0,0,0.55)'
        }}>
          {currentItem.imageSrc ? (
            <img
              src={currentItem.imageSrc}
              alt={currentItem.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '6px'
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Icono Solar Dorado Superpuesto */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(251, 191, 36, 0.85)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Columna 2: Subtítulo, Nombre y Descripción Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          <div className="font-cinzel" style={{
            fontSize: '1.05rem',
            letterSpacing: '3.5px',
            color: '#fbbf24',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {currentItem.subtitle || "FICHA DE HOY"}
          </div>

          <h3 className="font-cinzel" style={{
            fontSize: '2.45rem',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#ffffff',
            margin: '2px 0 6px',
            textShadow: '0 0 22px rgba(212, 175, 55, 0.55), 0 2px 8px rgba(0,0,0,0.95)'
          }}>
            {currentItem.name || "VITAMINA D"}
          </h3>

          <p style={{
            fontSize: '1.38rem',
            lineHeight: 1.4,
            color: '#f8fafc',
            fontWeight: 500,
            textShadow: '0 1px 5px rgba(0,0,0,0.9)',
            margin: 0
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Columna 3: Cuadro de Advertencia y Descargo Clínico */}
        <div style={{
          background: 'rgba(2, 20, 16, 0.85)',
          border: '1.6px solid rgba(212, 175, 55, 0.55)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fef08a', fontSize: '1.05rem', fontWeight: 800 }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span className="font-cinzel" style={{ letterSpacing: '2px' }}>CRITERIO PROFESIONAL</span>
          </div>
          <p style={{
            fontSize: '1.18rem',
            lineHeight: 1.36,
            color: '#fde047',
            fontStyle: 'italic',
            fontWeight: 600,
            textShadow: '0 1px 5px rgba(0,0,0,0.9)',
            margin: 0
          }}>
            {currentItem.disclaimer || "Revisa niveles, dosis e interacciones con un profesional de la salud."}
          </p>
        </div>
      </div>
    </div>
  );
};
