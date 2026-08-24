import React, { useEffect, useRef, useState } from 'react';
import type { AstralCardData, BoardState } from '../../types/board';

interface FullScreenAstralProps {
  card: AstralCardData;
  state: BoardState;
  effectiveTheme: 'day' | 'night';
}

export const FullScreenAstral: React.FC<FullScreenAstralProps> = ({
  card,
  effectiveTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const quotes = card.quotesList && card.quotesList.length > 0
    ? card.quotesList
    : [card.quote || "Tu proyecto de vida florece con cada pensamiento de gratitud y serena certeza."];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setIsFading(false);
      }, 600);
    }, (card.rotationSpeed || 18) * 1000);

    return () => clearInterval(interval);
  }, [quotes, card.rotationSpeed]);

  const currentQuote = quotes[currentIndex % quotes.length];

  // Motor Canvas a pantalla completa
  useEffect(() => {
    if (card.bgMode === 'video' && card.videoSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1920);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01
    }));

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Partículas
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
        ctx.fillStyle = effectiveTheme === 'night'
          ? `rgba(147, 197, 253, ${Math.max(0.1, Math.min(0.9, p.opacity))})`
          : `rgba(253, 230, 138, ${Math.max(0.1, Math.min(0.9, p.opacity))})`;
        ctx.fill();
      });

      // Geometría Sagrada Monumental
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.44;

      rotationAngle += 0.0014;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      ctx.strokeStyle = effectiveTheme === 'night'
        ? 'rgba(147, 197, 253, 0.25)'
        : 'rgba(212, 175, 55, 0.28)';
      ctx.lineWidth = 1.8;

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * (radius * 0.52);
        const y = Math.sin(angle) * (radius * 0.52);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.52, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectiveTheme, card.bgMode, card.videoSrc]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 40px',
      maxHeight: '620px'
    }}>
      {/* Fondo Video o Canvas */}
      {card.bgMode === 'video' && card.videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={card.videoSrc}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.45,
            pointerEvents: 'none'
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Badge de Categoría Astral Extra Grande */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 48px',
        borderRadius: '36px',
        background: 'rgba(212, 175, 55, 0.32)',
        border: '2.2px solid rgba(212, 175, 55, 0.85)',
        boxShadow: '0 0 35px rgba(212, 175, 55, 0.55)'
      }}>
        <span style={{ fontSize: '2rem' }}>✨</span>
        <span className="font-cinzel" style={{
          fontSize: '1.65rem',
          fontWeight: 900,
          letterSpacing: '4px',
          color: '#fef3c7',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.85)'
        }}>
          ✦ ENFOQUE ESPECIAL • {card.category || "ENERGÍA VITAL Y FORTALEZA INTERIOR"} ✦
        </span>
        {quotes.length > 1 && (
          <span style={{ fontSize: '1.35rem', color: '#fde047', fontWeight: 900, opacity: 0.95 }}>
            ({currentIndex + 1}/{quotes.length})
          </span>
        )}
      </div>

      {/* Cita Monumental Gigante para Móvil */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1700px',
        textAlign: 'center',
        padding: '0 24px',
        margin: 'auto 0',
        opacity: isFading ? 0.15 : 1,
        transform: isFading ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}>
        <p className="font-cinzel" style={{
          fontSize: '4.6rem',
          lineHeight: 1.25,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '1px',
          textShadow: '0 0 45px rgba(212, 175, 55, 0.85), 0 4px 24px rgba(0, 0, 0, 0.98)'
        }}>
          "{currentQuote}"
        </p>
      </div>

      {/* Barra CTA Elevada Extra Grande */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '14px 48px',
        borderRadius: '30px',
        background: 'rgba(2, 24, 19, 0.96)',
        border: '2px solid rgba(212, 175, 55, 0.75)',
        boxShadow: '0 12px 35px rgba(0,0,0,0.8)'
      }}>
        <span style={{
          fontSize: '1.65rem',
          color: '#fbbf24',
          fontWeight: 900,
          letterSpacing: '1px'
        }}>
          {card.cta || "Enlaces de acompañamiento en la descripción ⚡"}
        </span>
      </div>
    </div>
  );
};
