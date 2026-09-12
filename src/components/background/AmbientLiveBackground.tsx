import React from 'react';

interface AmbientLiveBackgroundProps {
  isNight: boolean;
  enabled?: boolean;
  speed?: 'calm' | 'normal' | 'deep';
}

export const AmbientLiveBackground: React.FC<AmbientLiveBackgroundProps> = ({
  isNight,
  enabled = true,
  speed = 'normal'
}) => {
  if (!enabled) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: isNight
            ? 'radial-gradient(circle at 50% 25%, #0c2044 0%, #050e24 45%, #02040b 100%)'
            : 'radial-gradient(circle at 50% 25%, #053b30 0%, #03211b 45%, #01130f 100%)'
        }}
      />
    );
  }

  // Multiplicador de velocidad de las órbitas y pulsos
  const speedMultipliers = {
    calm: { breath: '45s', top: '50s', bottom: '60s', pulse: '16s' },
    normal: { breath: '32s', top: '36s', bottom: '44s', pulse: '12s' },
    deep: { breath: '22s', top: '26s', bottom: '32s', pulse: '8s' }
  };

  const currentSpeed = speedMultipliers[speed] || speedMultipliers.normal;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        contain: 'strict',
        isolation: 'isolate',
        backgroundColor: isNight ? '#020614' : '#02241c'
      }}
    >
      {/* Capa de Respiración Cromática por Opacidad (100% Compositor, 0 Repaints) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isNight ? '#091738' : '#064e3b',
          animation: `layerFadeBreath ${currentSpeed.breath} ease-in-out infinite`,
          willChange: 'opacity'
        }}
      />
      {/* 1. Foco de Luz Superior (Orbe Ámbar / Esmeralda - Anclado a la esquina superior izquierda) */}
      <div
        style={{
          position: 'absolute',
          top: '-180px',
          left: '2%',
          width: '740px',
          height: '740px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(56, 189, 248, 0.45) 0%, rgba(30, 58, 138, 0.28) 30%, rgba(15, 23, 42, 0.15) 55%, rgba(2, 6, 23, 0.04) 75%, transparent 85%)'
            : 'radial-gradient(circle at center, rgba(245, 158, 11, 0.42) 0%, rgba(16, 185, 129, 0.36) 25%, rgba(5, 150, 105, 0.22) 45%, rgba(4, 47, 36, 0.10) 65%, transparent 82%)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitTop ${currentSpeed.top} ease-in-out infinite`
        }}
      />

      {/* 2. Foco de Luz Inferior (Orbe Jade Profundo / Bosque - Anclado a la esquina inferior derecha) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-200px',
          right: '2%',
          width: '780px',
          height: '780px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(99, 102, 241, 0.45) 0%, rgba(14, 165, 233, 0.28) 30%, rgba(30, 58, 138, 0.14) 55%, rgba(2, 6, 23, 0.04) 75%, transparent 85%)'
            : 'radial-gradient(circle at center, rgba(5, 150, 105, 0.45) 0%, rgba(52, 211, 153, 0.34) 28%, rgba(6, 78, 59, 0.20) 48%, rgba(2, 44, 34, 0.08) 68%, transparent 82%)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitBottom ${currentSpeed.bottom} ease-in-out infinite`
        }}
      />

      {/* 3. Halo Central de Pulso Vital (Sutil, elegante y no invasivo en el área de lectura) */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% - 200px)',
          left: 'calc(50% - 200px)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(96, 165, 250, 0.20) 0%, rgba(30, 64, 175, 0.10) 30%, rgba(15, 23, 42, 0.04) 55%, transparent 75%)'
            : 'radial-gradient(circle at center, rgba(254, 240, 138, 0.18) 0%, rgba(16, 185, 129, 0.16) 30%, rgba(6, 78, 59, 0.08) 55%, transparent 75%)',
          willChange: 'transform, opacity',
          animation: `vitalPulse ${currentSpeed.pulse} ease-in-out infinite`
        }}
      />

      {/* 4. Viñeta Periférica Suave (No sofoca la luz) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isNight
            ? 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(2, 4, 11, 0.3) 85%, rgba(2, 4, 11, 0.6) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(1, 19, 15, 0.25) 85%, rgba(1, 19, 15, 0.55) 100%)'
        }}
      />
    </div>
  );
};
