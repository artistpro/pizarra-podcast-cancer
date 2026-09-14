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
     ┌──────────────────────────────────────────────────────────────────────┐
     │         FIREBASE REALTIME DATABASE (pizarrapodcast-9d0cc)            │
     │  • podcast_cancer/board_state (Configuración, Textos, Tiempos)       │
     │  • podcast_cancer/live_alerts/latest (Bienvenidas y Donaciones)      │
     └──────────────────────────────────────────────────────────────────────┘
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
* **v1.8 (12 Septiembre 2026):**  
  **Fondo Bioluminiscente Dinámico, Purga de Incongruencias Visuales y Refresco Headless en Caliente:**
  - *Fondo Ambiental Bioluminiscente Dinámico (`AmbientLiveBackground.tsx`):* Geometría sagrada vectorial SVG en rotación suave a 120s, combinada con orbes flotantes bioluminiscentes acelerados por GPU (`transform: translate3d`) con keyframe `@keyframes emeraldHueBreath`.
  - *Calibración de Color Anti-Crush para YouTube Live:* Transición de verdes profundos a tonos esmeralda y bosque vibrantes (`#064e3b`, `#042f24`, `#02382b`), con opacidad de orbes ajustada al 50-55% y desenfoque óptimo de 58-65px para sobreponerse a la compresión H.264 (YUV 4:2:0) del encoder RTMP.
  - *Purga Radical de Desviaciones Gráficas:* Erradicación definitiva del ID erróneo de Unsplash (mando de PlayStation en hongos medicinales y pastillas de caramelo en semilla negra). Estandarización de las 24 fichas clínicas y 40 obras de arte a fotografía botánica apaisada 16:9 (`w=1200&h=675&fit=crop&q=85`) sin recortes verticales anómalos.
  - *Protocolo de Recarga en Caliente sin Pérdida de Emisión (Cero Caída de Stream):* Procedimiento validado en el servidor VPS 1 (`217.216.48.120:2222`) usando `xdotool` para enviar `Ctrl+Shift+R` a la ventana de Google Chrome Kiosk en el display virtual `:8`. FFmpeg 7+ (PID 2637117) mantuvo la emisión a YouTube RTMP al 100% ininterrumpida.
* **v1.9 (13 Septiembre 2026):**  
  **Saneamiento Total de la Galería de Arte — Cero Unsplash, 100% Obras Reales y Verificables:**
  - *Brushes with Cancer (Programa Real):* Las 4 tarjetas de comunidad activas en la rotación diaria (com-art-11 a com-art-16) reemplazadas con imágenes reales del programa Brushes with Cancer: Rosa Henríquez & Morgen Chesonis González, Caryn Frishman/Ashley Smith (ArtBurst Miami, Gregory Reed), Brushes with Cancer Chicago Winter 2025 (Chicago Social Butterflies).
  - *Maestros Verificados (8 Obras, Met Museum + AIC):* Banco MASTERS_ART_BANK reducido de 20 entradas con Unsplash a 8 obras 100% verificadas: Bierstadt (Met #10150), Klimt, Monet (Art Institute of Chicago), Van Gogh Olivos (Met #437998), Van Gogh Trigo (Met), Van Gogh Girasoles (Met), Hiroshige (Met), Rousseau (Met).
  - *Firebase actualizado vía Python:* Galería del día (256) inyectada directamente al RTDB sin pasar por el cron del VPS para sincronización inmediata.
  - *Bug fix React DOM:* `key={currentItem.id || currentItem.title}` agregado al `<img>` en `FullScreenArt.tsx` para forzar desmontaje/remontaje en cada slide y evitar reciclado de imágenes por el reconciliador de React.
  - *Commits:* `bfe528f`, `4e5eee7`, `443a0f9`
* **v1.10 (14 Septiembre 2026):**  
  **Migración a Firebase Independiente + Upload de Imágenes desde el Admin (Cloudinary):**
  - *Separación de Proyectos Firebase (CRÍTICO):* El proyecto reutilizaba el Firebase `dashboard-bch` perteneciente al proyecto CryptoMinders/BCH. Se creó proyecto Firebase propio `pizarrapodcast-9d0cc` bajo la cuenta `podcastdelcancer@gmail.com`. Datos migrados sin interrupción del stream. El proyecto `dashboard-bch` **no fue modificado en ningún momento**.
  - *Cloudinary como Storage Gratuito:* Firebase Storage requería plan Blaze (pago). Se adoptó Cloudinary (free tier, 25 GB, sin tarjeta de crédito) bajo la misma cuenta del podcast. Upload preset `podcast_cancer` (unsigned) con carpeta `podcast-cancer/` en el cloud `zuxwe5gl`.
  - *Botón 📷 Subir foto en AdminConsole:* Tres nuevos controles de upload en el panel administrativo: sección Arte, sección Noticias (miniatura) y sección Suplementos. Al seleccionar un archivo, sube a Cloudinary y actualiza la URL en RTDB automáticamente, sin necesidad de deploy.
  - *Preview de imagen en el admin:* Cada campo de imagen ahora muestra una miniatura inline (80px) de la imagen actual para verificación visual inmediata.
  - *VPS actualizado:* `auto_art_updater.py` en VPS 1 actualizado con `sed` para apuntar al nuevo RTDB `pizarrapodcast-9d0cc`.
  - *Commits:* `10c0406`

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

### Registro Histórico Certificado

| Identificador | `AUD-20260912-PODCAST-001` |
| :--- | :--- |
| **Fecha de Certificación:** | 12 de Septiembre de 2026 |
| **Módulos Auditados:** | • **Buenas Noticias:** Filtro lingüístico anti-inglés, pool español EFE/Infosalus/Gaceta, banco de 24 referencias integrativas, directriz anti-alarmismo, blindaje YouTube Safe y presupuesto Regla 12 (`.news_budget_ledger.json`).<br>• **Arte Que Sana:** Galería dinámica de 8 obras (4 de sanantes/comunidad + 4 de grandes maestros de la luz), rotación continua de 4 obras cada 24 horas (00:00), guía respiratoria 4x4 en pantalla completa y blindaje total ante desnudez o censura en YouTube.<br>• **Suplementos y Evidencia:** Catálogo maestro de 24 variantes del Protocolo Dr. Pete Sulack en 4 bloques, blindaje indestructible de imágenes contra cuadros vacíos, rotación diaria matemática (sliding window de 4 fichas) y sincronización dual VPS 1 / AdminConsole. |
| **Infraestructura Activa:** | • **VPS 1 (`217.216.48.120:2222`):** Cronjobs verificados a las `06:00/18:00` (`auto_news_updater.py`), a las `00:00` (`auto_art_updater.py`) y a las `00:00` (`auto_supplement_updater.py`).<br>• **Firebase RTDB:** Nodos `goodNews.json` (4 activas), `artCards.json` (8 activas) y `supplementsList.json` (4 activas) sincronizados en tiempo real.<br>• **YouTube Live Stream:** Transmisión 24/7 continua con clave `wy04-7pxe-5w3z-13dr-10a5` en 1080p sin microcortes ni reinicios.<br>• **Frontend (Vercel):** `pizarra-podcast-cancer.vercel.app` sincronizado con control interactivo en `AdminConsole.tsx`. |
| **Conformidad de Reglas:** | Reglas 1 (Aprobación explícita), 3 (Aislamiento de riesgo), 9 (Feedback continuo), 10 (Cero popups), 11 (Cero borrado) y 12 (Budget guard & Circuit breaker) al 100% verificadas. |
| **Commits Oficiales:** | `e3688e0`, `c2f3286`, `f3017a8`, `99a605f`, `3686e2c` |

<br>

| Identificador | `AUD-20260912-PODCAST-002` |
| :--- | :--- |
| **Fecha de Certificación:** | 12 de Septiembre de 2026 |
| **Versión Certificada:** | `v1.8` (Producción Activa en YouTube Live) |
| **Módulos Auditados:** | • **Fondo Ambiental Bioluminiscente Dinámico:** Geometría sagrada vectorial SVG (rotación continua 120s), orbes de luz viva con respiración cromática verde esmeralda y bosque (`#064e3b`, `#042f24`, `#02382b`), calibrados contra compresión YUV 4:2:0 de YouTube Live.<br>• **Saneamiento y Purga de Imágenes:** Erradicación del ID erróneo de Unsplash (PlayStation controller y pastillas de caramelo). Verificación y homologación de 24 suplementos y 40 obras de arte en formato apaisado widescreen 16:9 (`w=1200&h=675&fit=crop&q=85`) en frontend, scripts y Firebase RTDB.<br>• **Rediseño Senior de Tipografía & Arte:** Incremento de legibilidad móvil en tarjetas y citas sin desbordes.<br>• **Filtro Anti-Vacunación/ARNm:** Blindaje editorial en feeds RSS y scripts de noticias para bloquear menciones de vacunas o ARN mensajero.<br>• **Refresco Headless X11 sin Caída de Emisión:** Hot-reload de Google Chrome Kiosk en VPS 1 Display `:8` mediante inyección `xdotool key --window $win ctrl+shift+r` preservando uptime 100% en FFmpeg (PID 2637117). |
| **Infraestructura Activa:** | • **VPS 1 (`217.216.48.120:2222`):** Display Xvfb `:8`, Chrome Kiosk v1.8 activo, FFmpeg 7+ transmitiendo a YouTube RTMP `wy04-7pxe-5w3z-13dr-10a5` (Stream ID `5rJBvQM8hjk`).<br>• **Firebase RTDB (`dashboard-bch`):** Nodo `podcast_cancer/board_state/headerTitle` en `"EL PODCAST DEL CÁNCER v1.8"`, `supplementsList.json` con 4 fichas 16:9 verificadas.<br>• **Frontend Vercel:** Producción actualizada en `https://pizarra-podcast-cancer.vercel.app/`. |
| **Conformidad de Reglas:** | Reglas 1, 3, 9, 10, 11 (cero borrado de archivos) y 12 (presupuesto protegido) estrictamente cumplidas. |
| **Commits Oficiales:** | `3686e2c`, `dbb3cee`, `03e0e1a`, `3c68220` |
| **Evidencia Gráfica:** | Captura de frame en vivo del Display `:8` (`stream_live_capture.jpg`) verificando `v1.8`, geometría sagrada, fondo esmeralda bioluminiscente e imágenes 16:9 reales. |

<br>

| Identificador | `AUD-20260913-PODCAST-003` |
| :--- | :--- |
| **Fecha de Certificación:** | 13 de Septiembre de 2026 |
| **Versión Certificada:** | `v1.9` |
| **Módulos Auditados:** | • **Galería Arte Que Sana — Depuración Total:** Eliminación de todas las imágenes Unsplash del banco de rotación activo. Las 4 tarjetas de comunidad apuntadas en la rotación diaria ahora corresponden a fotografías reales del programa Brushes with Cancer (ArtBurst Miami + Chicago Social Butterflies). Los 8 Grandes Maestros usan objetos verificados del Met Museum (IDs conocidos) y del Art Institute of Chicago.<br>• **Bug Fix React DOM (FullScreenArt.tsx):** `key={currentItem.id}` forzando remontaje del `<img>` entre slides, evitando reciclado de nodo DOM y caché de src previo.<br>• **Validación de Atribuciones:** ChatGPT confirmó que al menos una atribución anterior era incorrecta (Renoir con paisaje de montañas). Todas las obras actuales tienen título, autor, año e institución verificables. |
| **Infraestructura Activa:** | • **Firebase RTDB (`pizarrapodcast-9d0cc`):** Galería del día 256 inyectada con cero Unsplash.<br>• **VPS 1:** Hard refresh ejecutado. Chrome actualizó contenido sin interrupción del stream.<br>• **Vercel:** Commits `bfe528f`, `4e5eee7`, `443a0f9` desplegados en `main`. |
| **Conformidad de Reglas:** | Reglas 1, 3, 9, 10, 11 cumplidas. |
| **Commits Oficiales:** | `bfe528f`, `4e5eee7`, `443a0f9` |

<br>

| Identificador | `AUD-20260914-PODCAST-004` |
| :--- | :--- |
| **Fecha de Certificación:** | 14 de Septiembre de 2026 |
| **Versión Certificada:** | `v1.10` |
| **Incidente Documentado:** | **Reutilización indebida de Firebase de otro proyecto.** Una sesión de IA anterior configuró el proyecto con el Firebase `dashboard-bch` perteneciente al proyecto CryptoMinders/BCH Music, violando el principio de aislamiento de infraestructura. |
| **Módulos Auditados:** | • **Migración Firebase (CRÍTICO):** Creación del proyecto Firebase independiente `pizarrapodcast-9d0cc` bajo cuenta exclusiva `podcastdelcancer@gmail.com`. Backup completo del nodo `podcast_cancer/` (18 KB — `board_state`, `live_alerts`, `sdk_test`) antes de la migración. Restauración en nuevo RTDB vía HTTP PUT. El proyecto `dashboard-bch` **NO fue modificado**.<br>• **Cloudinary Storage:** Firebase Storage descartado (requería plan Blaze de pago). Cloudinary adoptado como almacenamiento gratuito (25 GB, sin tarjeta). Cloud `zuxwe5gl`, preset unsigned `podcast_cancer`, carpeta `podcast-cancer/`.<br>• **Botones de Upload en AdminConsole:** Nuevo componente de upload inline en 3 secciones: Arte (📷), Noticias (📷), Suplementos (📷). Flujo: selección local → Cloudinary → URL en RTDB → stream actualizado en tiempo real. Preview de imagen 80px inline para verificación visual.<br>• **VPS Actualizado:** `auto_art_updater.py` en VPS 1 actualizado vía `sed` para apuntar al nuevo RTDB. Verificado con `grep firebaseio.com` post-cambio.<br>• **Rollback documentado:** Si falla el nuevo Firebase, revertir `firebaseConfig` en `src/firebase.ts` + `git push` = operativo en 2 min. |
| **Infraestructura Post-Migración:** | • **Firebase:** `pizarrapodcast-9d0cc` · `podcastdelcancer@gmail.com` ✅<br>• **Cloudinary:** cloud `zuxwe5gl` · preset `podcast_cancer` ✅<br>• **VPS cron:** apunta a `pizarrapodcast-9d0cc-default-rtdb.firebaseio.com` ✅<br>• **Frontend Vercel:** deploy `10c0406` activo ✅ |
| **Proyecto BCH / CryptoMinders:** | **INTACTO.** Firebase `dashboard-bch` no fue leído, escrito ni modificado durante esta sesión. |
| **Regla Establecida (PERMANENTE):** | **Cada proyecto del ecosistema Andru.ia DEBE tener su propio Firebase, Cloudinary y cuenta de servicio. NUNCA compartir infraestructura entre proyectos distintos.** |
| **Conformidad de Reglas:** | Reglas 1, 3, 9, 10, 11 cumplidas. |
| **Commits Oficiales:** | `10c0406` |

