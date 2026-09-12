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
        animation: isNight
          ? `nightHueBreath ${currentSpeed.breath} ease-in-out infinite`
          : `emeraldHueBreath ${currentSpeed.breath} ease-in-out infinite`,
        transition: 'background-color 1.5s ease'
      }}
    >
      {/* 1. Foco de Luz Superior (Orbe Ámbar / Esmeralda Vivificante - Soft Falloff sin CPU Blur) */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '18%',
          width: '840px',
          height: '840px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(56, 189, 248, 0.48) 0%, rgba(30, 58, 138, 0.32) 30%, rgba(15, 23, 42, 0.18) 55%, rgba(2, 6, 23, 0.05) 75%, transparent 85%)'
            : 'radial-gradient(circle at center, rgba(245, 158, 11, 0.46) 0%, rgba(16, 185, 129, 0.40) 25%, rgba(5, 150, 105, 0.26) 45%, rgba(4, 47, 36, 0.12) 65%, transparent 82%)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitTop ${currentSpeed.top} ease-in-out infinite`
        }}
      />

      {/* 2. Foco de Luz Inferior (Orbe Jade Profundo / Bosque Terapéutico - Soft Falloff sin CPU Blur) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-140px',
          right: '15%',
          width: '920px',
          height: '920px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(99, 102, 241, 0.48) 0%, rgba(14, 165, 233, 0.32) 30%, rgba(30, 58, 138, 0.16) 55%, rgba(2, 6, 23, 0.05) 75%, transparent 85%)'
            : 'radial-gradient(circle at center, rgba(5, 150, 105, 0.50) 0%, rgba(52, 211, 153, 0.38) 28%, rgba(6, 78, 59, 0.24) 48%, rgba(2, 44, 34, 0.10) 68%, transparent 82%)',
          willChange: 'transform, opacity',
          animation: `auroraOrbitBottom ${currentSpeed.bottom} ease-in-out infinite`
        }}
      />

      {/* 3. Halo Central de Pulso Vital (Coherencia y Ritmo Biológico - Soft Falloff sin CPU Blur) */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% - 300px)',
          left: 'calc(50% - 300px)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(96, 165, 250, 0.35) 0%, rgba(30, 64, 175, 0.20) 30%, rgba(15, 23, 42, 0.08) 55%, transparent 75%)'
            : 'radial-gradient(circle at center, rgba(254, 240, 138, 0.35) 0%, rgba(16, 185, 129, 0.35) 30%, rgba(6, 78, 59, 0.16) 55%, transparent 75%)',
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
