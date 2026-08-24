import React, { useState, useEffect } from 'react';
import type { NewsItem, BoardState } from '../../types/board';

interface FullScreenNewsProps {
  news: NewsItem[];
  rotationSpeed?: number;
  state: BoardState;
  effectiveTheme: 'day' | 'night';
}

export const FullScreenNews: React.FC<FullScreenNewsProps> = ({
  news,
  rotationSpeed = 30
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (!news || news.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setIsFading(false);
      }, 500);
    }, Math.max(20, rotationSpeed) * 1000);

    return () => clearInterval(interval);
  }, [news, rotationSpeed]);

  const currentItem = news && news.length > 0 ? news[currentIndex % news.length] : null;

  if (!currentItem) return null;

  const defaultKeyPoints = [
    "Evidencia científica contrastada y aplicable en tu día a día",
    "Prácticas y hábitos que impulsan tu energía celular y bienestar",
    "Validado por profesionales de la salud y medicina integrativa",
    "Fomento de la resiliencia y el proyecto de vida en comunidad"
  ];

  const pointsToShow = currentItem.keyPoints && currentItem.keyPoints.length > 0
    ? currentItem.keyPoints
    : defaultKeyPoints;

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
      {/* Columna Izquierda: Imagen HD en Gran Formato */}
      <div style={{
        position: 'relative',
        height: '620px',
        borderRadius: '26px',
        overflow: 'hidden',
        border: '2.5px solid rgba(212, 175, 55, 0.85)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.35)',
        background: '#011410'
      }}>
        <img
          src={currentItem.imageSrc}
          alt={currentItem.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.92) contrast(1.08)'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85";
          }}
        />

        {/* Degradé cinematográfico inferior */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 20, 16, 0.98) 0%, rgba(2, 20, 16, 0.45) 45%, transparent 100%)'
        }} />

        {/* Badge Superior */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px'
        }}>
          <div style={{
            padding: '10px 26px',
            borderRadius: '22px',
            background: 'rgba(2, 24, 19, 0.95)',
            border: '1.8px solid #d4af37',
            color: '#fef3c7',
            fontSize: '1.2rem',
            fontWeight: 900,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 18px rgba(0,0,0,0.7)'
          }}>
            📰 NOTICIA DESTACADA ({currentIndex + 1}/{news.length})
          </div>
        </div>

        {/* Fuente en la base de la foto */}
        <div style={{
          position: 'absolute',
          bottom: '22px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.35rem', color: '#fbbf24', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>
            🏷️ {currentItem.category || "BIENESTAR Y SALUD"}
          </span>
          <span style={{ fontSize: '1.2rem', color: '#e2e8f0', fontWeight: 700, textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>
            Fuente: {currentItem.source || "Periodismo de Soluciones"}
          </span>
        </div>
      </div>

      {/* Columna Derecha: Titular, Narrativa y Puntos Clave Extra Grandes */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px'
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
            ✦ REPORTAJE ESPECIAL & ESPERANZA ✦
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '3.3rem',
            lineHeight: 1.16,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.5px',
            margin: '0 0 12px',
            textShadow: '0 0 32px rgba(212, 175, 55, 0.6), 0 4px 12px rgba(0,0,0,0.98)'
          }}>
            {currentItem.title}
          </h1>

          <p style={{
            fontSize: '1.75rem',
            lineHeight: 1.42,
            color: '#f8fafc',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0,0,0,0.95)',
            margin: 0
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Cuadro de Puntos Clave Extra Grande */}
        <div style={{
          background: 'rgba(2, 24, 19, 0.94)',
          border: '2px solid rgba(212, 175, 55, 0.75)',
          borderRadius: '24px',
          padding: '20px 28px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.75)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
            color: '#fef08a',
            fontSize: '1.35rem',
            fontWeight: 900
          }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <span className="font-cinzel" style={{ letterSpacing: '3px' }}>
              CLAVES PARA TU SALUD INTEGRAL
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
            {pointsToShow.map((pt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '1.45rem', marginTop: '1px', fontWeight: 900 }}>✔</span>
                <span style={{ fontSize: '1.45rem', color: '#ffffff', lineHeight: 1.32, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  {pt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
