import React, { useState, useEffect } from 'react';
import type { ArtCard } from '../types/board';

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
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80";
            }}
          />
        ) : null}

        {/* Degradé */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 22, 17, 0.98) 0%, rgba(2, 22, 17, 0.88) 32%, rgba(2, 22, 17, 0.35) 60%, rgba(2, 22, 17, 0.65) 100%)'
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
          fontSize: '1rem',
          fontWeight: 800,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <span>🎨 {currentItem?.title || "ARTE QUE SANA"}</span>
          {artList.length > 1 && (
            <span style={{ fontSize: '0.88rem', opacity: 0.95, fontWeight: 800 }}>
              ({currentIndex + 1}/{artList.length})
            </span>
          )}
        </div>
      </div>

      {/* 3. Caption Integrado Inferior con Degradé */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '16px 22px 16px',
        textAlign: 'center',
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        <p style={{
          fontSize: '1.38rem',
          color: '#ffffff',
          fontWeight: 700,
          letterSpacing: '0.3px',
          lineHeight: 1.35,
          textShadow: '0 2px 10px rgba(0,0,0,0.98), 0 0 12px rgba(0,0,0,0.9)',
          margin: 0
        }}>
          "{currentItem?.caption || "Crear también es una forma de respirar y reconectar con la paz interior"}"
        </p>
      </div>
    </div>
  );
};
