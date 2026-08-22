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
  rotationSpeed = 15
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
    }, Math.max(10, rotationSpeed) * 1000);

    return () => clearInterval(interval);
  }, [news, rotationSpeed]);

  const currentItem = news && news.length > 0 ? news[currentIndex % news.length] : null;

  if (!currentItem) return null;

  const defaultKeyPoints = [
    "Evidencia científica contrastada y aplicable en tu día a día",
    "Prácticas y hábitos que impulsan tu energía celular y emocional",
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
      padding: '16px 45px',
      display: 'grid',
      gridTemplateColumns: '0.95fr 1.05fr',
      gap: '40px',
      alignItems: 'center',
      opacity: isFading ? 0.2 : 1,
      transform: isFading ? 'translateY(6px)' : 'translateY(0)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>
      {/* Columna Izquierda: Imagen HD en Gran Formato */}
      <div style={{
        position: 'relative',
        height: '540px',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '2px solid rgba(212, 175, 55, 0.65)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.25)',
        background: '#011410'
      }}>
        <img
          src={currentItem.imageSrc}
          alt={currentItem.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.92) contrast(1.06)'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85";
          }}
        />

        {/* Degradé cinematográfico inferior */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 20, 16, 0.95) 0%, rgba(2, 20, 16, 0.4) 40%, transparent 100%)'
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
            padding: '6px 18px',
            borderRadius: '16px',
            background: 'rgba(2, 24, 19, 0.9)',
            border: '1.4px solid #d4af37',
            color: '#fef3c7',
            fontSize: '0.88rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            📰 NOTICIA DESTACADA ({currentIndex + 1}/{news.length})
          </div>
        </div>

        {/* Fuente en la base de la foto */}
        <div style={{
          position: 'absolute',
          bottom: '18px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 700 }}>
            🏷️ {currentItem.category || "BIENESTAR Y SALUD"}
          </span>
          <span style={{ fontSize: '0.92rem', color: '#94a3b8', fontWeight: 600 }}>
            Fuente: {currentItem.source || "Periodismo de Soluciones"}
          </span>
        </div>
      </div>

      {/* Columna Derecha: Titular, Narrativa y Puntos Clave */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div>
          <div className="font-cinzel" style={{
            fontSize: '0.95rem',
            letterSpacing: '3px',
            color: '#d4af37',
            fontWeight: 800,
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            ✦ REPORTAJE ESPECIAL & ESPERANZA ✦
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '2.1rem',
            lineHeight: 1.26,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '1px',
            margin: '0 0 12px',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.45), 0 3px 8px rgba(0,0,0,0.9)'
          }}>
            {currentItem.title}
          </h1>

          <p style={{
            fontSize: '1.24rem',
            lineHeight: 1.5,
            color: '#e2e8f0',
            fontWeight: 500,
            textShadow: '0 1px 6px rgba(0,0,0,0.85)'
          }}>
            {currentItem.description}
          </p>
        </div>

        {/* Cuadro de Puntos Clave */}
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
            <span>💡</span>
            <span className="font-cinzel" style={{ letterSpacing: '2px' }}>
              CLAVES PARA TU SALUD INTEGRAL
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {pointsToShow.map((pt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '1rem', marginTop: '2px' }}>✔</span>
                <span style={{ fontSize: '0.98rem', color: '#f1f5f9', lineHeight: 1.35, fontWeight: 500 }}>
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
