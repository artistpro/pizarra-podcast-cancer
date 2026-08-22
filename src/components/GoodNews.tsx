import React, { useState, useEffect } from 'react';
import type { NewsItem } from '../types/board';

interface GoodNewsProps {
  news: NewsItem[];
  rotationSpeed?: number;
}

export const GoodNews: React.FC<GoodNewsProps> = ({
  news,
  rotationSpeed = 8
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (!news || news.length <= 1) return;

    const intervalTime = Math.max(4, rotationSpeed) * 1000;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setIsFading(false);
      }, 450);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [news, rotationSpeed]);

  const currentItem = news && news.length > 0 ? news[currentIndex % news.length] : null;

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
      {/* 1. Imagen de Fondo de Pantalla Completa (Full-Bleed Cover) */}
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
              filter: 'brightness(0.85) contrast(1.1)',
              opacity: isFading ? 0.2 : 1,
              transform: isFading ? 'scale(1.03)' : 'scale(1)',
              transition: 'opacity 0.45s ease, transform 0.45s ease'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80";
            }}
          />
        ) : null}

        {/* Degradé Fusión Cinematográfico */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 22, 17, 0.98) 0%, rgba(2, 22, 17, 0.92) 42%, rgba(2, 22, 17, 0.4) 68%, rgba(2, 22, 17, 0.65) 100%)'
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
          padding: '6px 20px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>✨ BUENAS NOTICIAS</span>
          {news && news.length > 1 && (
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 800 }}>
              ({currentIndex + 1}/{news.length})
            </span>
          )}
        </div>
      </div>

      {/* 3. Contenido Integrado con el Degradé en la Parte Inferior (Tipografía Ampliada) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '16px 22px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.45s ease, transform 0.45s ease'
      }}>
        {/* Etiqueta de Categoría */}
        {currentItem?.category && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            padding: '3px 12px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.25)',
            border: '1.2px solid rgba(212, 175, 55, 0.5)',
            color: '#fef08a',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase'
          }}>
            🌱 {currentItem.category}
          </div>
        )}

        {/* Titular Principal en Letra Grande y Nítida */}
        <h3 style={{
          fontSize: '1.22rem',
          lineHeight: 1.3,
          color: '#ffffff',
          fontWeight: 800,
          letterSpacing: '0.2px',
          textShadow: '0 2px 10px rgba(0,0,0,0.98), 0 0 12px rgba(0,0,0,0.85)',
          margin: 0
        }}>
          {currentItem ? currentItem.title : "Noticias de bienestar y calidad de vida"}
        </h3>

        {/* Texto Enriquecido / Descripción Ampliada */}
        {currentItem?.description && (
          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.38,
            color: '#e2e8f0',
            fontWeight: 400,
            textShadow: '0 1px 6px rgba(0,0,0,0.95)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0
          }}>
            {currentItem.description}
          </p>
        )}

        {/* Fuente & Fecha */}
        {currentItem?.source && (
          <div style={{
            fontSize: '0.84rem',
            color: '#a7f3d0',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px'
          }}>
            <span style={{ color: '#d4af37' }}>✦</span>
            <span>Fuente: {currentItem.source}</span>
          </div>
        )}
      </div>
    </div>
  );
};
