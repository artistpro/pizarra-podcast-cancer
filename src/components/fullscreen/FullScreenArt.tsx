import React, { useState, useEffect } from 'react';
import type { ArtCard, BoardState } from '../../types/board';

interface FullScreenArtProps {
  cards: ArtCard[];
  rotationSpeed?: number;
  state: BoardState;
  effectiveTheme: 'day' | 'night';
}

export const FullScreenArt: React.FC<FullScreenArtProps> = ({
  cards,
  rotationSpeed = 20
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhala' | 'retiene' | 'exhala' | 'paz'>('inhala');

  useEffect(() => {
    if (!cards || cards.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setIsFading(false);
      }, 500);
    }, Math.max(10, rotationSpeed) * 1000);

    return () => clearInterval(interval);
  }, [cards, rotationSpeed]);

  // Ciclo de respiración consciente 4x4 (4s cada fase)
  useEffect(() => {
    const phases: Array<'inhala' | 'retiene' | 'exhala' | 'paz'> = ['inhala', 'retiene', 'exhala', 'paz'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentItem = cards && cards.length > 0 ? cards[currentIndex % cards.length] : null;

  if (!currentItem) return null;

  const breathLabels = {
    inhala: { text: "INHALA PROFUNDO", sub: "Llénate de calma y serenidad", scale: 1.25, color: '#6ee7b7' },
    retiene: { text: "RETÉN EL AIRE", sub: "Siente la plenitud en tu centro", scale: 1.25, color: '#fef08a' },
    exhala: { text: "EXHALA DESPACIO", sub: "Suelta toda tensión y preocupación", scale: 0.85, color: '#93c5fd' },
    paz: { text: "PAZ INTERIOR", sub: "Descansa en tu fuerza y gratitud", scale: 0.85, color: '#d4af37' }
  };

  const currentBreath = breathLabels[breathPhase];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '16px 45px',
      display: 'grid',
      gridTemplateColumns: '0.9fr 1.1fr',
      gap: '40px',
      alignItems: 'center',
      opacity: isFading ? 0.2 : 1,
      transform: isFading ? 'translateY(6px)' : 'translateY(0)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>
      {/* Columna Izquierda: Cuadro con Marco Clásico de Museo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          height: '420px',
          borderRadius: '24px',
          padding: '14px',
          background: 'linear-gradient(145deg, #2a1f0a 0%, #151005 50%, #2a1f0a 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            border: '1.5px solid rgba(212, 175, 55, 0.4)'
          }}>
            <img
              src={currentItem.imageSrc}
              alt={currentItem.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.96) contrast(1.05)'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80";
              }}
            />
          </div>

          {/* Badge Flotante */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            padding: '4px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(90deg, #d4af37 0%, #b48c1e 100%)',
            color: '#021813',
            fontSize: '0.82rem',
            fontWeight: 900,
            letterSpacing: '1.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
          }}>
            🎨 GALERÍA ({currentIndex + 1}/{cards.length})
          </div>
        </div>

        {/* Autor y Técnica */}
        <div style={{
          textAlign: 'center',
          color: '#fbbf24',
          fontSize: '1rem',
          fontWeight: 700
        }}>
          <span>{currentItem.author || "Obra Clásica Universal"}</span>
        </div>
      </div>

      {/* Columna Derecha: Título, Reflexión y Guía de Respiración */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div>
          <div className="font-cinzel" style={{
            fontSize: '0.92rem',
            letterSpacing: '3px',
            color: '#d4af37',
            fontWeight: 800,
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            ✦ ARTE QUE SANA & MEDITACIÓN VISUAL ✦
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '2.3rem',
            lineHeight: 1.25,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '1.5px',
            margin: '0 0 10px',
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
            {currentItem.fullDescription || currentItem.caption}
          </p>
        </div>

        {/* Cuadro de Respiración Consciente Acompañada */}
        <div style={{
          background: 'rgba(2, 24, 19, 0.9)',
          border: '1.6px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '20px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
        }}>
          {/* Círculo Respiratorio Animado */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(2, 24, 19, 0.8) 100%)',
            border: `2.5px solid ${currentBreath.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${currentBreath.scale})`,
            transition: 'transform 3.8s ease-in-out, border-color 1s ease',
            boxShadow: `0 0 22px ${currentBreath.color}55`,
            flexShrink: 0
          }}>
            <span style={{ fontSize: '1.8rem' }}>🌿</span>
          </div>

          <div>
            <div className="font-cinzel" style={{
              fontSize: '1.18rem',
              fontWeight: 900,
              color: currentBreath.color,
              letterSpacing: '2px',
              marginBottom: '4px',
              transition: 'color 1s ease'
            }}>
              {currentBreath.text}
            </div>
            <p style={{
              fontSize: '1.02rem',
              color: '#f1f5f9',
              margin: 0,
              fontWeight: 500
            }}>
              {currentBreath.sub}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
