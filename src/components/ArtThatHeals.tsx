import React, { useState, useEffect } from 'react';
import type { ArtCard } from '../types/board';
import { handleSafeImageError } from '../utils/imageFallbacks';

interface ArtThatHealsProps {
  card?: ArtCard;
  cards?: ArtCard[];
  rotationSpeed?: number;
}

export const ArtThatHeals: React.FC<ArtThatHealsProps> = ({
  card,
  cards,
  rotationSpeed = 20
}) => {
  const artList = cards && cards.length > 0 ? cards : (card ? [card] : []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (!artList || artList.length <= 1) return;

    const intervalTime = Math.max(8, rotationSpeed) * 1000;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % artList.length);
        setIsFading(false);
      }, 500);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [artList, rotationSpeed]);

  const currentItem = artList.length > 0 ? artList[currentIndex % artList.length] : null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '18px',
      overflow: 'hidden',
      border: '1.8px solid rgba(212, 175, 55, 0.55)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.6)',
      background: '#021813',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. Imagen de Fondo Completa con Transición Cross-Fade */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#011410'
      }}>
        {currentItem ? (
          <img
            src={currentItem.imageSrc}
            alt={currentItem.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.88) contrast(1.08)',
              opacity: isFading ? 0.2 : 1,
              transform: isFading ? 'scale(1.03)' : 'scale(1)',
              transition: 'opacity 0.5s ease, transform 0.5s ease'
            }}
            onError={(e) => handleSafeImageError(e, 'art')}
          />
        ) : null}

        {/* Degradé Fusión Cinematográfico con Excelente Contraste */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 22, 17, 0.98) 0%, rgba(2, 22, 17, 0.92) 52%, rgba(2, 22, 17, 0.35) 75%, rgba(2, 22, 17, 0.65) 100%)'
        }} />
      </div>

      {/* 2. Header Pill Superior */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        right: '14px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="gold-pill-header" style={{
          padding: '7px 22px',
          borderRadius: '22px',
          fontSize: '1.02rem',
          fontWeight: 800,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <span>🎨 ARTE QUE SANA</span>
          {artList.length > 1 && (
            <span style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: 800 }}>
              ({currentIndex + 1}/{artList.length})
            </span>
          )}
        </div>
      </div>

      {/* 3. Contenido Central e Inferior Enriquecido (Mobile-First & Senior-Friendly) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '16px 20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        {/* Autor / Comunidad Badge */}
        {currentItem?.author && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            padding: '4px 12px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.28)',
            border: '1.4px solid rgba(212, 175, 55, 0.65)',
            color: '#fef08a',
            fontSize: '0.92rem',
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}>
            ✦ {currentItem.author}
          </div>
        )}

        {/* Título Protagónico Nítido y Grande */}
        <h3 style={{
          fontSize: '1.58rem',
          lineHeight: 1.2,
          color: '#ffffff',
          fontWeight: 900,
          letterSpacing: '0.2px',
          textShadow: '0 2px 12px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,0.9)',
          margin: 0
        }}>
          {currentItem?.title || "Arte que inspira y sana"}
        </h3>

        {/* Reflexión Terapéutica / Historia Agrandada (Legible en Móviles) */}
        <p style={{
          fontSize: '1.26rem',
          lineHeight: 1.34,
          color: '#f8fafc',
          fontWeight: 600,
          letterSpacing: '0.2px',
          textShadow: '0 2px 8px rgba(0,0,0,0.98), 0 0 10px rgba(0,0,0,0.9)',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          "{currentItem?.caption || currentItem?.fullDescription || "Crear también es una forma de respirar y reconectar con la paz interior"}"
        </p>

        {/* Píldora de Calma y Respiración en la Base */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6ee7b7',
          fontSize: '0.96rem',
          fontWeight: 700,
          textShadow: '0 1px 6px rgba(0,0,0,0.9)'
        }}>
          <span>🌿</span>
          <span>Respira profundo y descansa en la serenidad</span>
        </div>
      </div>
    </div>
  );
};
