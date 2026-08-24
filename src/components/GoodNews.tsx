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
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1.8px solid rgba(212, 175, 55, 0.65)',
      boxShadow: '0 10px 28px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.6)',
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
          background: 'linear-gradient(to top, rgba(2, 22, 17, 0.98) 0%, rgba(2, 22, 17, 0.94) 46%, rgba(2, 22, 17, 0.4) 72%, rgba(2, 22, 17, 0.65) 100%)'
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
          <span>✨ BUENAS NOTICIAS</span>
          {news && news.length > 1 && (
            <span style={{ fontSize: '0.88rem', opacity: 0.95, fontWeight: 800 }}>
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
        gap: '8px',
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
            padding: '4px 14px',
            borderRadius: '14px',
            background: 'rgba(212, 175, 55, 0.28)',
            border: '1.4px solid rgba(212, 175, 55, 0.6)',
            color: '#fef08a',
            fontSize: '0.92rem',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            🌱 {currentItem.category}
          </div>
        )}

        {/* Titular Principal en Letra Grande y Nítida */}
        <h3 style={{
          fontSize: '1.45rem',
          lineHeight: 1.25,
          color: '#ffffff',
          fontWeight: 800,
          letterSpacing: '0.2px',
          textShadow: '0 2px 10px rgba(0,0,0,0.98), 0 0 14px rgba(0,0,0,0.9)',
          margin: 0
        }}>
          {currentItem ? currentItem.title : "Noticias de bienestar y calidad de vida"}
        </h3>

        {/* Texto Enriquecido / Descripción Ampliada */}
        {currentItem?.description && (
          <p style={{
            fontSize: '1.22rem',
            lineHeight: 1.38,
            color: '#f1f5f9',
            fontWeight: 500,
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
            fontSize: '1rem',
            color: '#a7f3d0',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)'
          }}>
            <span style={{ color: '#d4af37' }}>✦</span>
            <span>Fuente: {currentItem.source}</span>
          </div>
        )}
      </div>
    </div>
  );
};
