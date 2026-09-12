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
        animation: isNight
          ? `nightHueBreath ${currentSpeed.breath} ease-in-out infinite`
          : `emeraldHueBreath ${currentSpeed.breath} ease-in-out infinite`,
        transition: 'background-color 1.5s ease'
      }}
    >
      {/* 1. Foco de Luz Superior (Orbe Ámbar / Esmeralda Vivificante) */}
      <div
        style={{
          position: 'absolute',
          top: '-140px',
          left: '22%',
          width: '760px',
          height: '760px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(30, 58, 138, 0.18) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(212, 175, 55, 0.26) 0%, rgba(16, 185, 129, 0.22) 45%, transparent 75%)',
          filter: 'blur(100px)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitTop ${currentSpeed.top} ease-in-out infinite`
        }}
      />

      {/* 2. Foco de Luz Inferior (Orbe Jade Profundo / Bosque Terapéutico) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-160px',
          right: '18%',
          width: '860px',
          height: '860px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.24) 0%, rgba(15, 23, 42, 0.3) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(5, 150, 105, 0.28) 0%, rgba(4, 47, 46, 0.25) 50%, transparent 75%)',
          filter: 'blur(110px)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitBottom ${currentSpeed.bottom} ease-in-out infinite`
        }}
      />

      {/* 3. Halo Central de Pulso Vital (Coherencia y Ritmo Biológico) */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% - 280px)',
          left: 'calc(50% - 280px)',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle, rgba(96, 165, 250, 0.18) 0%, rgba(30, 64, 175, 0.1) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(254, 240, 138, 0.15) 0%, rgba(16, 185, 129, 0.16) 45%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform, opacity',
          animation: `vitalPulse ${currentSpeed.pulse} ease-in-out infinite`
        }}
      />

      {/* 4. Viñeta Periférica de Alto Contraste para Enmarcar la Pantalla */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isNight
            ? 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(2, 4, 11, 0.6) 80%, rgba(2, 4, 11, 0.92) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(1, 19, 15, 0.55) 80%, rgba(1, 19, 15, 0.9) 100%)'
        }}
      />
    </div>
  );
};
