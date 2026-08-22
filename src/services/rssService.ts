import type { NewsItem } from '../types/board';

const DEFAULT_NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
];

const cleanHtmlText = (str: string): string => {
  return str
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
};

export const fetchPositiveNewsFromRSS = async (rssUrl: string): Promise<NewsItem[]> => {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.slice(0, 8).map((item: any, index: number) => {
          let imageSrc = item.thumbnail || item.enclosure?.link;
          if (!imageSrc && item.description) {
            const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageSrc = imgMatch[1];
          }
          if (!imageSrc) {
            imageSrc = DEFAULT_NATURE_IMAGES[index % DEFAULT_NATURE_IMAGES.length];
          }

          const cleanTitle = cleanHtmlText(item.title || "Avance para la salud y el bienestar");
          let cleanDesc = cleanHtmlText(item.description || item.content || "");
          if (cleanDesc.length > 170) {
            cleanDesc = cleanDesc.slice(0, 167) + "...";
          }

          return {
            id: `rss-${Date.now()}-${index}`,
            title: cleanTitle,
            description: cleanDesc || "Avances e investigaciones positivas para potenciar la calidad de vida y el bienestar integral.",
            imageSrc,
            source: data.feed?.title || "Noticias Positivas",
            category: Array.isArray(item.categories) && item.categories[0] ? item.categories[0].toUpperCase() : "BIENESTAR Y SALUD",
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : undefined
          };
        });
      }
    }
  } catch (err) {
    console.warn("Error consultando api.rss2json:", err);
  }

  // Fallback con curated list rica en texto
  return [
    {
      id: "curated-1",
      title: "La apreciatividad y la gratitud: multiplicar lo que funciona en la salud",
      description: "Estudios recientes confirman cómo enfocar la atención en los recursos internos, la serenidad y los vínculos significativos promueve una notable resiliencia celular y bienestar emocional.",
      imageSrc: DEFAULT_NATURE_IMAGES[0],
      source: "Noticias Positivas",
      category: "BIENESTAR Y SALUD"
    },
    {
      id: "curated-2",
      title: "Medicina integrativa y hábitos saludables elevan la calidad de vida",
      description: "Nuevas guías clínicas respaldan la combinación de tratamientos médicos convencionales con nutrición consciente, descanso reparador y técnicas de reducción del estrés.",
      imageSrc: DEFAULT_NATURE_IMAGES[1],
      source: "Ciencia y Vida",
      category: "EVIDENCIA CIENTÍFICA"
    },
    {
      id: "curated-3",
      title: "El valor terapéutico del apoyo comunitario y la escucha mutua",
      description: "Compartir vivencias en espacios de empatía reduce significativamente los marcadores de ansiedad y fortalece el proyecto de vida de personas en procesos de recuperación.",
      imageSrc: DEFAULT_NATURE_IMAGES[2],
      source: "Salud Consciente",
      category: "ESPERANZA"
    }
  ];
};
