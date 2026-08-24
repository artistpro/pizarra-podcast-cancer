export interface ArtCard {
  id?: string;
  title: string;
  imageSrc: string;
  caption: string;
  author?: string;
  fullDescription?: string;
}

export interface StoryCard {
  title: string;
  imageSrc: string;
  caption: string;
}

export interface AstralCardData {
  category: string;
  quote: string;
  cta: string;
  quotesList?: string[];
  bgMode?: 'canvas' | 'video';
  videoSrc?: string;
  rotationSpeed?: number;
}

export interface SupplementData {
  id?: string;
  sectionTitle?: string;
  badge?: string;
  subtitle?: string;
  name: string;
  description: string;
  disclaimer: string;
  imageSrc: string;
  keyBenefits?: string[];
  synergies?: string;
  usageTips?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  imageSrc: string;
  source?: string;
  date?: string;
  category?: string;
  keyPoints?: string[];
}

export type ThemeMode = "auto" | "day" | "night";

export type BroadcastMode = 
  | "auto_loop" 
  | "general_fixed" 
  | "fullscreen_astral" 
  | "fullscreen_news" 
  | "fullscreen_supplement" 
  | "fullscreen_art";

export type FullScreenViewType = "astral" | "news" | "supplement" | "art";

export interface BoardState {
  theme: ThemeMode;
  isLive: boolean;
  headerTitle: string;
  headerSubtitle: string;
  
  // Dirección de Emisión & Master Loop
  broadcastMode: BroadcastMode;
  generalViewDuration: number; // Duración de Pizarra General en segundos (ej. 180s = 3 min)
  fullScreenDuration: number;  // Duración de cada Pantalla Completa en segundos (ej. 120s = 2 min)
  activeFullScreenViews: FullScreenViewType[]; // Vistas activas en el bucle
  includeGeneralViewInLoop?: boolean; // Si es false, se suspende la pizarra general y solo emite fichas ampliadas en bucle
  
  // 1. Arte Que Sana (Multificha rotativo)
  artCards: ArtCard[];
  artRotationSpeed?: number; // en segundos (ej. 20s)
  
  // 2. Buenas Noticias (Feed RSS & Carrusel)
  goodNews: NewsItem[];
  newsMode: "carousel" | "list";
  newsRotationSpeed: number; // en segundos (ej. 15s)
  rssUrl: string;
  
  // 3. Tarjeta Astral / Video Central ("AHORA")
  astralCard: AstralCardData;
  
  // 4. Suplementos y Evidencia (Catálogo Multificha rotativo)
  supplementsList: SupplementData[];
  supplementRotationSpeed?: number; // en segundos (ej. 25s)
  
  // 5. Marquesinas Inferiores Dinámicas (Múltiples mensajes)
  dailyReminderLabel?: string;
  dailyReminders: string[];
  dailyReminderRotationSpeed?: number; // en segundos (ej. 18s)
  
  nextLiveLabel?: string;
  nextLiveList: string[];
  nextLiveRotationSpeed?: number; // en segundos (ej. 18s)
  
  // 6. Overlay Código QR Afiliados & Recompensas (iHerb)
  qrOverlayEnabled?: boolean;
  qrOverlayDisplayMode?: "always" | "periodic"; // 'always' = Fijo Permanente, 'periodic' = Intermitente
  qrOverlayCode?: string;
  qrOverlayInterval?: number; // en segundos entre apariciones (ej. 600 = 10 min)
  qrOverlayDuration?: number; // en segundos de duracion visible (ej. 35 = 35 seg)
  qrOverlayTitle?: string;
  qrOverlaySubtitle?: string;
  qrOverlayForceTrigger?: number; // timestamp para forzar aparicion inmediata
  
  // Compatibilidad hacia atrás
  artThatHeals?: ArtCard;
  supplement?: SupplementData;
  dailyReminder?: string;
  nextLive?: string;
  
  lastUpdated?: number;
}

export const getEffectiveTheme = (themeMode: ThemeMode): "day" | "night" => {
  if (themeMode === "day") return "day";
  if (themeMode === "night") return "night";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Semilla diaria para reproducir la misma aleatoriedad (+/- 5 min) del orquestador de emisión
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const offsetDay = ((daySeed * 9301 + 49297) % 233280) % 11 - 5; // -5 a +5 min
  const offsetNight = (((daySeed + 77) * 9301 + 49297) % 233280) % 11 - 5; // -5 a +5 min

  // Turno Día: Base 08:00 a 19:30 (+/- 5 min)
  const dayStart = (8 * 60) + offsetDay; // ~07:55 a 08:05
  const dayEnd = (19 * 60 + 30) + offsetDay; // ~19:25 a 19:35

  // Turno Noche: Base 20:00 a 07:30 (+/- 5 min)
  const nightStart = (20 * 60) + offsetNight; // ~19:55 a 20:05
  const nightEnd = (7 * 60 + 30) + offsetNight; // ~07:25 a 07:35

  // 1. Rango pleno de Turno Día
  if (currentMinutes >= dayStart && currentMinutes < dayEnd) {
    return "day";
  }

  // 2. Rango pleno de Turno Noche (de noche hasta medianoche, o de medianoche a la mañana)
  if (currentMinutes >= nightStart || currentMinutes < nightEnd) {
    return "night";
  }

  // 3. Ventanas de transición (19:30-20:00 atardecer, 07:30-08:00 amanecer) -> Mantener día
  return "day";
};

export const DEFAULT_BOARD_STATE: BoardState = {
  theme: "auto",
  isLive: true,
  headerTitle: "EL PODCAST DEL CÁNCER",
  headerSubtitle: "COMUNIDAD SANANTE",
  
  // Configuración de Emisión en Bucle
  broadcastMode: "auto_loop",
  generalViewDuration: 180, // 3 minutos en Pizarra General
  fullScreenDuration: 120,  // 2 minutos en cada Pantalla Completa
  activeFullScreenViews: ["astral", "news", "supplement", "art"],
  includeGeneralViewInLoop: false, // Suspender pizarra general para privilegiar fichas full-screen en móviles
  
  // Galería de Arte Que Sana
  artCards: [
    {
      id: "art-1",
      title: "ARTE QUE SANA",
      imageSrc: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85",
      caption: "Crear también es una forma de respirar y reconectar con la paz interior",
      author: "Galería Terapéutica",
      fullDescription: "La contemplación del arte estimula la liberación de dopamina y endorfinas, reduciendo la respuesta de estrés del eje HPA y facilitando la serenidad emocional."
    },
    {
      id: "art-2",
      title: "ARTE QUE SANA",
      imageSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85",
      caption: "Los colores expresan y liberan lo que el silencio guarda con amor",
      author: "Arte y Consciencia",
      fullDescription: "El uso consciente de colores cálidos y texturas suaves en la pintura favorece estados meditativos alpha que apoyan la recuperación del sistema nervioso."
    },
    {
      id: "art-3",
      title: "ARTE QUE SANA",
      imageSrc: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85",
      caption: "La belleza de la naturaleza restaura el espíritu y serena el corazón",
      author: "Naturaleza Consciente",
      fullDescription: "La geometría fractal presente en el arte paisajístico y botánico induce una rápida sincronización cerebral restaurativa."
    },
    {
      id: "art-4",
      title: "ARTE QUE SANA",
      imageSrc: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=85",
      caption: "En cada trazo habita la esperanza de una mente clara y renovada",
      author: "Espacio Creativo",
      fullDescription: "El arte es un lenguaje no verbal que permite procesar emociones complejas y transformarlas en fortaleza y proyecto de vida."
    }
  ],
  artRotationSpeed: 20,
  
  // Buenas Noticias
  goodNews: [
    {
      id: "news-1",
      title: "La apreciatividad y la gratitud: multiplicar lo que funciona en la salud",
      description: "Estudios recientes confirman cómo enfocar la atención en los recursos internos, la serenidad y los vínculos significativos promueve una notable resiliencia celular y bienestar emocional.",
      imageSrc: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
      source: "Noticias Positivas",
      category: "BIENESTAR Y SALUD",
      keyPoints: [
        "Incremento del 23% en marcadores de resiliencia inmunológica",
        "Disminución significativa de los picos de cortisol matutino",
        "Mayor adherencia y tolerancia a los procesos terapéuticos",
        "Fortalecimiento del sentido de propósito y proyecto vital"
      ]
    },
    {
      id: "news-2",
      title: "Medicina integrativa y hábitos saludables elevan la calidad de vida",
      description: "Nuevas guías clínicas respaldan la combinación de tratamientos médicos convencionales con nutrición consciente, descanso reparador y técnicas de reducción del estrés.",
      imageSrc: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85",
      source: "Ciencia y Vida",
      category: "EVIDENCIA CIENTÍFICA",
      keyPoints: [
        "Acompañamiento nutricional personalizado según etapa clínica",
        "Prácticas de mindfulness y coherencia cardíaca avaladas",
        "Optimización del sueño profundo para reparación celular",
        "Enfoque centrado en la persona y su entorno familiar"
      ]
    },
    {
      id: "news-3",
      title: "El valor terapéutico del apoyo comunitario y la escucha mutua",
      description: "Compartir vivencias en espacios de empatía reduce significativamente los marcadores de ansiedad y fortalece el proyecto de vida de personas en procesos de recuperación.",
      imageSrc: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
      source: "Salud Consciente",
      category: "ESPERANZA",
      keyPoints: [
        "Reducción del aislamiento y la sobrecarga emocional",
        "Intercambio de recursos prácticos de bienestar cotidiano",
        "Creación de redes de afecto y acompañamiento continuo",
        "Empoderamiento en la toma de decisiones informadas"
      ]
    },
    {
      id: "news-4",
      title: "Caminar en la naturaleza: reducción comprobada de marcadores inflamatorios",
      description: "El contacto consciente con entornos verdes reduce el cortisol y activa el sistema nervioso parasimpático, facilitando la regeneración biológica natural.",
      imageSrc: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85",
      source: "EFE Verde",
      category: "NATURALEZA Y VIDA",
      keyPoints: [
        "Inhalación de fitoncidas emitidos por árboles y plantas",
        "Estimulación de células natural killer (NK) del sistema inmune",
        "Regulación de la presión arterial y ritmo cardíaco",
        "Sensación inmediata de ligereza y despeje mental"
      ]
    }
  ],
  newsMode: "carousel",
  newsRotationSpeed: 30,
  rssUrl: "https://noticiaspositivas.org/feed/",
  
  // Tarjeta Astral / Video
  astralCard: {
    category: "ENERGÍA VITAL Y FORTALEZA INTERIOR",
    quote: "Tu proyecto de vida florece con cada pensamiento de gratitud y serena certeza.",
    cta: "Enlaces de acompañamiento en la descripción ⚡",
    bgMode: "canvas",
    rotationSpeed: 20,
    quotesList: [
      "Tu proyecto de vida florece con cada pensamiento de gratitud y serena certeza.",
      "La serenidad no es la ausencia de tormenta, es la paz profunda en medio de ella.",
      "Hoy elijo abrazar mi presente con confianza, respirar profundo y cuidar mi energía.",
      "Cada célula de tu cuerpo responde a la calma y a la armonía de tus pensamientos."
    ]
  },
  
  // Catálogo de Suplementos
  supplementsList: [
    {
      id: "sup-1",
      sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
      badge: "INFORMACIÓN RESPONSABLE",
      subtitle: "FICHA DE HOY",
      name: "VITAMINA D3",
      description: "Participa de forma fundamental en la salud ósea, la modulación inmunitaria y la respuesta antiinflamatoria. La dosis adecuada depende de analíticas periódicas de 25(OH)D.",
      disclaimer: "Revisa niveles en sangre, dosis personalizada e interacciones con tu médico.",
      imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      keyBenefits: [
        "Regulación de más de 200 genes relacionados con la inmunidad",
        "Mantenimiento de la densidad y mineralización ósea",
        "Apoyo al estado de ánimo y bienestar neuromuscular"
      ],
      synergies: "Sinergia óptima con Vitamina K2 (MK-7) y Magnesio para su correcta activación tisular.",
      usageTips: "Tomar preferentemente con la comida principal que contenga grasas saludables para maximizar su absorción."
    },
    {
      id: "sup-2",
      sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
      badge: "INFORMACIÓN RESPONSABLE",
      subtitle: "FICHA DE HOY",
      name: "MAGNESIO BISGLICINATO",
      description: "Forma de alta biodisponibilidad y excelente tolerancia digestiva. Favorece la relajación muscular, la calma del sistema nervioso y la calidad del sueño profundo reparador.",
      disclaimer: "Consulta tolerancia digestiva, función renal y dosis recomendada con un profesional.",
      imageSrc: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
      keyBenefits: [
        "Cofactor en más de 300 reacciones enzimáticas esenciales",
        "Relajación del tono muscular y alivio de calambres",
        "Activación del neurotransmisor GABA para el descanso nocturno"
      ],
      synergies: "Excelente combinación con L-Teanina o Manzanilla antes de dormir.",
      usageTips: "Consumir 30 a 60 minutos antes de acostarse para inducir un sueño reparador continuo."
    },
    {
      id: "sup-3",
      sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
      badge: "INFORMACIÓN RESPONSABLE",
      subtitle: "FICHA DE HOY",
      name: "OMEGA 3 (EPA / DHA)",
      description: "Ácidos grasos esenciales con amplia evidencia en la modulación del equilibrio inflamatorio corporal, el apoyo a la salud cardiovascular y la función cognitiva.",
      disclaimer: "Verifica certificación de pureza IFOS libre de metales pesados y consulta con tu especialista.",
      imageSrc: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=600&q=80",
      keyBenefits: [
        "Precursores de resolvinas y protectinas antiinflamatorias",
        "Protección de la salud cardiovascular y endotelial",
        "Integridad de las membranas neuronales y soporte anímico"
      ],
      synergies: "Acompañar con antioxidantes naturales (como Vitamina E) para prevenir su oxidación.",
      usageTips: "Almacenar en lugar fresco y oscuro; verificar que no tenga olor rancio."
    },
    {
      id: "sup-4",
      sectionTitle: "SUPLEMENTOS Y EVIDENCIA",
      badge: "INFORMACIÓN RESPONSABLE",
      subtitle: "FICHA DE HOY",
      name: "CURCUMINA FITOSOMADA",
      description: "Compuesto bioactivo con reconocidas propiedades antioxidantes y moduladoras. Su formulación con fosfolípidos o piperina optimiza drásticamente su absorción biológica.",
      disclaimer: "Verifica posibles interacciones farmacológicas con tu equipo de oncología integrativa.",
      imageSrc: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
      keyBenefits: [
        "Potente modulación de vías de señalización celular (NF-kB)",
        "Protección contra el estrés oxidativo tisular",
        "Apoyo al confort articular y digestivo"
      ],
      synergies: "Formulaciones fitosomadas multiplican hasta 29 veces su absorción sistémica.",
      usageTips: "Evitar en casos de obstrucción biliar activa y consultar antes de procedimientos quirúrgicos."
    }
  ],
  supplementRotationSpeed: 25,
  
  // Marquesinas Inferiores Continuas Asíncronas
  dailyReminderLabel: "HOY RECORDAMOS",
  dailyReminders: [
    "No eres un diagnóstico: eres una historia, una familia y un proyecto de vida",
    "El autocuidado y la serenidad son tus mayores aliados en cada paso del camino",
    "Celebrar los pequeños logros diarios fortalece tu sistema y tu bienestar interior",
    "¿Quieres ver tu mensaje o testimonio aquí en la pizarra? Más información en la descripción del directo",
    "Pedir ayuda y descansar cuando tu cuerpo lo necesita también es un acto de valentía"
  ],
  dailyReminderRotationSpeed: 480, // Segundos del ciclo continuo de scroll (desplazamiento hiper pausado de 8 min)
  
  nextLiveLabel: "INVITACIÓN",
  nextLiveList: [
    "Comprender para avanzar: preguntas esenciales que puedes llevar a tu consulta médica",
    "Taller de Nutrición Consciente: hábitos y alimentos que apoyan tu energía vital",
    "Espacio de Acompañamiento: testimonios de resiliencia y esperanza en comunidad",
    "¿Quieres participar con tu caso o pregunta? Escríbenos en los enlaces de la descripción",
    "Directo de Preguntas y Respuestas: resuelve tus dudas en vivo con especialistas"
  ],
  nextLiveRotationSpeed: 390, // Segundos del ciclo continuo de scroll (6.5 min)
  
  // 6. Overlay Código QR Afiliados & Recompensas (iHerb)
  qrOverlayEnabled: true,
  qrOverlayDisplayMode: "periodic",
  qrOverlayCode: "MBG0640",
  qrOverlayInterval: 600, // Cada 10 minutos (600s)
  qrOverlayDuration: 35,  // Visible por 35 segundos
  qrOverlayTitle: "APOYA NUESTRA COMUNIDAD",
  qrOverlaySubtitle: "Escanea y obtén 5% a 10% de DESCUENTO en iHerb"
};

export const normalizeBoardState = (saved: any): BoardState => {
  if (!saved || typeof saved !== 'object') return DEFAULT_BOARD_STATE;

  // 1. Arte Que Sana
  let artCards: ArtCard[] = DEFAULT_BOARD_STATE.artCards;
  if (Array.isArray(saved.artCards) && saved.artCards.length > 0) {
    artCards = saved.artCards.map((a: any, i: number) => ({
      ...(DEFAULT_BOARD_STATE.artCards[i] || DEFAULT_BOARD_STATE.artCards[0]),
      ...a
    }));
  } else if (saved.artThatHeals && saved.artThatHeals.caption) {
    artCards = [
      saved.artThatHeals,
      ...DEFAULT_BOARD_STATE.artCards.filter(a => a.caption !== saved.artThatHeals.caption)
    ];
  }

  // 2. Suplementos
  let supplementsList: SupplementData[] = DEFAULT_BOARD_STATE.supplementsList;
  if (Array.isArray(saved.supplementsList) && saved.supplementsList.length > 0) {
    supplementsList = saved.supplementsList.map((s: any, i: number) => ({
      ...(DEFAULT_BOARD_STATE.supplementsList[i] || DEFAULT_BOARD_STATE.supplementsList[0]),
      ...s
    }));
  } else if (saved.supplement && saved.supplement.name) {
    supplementsList = [
      saved.supplement,
      ...DEFAULT_BOARD_STATE.supplementsList.filter(s => s.name !== saved.supplement.name)
    ];
  }

  // 3. Tarjeta Astral
  const baseAstral = saved.astralCard || DEFAULT_BOARD_STATE.astralCard;
  let quotesList: string[] = DEFAULT_BOARD_STATE.astralCard.quotesList || [];
  if (Array.isArray(baseAstral.quotesList) && baseAstral.quotesList.length > 0) {
    quotesList = baseAstral.quotesList;
  } else if (baseAstral.quote) {
    quotesList = [
      baseAstral.quote,
      ...((DEFAULT_BOARD_STATE.astralCard.quotesList || []).filter(q => q !== baseAstral.quote))
    ];
  }

  // 4. Marquesinas
  let dailyReminders: string[] = DEFAULT_BOARD_STATE.dailyReminders;
  if (Array.isArray(saved.dailyReminders) && saved.dailyReminders.length > 0) {
    dailyReminders = saved.dailyReminders;
  } else if (saved.dailyReminder) {
    dailyReminders = [
      saved.dailyReminder,
      ...DEFAULT_BOARD_STATE.dailyReminders.filter(r => r !== saved.dailyReminder)
    ];
  }

  let nextLiveList: string[] = DEFAULT_BOARD_STATE.nextLiveList;
  if (Array.isArray(saved.nextLiveList) && saved.nextLiveList.length > 0) {
    nextLiveList = saved.nextLiveList;
  } else if (saved.nextLive) {
    nextLiveList = [
      saved.nextLive,
      ...DEFAULT_BOARD_STATE.nextLiveList.filter(l => l !== saved.nextLive)
    ];
  }

  // 5. Buenas Noticias
  let goodNews: NewsItem[] = DEFAULT_BOARD_STATE.goodNews;
  if (Array.isArray(saved.goodNews) && saved.goodNews.length > 0) {
    goodNews = saved.goodNews.map((n: any, i: number) => ({
      ...(DEFAULT_BOARD_STATE.goodNews[i] || DEFAULT_BOARD_STATE.goodNews[0]),
      ...n
    }));
  }

  return {
    ...DEFAULT_BOARD_STATE,
    ...saved,
    broadcastMode: saved.broadcastMode || DEFAULT_BOARD_STATE.broadcastMode || "auto_loop",
    generalViewDuration: saved.generalViewDuration || DEFAULT_BOARD_STATE.generalViewDuration || 180,
    fullScreenDuration: saved.fullScreenDuration || DEFAULT_BOARD_STATE.fullScreenDuration || 120,
    activeFullScreenViews: saved.activeFullScreenViews || DEFAULT_BOARD_STATE.activeFullScreenViews || ["astral", "news", "supplement", "art"],
    includeGeneralViewInLoop: saved.includeGeneralViewInLoop !== undefined ? saved.includeGeneralViewInLoop : false,
    artCards,
    artRotationSpeed: saved.artRotationSpeed || DEFAULT_BOARD_STATE.artRotationSpeed || 20,
    supplementsList,
    supplementRotationSpeed: saved.supplementRotationSpeed || DEFAULT_BOARD_STATE.supplementRotationSpeed || 25,
    astralCard: {
      ...DEFAULT_BOARD_STATE.astralCard,
      ...baseAstral,
      quotesList,
      rotationSpeed: baseAstral.rotationSpeed || DEFAULT_BOARD_STATE.astralCard.rotationSpeed || 20
    },
    goodNews,
    newsRotationSpeed: saved.newsRotationSpeed || DEFAULT_BOARD_STATE.newsRotationSpeed || 30,
    dailyReminders,
    dailyReminderRotationSpeed: (saved.dailyReminderRotationSpeed && saved.dailyReminderRotationSpeed >= 200)
      ? saved.dailyReminderRotationSpeed
      : DEFAULT_BOARD_STATE.dailyReminderRotationSpeed,
    dailyReminderLabel: saved.dailyReminderLabel || DEFAULT_BOARD_STATE.dailyReminderLabel || "HOY RECORDAMOS",
    nextLiveList,
    nextLiveRotationSpeed: (saved.nextLiveRotationSpeed && saved.nextLiveRotationSpeed >= 200)
      ? saved.nextLiveRotationSpeed
      : DEFAULT_BOARD_STATE.nextLiveRotationSpeed,
    nextLiveLabel: (saved.nextLiveLabel && saved.nextLiveLabel.toUpperCase().includes("ESPECIAL"))
      ? "INVITACIÓN"
      : (saved.nextLiveLabel || DEFAULT_BOARD_STATE.nextLiveLabel || "INVITACIÓN"),
    qrOverlayEnabled: saved.qrOverlayEnabled !== undefined ? saved.qrOverlayEnabled : DEFAULT_BOARD_STATE.qrOverlayEnabled,
    qrOverlayDisplayMode: saved.qrOverlayDisplayMode || DEFAULT_BOARD_STATE.qrOverlayDisplayMode || "periodic",
    qrOverlayCode: saved.qrOverlayCode || DEFAULT_BOARD_STATE.qrOverlayCode,
    qrOverlayInterval: saved.qrOverlayInterval || DEFAULT_BOARD_STATE.qrOverlayInterval,
    qrOverlayDuration: saved.qrOverlayDuration || DEFAULT_BOARD_STATE.qrOverlayDuration,
    qrOverlayTitle: saved.qrOverlayTitle || DEFAULT_BOARD_STATE.qrOverlayTitle,
    qrOverlaySubtitle: saved.qrOverlaySubtitle || DEFAULT_BOARD_STATE.qrOverlaySubtitle,
    qrOverlayForceTrigger: saved.qrOverlayForceTrigger || 0
  };
};
