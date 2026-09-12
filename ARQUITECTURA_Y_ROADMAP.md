# 🗺️ Arquitectura, Historia y Roadmap de Mejoras
## Dashboard & Pizarra 24/7 — El Podcast del Cáncer

---

## 📜 1. Origen y Contexto del Proyecto

Este proyecto nació el **22 de Agosto de 2026** como una evolución disruptiva frente a las transmisiones tradicionales basadas en renderizado de archivos de video pesados. 

### El Concepto Central:
En lugar de renderizar videos MP4 con Premiere o After Effects y subirlos a la nube (lo cual requiere horas de render y gigabytes de almacenamiento), desarrollamos una **Pizarra Web Interactiva a 1080p (React 19 + Vite)** ejecutada localmente en un navegador Chromium Headless en la VPS y capturada en tiempo real con **FFmpeg vía `x11grab`**.

**Ventajas clave alcanzadas:**
* **Cero costo de renderizado:** Las noticias, citas y suplementos se actualizan dinámicamente en tiempo real desde la nube sin tocar un solo archivo de video.
* **Control en vivo total:** Desde cualquier dispositivo móvil o navegador mediante la URL administrativa `/?view=admin`, se dirigen las escenas, textos y tiempos.
* **Consumo de recursos ultra bajo:** La VPS trabaja a solo 1.6 de load average emitiendo a 1080p 30 FPS continuos con `-preset ultrafast`.

---

## 🏛️ 2. Arquitectura del Sistema Multi-Capa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ARQUITECTURA TÉCNICA                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [1. CONTROL / DIRECCIÓN]                 [2. FUENTES EXTERNAS]
  • Consola Admin (?view=admin)            • ScienceDaily / EFE Verde / Feeds RSS
  • Alertas de Donaciones / Regalos        • Síntesis con IA (DeepSeek API)
  • Selección de Escenas & Tiempos         • Bot de Telegram (@podcasdelcancer)
               │                                      │
               ▼                                      ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │              FIREBASE REALTIME DATABASE (dashboard-bch)             │
    │  • podcast_cancer/board_state (Configuración, Textos, Tiempos)      │
    │  • podcast_cancer/live_alerts/latest (Bienvenidas y Donaciones)     │
    └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ (WebSocket + REST Fallback)
                      [3. FRONTEND DE EMISIÓN EN VERCEL]
                    https://pizarra-podcast-cancer.vercel.app/
                                      │
                                      ▼ (Render KIOSK 1920x1080 @ 30 FPS)
                     [4. SERVIDOR VPS 1 (217.216.48.120)]
                                 [DISPLAY=:8]
                                      │
  [Astra Radio Online] ────────────┐  │ (Captura x11grab)
  [Audio Naturaleza Loop] ─────────┼──┴────────> [FFmpeg 7+ Multi-Audio Mixer]
  [Audio Solfeggio 528Hz] ─────────┘                     │
                                                         ▼ (RTMP H.264 / AAC)
                                              [5. YOUTUBE LIVE 24/7]
                                            (wy04-7pxe-5w3z-13dr-10a5)
```

---

## 📅 3. Historial de Versiones

* **v1.0 (22 Agosto 2026):**  
  Nacimiento de la pizarra base. Diseño responsivo con escalado automático 1920x1080, tarjeta astral, noticia destacada, suplemento diario y cintas inferiores.
* **v1.1 (23 Agosto 2026):**  
  Tipografía y pesos optimizados (*Senior-Friendly Bold*). Integración de alertas de bienvenida de Telegram y regalos de YouTube. Motor autónomo de incentivo comunitario de 30 minutos. Código QR de afiliados iHerb (`MBG0640`).
* **v1.2 (24 Agosto 2026):**  
  Modo de escenas a pantalla completa (*FullScreen Loop*) para privilegiar la lectura en teléfonos móviles. Alternancia horaria automática Turno Día (esmeralda/oro) y Turno Noche (azul noche cósmico).
* **v1.3 (26 Agosto 2026):**  
  Auditoría multi-servidor y diagnóstico de CPU en VPS 1 (`ultrafast -threads 4` a 1.00x). Mapeo del stream de Odysee en VPS 2 (`195.26.251.31`) y servidor de radios AzuraCast.
* **v1.4 (2 Septiembre 2026):**  
  Persistencia infalible *Dual-Channel* (WebSocket + HTTP REST directo). Eliminación definitiva del bloqueo por `undefined`. Remontado reactivo inmediato de marquesinas (`key={lastUpdated}`). Inyección de las 4 fichas clínicas de oncología integrativa (Azul de Metileno, Vitamina C IV, Cardo Mariano y Cúrcuma).
* **v1.5 (12 Septiembre 2026):**  
  **Blindaje y Optimización de Buenas Noticias & Auditoría Lingüística:**
  - *Tolerancia Cero al Inglés:* Validador lingüístico determinista (`is_spanish_text`) en backend y frontend. Descarte automático y conmutación a banco local si cualquier fuente o IA intenta filtrar texto en inglés.
  - *Filtro Anti-Alarmismo:* Bloqueo estricto de términos de miedo, fatalismo o cifras de mortalidad. Directriz de esperanza, calma interior y evidencia en medicina integrativa.
  - *Pool Multifuente en Español:* Integración de EFE Salud, Infosalus, Gaceta Médica y Noticias Positivas con filtro temático de salud y biología celular.
  - *Banco Curado de 24 Referencias Clínicas:* Expansión a 24 monografías clínicas que rotan matemáticamente cada día del mes sin repeticiones.
  - *Salvaguarda de Presupuesto (Regla 12):* Disyuntor anti-bucles (*Circuit Breaker*) y ledger atómico `.news_budget_ledger.json` con tope de 10 llamadas/día para DeepSeek API.
  - *Despliegue Multi-Entorno:* Actualizado en VPS 1 (`/home/rik/streams/podcast_cancer/scripts/auto_news_updater.py`) y sincronizado con Vercel (`pizarra-podcast-cancer.vercel.app`, commit `e3688e0`).
* **v1.6 (12 Septiembre 2026):**  
  **Galería Dinámica "Arte Que Sana" (8 Obras, Rotación Diaria & Balance 50/50):**
  - *Galería Activa de 8 Obras:* Carrusel continuo en pantalla general y formato museo en pantalla completa con guía de respiración 4x4 (*Inhala, Retén, Exhala, Paz*).
  - *Balance Comunitario y Universal:* 50% Obras y testimonios reales de pacientes y sobrevivientes oncológicos (iniciativas de arte-terapia) + 50% Grandes Maestros del Impresionismo y Luz (Monet, Van Gogh, Klimt, etc.).
  - *Algoritmo de Rotación 24h:* Banco maestro de 40 obras con ventana deslizante diaria (`offset = (día * 2) % 20`): 4 obras nuevas cada día a las 00:00 y 4 conservadas.
  - *Blindaje Total YouTube Live:* Cero desnudez, cero términos anatómicos/sensibles, cero imágenes quirúrgicas para garantizar streaming libre de penalizaciones.
  - *Automatización Full-Stack:* Script `auto_art_updater.py` con cron a las 00:00 en VPS 1 inyectando en Firebase RTDB y botón interactivo *"✨ Sincronizar Galería de Hoy"* en `AdminConsole.tsx`.
* **v1.7 (12 Septiembre 2026):**  
  **Catálogo Maestro de 24 Suplementos (Protocolo Dr. Pete Sulack) & Blindaje de Imágenes:**
  - *24 Variantes Clínicas en 4 Bloques:* Basado en el Protocolo de Resiliencia del Dr. Sulack y oncología metabólica (Bloque A: Mitocondrial/Energía, Bloque B: Inmunidad/Metabolismo, Bloque C: Genética/Metilación, Bloque D: Intestino/Detox).
  - *Blindaje Triple de Imágenes:* Eliminación total del bug `display: none` en `SupplementCard.tsx` y `FullScreenSupplement.tsx`. Fallback indestructible a `FALLBACK_SUPPLEMENT_IMAGE` con conmutación en 1 frame; cero cajas vacías en la transmisión.
  - *Rotación Diaria Continua (Sliding Window):* Ventana deslizante matemática `(día * 2) % 24` para exhibir 4 suplementos en carrusel rotando 2 nuevos cada medianoche (00:00).
  - *Automatización y Administración:* Script `auto_supplement_updater.py` en VPS 1 (Cron `0 0 * * *`) inyectando en `supplementsList.json` y `supplement.json`, y botones de 1-clic (*"✨ Sincronizar Fichas de Hoy"* y *"📚 Cargar las 24 Variantes"*) en `AdminConsole.tsx`.

---

## 🚀 4. Próximas Mejoras y Roadmap (Para continuar en esta carpeta)

### 🔹 Fase 1: Catálogo Clínico Integrativo (Completado en v1.7)
- [x] Ampliar el banco de fichas de suplementación a 24 referencias clínicas integrativas basadas en el protocolo del Dr. Pete Sulack.
- [x] Blindaje triple de imágenes contra pantallas vacías o fallos de red.
- [x] Rotación matemática diaria continua en el carrusel de emisión (4 activas por día).
- [ ] Selector por categorías en el admin: *Inmunomodulación*, *Hepatoprotección*, *Respiración Mitocondrial*, *Calidad de Sueño*.

### 🔹 Fase 2: Interactividad en Vivo con la Audiencia
- [ ] Conector con la API de Chat en Vivo de YouTube para proyectar comentarios destacados o preguntas frecuentes en la marquesina superior.
- [ ] Módulo de encuestas o preguntas del día administrables desde el panel.

### 🔹 Fase 3: Automatización de Noticias con Telegram
- [ ] Notificación automática en el grupo público de Telegram cada vez que el cron de DeepSeek procese y publique una nueva noticia positiva en la pantalla.

### 🔹 Fase 4: Reproductor y Audio Visualizer
- [ ] Visualizador de espectro de audio (onda senoidal o barras de frecuencia sutiles en la esquina) sincronizado con el streaming de Astra Radio.

---

## 📋 5. Huella de Auditoría y Verificación de Producción (Audit Trail)

| Identificador | `AUD-20260912-PODCAST-001` |
| :--- | :--- |
| **Fecha de Certificación:** | 12 de Septiembre de 2026 |
| **Módulos Auditados:** | • **Buenas Noticias:** Filtro lingüístico anti-inglés, pool español EFE/Infosalus/Gaceta, banco de 24 referencias integrativas, directriz anti-alarmismo, blindaje YouTube Safe y presupuesto Regla 12 (`.news_budget_ledger.json`).<br>• **Arte Que Sana:** Galería dinámica de 8 obras (4 de sanantes/comunidad + 4 de grandes maestros de la luz), rotación continua de 4 obras cada 24 horas (00:00), guía respiratoria 4x4 en pantalla completa y blindaje total ante desnudez o censura en YouTube.<br>• **Suplementos y Evidencia:** Catálogo maestro de 24 variantes del Protocolo Dr. Pete Sulack en 4 bloques, blindaje indestructible de imágenes contra cuadros vacíos, rotación diaria matemática (sliding window de 4 fichas) y sincronización dual VPS 1 / AdminConsole. |
| **Infraestructura Activa:** | • **VPS 1 (`217.216.48.120:2222`):** Cronjobs verificados a las `06:00/18:00` (`auto_news_updater.py`), a las `00:00` (`auto_art_updater.py`) y a las `00:00` (`auto_supplement_updater.py`).<br>• **Firebase RTDB:** Nodos `goodNews.json` (4 activas), `artCards.json` (8 activas) y `supplementsList.json` (4 activas) sincronizados en tiempo real.<br>• **YouTube Live Stream:** Transmisión 24/7 continua con clave `wy04-7pxe-5w3z-13dr-10a5` en 1080p sin microcortes ni reinicios.<br>• **Frontend (Vercel):** `pizarra-podcast-cancer.vercel.app` sincronizado con control interactivo en `AdminConsole.tsx`. |
| **Conformidad de Reglas:** | Reglas 1 (Aprobación explícita), 3 (Aislamiento de riesgo), 9 (Feedback continuo), 10 (Cero popups), 11 (Cero borrado) y 12 (Budget guard & Circuit breaker) al 100% verificadas. |
| **Commits Oficiales:** | `e3688e0`, `c2f3286`, `f3017a8`, `99a605f`, `3686e2c` |


