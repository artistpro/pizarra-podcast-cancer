import React, { useState, useEffect } from 'react';
import type { 
  BoardState, 
  NewsItem, 
  ThemeMode, 
  ArtCard, 
  SupplementData, 
  BroadcastMode, 
  FullScreenViewType 
} from '../../types/board';
import { DEFAULT_BOARD_STATE, getEffectiveTheme, normalizeBoardState } from '../../types/board';
import { saveBoardState, subscribeBoardState, sendLiveAlert } from '../../firebase';
import { fetchPositiveNewsFromRSS } from '../../services/rssService';
import { fetchDailyHealthNews } from '../../services/newsService';
import { QrAffiliateOverlay } from '../QrAffiliateOverlay';

const SUPPLEMENT_PRESETS: SupplementData[] = [
  {
    id: "preset-d3",
    sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
    badge: "INFORMACIÓN RESPONSABLE",
    subtitle: "FICHA DE HOY",
    name: "VITAMINA D3",
    description: "Participa de forma fundamental en la salud ósea, la modulación inmunitaria y la respuesta antiinflamatoria. La dosis adecuada depende de analíticas periódicas de 25(OH)D.",
    disclaimer: "Revisa niveles en sangre, dosis personalizada e interacciones con tu médico.",
    imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    keyBenefits: [
      "Regulación de más de 200 genes de respuesta inmunológica",
      "Mantenimiento de la densidad y mineralización ósea",
      "Apoyo al estado anímico y neuromuscular"
    ],
    synergies: "Sinergia con Vitamina K2 y Magnesio para activación tisular.",
    usageTips: "Tomar con la comida principal que contenga grasas saludables."
  },
  {
    id: "preset-mg",
    sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
    badge: "INFORMACIÓN RESPONSABLE",
    subtitle: "FICHA DE HOY",
    name: "MAGNESIO BISGLICINATO",
    description: "Forma de alta biodisponibilidad y excelente tolerancia digestiva. Favorece la relajación muscular, la calma del sistema nervioso y la calidad del sueño profundo reparador.",
    disclaimer: "Consulta tolerancia digestiva, función renal y dosis recomendada con un profesional.",
    imageSrc: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
    keyBenefits: [
      "Cofactor en más de 300 reacciones enzimáticas",
      "Relajación muscular y alivio de tensiones físicas",
      "Inducción del neurotransmisor GABA para el descanso"
    ],
    synergies: "Excelente con L-Teanina o infusión de manzanilla antes de dormir.",
    usageTips: "Tomar de 30 a 60 minutos antes del descanso nocturno."
  },
  {
    id: "preset-o3",
    sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
    badge: "INFORMACIÓN RESPONSABLE",
    subtitle: "FICHA DE HOY",
    name: "OMEGA 3 (EPA / DHA)",
    description: "Ácidos grasos esenciales con amplia evidencia en la modulación del equilibrio inflamatorio corporal, el apoyo a la salud cardiovascular y la función cognitiva.",
    disclaimer: "Verifica certificación de pureza IFOS libre de metales pesados y consulta con tu especialista.",
    imageSrc: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=600&q=80",
    keyBenefits: [
      "Modulación de vías inflamatorias corporales",
      "Protección de salud cardiovascular y cerebral",
      "Integridad de membranas celulares"
    ],
    synergies: "Consumir junto a antioxidantes como Vitamina E natural.",
    usageTips: "Almacenar en lugar fresco y oscuro libre de calor."
  },
  {
    id: "preset-curc",
    sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
    badge: "INFORMACIÓN RESPONSABLE",
    subtitle: "FICHA DE HOY",
    name: "CURCUMINA FITOSOMADA",
    description: "Compuesto bioactivo con reconocidas propiedades antioxidantes y moduladoras. Su formulación con fosfolípidos o piperina optimiza drásticamente su absorción biológica.",
    disclaimer: "Verifica posibles interacciones farmacológicas con tu equipo de oncología integrativa.",
    imageSrc: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    keyBenefits: [
      "Modulación de señalizaciones celulares de inflamación",
      "Protección antioxidante de tejidos",
      "Apoyo al confort articular y digestivo"
    ],
    synergies: "Formulación con fosfolípidos que multiplica su absorción biológica.",
    usageTips: "Consultar previamente en casos de cirugías programadas."
  },
  {
    id: "preset-coq10",
    sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
    badge: "INFORMACIÓN RESPONSABLE",
    subtitle: "FICHA DE HOY",
    name: "COENZIMA Q10 (UBIQUINOL)",
    description: "Elemento clave en la bioenergética celular y la función mitocondrial. Actúa como un potente antioxidante lipídico protegiendo membranas celulares.",
    disclaimer: "Coordina la indicación y momentos de toma con tu especialista tratante.",
    imageSrc: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
    keyBenefits: [
      "Producción de ATP y energía celular mitocondrial",
      "Potente acción antioxidante en membranas celulares",
      "Soporte al rendimiento físico y muscular"
    ],
    synergies: "Combinable con L-Carnitina y complejo B para bioenergética.",
    usageTips: "Tomar por la mañana junto con el desayuno."
  }
];

const ART_PRESETS: ArtCard[] = [
  {
    title: "ARTE QUE SANA",
    imageSrc: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85",
    caption: "Crear también es una forma de respirar y reconectar con la paz interior",
    author: "Galería Terapéutica",
    fullDescription: "La contemplación del arte estimula la liberación de dopamina y endorfinas, reduciendo la respuesta de estrés del eje HPA y facilitando la serenidad emocional."
  },
  {
    title: "ARTE QUE SANA",
    imageSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85",
    caption: "Los colores expresan y liberan lo que el silencio guarda con amor",
    author: "Arte y Consciencia",
    fullDescription: "El uso consciente de colores cálidos y texturas suaves en la pintura favorece estados meditativos alpha que apoyan la recuperación del sistema nervioso."
  },
  {
    title: "ARTE QUE SANA",
    imageSrc: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85",
    caption: "La belleza de la naturaleza restaura el espíritu y serena el corazón",
    author: "Naturaleza Consciente",
    fullDescription: "La geometría fractal presente en el arte paisajístico y botánico induce una rápida sincronización cerebral restaurativa."
  },
  {
    title: "ARTE QUE SANA",
    imageSrc: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=85",
    caption: "En cada trazo habita la esperanza de una mente clara y renovada",
    author: "Espacio Creativo",
    fullDescription: "El arte es un lenguaje no verbal que permite procesar emociones complejas y transformarlas en fortaleza y proyecto de vida."
  }
];

const RSS_PRESETS = [
  { name: "🌱 Noticias Positivas (Periodismo de Soluciones)", url: "https://noticiaspositivas.org/feed/" },
  { name: "🔬 The Conversation (Salud y Bienestar)", url: "https://theconversation.com/es/salud/atom.xml" },
  { name: "🌿 EFE Verde (Sostenibilidad y Vida)", url: "https://www.efeverde.com/feed/" }
];

export const AdminConsole: React.FC = () => {
  const [state, setState] = useState<BoardState>(DEFAULT_BOARD_STATE);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isFetchingRSS, setIsFetchingRSS] = useState<boolean>(false);
  const [isAutoGeneratingNews, setIsAutoGeneratingNews] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeBoardState((latest) => {
      setState(normalizeBoardState(latest));
    });
    return unsub;
  }, []);

  const handleSave = async (customState?: BoardState) => {
    const target = customState || state;
    try {
      await saveBoardState(target);
      setSaveStatus('✅ ¡Cambios transmitidos en vivo con éxito!');
      setTimeout(() => setSaveStatus(''), 3500);
    } catch (e) {
      setSaveStatus('❌ Error guardando cambios');
    }
  };

  const handleQuickBroadcastChange = (mode: BroadcastMode) => {
    const nextState = { ...state, broadcastMode: mode };
    setState(nextState);
    handleSave(nextState);
  };

  const handleAutoUpdateNews = async () => {
    setIsAutoGeneratingNews(true);
    setSaveStatus('⚡ Rastreando fuentes científicas y sintetizando con IA...');
    try {
      const res = await fetchDailyHealthNews(state.rssUrl);
      if (res.success && res.news.length > 0) {
        const updated = {
          ...state,
          goodNews: res.news
        };
        setState(updated);
        await saveBoardState(updated);
        setSaveStatus(`✅ ${res.message}`);
      } else {
        setSaveStatus('⚠️ No se pudieron procesar noticias.');
      }
    } catch (e: any) {
      setSaveStatus(`❌ Error: ${e.message || e}`);
    } finally {
      setIsAutoGeneratingNews(false);
      setTimeout(() => setSaveStatus(''), 4500);
    }
  };

  const handleFetchRSS = async (urlToFetch?: string) => {
    const targetUrl = urlToFetch || state.rssUrl || "https://noticiaspositivas.org/feed/";
    setIsFetchingRSS(true);
    try {
      const items = await fetchPositiveNewsFromRSS(targetUrl);
      if (items.length > 0) {
        setState((prev) => ({ ...prev, goodNews: items, rssUrl: targetUrl }));
        setSaveStatus(`✅ Se cargaron ${items.length} buenas noticias con texto enriquecido.`);
      } else {
        setSaveStatus('⚠️ No se encontraron nuevas noticias en este feed.');
      }
    } catch (e) {
      setSaveStatus('❌ Error consultando el feed RSS.');
    } finally {
      setIsFetchingRSS(false);
      setTimeout(() => setSaveStatus(''), 3500);
    }
  };

  // --- Manejo de QR Overlay ---
  const handleTriggerQrNow = async () => {
    const updated = {
      ...state,
      qrOverlayEnabled: true,
      qrOverlayForceTrigger: Date.now()
    };
    setState(updated);
    await handleSave(updated);
    setSaveStatus('📱 ¡Código QR activado en vivo en la pantalla!');
  };

  // --- Manejo de Arte Que Sana ---
  const updateArtCard = (index: number, field: keyof ArtCard, value: string) => {
    const updated = [...(state.artCards || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setState({ ...state, artCards: updated });
    }
  };

  const addArtCard = (preset?: ArtCard) => {
    const newArt: ArtCard = preset ? { ...preset, id: `art-${Date.now()}` } : {
      id: `art-${Date.now()}`,
      title: "ARTE QUE SANA",
      imageSrc: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
      caption: "Nueva obra y reflexión de bienestar interior",
      author: "Galería Terapéutica",
      fullDescription: "Espacio de serenidad y contemplación consciente."
    };
    setState({ ...state, artCards: [...(state.artCards || []), newArt] });
  };

  const removeArtCard = (index: number) => {
    const updated = (state.artCards || []).filter((_, i) => i !== index);
    setState({ ...state, artCards: updated });
  };

  // --- Manejo de Noticias ---
  const updateGoodNews = (index: number, field: keyof NewsItem, value: string) => {
    const updated = [...state.goodNews];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setState({ ...state, goodNews: updated });
    }
  };

  const addNewsItem = () => {
    const newItem: NewsItem = {
      id: `custom-${Date.now()}`,
      title: "Nueva noticia positiva de bienestar",
      description: "Detalle y contexto de los beneficios y avances científicos para la salud integral.",
      imageSrc: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
      source: "Comunidad Sanante",
      category: "BIENESTAR Y SALUD",
      keyPoints: [
        "Avance validado y relevante para la salud integral",
        "Hábitos que fortalecen la calma y la regeneración celular",
        "Apoyo interdisciplinario en medicina y nutrición"
      ]
    };
    setState({ ...state, goodNews: [newItem, ...state.goodNews] });
  };

  const removeNewsItem = (index: number) => {
    const updated = state.goodNews.filter((_, i) => i !== index);
    setState({ ...state, goodNews: updated });
  };

  // --- Manejo de Suplementos ---
  const updateSupplement = (index: number, field: keyof SupplementData, value: string) => {
    const updated = [...(state.supplementsList || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setState({ ...state, supplementsList: updated });
    }
  };

  const addSupplement = (preset?: SupplementData) => {
    const newSup: SupplementData = preset ? { ...preset, id: `sup-${Date.now()}` } : {
      id: `sup-${Date.now()}`,
      sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
      badge: "INFORMACIÓN RESPONSABLE",
      subtitle: "FICHA DE HOY",
      name: "NUEVO SUPLEMENTO",
      description: "Descripción de las propiedades respaldadas por evidencia científica y nutrición integral.",
      disclaimer: "Consulta dosis personalizada y tolerancia con tu médico tratante.",
      imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      keyBenefits: [
        "Apoyo biológico y nutricional respaldado por evidencia",
        "Protección celular frente al estrés oxidativo",
        "Acompañamiento integrativo responsable"
      ],
      synergies: "Consultar posibles cofactores y momentos ideales de toma.",
      usageTips: "Tomar con alimentos principales para una óptima absorción."
    };
    setState({ ...state, supplementsList: [...(state.supplementsList || []), newSup] });
  };

  const removeSupplement = (index: number) => {
    const updated = (state.supplementsList || []).filter((_, i) => i !== index);
    setState({ ...state, supplementsList: updated });
  };

  // --- Manejo de Frases Astrales ---
  const updateAstralQuote = (index: number, value: string) => {
    const quotes = [...(state.astralCard.quotesList || [])];
    quotes[index] = value;
    setState({
      ...state,
      astralCard: { ...state.astralCard, quotesList: quotes }
    });
  };

  const addAstralQuote = () => {
    const quotes = [...(state.astralCard.quotesList || []), "Nueva afirmación de paz y proyecto de vida"];
    setState({
      ...state,
      astralCard: { ...state.astralCard, quotesList: quotes }
    });
  };

  const removeAstralQuote = (index: number) => {
    const quotes = (state.astralCard.quotesList || []).filter((_, i) => i !== index);
    setState({
      ...state,
      astralCard: { ...state.astralCard, quotesList: quotes }
    });
  };

  // --- Manejo de Marquesinas Inferiores ---
  const updateDailyReminderItem = (index: number, value: string) => {
    const updated = [...(state.dailyReminders || [])];
    updated[index] = value;
    setState({ ...state, dailyReminders: updated });
  };

  const addDailyReminderItem = () => {
    setState({
      ...state,
      dailyReminders: [...(state.dailyReminders || []), "Nuevo mensaje de recordatorio y vida"]
    });
  };

  const removeDailyReminderItem = (index: number) => {
    setState({
      ...state,
      dailyReminders: (state.dailyReminders || []).filter((_, i) => i !== index)
    });
  };

  const updateNextLiveItem = (index: number, value: string) => {
    const updated = [...(state.nextLiveList || [])];
    updated[index] = value;
    setState({ ...state, nextLiveList: updated });
  };

  const addNextLiveItem = () => {
    setState({
      ...state,
      nextLiveList: [...(state.nextLiveList || []), "Nueva invitación a directo o taller especial"]
    });
  };

  const removeNextLiveItem = (index: number) => {
    setState({
      ...state,
      nextLiveList: (state.nextLiveList || []).filter((_, i) => i !== index)
    });
  };

  const toggleFullScreenView = (view: FullScreenViewType) => {
    const current = state.activeFullScreenViews || ['astral', 'news', 'supplement', 'art'];
    let updated: FullScreenViewType[];
    if (current.includes(view)) {
      if (current.length === 1) return; // Mantener al menos 1
      updated = current.filter(v => v !== view);
    } else {
      updated = [...current, view];
    }
    setState({ ...state, activeFullScreenViews: updated });
  };

  const [testWelcomeName, setTestWelcomeName] = useState<string>("Claudia M.");
  const [testDonationName, setTestDonationName] = useState<string>("Juan Pablo R.");
  const [testDonationAmount, setTestDonationAmount] = useState<string>("Super Chat $10.00");
  const [testDonationMsg, setTestDonationMsg] = useState<string>("Con mucho amor y gratitud para toda la comunidad");
  const [alertTriggerStatus, setAlertTriggerStatus] = useState<string>("");

  const triggerWelcomeAlert = async (customName?: string) => {
    const name = customName || testWelcomeName || "Nuevo Miembro";
    const alert = {
      id: `welcome_${Date.now()}`,
      type: "welcome",
      title: "¡BIENVENIDO(A) A LA COMUNIDAD!",
      name,
      subtitle: "se unió a nuestro Telegram de apoyo y vida 🤍",
      timestamp: Date.now(),
      durationSec: 9
    };
    await sendLiveAlert(alert);
    setAlertTriggerStatus(`✅ Alerta de bienvenida para "${name}" enviada a pantalla`);
    setTimeout(() => setAlertTriggerStatus(""), 4000);
  };

  const triggerDonationAlert = async () => {
    const alert = {
      id: `donation_${Date.now()}`,
      type: "donation",
      title: "¡GRACIAS POR TU REGALO / APOYO!",
      name: testDonationName || "Donante Anónimo",
      amount: testDonationAmount || "Regalo YouTube 🎁",
      message: testDonationMsg || "Apoyo amoroso a la comunidad",
      timestamp: Date.now(),
      durationSec: 15
    };
    await sendLiveAlert(alert);
    setAlertTriggerStatus(`✅ Alerta de regalo de "${alert.name}" enviada a pantalla`);
    setTimeout(() => setAlertTriggerStatus(""), 4000);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentEffectiveTheme = getEffectiveTheme(state.theme);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#02130f',
      color: '#f8fafc',
      padding: '1.5rem 1.5rem 6rem',
      fontFamily: "'Outfit', sans-serif",
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(3, 30, 24, 0.95)',
        border: '1.5px solid rgba(212, 175, 55, 0.45)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        {/* Header Consola */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 className="font-cinzel" style={{ fontSize: '1.7rem', color: '#fef3c7', letterSpacing: '2px' }}>
              PANEL DE CONTROL • MASTER BROADCAST DIRECTOR
            </h1>
            <p style={{ color: '#d4af37', fontSize: '0.88rem', marginTop: '4px' }}>
              El Podcast del Cáncer • v1.1 (Senior-Friendly Bold) • Dirección de Escenas en Vivo & Transición Pizarra ⟷ Pantalla Completa
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid #d4af37',
                color: '#fef3c7',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📺 Ver Pizarra en Directo
            </a>

            <button
              onClick={() => handleSave()}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #e6c875 0%, #c49a37 100%)',
                color: '#021a14',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
              }}
            >
              🚀 Guardar y Transmitir
            </button>
          </div>
        </div>

        {/* Barra de Acceso Rápido a Secciones */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(2, 20, 16, 0.7)',
          borderRadius: '10px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 600, alignSelf: 'center', marginRight: '6px' }}>
            Ir a:
          </span>
          <button type="button" onClick={() => scrollTo('sec-director')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>🎬 Director de Emisión</button>
          <button type="button" onClick={() => scrollTo('sec-general')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>⚙️ General</button>
          <button type="button" onClick={() => scrollTo('sec-arte')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>🎨 Arte Que Sana ({state.artCards?.length || 0})</button>
          <button type="button" onClick={() => scrollTo('sec-noticias')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>📰 Buenas Noticias ({state.goodNews?.length || 0})</button>
          <button type="button" onClick={() => scrollTo('sec-astral')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>✨ Tarjeta Astral ({state.astralCard.quotesList?.length || 1})</button>
          <button type="button" onClick={() => scrollTo('sec-suplementos')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>💊 Suplementos ({state.supplementsList?.length || 0})</button>
          <button type="button" onClick={() => scrollTo('sec-tickers')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7', borderRadius: '4px', cursor: 'pointer' }}>🤍 Marquesinas Inferiores</button>
          <button type="button" onClick={() => scrollTo('sec-alertas')} style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#021a14', border: '1px solid #d4af37', color: '#fef08a', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>🔔 Alertas & Regalos</button>
        </div>

        {saveStatus && (
          <div style={{
            padding: '12px 20px',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid #10b981',
            color: '#a7f3d0',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {saveStatus}
          </div>
        )}

        {/* SECCIÓN PRINCIPAL: DIRECTOR DE EMISIÓN & MASTER LOOP */}
        <section id="sec-director" style={{
          background: 'linear-gradient(135deg, rgba(2, 28, 22, 0.95) 0%, rgba(2, 18, 14, 0.98) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.65)',
          borderRadius: '16px',
          padding: '1.6rem',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.2)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.35rem', color: '#fef08a', letterSpacing: '2px' }}>
                🎬 DIRECCIÓN DE EMISIÓN & BUCLE DE ESCENAS
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                Controla la alternancia automática entre la Pizarra Multi-ficha y las Vistas Protagonistas a Pantalla Completa.
              </p>
            </div>

            <div style={{
              padding: '6px 18px',
              borderRadius: '20px',
              background: state.broadcastMode === 'auto_loop' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.2)',
              border: state.broadcastMode === 'auto_loop' ? '1.5px solid #10b981' : '1.5px solid #d4af37',
              color: state.broadcastMode === 'auto_loop' ? '#a7f3d0' : '#fef3c7',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '1px'
            }}>
              {state.broadcastMode === 'auto_loop' ? '🤖 MODO BUCLE AUTOMÁTICO ACTIVO' : '📌 MODO ESCENA FIJA EN VIVO'}
            </div>
          </div>

          {/* Botones de Cambio Rápido de Escena en 1-Click */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ fontSize: '0.82rem', color: '#d4af37', fontWeight: 700 }}>
              ⚡ Cambiar Escena en Vivo Inmediatamente (1-Click):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('auto_loop')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'auto_loop' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : '#021813',
                  border: state.broadcastMode === 'auto_loop' ? '2px solid #a7f3d0' : '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: state.broadcastMode === 'auto_loop' ? '0 0 15px rgba(16,185,129,0.5)' : 'none'
                }}
              >
                🔄 Bucle Automático
              </button>

              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('general_fixed')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'general_fixed' ? 'linear-gradient(135deg, #e6c875 0%, #c49a37 100%)' : '#021813',
                  border: state.broadcastMode === 'general_fixed' ? '2px solid #ffffff' : '1px solid rgba(212,175,55,0.3)',
                  color: state.broadcastMode === 'general_fixed' ? '#021813' : '#fef3c7',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📺 Pizarra General Fija
              </button>

              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('fullscreen_astral')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'fullscreen_astral' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#021813',
                  border: state.broadcastMode === 'fullscreen_astral' ? '2px solid #93c5fd' : '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ✨ Video / Astral Full
              </button>

              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('fullscreen_news')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'fullscreen_news' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : '#021813',
                  border: state.broadcastMode === 'fullscreen_news' ? '2px solid #a7f3d0' : '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📰 Noticias Revista Full
              </button>

              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('fullscreen_supplement')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'fullscreen_supplement' ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : '#021813',
                  border: state.broadcastMode === 'fullscreen_supplement' ? '2px solid #fde047' : '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                💊 Suplemento Full
              </button>

              <button
                type="button"
                onClick={() => handleQuickBroadcastChange('fullscreen_art')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: state.broadcastMode === 'fullscreen_art' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '#021813',
                  border: state.broadcastMode === 'fullscreen_art' ? '2px solid #c4b5fd' : '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🎨 Galería Arte Full
              </button>
            </div>
          </div>

          {/* Configuración de Tiempos del Bucle */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#fde68a', fontWeight: 600, marginBottom: '6px' }}>
                ⏱️ Tiempo en Pizarra General (Segundos):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="15"
                  max="900"
                  step="15"
                  value={state.generalViewDuration || 180}
                  onChange={(e) => setState({ ...state, generalViewDuration: Number(e.target.value) })}
                  style={{ width: '100px', padding: '8px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', textAlign: 'center', fontSize: '0.95rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  segundos ({((state.generalViewDuration || 180) / 60).toFixed(1)} minutos)
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#fde68a', fontWeight: 600, marginBottom: '6px' }}>
                ⏱️ Tiempo en cada Pantalla Completa (Segundos):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="15"
                  max="600"
                  step="15"
                  value={state.fullScreenDuration || 120}
                  onChange={(e) => setState({ ...state, fullScreenDuration: Number(e.target.value) })}
                  style={{ width: '100px', padding: '8px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', textAlign: 'center', fontSize: '0.95rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  segundos ({((state.fullScreenDuration || 120) / 60).toFixed(1)} minutos)
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#fde68a', fontWeight: 600, marginBottom: '6px' }}>
                🎯 Vistas que participan en el bucle:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  { id: 'astral', label: '✨ Astral' },
                  { id: 'news', label: '📰 Noticias' },
                  { id: 'supplement', label: '💊 Suplemento' },
                  { id: 'art', label: '🎨 Arte' }
                ].map((item) => {
                  const isChecked = (state.activeFullScreenViews || ['astral', 'news', 'supplement', 'art']).includes(item.id as FullScreenViewType);
                  return (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: isChecked ? '#a7f3d0' : '#64748b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFullScreenView(item.id as FullScreenViewType)}
                      />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Control para Suspender / Incluir Pizarra General en el Bucle */}
            <div style={{
              gridColumn: '1 / -1',
              padding: '12px 16px',
              background: 'rgba(2, 24, 19, 0.7)',
              borderRadius: '10px',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.92rem', color: '#fef3c7', fontWeight: 800 }}>
                  📱 Modo Optimizado Móviles: ¿Incluir Pizarra General de 4 Cuadrantes en el Bucle?
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Si desactivas esta opción, la emisión transmitirá <strong>exclusivamente las Fichas Ampliadas (Full-Screen)</strong> en bucle continuo, maximizando la legibilidad para celulares y adultos mayores.
                </p>
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: state.includeGeneralViewInLoop !== false ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: state.includeGeneralViewInLoop !== false ? '1.5px solid #10b981' : '1.5px solid #ef4444',
                color: state.includeGeneralViewInLoop !== false ? '#a7f3d0' : '#fca5a5',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={state.includeGeneralViewInLoop !== false}
                  onChange={(e) => setState({ ...state, includeGeneralViewInLoop: e.target.checked })}
                />
                {state.includeGeneralViewInLoop !== false ? '✅ Pizarra General Incluida' : '🚫 Pizarra General Suspendida (Solo Fichas Full)'}
              </label>
            </div>
          </div>
        </section>

        {/* Sección 1: Configuración General */}
        <section id="sec-general" style={{ marginBottom: '2.5rem' }}>
          <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a', marginBottom: '1rem' }}>
            1. Configuración General & Turno Horario
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                Modo de Turno (Actualmente: {currentEffectiveTheme === 'day' ? '☀️ DÍA' : '🌙 NOCHE'})
              </label>
              <select
                value={state.theme}
                onChange={(e) => setState({ ...state, theme: e.target.value as ThemeMode })}
                style={{ width: '100%', padding: '10px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px' }}
              >
                <option value="auto">🤖 Automático (06:00 a 18:00 = Día | 18:00 a 06:00 = Noche)</option>
                <option value="day">☀️ Forzar Día (Verde Esmeralda & Oro)</option>
                <option value="night">🌙 Forzar Noche (Azul Zafiro & Oro)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                Estado de Transmisión
              </label>
              <button
                type="button"
                onClick={() => setState({ ...state, isLive: !state.isLive })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: state.isLive ? '1px solid #ef4444' : '1px solid #64748b',
                  background: state.isLive ? 'rgba(239, 68, 68, 0.2)' : '#021813',
                  color: state.isLive ? '#fca5a5' : '#94a3b8',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {state.isLive ? '🔴 EN VIVO (Activo)' : '⚪ Fuera de Emisión'}
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                Título Cabecera
              </label>
              <input
                type="text"
                value={state.headerTitle}
                onChange={(e) => setState({ ...state, headerTitle: e.target.value })}
                style={{ width: '100%', padding: '10px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px' }}
              />
            </div>
          </div>
        </section>

        {/* Sección 2: Galería de Arte Que Sana */}
        <section id="sec-arte" style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a' }}>
                2. Galería de Arte Que Sana ({state.artCards?.length || 0} Obras en Rotación)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                Rotación pausada con cross-fade e imágenes de contemplación y serenidad.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#d4af37' }}>⏱️ Rotar cada:</span>
                <input
                  type="number"
                  min="8"
                  max="60"
                  value={state.artRotationSpeed || 20}
                  onChange={(e) => setState({ ...state, artRotationSpeed: Number(e.target.value) })}
                  style={{ width: '65px', padding: '6px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>seg</span>
              </div>

              <button
                type="button"
                onClick={() => addArtCard()}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                ➕ Añadir Obra de Arte
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cargar Obra desde Galería de Presets:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {ART_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addArtCard(p)}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#fef3c7', borderRadius: '6px', cursor: 'pointer' }}
                >
                  🎨 Preset #{i + 1}: "{p.caption.slice(0, 30)}..."
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {(state.artCards || []).map((art, idx) => (
              <div key={art.id || idx} style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 600 }}>Obra #{idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArtCard(idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>URL Imagen de Arte:</label>
                  <input
                    type="text"
                    value={art.imageSrc}
                    onChange={(e) => updateArtCard(idx, 'imageSrc', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reflexión / Pie de Foto:</label>
                  <textarea
                    rows={2}
                    value={art.caption}
                    onChange={(e) => updateArtCard(idx, 'caption', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Descripción Detallada (Modo Pantalla Completa):</label>
                  <textarea
                    rows={2}
                    value={art.fullDescription || ""}
                    onChange={(e) => updateArtCard(idx, 'fullDescription', e.target.value)}
                    placeholder="Beneficios y enfoque terapéutico de la obra..."
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 3: Buenas Noticias */}
        <section id="sec-noticias" style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a' }}>
                3. Ficha: Buenas Noticias en Carrusel ({state.goodNews?.length || 0} Noticias)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                Sincroniza feeds RSS o gestiona titulares y descripciones enriquecidas.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={isAutoGeneratingNews}
                onClick={handleAutoUpdateNews}
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b48c1e 100%)',
                  border: '1.4px solid #fef08a',
                  color: '#021813',
                  borderRadius: '6px',
                  cursor: isAutoGeneratingNews ? 'wait' : 'pointer',
                  fontWeight: 800,
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
                }}
              >
                {isAutoGeneratingNews ? '⚡ Consultando Fuentes & IA...' : '✨ Auto-Actualizar 4 Noticias de Hoy (IA)'}
              </button>

              <button
                type="button"
                onClick={addNewsItem}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                ➕ Añadir Manual
              </button>
              <button
                type="button"
                disabled={isFetchingRSS}
                onClick={() => handleFetchRSS()}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: isFetchingRSS ? 'wait' : 'pointer',
                  fontWeight: 700
                }}
              >
                {isFetchingRSS ? '⏳ Descargando...' : '🔄 Sincronizar RSS'}
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: '10px' }}>📡 Configuración del Feed RSS y Rotación</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Seleccionar Fuente de Noticias Positivas:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {RSS_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleFetchRSS(preset.url)}
                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#021a14', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fef3c7', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>URL Feed RSS Personalizado:</label>
                <input
                  type="text"
                  value={state.rssUrl}
                  onChange={(e) => setState({ ...state, rssUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Velocidad de Rotación en Carrusel (Segundos):</label>
                <input
                  type="number"
                  min="6"
                  max="45"
                  value={state.newsRotationSpeed || 15}
                  onChange={(e) => setState({ ...state, newsRotationSpeed: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {state.goodNews.map((item, idx) => (
              <div key={item.id || idx} style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 600 }}>Noticia #{idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeNewsItem(idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Titular:</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateGoodNews(idx, 'title', e.target.value)}
                    style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Descripción / Texto Enriquecido Integrado:</label>
                  <textarea
                    rows={3}
                    value={item.description || ""}
                    onChange={(e) => updateGoodNews(idx, 'description', e.target.value)}
                    placeholder="Escribe el texto detallado que se mostrará sobre el degradé..."
                    style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Categoría:</label>
                    <input
                      type="text"
                      value={item.category || ""}
                      onChange={(e) => updateGoodNews(idx, 'category', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fuente:</label>
                    <input
                      type="text"
                      value={item.source || ""}
                      onChange={(e) => updateGoodNews(idx, 'source', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>URL Miniatura:</label>
                  <input
                    type="text"
                    value={item.imageSrc}
                    onChange={(e) => updateGoodNews(idx, 'imageSrc', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 4: Tarjeta Astral Central ("AHORA") */}
        <section id="sec-astral" style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a' }}>
                4. Tarjeta Astral Central ("AHORA" • Mensajes y Fondos)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                Rotación de sabiduría espiritual y opciones de motor Canvas o Video Loop.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#d4af37' }}>⏱️ Rotar frases:</span>
                <input
                  type="number"
                  min="8"
                  max="60"
                  value={state.astralCard.rotationSpeed || 20}
                  onChange={(e) => setState({
                    ...state,
                    astralCard: { ...state.astralCard, rotationSpeed: Number(e.target.value) }
                  })}
                  style={{ width: '65px', padding: '6px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>seg</span>
              </div>

              <button
                type="button"
                onClick={addAstralQuote}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                ➕ Añadir Frase
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Categoría / Tag Superior:</label>
                <input
                  type="text"
                  value={state.astralCard.category}
                  onChange={(e) => setState({ ...state, astralCard: { ...state.astralCard, category: e.target.value } })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tipo de Fondo:</label>
                <select
                  value={state.astralCard.bgMode || 'canvas'}
                  onChange={(e) => setState({
                    ...state,
                    astralCard: { ...state.astralCard, bgMode: e.target.value as 'canvas' | 'video' }
                  })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                >
                  <option value="canvas">✨ Motor Canvas (Partículas + Geometría Sagrada Dinámica)</option>
                  <option value="video">🎥 Video Loop Personalizado (URL MP4)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Texto Call To Action (CTA):</label>
                <input
                  type="text"
                  value={state.astralCard.cta}
                  onChange={(e) => setState({ ...state, astralCard: { ...state.astralCard, cta: e.target.value } })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            {state.astralCard.bgMode === 'video' && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.8rem', color: '#fbbf24' }}>URL del Video MP4 de Fondo:</label>
                <input
                  type="text"
                  placeholder="https://.../video_loop.mp4"
                  value={state.astralCard.videoSrc || ''}
                  onChange={(e) => setState({
                    ...state,
                    astralCard: { ...state.astralCard, videoSrc: e.target.value }
                  })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            )}
          </div>

          <h3 style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: '10px' }}>
            📜 Colección de Frases y Sabiduría en Rotación:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {(state.astralCard.quotesList || []).map((quote, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(2, 20, 16, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.25)' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', width: '28px' }}>#{idx + 1}</span>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => updateAstralQuote(idx, e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: '#021813', border: '1px solid rgba(212,175,55,0.3)', color: '#fff', borderRadius: '6px' }}
                />
                <button
                  type="button"
                  onClick={() => removeAstralQuote(idx)}
                  style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 5: Catálogo de Suplementos y Evidencia */}
        <section id="sec-suplementos" style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a' }}>
                5. Catálogo Rotativo de Suplementos ({state.supplementsList?.length || 0} Fichas)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                Rotación pausada con información responsable y rigor clínico en la fila inferior completa.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#d4af37' }}>⏱️ Rotar cada:</span>
                <input
                  type="number"
                  min="10"
                  max="90"
                  value={state.supplementRotationSpeed || 25}
                  onChange={(e) => setState({ ...state, supplementRotationSpeed: Number(e.target.value) })}
                  style={{ width: '65px', padding: '6px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>seg</span>
              </div>

              <button
                type="button"
                onClick={() => addSupplement()}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                ➕ Añadir Suplemento
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cargar Fórmulas Preconfiguradas:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {SUPPLEMENT_PRESETS.map((sup, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addSupplement(sup)}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#021a14', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#fef3c7', borderRadius: '6px', cursor: 'pointer' }}
                >
                  ➕ Añadir {sup.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.4rem' }}>
            {(state.supplementsList || []).map((sup, idx) => (
              <div key={sup.id || idx} style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: 700 }}>Ficha #{idx + 1}: {sup.name}</h4>
                  <button
                    type="button"
                    onClick={() => removeSupplement(idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Nombre Suplemento:</label>
                    <input
                      type="text"
                      value={sup.name}
                      onChange={(e) => updateSupplement(idx, 'name', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subtítulo:</label>
                    <input
                      type="text"
                      value={sup.subtitle || 'FICHA DE HOY'}
                      onChange={(e) => updateSupplement(idx, 'subtitle', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>URL Imagen Frasco / Gotero:</label>
                  <input
                    type="text"
                    value={sup.imageSrc}
                    onChange={(e) => updateSupplement(idx, 'imageSrc', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Descripción Clínica / Nutricional:</label>
                  <textarea
                    rows={3}
                    value={sup.description}
                    onChange={(e) => updateSupplement(idx, 'description', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#fde047' }}>Descargo Profesional / Advertencia:</label>
                  <input
                    type="text"
                    value={sup.disclaimer}
                    onChange={(e) => updateSupplement(idx, 'disclaimer', e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 6: Marquesinas Inferiores Dinámicas */}
        <section id="sec-tickers" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a', marginBottom: '1rem' }}>
            6. Marquesinas Inferiores Dinámicas (Múltiples Mensajes)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Barra 1: HOY RECORDAMOS */}
            <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#fef3c7', fontSize: '0.95rem', fontWeight: 700 }}>🤍 Barra 1: Recordatorios de Vida</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d4af37' }}>⏱️ Scroll:</span>
                  <input
                    type="number"
                    min="60"
                    max="900"
                    step="15"
                    value={state.dailyReminderRotationSpeed || 480}
                    onChange={(e) => setState({ ...state, dailyReminderRotationSpeed: Number(e.target.value) })}
                    style={{ width: '70px', padding: '4px', background: '#021813', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>seg</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Etiqueta de la Barra:</label>
                <input
                  type="text"
                  value={state.dailyReminderLabel || 'HOY RECORDAMOS'}
                  onChange={(e) => setState({ ...state, dailyReminderLabel: e.target.value })}
                  style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(212,175,55,0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.75rem', color: '#d4af37' }}>Mensajes en la Marquesina Continua:</label>
                <button
                  type="button"
                  onClick={addDailyReminderItem}
                  style={{ padding: '3px 10px', fontSize: '0.72rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ➕ Añadir Mensaje
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(state.dailyReminders || []).map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => updateDailyReminderItem(idx, e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', background: '#021813', border: '1px solid rgba(212,175,55,0.25)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeDailyReminderItem(idx)}
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Barra 2: INVITACIÓN */}
            <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#a7f3d0', fontSize: '0.95rem', fontWeight: 700 }}>✨ Barra 2: Convocatorias & Directos</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>⏱️ Scroll:</span>
                  <input
                    type="number"
                    min="60"
                    max="900"
                    step="15"
                    value={state.nextLiveRotationSpeed || 390}
                    onChange={(e) => setState({ ...state, nextLiveRotationSpeed: Number(e.target.value) })}
                    style={{ width: '70px', padding: '4px', background: '#021813', border: '1px solid rgba(16,185,129,0.4)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>seg</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Etiqueta de la Barra:</label>
                <input
                  type="text"
                  value={state.nextLiveLabel || 'INVITACIÓN'}
                  onChange={(e) => setState({ ...state, nextLiveLabel: e.target.value })}
                  style={{ width: '100%', padding: '6px', background: '#021813', border: '1px solid rgba(16,185,129,0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Mensajes en la Marquesina Continua:</label>
                <button
                  type="button"
                  onClick={addNextLiveItem}
                  style={{ padding: '3px 10px', fontSize: '0.72rem', background: '#021a14', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ➕ Añadir Mensaje
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(state.nextLiveList || []).map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => updateNextLiveItem(idx, e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', background: '#021813', border: '1px solid rgba(16,185,129,0.25)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNextLiveItem(idx)}
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sección 7: Overlay Código QR & Afiliados iHerb */}
        <section id="sec-qr" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fde68a' }}>
                7. Overlay Flotante de Código QR (Afiliados iHerb)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                Proyecta periódicamente un código QR flotante en alta definición para que la audiencia escanee con su celular y obtenga descuento.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={handleTriggerQrNow}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  border: '1px solid #34d399',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }}
              >
                👁️ Probar QR en Pantalla Ahora
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={state.qrOverlayEnabled ?? true}
                  onChange={(e) => setState({ ...state, qrOverlayEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
                <span style={{ fontSize: '0.9rem', color: state.qrOverlayEnabled ? '#a7f3d0' : '#94a3b8', fontWeight: 700 }}>
                  {state.qrOverlayEnabled ? '🟢 Activado' : '⚪ Desactivado'}
                </span>
              </label>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 20, 16, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            {/* Modo de Proyección */}
            <div style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <label style={{ fontSize: '0.82rem', color: '#fef3c7', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Modo de Visualización en Pantalla:
              </label>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="qrDisplayMode"
                    value="always"
                    checked={(state.qrOverlayDisplayMode || 'periodic') === 'always'}
                    onChange={() => setState({ ...state, qrOverlayDisplayMode: 'always' })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600 }}>
                    📌 Fijo Permanente (Siempre visible en pantalla)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="qrDisplayMode"
                    value="periodic"
                    checked={(state.qrOverlayDisplayMode || 'periodic') === 'periodic'}
                    onChange={() => setState({ ...state, qrOverlayDisplayMode: 'periodic' })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#fde68a', fontWeight: 600 }}>
                    ⏱️ Periódico Intermitente (Aparece cada X tiempo)
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Código de Recompensas iHerb:</label>
                <input
                  type="text"
                  value={state.qrOverlayCode || 'MBG0640'}
                  onChange={(e) => setState({ ...state, qrOverlayCode: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: (state.qrOverlayDisplayMode === 'always') ? '#64748b' : '#94a3b8' }}>
                  Frecuencia de Aparición (Segundos):
                </label>
                <input
                  type="number"
                  min="10"
                  max="3600"
                  step="10"
                  disabled={state.qrOverlayDisplayMode === 'always'}
                  value={state.qrOverlayInterval || 600}
                  onChange={(e) => setState({ ...state, qrOverlayInterval: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px', opacity: state.qrOverlayDisplayMode === 'always' ? 0.4 : 1 }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>600s = cada 10 min | 60s = cada 1 min</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: (state.qrOverlayDisplayMode === 'always') ? '#64748b' : '#94a3b8' }}>
                  Duración en Pantalla (Segundos):
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  disabled={state.qrOverlayDisplayMode === 'always'}
                  value={state.qrOverlayDuration || 35}
                  onChange={(e) => setState({ ...state, qrOverlayDuration: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px', opacity: state.qrOverlayDisplayMode === 'always' ? 0.4 : 1 }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tiempo visible antes de ocultarse</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Título del Banner:</label>
                <input
                  type="text"
                  value={state.qrOverlayTitle || 'APOYA NUESTRA COMUNIDAD'}
                  onChange={(e) => setState({ ...state, qrOverlayTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Subtítulo / Oferta:</label>
                <input
                  type="text"
                  value={state.qrOverlaySubtitle || '5% a 10% de DESCUENTO en iHerb'}
                  onChange={(e) => setState({ ...state, qrOverlaySubtitle: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#021813', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            {/* Vista Previa en Vivo Integrada en el Panel */}
            <div style={{ background: '#011410', padding: '16px', borderRadius: '10px', border: '1px dashed rgba(212, 175, 55, 0.4)' }}>
              <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
                👁️ Vista Previa en Vivo del Banner QR:
              </span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <QrAffiliateOverlay state={state} inlinePreview={true} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. GESTIÓN DE ALERTAS EN VIVO (BIENVENIDAS & REGALOS YOUTUBE) */}
        {/* ========================================================================= */}
        <section id="sec-alertas" style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            paddingBottom: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h2 className="font-cinzel" style={{ fontSize: '1.25rem', color: '#fef3c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔔</span> 8. Alertas en Vivo: Bienvenidas de Telegram & Regalos de YouTube
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              🛡️ Cero Spam en Telegram • Pruebas Directas a Pantalla
            </span>
          </div>

          {alertTriggerStatus && (
            <div style={{
              padding: '10px 16px',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#a7f3d0',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              {alertTriggerStatus}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* A. Alerta de Bienvenida Telegram (Arriba Derecha) */}
            <div style={{
              background: 'rgba(2, 24, 18, 0.8)',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#a7f3d0', fontWeight: 700, fontSize: '0.95rem' }}>
                    🌿 Alerta de Bienvenida (Telegram)
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#021a14', color: '#d4af37', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.3)' }}>
                    📍 Arriba a la Derecha (9s)
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Se dispara automáticamente en tiempo real cuando alguien entra al grupo de Telegram con Makix Bot. Puedes probarla aquí sin enviar mensajes al grupo:
                </p>

                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Nombre del Miembro:</label>
                <input
                  type="text"
                  value={testWelcomeName}
                  onChange={(e) => setTestWelcomeName(e.target.value)}
                  placeholder="Ej: Claudia M. o Carlos R."
                  style={{ width: '100%', padding: '8px', background: '#011410', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#fff', borderRadius: '6px', marginTop: '4px', marginBottom: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => triggerWelcomeAlert()}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  🚀 Probar Bienvenida en Pantalla
                </button>
                <button
                  type="button"
                  onClick={() => triggerWelcomeAlert("María Elena G.")}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#021a14',
                    border: '1px solid rgba(212,175,55,0.4)',
                    color: '#fef08a',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Probar "María Elena G."
                </button>
              </div>
            </div>

            {/* B. Alerta de Regalos / Super Chats de YouTube (Abajo Izquierda) */}
            <div style={{
              background: 'rgba(38, 26, 6, 0.8)',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#fef08a', fontWeight: 700, fontSize: '0.95rem' }}>
                    ⭐ Regalos & Super Chats (YouTube)
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#1c1303', color: '#fef08a', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.4)' }}>
                    📍 Abajo a la Izquierda (15s)
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Agradece donaciones, Super Chats o regalos del directo de YouTube con una burbuja dorada sin solaparse con el código QR:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Nombre Donante:</label>
                    <input
                      type="text"
                      value={testDonationName}
                      onChange={(e) => setTestDonationName(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#140d02', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Monto / Regalo:</label>
                    <input
                      type="text"
                      value={testDonationAmount}
                      onChange={(e) => setTestDonationAmount(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#140d02', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '2px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Mensaje del Donante:</label>
                  <input
                    type="text"
                    value={testDonationMsg}
                    onChange={(e) => setTestDonationMsg(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', background: '#140d02', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '6px', marginTop: '2px', marginBottom: '10px' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerDonationAlert()}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
                  color: '#021a14',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}
              >
                🎁 Probar Alerta de Regalo / Super Chat en Pantalla
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Barra Flotante Inferior Pegada */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '960px',
        padding: '12px 24px',
        borderRadius: '30px',
        background: 'rgba(2, 24, 19, 0.95)',
        border: '1.5px solid #d4af37',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#fef3c7', fontWeight: 600 }}>
            {state.broadcastMode === 'auto_loop' ? '🔄 Bucle Automático' : `📌 Escena: ${state.broadcastMode}`}
          </span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#d4af37' }}>
            {currentEffectiveTheme === 'day' ? '☀️ Día' : '🌙 Noche'}
          </span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
            ⏱️ {state.generalViewDuration}s / {state.fullScreenDuration}s
          </span>
        </div>

        <button
          onClick={() => handleSave()}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #e6c875 0%, #c49a37 100%)',
            color: '#021a14',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.5)'
          }}
        >
          🚀 Guardar y Transmitir
        </button>
      </div>
    </div>
  );
};
