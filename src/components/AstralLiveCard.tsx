import React, { useEffect, useRef, useState } from 'react';
import type { AstralCardData } from '../types/board';

interface AstralLiveCardProps {
  card: AstralCardData;
  theme?: 'day' | 'night';
}

export const AstralLiveCard: React.FC<AstralLiveCardProps> = ({ card, theme = 'day' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lista de frases para rotar
  const quotes = card.quotesList && card.quotesList.length > 0
    ? card.quotesList
    : [card.quote || "Tu proyecto de vida florece con cada pensamiento de gratitud y serena certeza."];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (quotes.length <= 1) return;

    const intervalTime = Math.max(10, card.rotationSpeed || 20) * 1000;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setIsFading(false);
      }, 500);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [quotes, card.rotationSpeed]);

  const currentQuote = quotes[currentIndex % quotes.length];

  // Motor Canvas de Geometría Sagrada y Partículas
  useEffect(() => {
    if (card.bgMode === 'video' && card.videoSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01
    }));

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Partículas Estelares
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * p.pulseSpeed * 0.05) * 0.015;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'night'
          ? `rgba(147, 197, 253, ${Math.max(0.1, Math.min(0.9, p.opacity))})`
          : `rgba(253, 230, 138, ${Math.max(0.1, Math.min(0.9, p.opacity))})`;
        ctx.fill();
      });

      // 2. Geometría Sagrada Dinámica (Flor de la Vida / Mandala)
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      rotationAngle += 0.0018;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      ctx.strokeStyle = theme === 'night' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.22)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * (radius * 0.5);
        const y = Math.sin(angle) * (radius * 0.5);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, card.bgMode, card.videoSrc]);

  const isNight = theme === 'night';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '18px',
      overflow: 'hidden',
      border: '1.8px solid rgba(212, 175, 55, 0.55)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 35px rgba(0, 0, 0, 0.5)',
      background: isNight
        ? 'linear-gradient(135deg, rgba(6, 26, 56, 0.88) 0%, rgba(2, 12, 28, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(4, 38, 30, 0.88) 0%, rgba(2, 18, 14, 0.95) 100%)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 36px 20px',
      transition: 'background 1.2s ease, border-color 1.2s ease'
    }}>
      {/* Fondo: Video Loop o Canvas */}
      {card.bgMode === 'video' && card.videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={card.videoSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            pointerEvents: 'none'
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* 1. Categoría Superior con Isotipo Sagrado */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 28px',
          borderRadius: '26px',
          background: 'rgba(212, 175, 55, 0.22)',
          border: '1.4px solid rgba(212, 175, 55, 0.6)',
          boxShadow: '0 0 18px rgba(212, 175, 55, 0.35)'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✨</span>
          <span className="font-cinzel" style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '2.5px',
            color: '#fef3c7',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(212, 175, 55, 0.6)'
          }}>
            AHORA • {card.category || "ENERGÍA VITAL Y FORTALEZA INTERIOR"}
          </span>
          {quotes.length > 1 && (
            <span style={{ fontSize: '0.88rem', opacity: 0.95, color: '#fde047', fontWeight: 800 }}>
              ({currentIndex + 1}/{quotes.length})
            </span>
          )}
        </div>
      </div>

      {/* 2. Frase Espiritual Rotativa en Letra Grande y Nítida */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '0 16px',
        margin: 'auto 0',
        opacity: isFading ? 0.2 : 1,
        transform: isFading ? 'translateY(3px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        <p className="font-cinzel" style={{
          fontSize: '2.25rem',
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.8px',
          textShadow: '0 0 24px rgba(212, 175, 55, 0.6), 0 3px 12px rgba(0, 0, 0, 0.98)'
        }}>
          "{currentQuote}"
        </p>
      </div>

      {/* 3. Call to Action Inferior */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 24px',
          borderRadius: '18px',
          background: 'rgba(0, 0, 0, 0.65)',
          border: '1.2px solid rgba(212, 175, 55, 0.5)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
        }}>
          <span style={{
            fontSize: '1.08rem',
            color: '#fbbf24',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            {card.cta || "Enlaces de acompañamiento en la descripción ⚡"}
          </span>
        </div>
      </div>
    </div>
  );
};
