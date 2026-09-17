# 🎙️ Pizarra Podcast Cáncer — Dashboard 24/7

**Versión Actual:** v1.11 (Septiembre 2026 — Optimización de Rendimiento Gráfico & Cloudinary)
**Stream en vivo:** [YouTube Live](https://youtube.com) · **Admin:** [https://pizarra-podcast-cancer.vercel.app/?view=admin](https://pizarra-podcast-cancer.vercel.app/?view=admin)

---

## 🏛️ Infraestructura Independiente del Proyecto

> ⚠️ **REGLA DE ORO — NUNCA MEZCLAR PROYECTOS**
> Este proyecto tiene su propia infraestructura aislada. Ningún recurso (Firebase, Cloudinary, dominio, cuenta) es compartido con otros proyectos del ecosistema Andru.ia.

| Servicio | Proyecto | Cuenta | URL / ID |
|---|---|---|---|
| **Firebase RTDB** | `pizarrapodcast-9d0cc` | podcastdelcancer@gmail.com | `https://pizarrapodcast-9d0cc-default-rtdb.firebaseio.com` |
| **Cloudinary** | `podcast-cancer` | podcastdelcancer@gmail.com | Cloud: `zuxwe5gl` · Preset: `podcast_cancer` |
| **Vercel** | `pizarra-podcast-cancer` | — | `https://pizarra-podcast-cancer.vercel.app` |
| **GitHub** | `artistpro/pizarra-podcast-cancer` | — | Branch: `main` |
| **VPS 1** | — | `rik` | `217.216.48.120:2222` · Display `:8` |
| **YouTube Live** | — | — | Stream key: `wy04-7pxe-5w3z-13dr-10a5` |

---

## 🚀 Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Base de datos:** Firebase Realtime Database (WebSocket + REST fallback)
- **Storage de imágenes:** Cloudinary (free tier · 25 GB · sin tarjeta)
- **Deploy:** Vercel (auto-deploy en cada push a `main`)
- **Emisión:** FFmpeg 7+ capturando x11grab Display `:8` → RTMP YouTube

---

## 📁 Estructura de Archivos Clave

```
src/
├── firebase.ts                  # Config Firebase PizarraPodcast + funciones RTDB
├── utils/
│   └── cloudinary.ts            # Upload de imágenes a Cloudinary (sin API secret)
├── components/
│   └── admin/
│       └── AdminConsole.tsx     # Panel de control 24/7 con botones 📷 Subir foto
└── services/
    ├── artService.ts            # Banco de 20 obras (4 Brushes with Cancer + maestros)
    ├── supplementService.ts     # Banco de 24 suplementos (Dr. Pete Sulack)
    └── rssService.ts            # Noticias positivas en español (EFE, Infosalus, etc.)
```

---

## 🔧 Setup Local

```bash
# Clonar
git clone https://github.com/artistpro/pizarra-podcast-cancer.git
cd pizarra-podcast-cancer

# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build
```

---

## 📖 Documentación Completa

- [ARQUITECTURA_Y_ROADMAP.md](./ARQUITECTURA_Y_ROADMAP.md) — Historia, arquitectura técnica, changelog y auditoría
- [MANUAL_SISTEMA_24_7.md](./MANUAL_SISTEMA_24_7.md) — Manual operativo del stream, VPS y crons
