import React from 'react';
import type { BoardState } from '../types/board';

interface HeaderProps {
  state: BoardState;
  effectiveTheme: 'day' | 'night';
}

export const Header: React.FC<HeaderProps> = ({ state, effectiveTheme }) => {
  const isNight = effectiveTheme === 'night';

  return (
    <header style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 36px',
      borderBottom: isNight ? '1.5px solid rgba(234, 179, 8, 0.35)' : '1.5px solid rgba(212, 175, 55, 0.35)',
      background: isNight ? 'rgba(5, 13, 34, 0.85)' : 'rgba(2, 24, 19, 0.78)',
      backdropFilter: 'blur(16px)',
      transition: 'background 1s ease, border-color 1s ease'
    }}>
      {/* Brand & Isotipo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '1.8px solid #d4af37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isNight
            ? 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, rgba(5, 13, 34, 0.95) 100%)'
            : 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(2, 24, 19, 0.95) 100%)',
          boxShadow: '0 0 18px rgba(212, 175, 55, 0.45)'
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22v-9" />
            <path d="M12 13c-3-3-7-3-7 0 0 4 5 7 7 9 2-2 7-5 7-9 0-3-4-3-7 0Z" fill="rgba(212, 175, 55, 0.4)" />
            <path d="M12 13c-2-3-4-7-1-9 3 0 4 4 1 9Z" fill="rgba(254, 240, 138, 0.6)" />
          </svg>
        </div>

        <div>
          <h1 className="font-cinzel" style={{
            fontSize: '2.05rem',
            fontWeight: 900,
            letterSpacing: '2.5px',
            color: '#fef3c7',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            textShadow: '0 0 18px rgba(212, 175, 55, 0.55), 0 2px 8px rgba(0,0,0,0.9)'
          }}>
            {state.headerTitle || "EL PODCAST DEL CÁNCER"}
          </h1>
          <div className="font-cinzel" style={{
            fontSize: '1.12rem',
            letterSpacing: '3.5px',
            color: '#fbbf24',
            fontWeight: 800,
            marginTop: '3px'
          }}>
            {state.headerSubtitle || "COMUNIDAD SANANTE"}
          </div>
        </div>
      </div>

      {/* Indicadores Derecha: Turno Actual & EN VIVO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Indicador de Turno */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 22px',
          borderRadius: '22px',
          background: isNight ? 'rgba(30, 58, 138, 0.55)' : 'rgba(6, 78, 59, 0.55)',
          border: isNight ? '1.4px solid rgba(147, 197, 253, 0.55)' : '1.4px solid rgba(110, 231, 183, 0.55)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          <span style={{ fontSize: '1.25rem' }}>{isNight ? '🌙' : '☀️'}</span>
          <span className="font-cinzel" style={{
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '2px',
            color: isNight ? '#bfdbfe' : '#a7f3d0'
          }}>
            {isNight ? 'TURNO NOCHE' : 'TURNO DÍA'}
          </span>
        </div>

        {/* Indicador EN VIVO */}
        {state.isLive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 24px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(153, 27, 27, 0.5) 100%)',
            border: '1.4px solid rgba(239, 68, 68, 0.75)',
            boxShadow: '0 0 18px rgba(239, 68, 68, 0.5)'
          }}>
            <span style={{
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite',
              boxShadow: '0 0 12px #ef4444'
            }} />
            <span className="font-cinzel" style={{
              fontSize: '1.02rem',
              fontWeight: 900,
              letterSpacing: '2.5px',
              color: '#fee2e2'
            }}>
              EN VIVO
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
