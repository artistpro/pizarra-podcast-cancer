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
      const radius = Math.min(width, height) * 0.42;

      rotationAngle += 0.0014;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      ctx.strokeStyle = effectiveTheme === 'night' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(212, 175, 55, 0.26)';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
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
      justifyContent: 'center',
      padding: '20px 80px'
    }}>
      {/* Fondo de Video o Canvas */}
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

      {/* Badge de Categoría Astral */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 36px',
        borderRadius: '30px',
        background: 'rgba(212, 175, 55, 0.2)',
        border: '1.6px solid rgba(212, 175, 55, 0.6)',
        boxShadow: '0 0 25px rgba(212, 175, 55, 0.35)',
        marginBottom: '28px'
      }}>
        <span style={{ fontSize: '1.4rem' }}>✨</span>
        <span className="font-cinzel" style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          letterSpacing: '3.5px',
          color: '#fef3c7',
          textTransform: 'uppercase',
          textShadow: '0 0 14px rgba(212, 175, 55, 0.6)'
        }}>
          ✦ ENFOQUE ESPECIAL • {card.category || "ENERGÍA VITAL Y FORTALEZA INTERIOR"} ✦
        </span>
        {quotes.length > 1 && (
          <span style={{ fontSize: '0.9rem', color: '#fde047', fontWeight: 800, opacity: 0.9 }}>
            ({currentIndex + 1}/{quotes.length})
          </span>
        )}
      </div>

      {/* Cita Monumental */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1400px',
        textAlign: 'center',
        opacity: isFading ? 0.15 : 1,
        transform: isFading ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}>
        <p className="font-cinzel" style={{
          fontSize: '2.65rem',
          lineHeight: 1.42,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '1.5px',
          textShadow: '0 0 35px rgba(212, 175, 55, 0.65), 0 4px 18px rgba(0, 0, 0, 0.98)'
        }}>
          "{currentQuote}"
        </p>
      </div>

      {/* Barra CTA Elevada */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '36px',
        padding: '10px 32px',
        borderRadius: '24px',
        background: 'rgba(2, 24, 19, 0.85)',
        border: '1.4px solid rgba(212, 175, 55, 0.45)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
      }}>
        <span style={{
          fontSize: '1.15rem',
          color: '#fbbf24',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>
          {card.cta || "Enlaces de acompañamiento en la descripción ⚡"}
        </span>
      </div>
    </div>
  );
};
