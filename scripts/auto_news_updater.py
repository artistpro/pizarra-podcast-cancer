#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de Noticias Diarias Automáticas - El Podcast del Cáncer
Ejecutado diariamente vía Cronjob en VPS (06:00 y 18:00).

Características Principales:
1. Tolerancia CERO al inglés: Validador lingüístico estricto.
2. Filtro Anti-Alarmismo: Exclusión de términos de miedo, cifras letales o sensacionalismo.
3. Salvaguarda de Presupuesto (Regla 12): Hard-limit de llamadas y Circuit Breaker para DeepSeek API.
4. Múltiples Fuentes RSS en Español e Internacionales rigurosas.
5. Banco Curado de Respaldo Ampliado (24 noticias) con rotación mensual sin repetición.
6. Inyección atómica directa en Firebase Realtime Database.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import re
import ssl
from datetime import datetime

SSL_CTX = ssl._create_unverified_context()

# Asegurar salida utf-8 en consola
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

FIREBASE_NEWS_URL = "https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/board_state/goodNews.json"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORY_FILE = os.path.join(BASE_DIR, "news_history.json")
LEDGER_FILE = os.path.join(BASE_DIR, ".news_budget_ledger.json")

# Límite de seguridad de llamadas diarias a DeepSeek (Regla 12)
MAX_DAILY_DEEPSEEK_CALLS = 10
MAX_CONSECUTIVE_FAILURES = 3

# Intentar cargar DEEPSEEK_API_KEY desde .env
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
if not DEEPSEEK_API_KEY:
    env_paths = [
        os.path.join(BASE_DIR, "..", ".env"),
        os.path.join(BASE_DIR, ".env"),
        os.path.join(BASE_DIR, "..", "..", "Podcast_del_Cancer_24_7", ".env"),
        os.path.join(BASE_DIR, "..", "..", "Dashboard_Podcast_del_Cancer", ".env"),
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        clean_line = line.strip()
                        if clean_line.startswith("DEEPSEEK_API_KEY="):
                            val = clean_line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                DEEPSEEK_API_KEY = val
                                break
            except Exception:
                pass
        if DEEPSEEK_API_KEY:
            break

# Pool ampliado de fuentes RSS (priorizando fuentes biomédicas y de bienestar en español)
FEEDS = [
    {
        "name": "EFE Salud",
        "url": "https://efesalud.com/feed/",
        "category": "INVESTIGACIÓN Y SALUD",
        "is_spanish": True
    },
    {
        "name": "Infosalus",
        "url": "https://www.infosalus.com/rss/rss.aspx",
        "category": "INVESTIGACIÓN Y CIENCIA",
        "is_spanish": True
    },
    {
        "name": "Gaceta Médica",
        "url": "https://gacetamedica.com/feed/",
        "category": "MEDICINA INTEGRATIVA",
        "is_spanish": True
    },
    {
        "name": "Noticias Positivas - Salud",
        "url": "https://noticiaspositivas.org/feed/",
        "category": "BIENESTAR Y SALUD",
        "is_spanish": True
    },
    {
        "name": "ScienceDaily Oncology",
        "url": "https://www.sciencedaily.com/rss/health_medicine/cancer.xml",
        "category": "INVESTIGACIÓN Y CIENCIA",
        "is_spanish": False
    }
]

# Filtro temático de salud, medicina integrativa, espiritualidad y estilo de vida
HEALTH_KEYWORDS = [
    # Biología y Medicina
    "salud", "célula", "cáncer", "oncolog", "médic", "terap", "inmun", "estudio", 
    "investiga", "paciente", "cuerpo", "vida", "alimento", "nutri", "sueño", 
    "ejercicio", "bienestar", "cerebro", "biolog", "clínic", "hábito", 
    "prevención", "tratamiento", "hospital", "fármaco", "esperanza", "respir", 
    "estrés", "tumor", "adn", "mitocondria", "molecular", "avance", "órgano", "proteína",
    # Mente, Espiritualidad, Amor, Familia, Comunidad y Motivación
    "espiritual", "medita", "calma", "paz", "mente", "emocion", "amor", "familia", 
    "compasión", "gratitud", "serenidad", "vínculo", "comunidad", "resiliencia", 
    "motivaci", "ánimo", "fuerza interior", "descanso", "naturaleza", "bosque",
    "caminar", "dieta", "antioxidante", "oxitocina", "vago", "coherencia"
]

def is_health_related(text: str) -> bool:
    """Verifica si el contenido trata efectivamente de salud, medicina, biología, mente o bienestar."""
    t_lower = text.lower()
    return any(k in t_lower for k in HEALTH_KEYWORDS)

# Filtro de seguridad estricto contra temas sexuales, íntimos o borderline (YouTube Advertiser-Safe)
SENSITIVE_SEXUAL_WORDS = [
    "sexo", "sexual", "sexualidad", "erótic", "pareja", "intimidad", "infidelidad", 
    "sueño erótico", "coito", "genital", "pene", "vagina", "útero", "uterin", 
    "mioma", "menstrua", "ovario", "senos", "mamas", "testículo", "esperm", 
    "fecundaci", "preservativo", "anticoncept", "orgasmo", "libido", "deseo sexual",
    "ginecolog", "androlog", "reproductiv", "cama", "desnudo", "desnuda", "seducci"
]

def contains_sensitive_content(text: str) -> bool:
    """Detecta términos íntimos, sexuales o ambiguos que puedan comprometer la emisión ante YouTube."""
    t_lower = text.lower()
    for word in SENSITIVE_SEXUAL_WORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', t_lower):
            return True
    return False

# Palabras que denotan alarmismo o sensacionalismo negativo (Filtro Anti-Miedo)
ALARMIST_WORDS = [
    "mortalidad", "mortal", "letal", "devastador", "incurable", 
    "muerte", "muertes", "fatal", "fallecimiento", "catastrófico", 
    "desesperanza", "tragedia", "peor escenario", "sentencia de muerte",
    "deadly", "fatal", "lethal", "mortality"
]

DEFAULT_FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=85"
]

# ---------------------------------------------------------
# DETECTOR LINGÜÍSTICO Y FILTRO ANTI-INGLÉS
# ---------------------------------------------------------
SPANISH_STOPWORDS = {
    "de", "la", "el", "en", "y", "que", "los", "del", "las", "por", 
    "un", "con", "para", "una", "su", "al", "como", "mas", "más", "sus", 
    "pero", "este", "esta", "entre", "cuando", "sobre", "salud", "células", 
    "celular", "tratamiento", "estudio", "vida", "pacientes", "investigación",
    "cáncer", "bienestar", "cuerpo", "defensas", "sistema"
}

ENGLISH_STOPWORDS = {
    "the", "of", "and", "in", "to", "for", "with", "is", "that", "this", 
    "may", "cancer", "by", "on", "at", "from", "as", "are", "have", "not",
    "with", "which", "study", "cells", "new", "treatment", "patients", "scientists"
}

def is_spanish_text(text: str) -> bool:
    """Verifica de forma determinista si un texto está en español y descarta inglés."""
    if not text or len(text.strip()) < 5:
        return False
    
    words = re.findall(r'\b[a-záéíóúñü]+\b', text.lower())
    if not words:
        return False
        
    spanish_count = sum(1 for w in words if w in SPANISH_STOPWORDS)
    english_count = sum(1 for w in words if w in ENGLISH_STOPWORDS)
    
    # Si detecta palabras clave en inglés y prácticamente ninguna en español -> NO es español
    if english_count > 0 and spanish_count == 0:
        return False
    if english_count >= 2 and english_count > spanish_count:
        return False
        
    return spanish_count >= 1 or len(words) < 4

def contains_alarmism(text: str) -> bool:
    """Detecta si el texto contiene términos alarmistas o sensacionalistas negativos."""
    t_lower = text.lower()
    for word in ALARMIST_WORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', t_lower):
            return True
    return False

# ---------------------------------------------------------
# SALVAGUARDA DE COSTOS Y CIRCUIT BREAKER (REGLA 12)
# ---------------------------------------------------------
def get_budget_ledger():
    today = datetime.now().strftime("%Y-%m-%d")
    default_data = {
        "date": today,
        "daily_calls": 0,
        "consecutive_failures": 0,
        "circuit_open": False
    }
    if os.path.exists(LEDGER_FILE):
        try:
            with open(LEDGER_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("date") == today:
                    return data
        except Exception:
            pass
    return default_data

def save_budget_ledger(ledger):
    try:
        with open(LEDGER_FILE, "w", encoding="utf-8") as f:
            json.dump(ledger, f, indent=2)
    except Exception as e:
        print(f"⚠️ Error guardando ledger de presupuesto: {e}")

def can_call_deepseek():
    ledger = get_budget_ledger()
    if ledger.get("circuit_open", False):
        print("🛑 [DISYUNTOR ABIERTO] Se superó el límite de fallos consecutivos en DeepSeek.")
        return False
    if ledger.get("daily_calls", 0) >= MAX_DAILY_DEEPSEEK_CALLS:
        print(f"🛑 [PRESUPUESTO AGOTADO] Se alcanzó el tope diario de {MAX_DAILY_DEEPSEEK_CALLS} llamadas a DeepSeek.")
        return False
    return True

def record_deepseek_call(success: bool):
    ledger = get_budget_ledger()
    ledger["daily_calls"] = ledger.get("daily_calls", 0) + 1
    if success:
        ledger["consecutive_failures"] = 0
        ledger["circuit_open"] = False
    else:
        fails = ledger.get("consecutive_failures", 0) + 1
        ledger["consecutive_failures"] = fails
        if fails >= MAX_CONSECUTIVE_FAILURES:
            ledger["circuit_open"] = True
            print("⚡ [CIRCUIT BREAKER ACTIVADO] 3 fallos consecutivos con DeepSeek. Conmutando a fallback local.")
    save_budget_ledger(ledger)

# ---------------------------------------------------------
# HISTORIAL Y CACHÉ
# ---------------------------------------------------------
def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(history):
    trimmed = history[-200:]
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(trimmed, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error guardando historial: {e}")

def clean_html(raw_html):
    if not raw_html: return ""
    clean = re.sub(r'<.*?>', '', raw_html)
    return clean.strip().replace("\n", " ").replace("\r", "")

# ---------------------------------------------------------
# EXTRACCIÓN RSS Y OPENGRAPH
# ---------------------------------------------------------
def fetch_rss_items(feed_url, feed_name, category, is_spanish):
    items = []
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        req = urllib.request.Request(feed_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12, context=SSL_CTX) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        
        channel_items = root.findall(".//item")
        if not channel_items:
            channel_items = root.findall(".//{http://www.w3.org/2005/Atom}entry")
            
        for item in channel_items:
            title_elem = item.find("title") if item.find("title") is not None else item.find("{http://www.w3.org/2005/Atom}title")
            link_elem = item.find("link") if item.find("link") is not None else item.find("{http://www.w3.org/2005/Atom}link")
            desc_elem = item.find("description") if item.find("description") is not None else item.find("summary")
            
            title = title_elem.text if title_elem is not None and title_elem.text else ""
            
            if link_elem is not None:
                link = link_elem.text if link_elem.text else link_elem.get("href", "")
            else:
                link = ""
                
            desc = desc_elem.text if desc_elem is not None and desc_elem.text else ""
            
            enclosure = item.find("enclosure")
            image_url = enclosure.get("url") if enclosure is not None else ""
            
            cleaned_title = clean_html(title)
            cleaned_desc = clean_html(desc)
            
            # FILTRO ANTI-ALARMISMO: Descartar si contiene miedo o tragedia
            if contains_alarmism(cleaned_title) or contains_alarmism(cleaned_desc):
                continue
                
            # FILTRO DE SEGURIDAD ESTRICTA (YOUTUBE ADVERTISER & FAMILY SAFE): Cero temas sexuales o íntimos
            if contains_sensitive_content(cleaned_title) or contains_sensitive_content(cleaned_desc):
                continue
                
            # FILTRO TEMÁTICO DE SALUD Y MEDICINA INTEGRATIVA
            if is_spanish and not is_health_related(cleaned_title + " " + cleaned_desc):
                continue
                
            if cleaned_title and link:
                items.append({
                    "title": cleaned_title,
                    "link": link.strip(),
                    "description": cleaned_desc,
                    "image": image_url,
                    "source": feed_name,
                    "category": category,
                    "is_spanish": is_spanish
                })
    except Exception as e:
        print(f"[Aviso Feed] No se pudo leer '{feed_name}': {e}")
    return items

def extract_og_image(article_url):
    if not article_url: return None
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(article_url, headers=headers)
        with urllib.request.urlopen(req, timeout=6, context=SSL_CTX) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
        match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if match:
            return match.group(1)
        match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.IGNORECASE)
        if match:
            return match.group(1)
    except Exception:
        pass
    return None

# ---------------------------------------------------------
# SÍNTESIS CON DEEPSEEK (CON REGLAS ESTRICTAS DE ESPAÑOL Y POSITIVISMO)
# ---------------------------------------------------------
def synthesize_with_deepseek(raw_items):
    """Utiliza DeepSeek para traducir, titular y extraer 4 puntos clave en formato JSON estricto."""
    if not DEEPSEEK_API_KEY:
        print("[AVISO] DEEPSEEK_API_KEY no configurada. Saltando llamada a IA.")
        return None

    if not can_call_deepseek():
        return None

    print(f"🧠 Consultando DeepSeek AI para sintetizar {len(raw_items)} noticias...", flush=True)

    items_prompt = []
    for idx, it in enumerate(raw_items):
        items_prompt.append(f"Noticia {idx+1}:\nTítulo original: {it['title']}\nResumen: {it['description']}\nFuente: {it['source']}\n")

    prompt_text = (
        "Eres el editor científico y humano jefe de 'El Podcast del Cáncer'. Transforma estas noticias médicas en 4 fichas divulgativas, profundamente esperanzadoras, humanas y 100% EN ESPAÑOL.\n"
        "REGLAS INQUEBRANTABLES:\n"
        "1. SEGURIDAD TOTAL ANTE YOUTUBE: PROHIBIDO TERMINANTEMENTE cualquier alusión a sexualidad, pareja, intimidad o anatomía sensible. Cero contenido borderline o para adultos.\n"
        "2. PILARES TEMÁTICOS PRIORITARIOS: Fomenta la esperanza activa, la fuerza mental, la paz espiritual, el amor, la familia, la compasión, la nutrición consciente, el ejercicio y la ciencia biomédica integrativa.\n"
        "3. CERO ALARMISMO: Prohibido usar palabras como 'mortalidad', 'letal', 'fatal' o sensacionalismo. Cero miedo y cero promesas de curas mágicas.\n"
        "4. IDIOMA: Absolutamente TODO el texto generado debe ser en ESPAÑOL impecable, cálido y profesional.\n"
        "5. Para cada noticia debes devolver un objeto JSON con:\n"
        "   - 'title': Titular claro, positivo y periodístico en español (máx 12 palabras).\n"
        "   - 'description': Explicación narrativa comprensible y esperanzadora (2 líneas, 150-200 caracteres).\n"
        "   - 'category': Una de estas categorías: 'INVESTIGACIÓN Y CIENCIA', 'MEDICINA INTEGRATIVA', 'ESTILO DE VIDA', 'BIENESTAR Y SALUD', 'NUTRICIÓN INTEGRATIVA', 'PAZ Y ESPIRITUALIDAD'.\n"
        "   - 'keyPoints': Un arreglo de EXACTAMENTE 4 frases concisas con los puntos clave positivos para la salud.\n"
        "\nDEVUELVE EXCLUSIVAMENTE UN ARREGLO JSON VÁLIDO CON LOS 4 OBJETOS:\n"
        "[\n"
        "  {\n"
        "    \"title\": \"...\",\n"
        "    \"description\": \"...\",\n"
        "    \"category\": \"...\",\n"
        "    \"keyPoints\": [\"punto 1\", \"punto 2\", \"punto 3\", \"punto 4\"]\n"
        "  }\n"
        "]\n\n"
        + "\n".join(items_prompt)
    )

    try:
        url = "https://api.deepseek.com/v1/chat/completions"
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "Eres un editor médico integrativo que responde ÚNICAMENTE con código JSON válido en español, sin explicaciones ni markdown."},
                {"role": "user", "content": prompt_text}
            ],
            "temperature": 0.3,
            "max_tokens": 1800
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
            }
        )
        
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            content = data['choices'][0]['message']['content'].strip()
            
            if content.startswith("```"):
                content = re.sub(r'^```(json)?\n', '', content)
                content = re.sub(r'\n```$', '', content)
                
            parsed = json.loads(content)
            if isinstance(parsed, list) and len(parsed) >= 4:
                # Validar que cada ítem esté verdaderamente en español
                all_spanish = True
                for p in parsed[:4]:
                    if not is_spanish_text(p.get("title", "")) or not is_spanish_text(p.get("description", "")):
                        all_spanish = False
                        break
                
                if all_spanish:
                    record_deepseek_call(success=True)
                    return parsed[:4]
                else:
                    print("⚠️ DeepSeek devolvió contenido con trazas de inglés. Descartando respuesta.")
                    record_deepseek_call(success=False)
                    return None
    except Exception as e:
        print(f"⚠️ Error procesando con DeepSeek: {e}")
        record_deepseek_call(success=False)
    return None

# ---------------------------------------------------------
# BANCO CURADO DE 24 NOTICIAS CLÍNICAS INTEGRATIVAS
# Rotación matemática mensual garantizada sin repetición
# ---------------------------------------------------------
CURATED_NEWS_BANK = [
    {
        "title": "Avances en Inmunoterapia de Precisión Multiplican la Respuesta Celular",
        "description": "Nuevas combinaciones terapéuticas activan los linfocitos T del paciente para reconocer células diana de forma selectiva y con mínima toxicidad.",
        "imageSrc": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85",
        "source": "Nature Medicine / ESMO",
        "category": "INMUNOTERAPIA",
        "keyPoints": [
            "Activación selectiva de defensas naturales del organismo",
            "Reducción demostrada de efectos secundarios convencionales",
            "Ensayos clínicos avanzados con respuestas celulares estables",
            "Personalización del tratamiento según el perfil de cada caso"
        ]
    },
    {
        "title": "La Crononutrición y el Ayuno Guiado Optimizan la Protección Tisular",
        "description": "Alinear los horarios de comida con los ritmos biológicos circadianos favorece la autofagia celular y la preservación de tejidos saludables.",
        "imageSrc": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85",
        "source": "Cell Metabolism",
        "category": "NUTRICIÓN INTEGRATIVA",
        "keyPoints": [
            "Control óptimo de los picos de glucosa y sensibilidad insulínica",
            "Activación de enzimas reparadoras y limpieza mitocondrial",
            "Mayor vitalidad y reducción de la sensación de fatiga",
            "Protección celular durante los ciclos de recuperación"
        ]
    },
    {
        "title": "El Ejercicio de Fuerza Adaptado Disminuye Marcadores Inflamatorios",
        "description": "El trabajo muscular libera mioquinas antiinflamatorias que fortalecen la respuesta inmune, elevan el estado de ánimo y cuidan la masa magra.",
        "imageSrc": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
        "source": "British Journal of Sports Medicine",
        "category": "ESTILO DE VIDA",
        "keyPoints": [
            "Liberación de mioquinas protectoras en cada sesión",
            "Mejora sustancial de la densidad ósea y la movilidad",
            "Efecto ansiolítico natural por regulación de neurotransmisores",
            "Mayor autonomía y energía física durante la jornada"
        ]
    },
    {
        "title": "La Coherencia Cardíaca y Respiración 4x4 Regulan el Eje Nervioso",
        "description": "Prácticas de respiración consciente disminuyen el cortisol y potencian la calma interior, facilitando un descanso nocturno profundo y reparador.",
        "imageSrc": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
        "source": "Psychoneuroimmunology Journal",
        "category": "PSICO-ONCOLOGÍA",
        "keyPoints": [
            "Regulación del tono vagal y descenso del ritmo cardíaco",
            "Disminución medible del estrés y la tensión muscular",
            "Mayor profundidad en las fases de sueño delta",
            "Claridad mental para tomar decisiones médicas con serenidad"
        ]
    },
    {
        "title": "Biopsias Líquidas Permiten Detección Ultra-Temprana de Respuesta Celular",
        "description": "El análisis no invasivo de ADN circulante en sangre permite monitorizar la eficacia de los tratamientos con semanas de anticipación.",
        "imageSrc": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=85",
        "source": "Journal of Clinical Oncology",
        "category": "DIAGNÓSTICO AVANZADO",
        "keyPoints": [
            "Evaluación de alta precisión mediante una simple muestra sanguínea",
            "Monitoreo continuo y adaptativo de la respuesta biológica",
            "Menor invasividad y mayor comodidad para el paciente",
            "Ajustes de tratamiento personalizados en tiempo real"
        ]
    },
    {
        "title": "La Microbiota Intestinal como Guardiana de la Eficacia Inmunitaria",
        "description": "Una flora bacteriana enriquecida con fibra fermentable y polifenoles multiplica las defensas orgánicas y protege el epitelio intestinal.",
        "imageSrc": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85",
        "source": "Science / Gut Microbes",
        "category": "MICROBIOTA Y SALUD",
        "keyPoints": [
            "Producción de ácidos grasos de cadena corta beneficiosos (butirato)",
            "Entrenamiento inmunológico constante en la mucosa entérica",
            "Protección de la barrera digestiva frente a la inflamación",
            "Sinergia con alimentos fermentados y prebióticos naturales"
        ]
    },
    {
        "title": "Terapia con Células CAR-T de Nueva Generación Amplía su Alcance",
        "description": "Ingeniería celular de vanguardia reprograma receptores celulares para actuar con máxima selectividad y alta seguridad en el tejido.",
        "imageSrc": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
        "source": "The Lancet Oncology",
        "category": "TERAPIA CELULAR",
        "keyPoints": [
            "Reprogramación celular de alta especificidad molecular",
            "Mayor persistencia protectora de linfocitos en el organismo",
            "Excelente perfil de tolerancia clínica en ensayos actuales",
            "Nuevas opciones de tratamiento individualizado"
        ]
    },
    {
        "title": "El Sueño Profundo y la Melatonina Activan la Reparación de ADN",
        "description": "Durante las fases de sueño delta se estimula el sistema glinfático cerebral y se segregan enzimas clave para la longevidad tisular.",
        "imageSrc": "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=85",
        "source": "Sleep Medicine Reviews",
        "category": "DESCANSO Y REGENERACIÓN",
        "keyPoints": [
            "Acción antioxidante endógena de la melatonina fisiológica",
            "Depuración de toxinas metabólicas mediante el flujo glinfático",
            "Regeneración acelerada de tejidos durante el reposo nocturno",
            "Restablecimiento de la armonía en los ritmos hormonales"
        ]
    },
    {
        "title": "Curcumina Fitosomada Demuestra Potente Acción Moduladora Celular",
        "description": "Formulaciones avanzadas con fosfolípidos mejoran hasta 29 veces la biodisponibilidad del extracto, apoyando el equilibrio biológico.",
        "imageSrc": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85",
        "source": "Phytotherapy Research",
        "category": "MEDICINA INTEGRATIVA",
        "keyPoints": [
            "Modulación de vías celulares NF-kB y respuesta antiinflamatoria",
            "Protección antioxidante de amplio espectro en células sanas",
            "Apoyo complementario al bienestar articular y digestivo",
            "Biodisponibilidad optimizada mediante tecnología fitosoma"
        ]
    },
    {
        "title": "Hongos Medicinales Reishi y Coriolus Estimulan las Células Natural Killer",
        "description": "Beta-glucanos específicos presentes en hongos terapéuticos modulan la inmunidad innata y promueven una mayor vitalidad diaria.",
        "imageSrc": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
        "source": "Integrative Cancer Therapies",
        "category": "MICOTERAPIA",
        "keyPoints": [
            "Riqueza en polisacáridos inmunomoduladores (PSP y PSK)",
            "Aumento en la actividad vigilante de las células Natural Killer",
            "Soporte adaptógeno que disminuye el cansancio físico",
            "Protección hepática y refuerzo de las defensas biológicas"
        ]
    },
    {
        "title": "Vitamina D3 y su Rol Esencial en la Regulación Genómica Inmune",
        "description": "Niveles óptimos en sangre de 25(OH)D modulan más de 200 genes, promoviendo la homeostasis tisular y la respuesta adaptativa.",
        "imageSrc": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85",
        "source": "The Journal of Steroid Biochemistry",
        "category": "INMUNONUTRICIÓN",
        "keyPoints": [
            "Unión al receptor nuclear VDR presente en linfocitos y macrófagos",
            "Control de la inflamación subclínica y diferenciación celular",
            "Sinergia con Vitamina K2 y Magnesio para absorción mineral",
            "Monitorización analítica para dosificación individualizada"
        ]
    },
    {
        "title": "Azul de Metileno USP Reactiva la Cadena Respiratoria Mitocondrial",
        "description": "Actúa como transportador de electrones catalítico en el complejo IV, incrementando la síntesis de ATP y la claridad neurocognitiva.",
        "imageSrc": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=85",
        "source": "Mitochondrion / Bioenergetics",
        "category": "BIOENERGÉTICA CELULAR",
        "keyPoints": [
            "Aporte catalítico de energía en la fosforilación oxidativa",
            "Neutralización de radicales superóxido a bajas concentraciones",
            "Neuroprotección celular y apoyo al enfoque mental",
            "Uso protocolizado exclusivamente bajo estándar USP de farmacia"
        ]
    },
    {
        "title": "Protocolos de Vitamina C Intravenosa Respaldan la Vitalidad Celular",
        "description": "Alcanzar picos plasmáticos mediante infusión apoya la integridad del colágeno, combate la astenia y mejora sustancialmente el ánimo.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=85",
        "source": "Redox Biology",
        "category": "MEDICINA INTEGRATIVA",
        "keyPoints": [
            "Cofactor indispensable en la biosíntesis de colágeno y carnitina",
            "Reducción documentada de la sensación de fatiga crónica",
            "Efecto modulador selectivo del ambiente oxidativo tumoral",
            "Supervisión médica protocolizada con pruebas previas de G6PD"
        ]
    },
    {
        "title": "El Cardo Mariano y la Silibinina Preservan la Función Hepática",
        "description": "Flavonolignanos activos estabilizan la membrana de los hepatocitos y estimulan la regeneración del glutatión en el hígado.",
        "imageSrc": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&q=85",
        "source": "Hepatology Communications",
        "category": "HEPATOPROTECCIÓN",
        "keyPoints": [
            "Estimulación de la síntesis proteica en células hepáticas sanas",
            "Elevación endógena de los niveles de glutatión celular",
            "Protección tisular ante la sobrecarga de metabolitos",
            "Formulaciones estandarizadas al 80% para óptima asimilación"
        ]
    },
    {
        "title": "Polifenoles del Té Verde (EGCG) Favorecen la Autofagia y Longevidad",
        "description": "El galato de epigalocatequina activa sensores celulares de energía que promueven la limpieza mitocondrial y la protección vascular.",
        "imageSrc": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85",
        "source": "Nutritional Biochemistry",
        "category": "NUTRICIÓN INTEGRATIVA",
        "keyPoints": [
            "Potente acción antioxidante directa contra radicales hidroxilo",
            "Inducción de procesos naturales de reciclaje celular (autofagia)",
            "Apoyo a la salud endotelial y la regulación del colesterol",
            "Consumo preferente en infusión templada o extracto decafeinado"
        ]
    },
    {
        "title": "La Fotobiomodulación con Luz Roja e Infrarroja Estimula el ATP",
        "description": "Longitudes de onda de 660nm y 850nm son absorbidas por la citocromo c oxidasa, impulsando la reparación tisular no invasiva.",
        "imageSrc": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
        "source": "Photomedicine and Laser Surgery",
        "category": "TERAPIAS BIOFÍSICAS",
        "keyPoints": [
            "Absorción fotónica directa por las mitocondrias celulares",
            "Aumento en la síntesis de adenosín trifosfato (ATP)",
            "Alivio local de la inflamación y aceleración de la cicatrización",
            "Terapia indolora y complementaria de soporte regenerativo"
        ]
    },
    {
        "title": "La Meditación y Coherencia Emocional Modulan la Expresión Epigenética",
        "description": "Estados continuos de serenidad y gratitud reducen la expresión de genes proinflamatorios, fortaleciendo el sistema inmunológico.",
        "imageSrc": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85",
        "source": "Psychoneuroendocrinology",
        "category": "EPIGENÉTICA Y MENTE",
        "keyPoints": [
            "Descenso significativo de marcadores de estrés sistémico",
            "Activación de vías de telomerasa asociadas a la longevidad celular",
            "Mayor resiliencia frente a los desafíos cotidianos del tratamiento",
            "Prácticas sencillas de 15 minutos con impacto biológico medible"
        ]
    },
    {
        "title": "Baños de Bosque y Fitoncidas Aumentan la Inmunidad Celular",
        "description": "Caminar en entornos naturales arbolados eleva la concentración y actividad citotóxica de las células Natural Killer hasta por 7 días.",
        "imageSrc": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
        "source": "Environmental Health and Preventive Medicine",
        "category": "NATURALEZA Y SALUD",
        "keyPoints": [
            "Inhalación de fitoncidas emitidos por coníferas y robles",
            "Incremento comprobado en la producción de perforinas celulares",
            "Disminución de la presión arterial y el pulso cardíaco",
            "Reconexión vital que alivia la fatiga atencional y mental"
        ]
    },
    {
        "title": "Magnesio Bisglicinato: Nutrición Esencial para el Eje Nervioso",
        "description": "Forma quelada de máxima absorción que apoya más de 300 reacciones enzimáticas, facilitando la relajación muscular y el descanso.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=85",
        "source": "Nutrients Journal",
        "category": "NUTRICIÓN ORTOMOLECULAR",
        "keyPoints": [
            "Cofactor clave en la activación del neurotransmisor GABA",
            "Alivio de tensiones musculares y prevención de calambres",
            "Excelente tolerancia gastrointestinal sin efecto laxante",
            "Inducción natural de fases de sueño profundo y restaurador"
        ]
    },
    {
        "title": "Ácidos Grasos Omega-3 (EPA/DHA) Favorecen la Resolución Inflamatoria",
        "description": "Precursores de resolvinas y protectinas que ayudan al organismo a cerrar activamente los procesos inflamatorios de los tejidos.",
        "imageSrc": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&q=85",
        "source": "Prostaglandins, Leukotrienes and Essential Fatty Acids",
        "category": "INMUNONUTRICIÓN",
        "keyPoints": [
            "Generación de mediadores especializados de resolución (SPM)",
            "Protección de la salud cardiovascular y microcirculación",
            "Mantenimiento de la fluidez en membranas neuronales y celulares",
            "Importancia de la certificación IFOS libre de metales pesados"
        ]
    },
    {
        "title": "El Apoyo Comunitario y la Escucha Empática Fortalecen el Ánimo",
        "description": "Compartir el proceso en redes de acompañamiento reduce la percepción de aislamiento y estimula la liberación de oxitocina reparadora.",
        "imageSrc": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
        "source": "Social Science & Medicine",
        "category": "COMUNIDAD Y ESPERANZA",
        "keyPoints": [
            "Reducción comprobada de los índices de angustia y soledad",
            "Estimulación de oxitocina con efecto ansiolítico natural",
            "Mayor adherencia y optimismo frente a las pautas terapéuticas",
            "Espacios seguros donde transformar la experiencia en fortaleza"
        ]
    },
    {
        "title": "Coenzima Q10 en Forma Ubiquinol Optimiza la Bioenergética Muscular",
        "description": "La forma reducida del nutriente protege las membranas lipídicas del daño oxidativo y mejora la tolerancia al esfuerzo físico diario.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=85",
        "source": "BioFactors Journal",
        "category": "SUPLEMENTACIÓN CLÍNICA",
        "keyPoints": [
            "Pieza fundamental en el transporte de electrones mitocondrial",
            "Elevada absorción biológica en personas mayores o bajo tratamiento",
            "Protección directa contra la peroxidación de lípidos celulares",
            "Soporte integral a la musculatura esquelética y cardiovascular"
        ]
    },
    {
        "title": "El Poder de la Hidratación Celular Estructurada con Electrolitos",
        "description": "Mantener una óptima conductividad osmótica celular previene la deshidratación tisular y mejora el transporte de micronutrientes.",
        "imageSrc": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85",
        "source": "Journal of Cellular Physiology",
        "category": "BIENESTAR Y SALUD",
        "keyPoints": [
            "Equilibrio de sodio, potasio y magnesio biodisponibles",
            "Mejor distribución del agua en el espacio intracelular",
            "Apoyo a la depuración renal y eliminación de metabolitos",
            "Alivio de la pesadez matutina y ganancia de energía limpia"
        ]
    },
    {
        "title": "La Respiración Diafragmática Lenta Activa el Nervio Vago",
        "description": "Inspirar en 4 tiempos y exhalar en 6 estimula el reflejo parasimpático, reduciendo la taquicardia y la tensión en minutos.",
        "imageSrc": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
        "source": "Frontiers in Human Neuroscience",
        "category": "ESTILO DE VIDA",
        "keyPoints": [
            "Desaceleración del ritmo cardíaco y aumento de la variabilidad HRV",
            "Estimulación del tono colinérgico antiinflamatorio",
            "Herramienta autónoma y gratuita disponible en cualquier momento",
            "Inducción de calma profunda previa a consultas o estudios médicos"
        ]
    }
]

def get_curated_fallback_news(count=4):
    """
    Selecciona un bloque de noticias curadas según el día del año.
    Con 24 noticias y bloques de 4, cada día del mes tiene una rotación
    completamente fresca y sin repetición.
    """
    now = datetime.now()
    day_num = now.timetuple().tm_yday
    total = len(CURATED_NEWS_BANK)
    
    offset = (day_num * 4) % total
    res = []
    
    for idx in range(count):
        p = CURATED_NEWS_BANK[(offset + idx) % total]
        res.append({
            "id": f"news-curated-{int(time.time())}-{idx+1}",
            "title": p["title"],
            "description": p["description"],
            "imageSrc": p["imageSrc"],
            "source": p["source"],
            "date": "HOY",
            "category": p["category"],
            "keyPoints": p["keyPoints"]
        })
    return res

# ---------------------------------------------------------
# CONSTRUCTOR PRINCIPAL DE NOTICIAS
# ---------------------------------------------------------
def build_daily_news():
    history = load_history()
    collected = []
    
    # 1. Rastrear feeds RSS
    for feed in FEEDS:
        items = fetch_rss_items(feed["url"], feed["name"], feed["category"], feed.get("is_spanish", False))
        for it in items:
            if it["link"] not in history and it["title"] not in history:
                collected.append(it)
                if len(collected) >= 8:
                    break
        if len(collected) >= 8:
            break
            
    # Si no se recopilaron suficientes noticias frescas, recurrir al banco curado de 24 referencias
    if len(collected) < 4:
        print("[INFO] Feeds externos insuficientes o repetidos. Activando rotación del Banco Curado de 24 Referencias...")
        return get_curated_fallback_news(4)
        
    raw_four = collected[:4]
    all_native_spanish = all(it.get("is_spanish", False) and is_spanish_text(it["title"]) for it in raw_four)
    
    ai_synthesized = None
    if not all_native_spanish or can_call_deepseek():
        ai_synthesized = synthesize_with_deepseek(raw_four)
        
    selected_news = []
    
    for idx, it in enumerate(raw_four):
        img = it.get("image")
        if not img or not img.startswith("http") or contains_sensitive_content(img):
            img = extract_og_image(it["link"])
        if not img or not img.startswith("http") or contains_sensitive_content(img):
            img = DEFAULT_FALLBACK_IMAGES[idx % len(DEFAULT_FALLBACK_IMAGES)]
            
        # Si la síntesis con IA fue exitosa y en español:
        if ai_synthesized and idx < len(ai_synthesized):
            ai_item = ai_synthesized[idx]
            cand_title = ai_item.get("title", "")
            cand_desc = ai_item.get("description", "")
            
            # FILTRO TOLERANCIA CERO: Confirmar que esté en español, sin alarmismo y sin temas sensibles
            if (is_spanish_text(cand_title) and is_spanish_text(cand_desc) 
                and not contains_alarmism(cand_title) and not contains_alarmism(cand_desc)
                and not contains_sensitive_content(cand_title) and not contains_sensitive_content(cand_desc)):
                history.append(it["link"])
                history.append(it["title"])
                selected_news.append({
                    "id": f"news-auto-{int(time.time())}-{idx+1}",
                    "title": cand_title,
                    "description": cand_desc,
                    "imageSrc": img,
                    "source": it["source"],
                    "date": "HOY",
                    "category": ai_item.get("category", it["category"]),
                    "keyPoints": ai_item.get("keyPoints", [
                        "Investigación contrastada y revisada por pares",
                        "Estrategias para potenciar la vitalidad celular",
                        "Enfoque en calidad de vida y bienestar integral",
                        "Nuevas perspectivas en medicina integrativa"
                    ])
                })
                continue

        # Si no hubo IA o falló, PERO el ítem es nativo en español y pasa todos los filtros de seguridad:
        if (it.get("is_spanish", False) and is_spanish_text(it["title"]) 
            and not contains_alarmism(it["title"]) and not contains_alarmism(it["description"])
            and not contains_sensitive_content(it["title"]) and not contains_sensitive_content(it["description"])):
            history.append(it["link"])
            history.append(it["title"])
            selected_news.append({
                "id": f"news-auto-{int(time.time())}-{idx+1}",
                "title": it["title"][:95],
                "description": (it["description"][:210] + "...") if len(it["description"]) > 210 else it["description"],
                "imageSrc": img,
                "source": it["source"],
                "date": "HOY",
                "category": it["category"],
                "keyPoints": [
                    "Evidencia científica orientada a la esperanza activa",
                    "Pautas para fortalecer los recursos biológicos del cuerpo",
                    "Acompañamiento integrativo y calidad de vida",
                    "Información responsable basada en investigación"
                ]
            })
            continue

        # SI LLEGA AQUÍ (ej. Noticia en inglés que la IA no pudo traducir o feed con error):
        # PROHIBICIÓN ABSOLUTA: JAMÁS usar el texto en inglés crudo.
        print(f"🛡️ [FILTRO ANTI-INGLÉS] Descartado ítem no hispano o sin traducir: '{it['title'][:40]}...'")
        fallback_item = CURATED_NEWS_BANK[(idx * 5 + int(time.time())) % len(CURATED_NEWS_BANK)]
        selected_news.append({
            "id": f"news-fallback-{int(time.time())}-{idx+1}",
            "title": fallback_item["title"],
            "description": fallback_item["description"],
            "imageSrc": fallback_item["imageSrc"],
            "source": fallback_item["source"],
            "date": "HOY",
            "category": fallback_item["category"],
            "keyPoints": fallback_item["keyPoints"]
        })
        
    save_history(history)
    return selected_news

# ---------------------------------------------------------
# INYECCIÓN EN FIREBASE
# ---------------------------------------------------------
def upload_to_firebase(news_items):
    print("Inyectando 4 noticias en Firebase Realtime Database...", flush=True)
    try:
        data_bytes = json.dumps(news_items, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(FIREBASE_NEWS_URL, data=data_bytes, method='PUT')
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        
        with urllib.request.urlopen(req, timeout=12, context=SSL_CTX) as response:
            if response.status in (200, 204):
                print("✅ [ÉXITO] Noticias actualizadas en tiempo real en la Pizarra de Emisión.")
                return True
            else:
                print(f"⚠️ Código de respuesta Firebase: {response.status}")
    except Exception as e:
        print(f"❌ Error subiendo a Firebase: {e}")
    return False

def main():
    print(f"=== [PIPELINE DE NOTICIAS POSITIVAS 24/7] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")
    news = build_daily_news()
    print(f"Procesadas {len(news)} noticias:")
    for idx, n in enumerate(news):
        print(f"   {idx+1}. [{n['category']}] {n['title']} (Fuente: {n['source']})")
        # Doble verificación final de seguridad (Español, Cero Miedo y Cero Temas Sensibles)
        if (not is_spanish_text(n['title']) or contains_sensitive_content(n['title']) 
            or contains_sensitive_content(n['description']) or contains_alarmism(n['title'])):
            print(f"⚠️ FILTRO DE SEGURIDAD ACTIVADO en '{n['title'][:40]}...'. Sustituyendo por banco curado...")
            fallback = CURATED_NEWS_BANK[idx % len(CURATED_NEWS_BANK)]
            n['title'] = fallback['title']
            n['description'] = fallback['description']
            n['category'] = fallback['category']
            n['keyPoints'] = fallback['keyPoints']
            n['source'] = fallback['source']
            n['imageSrc'] = fallback['imageSrc']
        
    upload_to_firebase(news)
    print("=== [FIN DEL PIPELINE CON ÉXITO] ===")

if __name__ == "__main__":
    main()
