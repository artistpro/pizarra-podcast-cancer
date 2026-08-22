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
      borderRadius: '18px',
      overflow: 'hidden',
      border: '1.8px solid rgba(212, 175, 55, 0.55)',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.6), inset 0 0 28px rgba(0, 0, 0, 0.45)',
      background: 'rgba(3, 26, 21, 0.88)',
      backdropFilter: 'blur(18px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 32px 16px',
      justifyContent: 'space-between'
    }}>
      {/* Header: Título de Sección + Badge Información Responsable & Contador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        borderBottom: '1.5px solid rgba(212, 175, 55, 0.25)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.45rem' }}>💊</span>
          <h2 className="font-cinzel" style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#fef3c7',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
          }}>
            {currentItem.sectionTitle || "SUPLEMENTOS Y EVIDENCIA"}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 20px',
          borderRadius: '16px',
          border: '1.2px solid rgba(212, 175, 55, 0.5)',
          background: 'rgba(0, 0, 0, 0.55)',
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '1.5px',
          color: '#fde047',
          textTransform: 'uppercase',
          boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)'
        }}>
          <span>{currentItem.badge || "INFORMACIÓN RESPONSABLE"}</span>
          {supList.length > 1 && (
            <span style={{ fontSize: '0.75rem', opacity: 0.9, color: '#a7f3d0' }}>
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
        gap: '32px',
        minHeight: 0,
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        {/* Columna 1: Gráfico de Frasco/Gotas + Icono Solar */}
        <div style={{
          width: '145px',
          height: '100%',
          maxHeight: '140px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '14px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(2, 20, 16, 0.85) 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
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
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(251, 191, 36, 0.8)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            fontSize: '0.92rem',
            letterSpacing: '3px',
            color: '#fbbf24',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {currentItem.subtitle || "FICHA DE HOY"}
          </div>

          <h3 className="font-cinzel" style={{
            fontSize: '2.1rem',
            fontWeight: 900,
            letterSpacing: '2.5px',
            color: '#ffffff',
            margin: '2px 0 8px',
            textShadow: '0 0 18px rgba(212, 175, 55, 0.5), 0 2px 6px rgba(0,0,0,0.9)'
          }}>
            {currentItem.name || "VITAMINA D"}
          </h3>

          <p style={{
            fontSize: '1.22rem',
            lineHeight: 1.45,
            color: '#e2e8f0',
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Columna 3: Cuadro de Advertencia y Descargo Clínico */}
        <div style={{
          background: 'rgba(2, 20, 16, 0.75)',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fef08a', fontSize: '0.92rem', fontWeight: 800 }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span className="font-cinzel" style={{ letterSpacing: '2px' }}>CRITERIO PROFESIONAL</span>
          </div>
          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.4,
            color: '#fde047',
            fontStyle: 'italic',
            fontWeight: 600,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)'
          }}>
            {currentItem.disclaimer || "Revisa niveles, dosis e interacciones con un profesional de la salud."}
          </p>
        </div>
      </div>
    </div>
  );
};
