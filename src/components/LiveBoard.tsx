import React, { useState, useEffect, useRef } from 'react';
import type { BoardState, FullScreenViewType } from '../types/board';
import { getEffectiveTheme } from '../types/board';
import { Header } from './Header';
import { ArtThatHeals } from './ArtThatHeals';
import { GoodNews } from './GoodNews';
import { AstralLiveCard } from './AstralLiveCard';
import { SupplementCard } from './SupplementCard';
import { BottomTicker } from './BottomTicker';
import { FullScreenAstral } from './fullscreen/FullScreenAstral';
import { FullScreenNews } from './fullscreen/FullScreenNews';
import { FullScreenSupplement } from './fullscreen/FullScreenSupplement';
import { FullScreenArt } from './fullscreen/FullScreenArt';
import { QrAffiliateOverlay } from './QrAffiliateOverlay';
import { LiveAlertsOverlay } from './LiveAlertsOverlay';

interface LiveBoardProps {
  state: BoardState;
}

type ActiveView = 'general' | FullScreenViewType;

export const LiveBoard: React.FC<LiveBoardProps> = ({ state }) => {
  const [scale, setScale] = useState<number>(1);
  const [effectiveTheme, setEffectiveTheme] = useState<'day' | 'night'>(() =>
    getEffectiveTheme(state.theme)
  );

  // Estado del Director de Emisión: Inicia SIEMPRE en la Pizarra General
  const [currentView, setCurrentView] = useState<ActiveView>('general');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const fullScreenIndexRef = useRef<number>(0);

  // Escalar responsivamente la pizarra 1920x1080
  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;
      const currentScale = Math.min(scaleX, scaleY);
      setScale(currentScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actualizar tema día/noche según hora
  useEffect(() => {
    const updateTheme = () => {
      setEffectiveTheme(getEffectiveTheme(state.theme));
    };

    updateTheme();
    const interval = setInterval(updateTheme, 15000);
    return () => clearInterval(interval);
  }, [state.theme]);

  // Motor Director de Emisión & Master Loop
  useEffect(() => {
    const mode = state.broadcastMode || 'auto_loop';

    // 1. Modos Forzados Manuales
    if (mode === 'general_fixed') {
      setCurrentView('general');
      return;
    }
    if (mode === 'fullscreen_astral') {
      setCurrentView('astral');
      return;
    }
    if (mode === 'fullscreen_news') {
      setCurrentView('news');
      return;
    }
    if (mode === 'fullscreen_supplement') {
      setCurrentView('supplement');
      return;
    }
    if (mode === 'fullscreen_art') {
      setCurrentView('art');
      return;
    }

    // 2. Modo Automático en Bucle (auto_loop)
    if (mode === 'auto_loop') {
      const fullViews: FullScreenViewType[] = state.activeFullScreenViews && state.activeFullScreenViews.length > 0
        ? state.activeFullScreenViews
        : ['astral', 'news', 'supplement', 'art'];

      const includeGeneral = state.includeGeneralViewInLoop !== false;
      const generalDurationMs = Math.max(10, state.generalViewDuration || 180) * 1000;
      const fullDurationMs = Math.max(10, state.fullScreenDuration || 120) * 1000;

      let timeoutId: number;

      fullScreenIndexRef.current = 0;

      // Función para cambiar a la siguiente vista con transición suave
      const transitionTo = (nextView: ActiveView, nextCallback: () => void, durationMs: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentView(nextView);
          setIsTransitioning(false);
          timeoutId = window.setTimeout(nextCallback, durationMs);
        }, 750);
      };

      if (!includeGeneral) {
        // Bucle Exclusivo de Fichas Ampliadas Full Screen (Óptimo para Móviles)
        const firstView = fullViews[0];
        setCurrentView(firstView);
        fullScreenIndexRef.current = 1 % fullViews.length;

        const cycleNextFullScreen = () => {
          const targetView = fullViews[fullScreenIndexRef.current % fullViews.length];
          fullScreenIndexRef.current = (fullScreenIndexRef.current + 1) % fullViews.length;
          transitionTo(targetView, cycleNextFullScreen, fullDurationMs);
        };

        timeoutId = window.setTimeout(cycleNextFullScreen, fullDurationMs);
      } else {
        // Bucle Híbrido: Pizarra General ⟷ Pantallas Completas
        setCurrentView('general');

        const showFullScreenStep = () => {
          const targetView = fullViews[fullScreenIndexRef.current % fullViews.length];
          fullScreenIndexRef.current = (fullScreenIndexRef.current + 1) % fullViews.length;
          transitionTo(targetView, showGeneralStep, fullDurationMs);
        };

        const showGeneralStep = () => {
          transitionTo('general', showFullScreenStep, generalDurationMs);
        };

        timeoutId = window.setTimeout(showFullScreenStep, generalDurationMs);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [
    state.broadcastMode,
    state.generalViewDuration,
    state.fullScreenDuration,
    state.activeFullScreenViews,
    state.includeGeneralViewInLoop
  ]);

  const isNight = effectiveTheme === 'night';

  const bgStyle = isNight
    ? { background: 'radial-gradient(circle at 50% 25%, #0c2044 0%, #050e24 45%, #02040b 100%)' }
    : { background: 'radial-gradient(circle at 50% 25%, #053b30 0%, #03211b 45%, #01130f 100%)' };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isNight ? '#02040b' : '#01130f',
        position: 'relative',
        transition: 'background-color 1.2s ease'
      }}
    >
      <div
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)',
          opacity: isTransitioning ? 0.05 : 1,
          filter: isTransitioning ? 'blur(12px)' : 'none',
          transition: 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out',
          ...bgStyle
        }}
      >
        {/* 1. Cabecera Fija y Permanente de Transmisión */}
        <Header state={state} effectiveTheme={effectiveTheme} />

        {/* 2. Escenario Central Variable con Transición Suave */}
        <div
          style={{
            flex: 1,
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative',
            opacity: isTransitioning ? 0.05 : 1,
            filter: isTransitioning ? 'blur(10px)' : 'none',
            transform: isTransitioning ? 'scale(0.99)' : 'scale(1)',
            transition: 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out, transform 0.75s ease-in-out'
          }}
        >
          {/* A. Pizarra General Multi-Ficha */}
          {currentView === 'general' && (
            <main
              style={{
                width: '100%',
                height: '100%',
                padding: '12px 36px',
                display: 'grid',
                gridTemplateColumns: '1.05fr 1.2fr',
                gridTemplateRows: '1.15fr 0.85fr',
                gap: '20px',
                overflow: 'hidden'
              }}
            >
              {/* Fila 1 - Izquierda: Arte Que Sana + Buenas Noticias */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  height: '100%'
                }}
              >
                <ArtThatHeals
                  card={state.artThatHeals}
                  cards={state.artCards}
                  rotationSpeed={state.artRotationSpeed || 20}
                />
                <GoodNews
                  news={state.goodNews}
                  rotationSpeed={state.newsRotationSpeed || 15}
                />
              </section>

              {/* Fila 1 - Derecha: Tarjeta Astral Central ("AHORA") */}
              <section style={{ height: '100%' }}>
                <AstralLiveCard
                  card={state.astralCard}
                  theme={effectiveTheme}
                />
              </section>

              {/* Fila 2 - Todo el Ancho: Suplementos y Evidencia */}
              <section style={{ gridColumn: '1 / -1', height: '100%' }}>
                <SupplementCard
                  supplement={state.supplement}
                  supplements={state.supplementsList}
                  rotationSpeed={state.supplementRotationSpeed || 25}
                />
              </section>
            </main>
          )}

          {/* B. Protagonismo Astral / Meditación */}
          {currentView === 'astral' && (
            <FullScreenAstral
              card={state.astralCard}
              state={state}
              effectiveTheme={effectiveTheme}
            />
          )}

          {/* C. Protagonismo Noticia Destacada */}
          {currentView === 'news' && (
            <FullScreenNews
              news={state.goodNews}
              rotationSpeed={state.newsRotationSpeed || 15}
              state={state}
              effectiveTheme={effectiveTheme}
            />
          )}

          {/* D. Protagonismo Ficha de Suplemento */}
          {currentView === 'supplement' && (
            <FullScreenSupplement
              supplements={state.supplementsList}
              rotationSpeed={state.supplementRotationSpeed || 25}
              state={state}
              effectiveTheme={effectiveTheme}
            />
          )}

          {/* E. Protagonismo Arte Que Sana & Galería */}
          {currentView === 'art' && (
            <FullScreenArt
              cards={state.artCards}
              rotationSpeed={state.artRotationSpeed || 20}
              state={state}
              effectiveTheme={effectiveTheme}
            />
          )}
        </div>

        {/* Overlay Flotante de Alertas en Vivo (Bienvenidas de Telegram y Regalos de YouTube) */}
        <LiveAlertsOverlay state={state} initialAlert={state.latestAlert} />

        {/* Overlay Flotante Periódico con Código QR de Afiliados (iHerb MBG0640) */}
        <QrAffiliateOverlay state={state} />

        {/* 3. Barras Horizontales Inferiores Fijas y Permanentes (Nunca se reinician ni se mueven) */}
        <footer style={{ width: '100%', paddingBottom: '8px' }}>
          <BottomTicker
            dailyReminder={state.dailyReminder}
            dailyReminders={state.dailyReminders}
            dailyReminderLabel={state.dailyReminderLabel}
            dailyReminderRotationSpeed={state.dailyReminderRotationSpeed || 95}
            
            nextLive={state.nextLive}
            nextLiveList={state.nextLiveList}
            nextLiveLabel={state.nextLiveLabel}
            nextLiveRotationSpeed={state.nextLiveRotationSpeed || 85}
            lastUpdated={state.lastUpdated}
          />
        </footer>
      </div>
    </div>
  );
};
