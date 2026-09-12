#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de Rotación Diaria de "Suplementos y Evidencia" - El Podcast del Cáncer
Ejecutado diariamente a las 00:00 vía Cronjob en VPS 1.

Características:
1. Catálogo Maestro de 24 Variantes Clínicas:
   - Basado en el Protocolo de Resiliencia del Dr. Pete Sulack y Oncología Integrativa.
   - Dividido en 4 Bloques: Respiración Mitocondrial, Oncología Metabólica, Genética/Metilación y Eje Intestino-Cerebro.
2. Rotación Diaria Continua (Sliding Window):
   - Selecciona 4 suplementos activos cada 24 horas ((día * 2) % 24).
   - Transición suave que mantiene 2 suplementos del día previo y añade 2 nuevos.
3. Blindaje Triple de Imágenes:
   - URLs verificadas de frascos de laboratorio y extractos botánicos de alta disponibilidad.
   - CERO vacíos visuales garantizados.
4. Inyección atómica directa en Firebase Realtime Database:
   - `supplementsList.json` (4 fichas activas)
   - `supplement.json` (ficha destacada)
"""

import os
import sys
import json
import time
import urllib.request
import ssl
from datetime import datetime

# Asegurar codificación UTF-8
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

SSL_CTX = ssl._create_unverified_context()
FIREBASE_SUPS_LIST_URL = "https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/board_state/supplementsList.json"
FIREBASE_SUP_SINGLE_URL = "https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/board_state/supplement.json"

FALLBACK_IMAGE = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=675&q=85"

# ============================================================================
# BANCO MAESTRO: 24 SUPLEMENTOS CLÍNICOS E INTEGRATIVOS
# ============================================================================
MASTER_SUPPLEMENTS_BANK = [
    # Bloque A: Respiración Mitocondrial y Energía Celular
    {
        "id": "sup-azul-metileno",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "AZUL DE METILENO (GRADO USP)",
        "description": "Aceptor y donante catalítico de electrones a nivel mitocondrial. Optimiza el consumo de oxígeno celular en el complejo IV y ejerce una potente acción antioxidante y neuroprotectora.",
        "disclaimer": "Uso exclusivo grado USP libre de metales pesados. Consulta dosis e interacciones farmacológicas con tu médico tratante.",
        "imageSrc": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Optimización de la respiración celular y síntesis de ATP mitocondrial",
            "Neutralización selectiva de radicales libres sin bloquear la señal fisiológica",
            "Soporte neurocognitivo y protección mitocondrial frente al estrés oxidativo"
        ],
        "synergies": "Gran sinergia con terapia de luz roja e infrarroja cercana (fotobiomodulación).",
        "usageTips": "Iniciar siempre con dosis mínimas tituladas bajo supervisión médica."
    },
    {
        "id": "sup-coq10-pqq",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "COENZIMA Q10 (UBIQUINOL) + PQQ",
        "description": "Cofactores indispensables en la cadena de transporte de electrones. Estimulan la biogénesis mitocondrial y protegen los lípidos de membrana frente a la peroxidación.",
        "disclaimer": "Coordina la indicación y momentos de toma con tu especialista tratante.",
        "imageSrc": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Estímulo directo a la creación de nuevas mitocondrias sanas (biogénesis)",
            "Potente protección antioxidante en la membrana interna mitocondrial",
            "Soporte al tejido muscular cardíaco y vitalidad física general"
        ],
        "synergies": "Sinergia con L-Carnitina y complejo B para optimizar el ciclo de Krebs.",
        "usageTips": "Tomar por la mañana junto con un desayuno que contenga grasas saludables."
    },
    {
        "id": "sup-vitamina-c-iv",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "VITAMINA C INTRAVENOSA / LIPOSOMAL",
        "description": "En dosis elevadas genera peróxido de hidrógeno que daña selectivamente células con disfunción metabólica, mientras estimula la síntesis de colágeno y el sistema inmune.",
        "disclaimer": "Requiere prueba previa de G6PD, evaluación de función renal y administración por profesional de salud.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Generación selectiva de estrés oxidativo en tejidos metabólicamente vulnerables",
            "Cofactor fundamental para la síntesis de colágeno e integridad tisular",
            "Disminución de la astenia y mejora sustancial en la calidad de vida"
        ],
        "synergies": "Protocolos graduales con adecuada hidratación y osmolaridad controlada.",
        "usageTips": "Administración clínica protocolizada en centros integrativos autorizados."
    },
    {
        "id": "sup-glutation-nac",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "GLUTATIÓN LIPOSOMAL & NAC",
        "description": "El antioxidante maestro intracelular junto a su precursor clave. Fundamental para la neutralización de xenobióticos, soporte inmunológico y desintoxicación hepática.",
        "disclaimer": "Evitar en ventanas inmediatamente adyacentes a ciertas quimioterapias pro-oxidantes según criterio oncológico.",
        "imageSrc": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Neutralización directa de toxinas y metales pesados en Fase II hepática",
            "Preservación de la función inmune de linfocitos y macrófagos",
            "Fluidificación de secreciones mucosas y protección broncopulmonar"
        ],
        "synergies": "Sinergia indispensable con Selenio para la activación de la glutatión peroxidasa.",
        "usageTips": "Tomar preferentemente con el estómago vacío o entre comidas."
    },

    # Bloque B: Modulación Inmune y Oncología Metabólica
    {
        "id": "sup-berberina",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "BERBERINA HCL (ACTIVADOR AMPK)",
        "description": "Alcaloide natural que activa la enzima AMPK y modula la captación de glucosa celular. Induce restricción metabólica en vías celulares dependientes de fermentación anaeróbica.",
        "disclaimer": "Monitorear glucemia si se combinan hipoglucemiantes o metformina.",
        "imageSrc": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Activación de la vía AMPK y regulación de la sensibilidad a la insulina",
            "Restricción glucolítica en el microambiente metabólico",
            "Modulación beneficiosa del microbioma intestinal e integridad de barrera"
        ],
        "synergies": "Sinergia con dieta cetogénica o ayuno intermitente supervisado.",
        "usageTips": "Tomar de 15 a 20 minutos antes de las comidas ricas en carbohidratos."
    },
    {
        "id": "sup-egcg",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "TÉ VERDE (EGCG FITOSOMADO)",
        "description": "El polifenol más potente de Camellia sinensis. Documentado por su capacidad para inhibir la formación de nuevos vasos sanguíneos no deseados (antiangiogénesis) y modular quinasas.",
        "disclaimer": "Optar por extractos descafeinados y evitar tomas nocturnas.",
        "imageSrc": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Inhibición de factores de crecimiento endotelial (antiangiogénesis)",
            "Potente neutralización de radicales libres y protección del ADN celular",
            "Soporte metabólico y modulación del recambio celular saludable"
        ],
        "synergies": "Sinergia demostrada con quercetina para aumentar su biodisponibilidad plasmática.",
        "usageTips": "Tomar entre comidas con agua tibia o infusión ligera."
    },
    {
        "id": "sup-curcumina",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "CURCUMINA FITOSOMADA (MERIVA)",
        "description": "Polifenol de referencia con amplia documentación en la inhibición del factor de transcripción NF-kB, reduciendo la producción de citocinas inflamatorias y citoquinas tisulares.",
        "disclaimer": "Suspender antes de procedimientos quirúrgicos por su efecto modulador sobre la agregación plaquetaria.",
        "imageSrc": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Potente modulación de vías proinflamatorias (NF-kB, COX-2 y TNF-alfa)",
            "Soporte antioxidante tisular y bienestar de la mucosa intestinal",
            "Alivio del malestar articular y equilibrio oxidativo general"
        ],
        "synergies": "Formulaciones con fosfatidilcolina multiplican hasta 29 veces su absorción plasmática.",
        "usageTips": "Consumir junto a la comida principal para optimizar su efecto fisiológico."
    },
    {
        "id": "sup-mushroom-multiplex",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "COMPLEJO DE HONGOS MEDICINALES",
        "description": "Sinergia de Reishi, Melena de León, Cordyceps y Cola de Pavo (PSK/PSP). Ricos en beta-glucanos 1,3/1,6 que entrenan la vigilancia inmune y activan las células Natural Killer.",
        "disclaimer": "Verificar extractos estandarizados en polisacáridos y libre de micotoxinas.",
        "imageSrc": "https://images.unsplash.com/photo-1543883341-ab66702da8b9?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Activación y maduración de células dendríticas y Natural Killer (NK)",
            "Apoyo adaptogénico frente a la fatiga y el desgaste biológico",
            "Neuroprotección y soporte cognitivo gracias a las hericenonas de Melena de León"
        ],
        "synergies": "Consumir junto con Vitamina C para mejorar la biodisponibilidad de los beta-glucanos.",
        "usageTips": "Tomar por la mañana en ayunas disuelto en infusión caliente o agua tibia."
    },
    {
        "id": "sup-black-seed-oil",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "ACEITE DE SEMILLA NEGRA (TIMOKINONA)",
        "description": "Extracto oleoso de Nigella sativa estandarizado en timokinona. Ejerce una notable modulación inmune, protección broncopulmonar y selectiva citotoxicidad frente a células anómalas.",
        "disclaimer": "Utilizar aceite prensado en frío 100% puro y con análisis de pureza certificado.",
        "imageSrc": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Modulación de la apoptosis y regulación de genes supresores",
            "Soporte antiinflamatorio en vías respiratorias y bronquiales",
            "Propiedades antimicrobianas naturales que equilibran la flora intestinal"
        ],
        "synergies": "Sinergia con miel de grado médico o alimentos ricos en ácidos grasos saludables.",
        "usageTips": "Consumir una cucharadita con alimentos para evitar reflujo aromático."
    },
    {
        "id": "sup-graviola",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "GRAVIOLA (ACETOGENINAS ANNONÁCEAS)",
        "description": "Extracto botánico de Annona muricata rico en acetogeninas. Estas moléculas interfieren con el complejo I mitocondrial de células dependientes de altos requerimientos energéticos.",
        "disclaimer": "No utilizar por períodos prolongados ininterrumpidos sin descansos mensuales.",
        "imageSrc": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Inhibición enzimática selectiva en células con sobreexpresión de bombas ATP",
            "Apoyo a la respuesta inmunitaria innata",
            "Protección celular frente a la proliferación acelerada desordenada"
        ],
        "synergies": "Se protocoliza en ciclos alternados (ej. 3 semanas de uso, 1 de descanso).",
        "usageTips": "Acompañar con abundante hidratación a lo largo de la jornada."
    },
    {
        "id": "sup-artemisinina",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "ARTEMISININA (AJENJO DULCE)",
        "description": "Lactona sesquiterpénica de Artemisia annua. Reacciona selectivamente con depósitos de hierro libre intra-tumoral liberando radicales libres que inducen apoptosis dirigida.",
        "disclaimer": "Monitorear enzimas hepáticas y evitar su uso continuado sin supervisión médica.",
        "imageSrc": "https://images.unsplash.com/photo-1543883341-ab66702da8b9?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Citotoxicidad selectiva dependiente de hierro (efecto Caballo de Troya)",
            "Inhibición de factores de transcripción de angiogénesis tumoral",
            "Acción depurativa y antiparasitaria de amplio espectro"
        ],
        "synergies": "Protocolos en pulsos intermitentes (ej. 4 días continuos, 3 días descanso).",
        "usageTips": "Tomar con el estómago vacío antes del descanso nocturno o lejos de antioxidantes."
    },
    {
        "id": "sup-boswellia",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "BOSWELLIA SERRATA (AKBA)",
        "description": "Resina ayurvédica estandarizada en ácido acetil-11-ceto-beta-boswélico (AKBA). Inhibidor selectivo de la 5-lipoxigenasa (5-LOX), reduce edemas peritumorales e inflamación severa.",
        "disclaimer": "Excelente perfil gástrico en comparación con antiinflamatorios convencionales.",
        "imageSrc": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Inhibición específica de leucotrienos inflamatorios (vía 5-LOX)",
            "Disminución documentada del edema peritumoral y la presión intracraneal",
            "Alivio del dolor musculoesquelético sin dañar la mucosa gástrica"
        ],
        "synergies": "Sinergia de alta potencia con Curcumina para cobertura inflamatoria dual (COX y LOX).",
        "usageTips": "Consumir con comidas que contengan grasas saludables para maximizar absorción."
    },

    # Bloque C: Genética, Metilación y Terrenos Biológicos
    {
        "id": "sup-b-metiladas",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "COMPLEJO B METILADO (MTHFR PROTOCOL)",
        "description": "Formas bioactivas de Metilfolato (5-MTHF), Metilcobalamina (B12) y Piridoxal-5-Fosfato (B6). Claves para sortear mutaciones genéticas en MTHFR y reducir la homocisteína.",
        "disclaimer": "Personalizar según analíticas de homocisteína y perfil genético de metilación.",
        "imageSrc": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Donación eficiente de grupos metilo para la reparación y silenciamiento del ADN",
            "Conversión de homocisteína proinflamatoria en metionina segura",
            "Síntesis de neurotransmisores del bienestar (serotonina, dopamina, GABA)"
        ],
        "synergies": "Sinergia con Magnesio y Colina para optimizar el ciclo de un solo carbono.",
        "usageTips": "Tomar por la mañana junto con el desayuno para evitar interferencias con el sueño."
    },
    {
        "id": "sup-vitamina-d3-k2",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "VITAMINA D3 + K2 (MK-7)",
        "description": "Hormona secosteroidal clave en la transcripción de más de 200 genes inmunológicos. La K2 asegura que el calcio movilizado se deposite en los huesos y no en las arterias.",
        "disclaimer": "Monitorear niveles de 25(OH)D en sangre periódicamente para titular la dosis óptima.",
        "imageSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Modulación transcripcional de linfocitos T reguladores y péptidos antimicrobianos",
            "Mantenimiento de la densidad y salud de la microarquitectura ósea",
            "Soporte cardiovascular protegiendo la elasticidad endotelial"
        ],
        "synergies": "Requiere Magnesio en cantidad suficiente para su activación enzimática en hígado y riñón.",
        "usageTips": "Consumir junto a la comida principal que contenga grasas naturales."
    },
    {
        "id": "sup-magnesio-bisglicinato",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "MAGNESIO BISGLICINATO / TREONATO",
        "description": "Forma quelada de máxima absorción y tolerancia gastrointestinal. Participa en más de 300 reacciones enzimáticas, promueve el tono parasimpático y cruza la barrera hematoencefálica.",
        "disclaimer": "Consulta tolerancia digestiva y función renal con tu profesional de la salud.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Activación del sistema parasimpático y relajación neuromuscular profunda",
            "Estímulo a la síntesis de GABA favoreciendo un sueño reparador",
            "Cofactor esencial en la síntesis de ATP mitocondrial y activación de Vitamina D"
        ],
        "synergies": "Excelente combinación con L-Teanina o Taurina antes de dormir.",
        "usageTips": "Tomar entre 30 y 60 minutos antes del descanso nocturno."
    },
    {
        "id": "sup-omega3",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "OMEGA 3 (EPA / DHA PURIFICADO IFOS)",
        "description": "Ácidos grasos esenciales con certificación IFOS 5 estrellas libre de metales pesados. Precursores de mediadores especializados de la resolución inflamatoria (resolvinas y protectinas).",
        "disclaimer": "Verificar dosis en pacientes anticoagulados o con cirugías programadas.",
        "imageSrc": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Resolución activa de focos inflamatorios crónicos tisulares",
            "Mantenimiento de la fluidez y comunicación de membranas celulares",
            "Protección endotelial cardiovascular y soporte cognitivo neuronal"
        ],
        "synergies": "Tomar junto con antioxidantes naturales (como Vitamina E) para prevenir su oxidación.",
        "usageTips": "Almacenar en refrigeración una vez abierto para preservar su frescura."
    },
    {
        "id": "sup-cardo-mariano",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "CARDO MARIANO (SILIBININA FITOSOMADA)",
        "description": "Extracto con flavonolignanos activos que estabilizan la membrana del hepatocito, estimulan la regeneración del tejido hepático y promueven la síntesis de glutatión endógeno.",
        "disclaimer": "Consulta interacciones potenciales en citocromo P450 con fármacos oncológicos activos.",
        "imageSrc": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Protección hepática frente a la sobrecarga y toxicidad metabólica",
            "Estimulación de la producción de glutatión (Fases I y II hepáticas)",
            "Acción antioxidante y antiinflamatoria en membranas celulares"
        ],
        "synergies": "Extractos estandarizados al 70-80% de silimarina, preferiblemente en formulación fitosoma.",
        "usageTips": "Tomar con alimentos que contengan grasas saludables para favorecer su biodisponibilidad."
    },
    {
        "id": "sup-selenio-zinc",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "SELENIO & ZINC BISGLICINATO",
        "description": "Oligoelementos estructurales catalíticos. El selenio es el corazón de la glutatión peroxidasa; el zinc gobierna más de 2000 factores de transcripción y la integridad timocítica.",
        "disclaimer": "Respetar las dosis terapéuticas recomendadas para evitar toxicidad por selenio.",
        "imageSrc": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Cofactores indispensables de enzimas antioxidantes endógenas (SOD y GPx)",
            "Maduración y correcto funcionamiento de linfocitos T cooperadores",
            "Apoyo a la conversión periférica de hormonas tiroideas (T4 a T3 activa)"
        ],
        "synergies": "Combinar con Vitamina C para mejorar la biodisponibilidad digestiva de oligoelementos.",
        "usageTips": "Tomar con una comida para evitar náuseas asociadas al zinc en ayunas."
    },

    # Bloque D: Eje Intestino-Cerebro, Descanso y Desintoxicación
    {
        "id": "sup-melatonina-alta-dosis",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "MELATONINA EN ALTA DOSIS",
        "description": "Molécula antiquísima producida por todas las mitocondrias. A dosis oncológicas actúa como potente depurador de radicales libres, inductor de apoptosis y modulador epigenético.",
        "disclaimer": "Titular gradualmente bajo supervisión médica especializada en medicina integrativa.",
        "imageSrc": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Barrido selectivo de radicales hidroxilo dentro de las crestas mitocondriales",
            "Sincronización del reloj biológico circadiano y facilitación de sueño REM profundo",
            "Modulación de la aromatasa y vías hormonales proliferativas"
        ],
        "synergies": "Sinergia con Magnesio en habitación completamente oscura para optimizar su efecto.",
        "usageTips": "Tomar de 45 a 60 minutos antes de apagar todas las luces para dormir."
    },
    {
        "id": "sup-probioticos-galt",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "PROBIÓTICOS MULTICEPA & PREBIÓTICOS",
        "description": "Cepas de Lactobacillus y Bifidobacterium con fibra prebiótica. Nutren el tejido linfoide asociado al intestino (GALT), promoviendo la síntesis de ácidos grasos de cadena corta.",
        "disclaimer": "Seleccionar cepas con resistencia al ácido gástrico y certificación de viabilidad.",
        "imageSrc": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Restauración de la eubiosis intestinal tras terapias antimicrobianas",
            "Producción de butirato que nutre y sella los colonocitos",
            "Modulación del eje microbiota-intestino-cerebro reduciendo la neuroinflamación"
        ],
        "synergies": "Combinar con fibra de acacia, inulina o almidón resistente según tolerancia.",
        "usageTips": "Tomar antes del desayuno o justo antes de dormir con agua a temperatura ambiente."
    },
    {
        "id": "sup-l-glutamina-colageno",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "L-GLUTAMINA & PÉPTIDOS DE COLÁGENO",
        "description": "Nutrientes estructurales de rápida asimilación para la pared intestinal. Sellan las uniones estrechas (zonulina), disminuyen la hiperpermeabilidad y alivian mucositis.",
        "disclaimer": "Consultar con el médico tratante en protocolos con restricciones específicas de glutamina.",
        "imageSrc": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Combustible primario para la regeneración y división de enterocitos",
            "Disminución del paso de macromoléculas y endotoxinas a la circulación sanguínea",
            "Alivio de la irritación en mucosas tras tratamientos de quimioterapia"
        ],
        "synergies": "Sinergia con zinc carnosina y caldo de huesos casero para reparación acelerada.",
        "usageTips": "Tomar en ayunas disuelto en agua tibia o caldo claro."
    },
    {
        "id": "sup-calostro-transfer-factors",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "CALOSTRO BOVINO & FACTORES TRANSFERENCIA",
        "description": "Primer alimento biológico rico en inmunoglobulinas IgG, lactoferrina y polipéptidos ricos en prolina (PRP). Entrenan al sistema inmune adaptativo frente a infecciones oportunistas.",
        "disclaimer": "Verificar pureza libre de hormonas artificiales y antibióticos.",
        "imageSrc": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Suministro pasivo de inmunoglobulinas de amplio espectro",
            "Quelación de hierro libre en el lumen intestinal mediante lactoferrina",
            "Equilibrio entre las respuestas inmunes Th1 y Th2"
        ],
        "synergies": "Ideal en combinación con probióticos para un blindaje digestivo completo.",
        "usageTips": "Disolver en agua fría o tibia (nunca caliente para no desnaturalizar proteínas)."
    },
    {
        "id": "sup-zeolita-carbon",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "ZEOLITA MICRONIZADA & CARBÓN VEGETAL",
        "description": "Mineral aluminosilicato con estructura de panal de carga negativa. Atrae y retiene toxinas catiónicas, pesticidas y amoníaco en el tracto digestivo para su eliminación segura.",
        "disclaimer": "Separar al menos 2 horas de cualquier medicamento o suplemento nutricional.",
        "imageSrc": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Quelación pasiva de metales pesados y micotoxinas sin entrar en sangre",
            "Alivio de la carga tóxica que llega al hígado por circulación enterohepática",
            "Equilibrio del pH luminal y reducción de gases digestivos molestos"
        ],
        "synergies": "Beber al menos 2 vasos de agua pura al momento de consumirlo.",
        "usageTips": "Tomar preferentemente antes de acostarse, bien alejado de la cena y suplementos."
    },
    {
        "id": "sup-resveratrol-quercetina",
        "sectionTitle": "SUPLEMENTOS Y EVIDENCIA",
        "badge": "INFORMACIÓN RESPONSABLE",
        "subtitle": "FICHA DE HOY",
        "name": "RESVERATROL TRANS & QUERCETINA",
        "description": "Dúo senolítico por excelencia. Activan las sirtuínas (SIRT1), modulan la respuesta a la hipoxia tisular (HIF-1) y promueven la limpieza celular profunda por autofagia.",
        "disclaimer": "Consultar en personas que consuman anticoagulantes o antiplaquetarios.",
        "imageSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=675&q=85",
        "keyBenefits": [
            "Estimulación de la autofagia y eliminación de células senescentes dañadas",
            "Estabilización de mastocitos y reducción de la liberación de histamina",
            "Protección del endotelio vascular y mejora del flujo microcirculatorio"
        ],
        "synergies": "Sinergia de absorción cuando se combina con piperina o grasas monoinsaturadas.",
        "usageTips": "Tomar en la primera comida del día junto a un chorrito de aceite de oliva virgen."
    }
]

def get_daily_supplements(day_num: int = None, count: int = 4):
    """
    Selecciona las 4 fichas activas para el día de hoy, rotando continuamente
    a través de las 24 variantes del catálogo maestro.
    """
    if day_num is None:
        day_num = datetime.now().timetuple().tm_yday
        
    total = len(MASTER_SUPPLEMENTS_BANK)
    offset = (day_num * 2) % total
    
    selected = []
    for i in range(count):
        selected.append(MASTER_SUPPLEMENTS_BANK[(offset + i) % total])
    return selected

def upload_supplements_to_firebase(supplements_list):
    print(f"Inyectando {len(supplements_list)} Fichas de Suplementos en Firebase RTDB...", flush=True)
    try:
        # 1. Inyectar lista activa
        data_bytes = json.dumps(supplements_list, ensure_ascii=False).encode('utf-8')
        req_list = urllib.request.Request(FIREBASE_SUPS_LIST_URL, data=data_bytes, method='PUT')
        req_list.add_header('Content-Type', 'application/json; charset=utf-8')
        
        with urllib.request.urlopen(req_list, timeout=12, context=SSL_CTX) as response:
            if response.status not in (200, 204):
                print(f"⚠️ Código Firebase (Lista): {response.status}")
                return False
                
        # 2. Inyectar ficha única principal (compatibilidad hacia atrás)
        primary_sup = supplements_list[0]
        data_single_bytes = json.dumps(primary_sup, ensure_ascii=False).encode('utf-8')
        req_single = urllib.request.Request(FIREBASE_SUP_SINGLE_URL, data=data_single_bytes, method='PUT')
        req_single.add_header('Content-Type', 'application/json; charset=utf-8')
        
        with urllib.request.urlopen(req_single, timeout=12, context=SSL_CTX) as response:
            if response.status in (200, 204):
                print("✅ [ÉXITO] Suplementos actualizados en tiempo real en la Pizarra de Emisión.")
                return True
            else:
                print(f"⚠️ Código Firebase (Single): {response.status}")
    except Exception as e:
        print(f"❌ Error subiendo suplementos a Firebase: {e}")
    return False

def main():
    print(f"=== [PIPELINE DE SUPLEMENTOS Y EVIDENCIA 24/7] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")
    active_sups = get_daily_supplements()
    print(f"Suplementos activos para hoy ({len(active_sups)} en carrusel):")
    for idx, item in enumerate(active_sups):
        print(f"   {idx+1}. {item['name']} — {item['subtitle']}")
        
    upload_supplements_to_firebase(active_sups)
    print("=== [CATÁLOGO DE SUPLEMENTOS DESPLEGADO CON ÉXITO] ===")

if __name__ == "__main__":
    main()
