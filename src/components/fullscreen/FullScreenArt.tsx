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
    inhala: { text: "INHALA PROFUNDO (4s)", sub: "Llénate de calma, oxígeno y serenidad interior", scale: 1.25, color: '#6ee7b7' },
    retiene: { text: "RETÉN EL AIRE (4s)", sub: "Siente la quietud y plenitud en tu centro", scale: 1.25, color: '#fef08a' },
    exhala: { text: "EXHALA DESPACIO (4s)", sub: "Suelta toda tensión, dolor y preocupación", scale: 0.85, color: '#93c5fd' },
    paz: { text: "PAZ Y GRATITUD (4s)", sub: "Descansa en tu fuerza vital y esperanza", scale: 0.85, color: '#d4af37' }
  };

  const currentBreath = breathLabels[breathPhase];

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
      {/* Columna Izquierda: Cuadro con Marco Clásico de Museo de 620px */}
      <div style={{
        position: 'relative',
        height: '620px',
        borderRadius: '26px',
        padding: '16px',
        background: 'linear-gradient(145deg, #2a1f0a 0%, #151005 50%, #2a1f0a 100%)',
        border: '3.5px solid #d4af37',
        boxShadow: '0 22px 52px rgba(0, 0, 0, 0.95), 0 0 45px rgba(212, 175, 55, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Imagen del Cuadro */}
        <div style={{
          width: '100%',
          flex: 1,
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          border: '1.8px solid rgba(212, 175, 55, 0.45)'
        }}>
          <img
            src={currentItem.imageSrc}
            alt={currentItem.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.96) contrast(1.06)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80";
            }}
          />

          {/* Badge Superior */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '8px 22px',
            borderRadius: '18px',
            background: 'linear-gradient(90deg, #d4af37 0%, #b48c1e 100%)',
            color: '#021813',
            fontSize: '1.15rem',
            fontWeight: 900,
            letterSpacing: '1.8px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.7)'
          }}>
            🎨 GALERÍA ({currentIndex + 1}/{cards.length})
          </div>
        </div>

        {/* Autor y Técnica en la Base */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          paddingTop: '10px',
          color: '#fbbf24',
          fontSize: '1.35rem',
          fontWeight: 900,
          textShadow: '0 2px 10px rgba(0,0,0,0.95)'
        }}>
          <span>✦ {currentItem.author || "Obra Clásica Universal"} ✦</span>
        </div>
      </div>

      {/* Columna Derecha: Título, Reflexión y Guía de Respiración de 620px */}
      <div style={{
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
            ✦ ARTE QUE SANA & MEDITACIÓN VISUAL ✦
          </div>

          <h1 className="font-cinzel" style={{
            fontSize: '3.4rem',
            lineHeight: 1.18,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '1px',
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
            {currentItem.fullDescription || currentItem.caption}
          </p>
        </div>

        {/* Cuadro de Respiración Consciente Acompañada Extra Grande */}
        <div style={{
          background: 'rgba(2, 24, 19, 0.94)',
          border: '2px solid rgba(212, 175, 55, 0.75)',
          borderRadius: '26px',
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.75)'
        }}>
          {/* Círculo Respiratorio Animado Extra Grande */}
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(2, 24, 19, 0.9) 100%)',
            border: `4px solid ${currentBreath.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${currentBreath.scale})`,
            transition: 'transform 3.8s ease-in-out, border-color 1s ease',
            boxShadow: `0 0 34px ${currentBreath.color}77`,
            flexShrink: 0
          }}>
            <span style={{ fontSize: '2.8rem' }}>🌿</span>
          </div>

          <div>
            <div className="font-cinzel" style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: currentBreath.color,
              letterSpacing: '2.5px',
              marginBottom: '6px',
              transition: 'color 1s ease',
              textShadow: '0 2px 10px rgba(0,0,0,0.95)'
            }}>
              {currentBreath.text}
            </div>
            <p style={{
              fontSize: '1.48rem',
              color: '#ffffff',
              margin: 0,
              fontWeight: 600,
              textShadow: '0 1px 6px rgba(0,0,0,0.9)'
            }}>
              {currentBreath.sub}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
