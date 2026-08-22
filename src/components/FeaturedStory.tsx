import React from 'react';
import type { StoryCard } from '../types/board';

interface FeaturedStoryProps {
  card: StoryCard;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({ card }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1.5px solid rgba(212, 175, 55, 0.4)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.6)',
      background: '#041d18',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        right: '14px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className="gold-pill-header" style={{
          padding: '6px 20px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          width: '100%',
          textAlign: 'center'
        }}>
          {card.title || "HISTORIA DESTACADA"}
        </div>
      </div>

      <div style={{
        flex: 1,
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src={card.imageSrc}
          alt={card.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.92) contrast(1.05)'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(4, 29, 24, 0.4) 0%, transparent 40%, rgba(4, 29, 24, 0.8) 100%)'
        }} />
      </div>

      <div style={{
        padding: '8px 12px 10px',
        background: 'rgba(3, 20, 16, 0.95)',
        borderTop: '1px solid rgba(212, 175, 55, 0.25)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.82rem',
          color: '#e2e8f0',
          fontWeight: 400,
          letterSpacing: '0.3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {card.caption || "Cada pequeño avance merece celebrarse"}
        </p>
      </div>
    </div>
  );
};
