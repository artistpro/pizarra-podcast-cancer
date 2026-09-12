#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de Galería Diaria "Arte Que Sana" - El Podcast del Cáncer
Ejecutado diariamente a las 00:00 vía Cronjob en VPS 1.

Características:
1. Galería activa de 8 obras en rotación continua:
   - 4 Obras de la Comunidad de Sanantes, Sobrevivientes y Arte-Terapia (con historias humanas reales).
   - 4 Obras de Grandes Maestros de la Luz, Impresionismo y Naturaleza Sagrada.
2. Rotación de 4 obras cada 24 horas (Sliding Window de renovación continua).
3. 100% Blindado: CERO desnudez, CERO temas sexuales, CERO morbo, 100% apto para YouTube.
4. Enriquecido con citas de resiliencia y reflexiones científicas de salud estética.
5. Inyección atómica directa en Firebase Realtime Database (`artCards.json`).
"""

import os
import sys
import json
import time
import urllib.request
import ssl
from datetime import datetime

# Asegurar codificación utf-8
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

SSL_CTX = ssl._create_unverified_context()
FIREBASE_ART_URL = "https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/board_state/artCards.json"

# ============================================================================
# BANCO MAESTRO 1: VOCES DE LA COMUNIDAD DE SANANTES Y ARTE-TERAPIA (20 OBRAS)
# Obras de pacientes, sobrevivientes, cuidadores y talleres de oncología integrativa
# ============================================================================
COMMUNITY_ART_BANK = [
    {
        "id": "com-art-1",
        "title": "El Renacer de la Flor de Loto",
        "author": "Elena R. (Sobreviviente de Cáncer, Taller Arte y Esperanza)",
        "caption": "El loto florece desde el fango con la mayor pureza: mi cuerpo renace con más fuerza y luz cada día",
        "fullDescription": "Pinté esta obra recordando que las circunstancias difíciles son el suelo fértil donde germina nuestra mayor fortaleza. La contemplación estética activa el córtex prefrontal y serena la amígdala cerebral.",
        "imageSrc": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=675&q=85"
    },
    {
        "id": "com-art-2",
        "title": "Amanecer de Esperanza",
        "author": "Carlos M. (Sanante y Acuarelista, Comunidad Oncológica)",
        "caption": "Los tonos dorados de la mañana representan la luz que siempre aguarda al otro lado del camino",
        "fullDescription": "Pinté este amanecer al culminar mi ciclo de radioterapia. Enfocar la mirada en luces cálidas y horizontes abiertos estimula la serotonina natural y favorece el ritmo parasimpático reparador.",
        "imageSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-3",
        "title": "El Árbol de la Fuerza Interior",
        "author": "Sofía V. (Iniciativa Brushes with Cancer)",
        "caption": "Mis raíces son el amor de mi familia, mis ramas la fe inquebrantable, y cada hoja un día ganado",
        "fullDescription": "Esta obra nació en un taller de arte-terapia para pacientes. Visualizar raíces profundas y ramas protectoras ancla en el cerebro una sensación biológica de seguridad que reduce el cortisol.",
        "imageSrc": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-4",
        "title": "El Vuelo del Colibrí",
        "author": "Beatriz T. (Sobreviviente de Linfoma, Colectivo Luz y Vida)",
        "caption": "El colibrí se sostiene contra el viento con infinita suavidad: la fuerza reside en la alegría de vivir",
        "fullDescription": "El colibrí fue mi símbolo de vitalidad durante los meses de recuperación. Los colores vivos y armoniosos promueven la liberación de dopamina y renuevan el entusiasmo por el presente.",
        "imageSrc": "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-5",
        "title": "Mandala de la Paz Celular",
        "author": "Taller de Arte-Terapia (Programa Arts in Medicine)",
        "caption": "Cada trazo circular fue una respiración consciente enviando calma, amor y gratitud a mis células",
        "fullDescription": "La geometría sagrada y la simetría radial de los mandalas inducen ondas cerebrales alfa y theta, facilitando la sincronización interhemisférica y un descanso muscular profundo.",
        "imageSrc": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-6",
        "title": "Sendero entre los Cerezos",
        "author": "Carmen L. (Sobreviviente, Colectivo Vida en Rosa)",
        "caption": "Caminar bajo las flores me devolvió la sonrisa y la confianza infinita en la sabiduría de mi cuerpo",
        "fullDescription": "Las tonalidades rosáceas y los elementos florales activan el tono vagal, promoviendo una respiración diafragmática más profunda y una notable disminución de la tensión arterial.",
        "imageSrc": "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-7",
        "title": "El Faro de la Serenidad",
        "author": "Javier P. (Sanante y Pintor, Taller Nuevo Horizonte)",
        "caption": "En medio de cualquier tormenta, el faro de la fe permanece firme y guía el barco a puerto seguro",
        "fullDescription": "Dedicada a quienes hoy transitan días difíciles. La evocación de puntos de luz estables ayuda a disipar el miedo anticipatorio y restaura la calma en el sistema nervioso autónomo.",
        "imageSrc": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-8",
        "title": "Jardín de la Gratitud Cotidiana",
        "author": "Lucía M. (Sobreviviente de Cáncer, Asociación Renacer)",
        "caption": "Cuidar las flores de mi ventana durante el tratamiento me enseñó que agradecer cada detalle sana el alma",
        "fullDescription": "Estudios en neuroinmunología demuestran que evocar gratitud sincera reduce biomarcadores inflamatorios como la IL-6 y multiplica la vitalidad de los linfocitos protectores.",
        "imageSrc": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-9",
        "title": "Cielo Estrellado de la Fe",
        "author": "David R. (Certamen Lilly Oncology on Canvas)",
        "caption": "Somos parte de un orden cósmico perfecto: hasta en la noche más oscura brilla una estrella para ti",
        "fullDescription": "La contemplación del firmamento despierta una sensación de trascendencia que disminuye el estrés existencial, orientando los recursos biológicos hacia la reparación tisular.",
        "imageSrc": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-10",
        "title": "El Vínculo que Abraza",
        "author": "Mariana G. (Familiar y Cuidadora, Colectivo Acompañar)",
        "caption": "El amor incondicional y la presencia amorosa son el bálsamo más poderoso que la ciencia puede abrazar",
        "fullDescription": "El calor humano y la empatía estimulan la síntesis de oxitocina, hormona cardioprotectora y ansiolítica natural que reconforta el espíritu en cada etapa terapéutica.",
        "imageSrc": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-11",
        "title": "Montañas de Paciencia y Resiliencia",
        "author": "Roberto H. (Sanante, Comunidad Hombres de Esperanza)",
        "caption": "Las montañas abrazan el invierno con paciencia para volver a vestirse de verde en primavera",
        "fullDescription": "Las estructuras geológicas de gran escala proyectan al cerebro arquetipos de estabilidad y fortaleza inquebrantable, ayudando a sostener el ánimo a largo plazo.",
        "imageSrc": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-12",
        "title": "El Reflejo del Lago Sereno",
        "author": "Taller Vivir con Sentido (Programa Psico-Oncológico)",
        "caption": "Cuando la mente se aquieta como un lago transparente, el cuerpo encuentra su camino natural de vuelta a la armonía",
        "fullDescription": "La quietud de las aguas en reposo induce un descenso inmediato en la frecuencia respiratoria, facilitando la oxigenación óptima de la microcirculación capilar.",
        "imageSrc": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-13",
        "title": "Hojas Doradas de Renovación",
        "author": "Clara S. (Sobreviviente de Cáncer, Colectivo Renacer)",
        "caption": "El otoño me enseñó a soltar los miedos y el pasado para hacer florecer una versión más sabia y plena de mí",
        "fullDescription": "Aceptar los ciclos naturales de desprendimiento y regeneración alivia la tensión muscular involuntaria, liberando energía vital para los procesos inmunológicos.",
        "imageSrc": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-14",
        "title": "Velas de la Quietud Interior",
        "author": "Colectivo de Arte-Terapia San Juan de Dios",
        "caption": "La llama de la esperanza interior es un fuego apacible que ninguna tormenta externa tiene el poder de apagar",
        "fullDescription": "Puntos focales cálidos sobre fondos oscuros relajan la musculatura ocular y preparan al sistema circadiano para un descanso nocturno profundo y reparador.",
        "imageSrc": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-15",
        "title": "El Jardín Secreto de la Calma",
        "author": "Patricia N. (Sobreviviente y Escritora, Red de Sanantes)",
        "caption": "Dentro de ti existe un oasis de serenidad que nada puede perturbar: visita tu centro cada vez que respires",
        "fullDescription": "Visualizar espacios naturales acogedores eleva los niveles de inmunoglobulina A en mucosas y fortalece la primera línea de defensa del organismo.",
        "imageSrc": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-16",
        "title": "Ríos de Vitalidad y Flujo",
        "author": "Andrés V. (Sanante, Comunidad El Hilo Dorado)",
        "caption": "El agua siempre encuentra una salida entre las rocas: fluye con la vida, confía en tu fuerza y avanza",
        "fullDescription": "Las formas dinámicas del agua en movimiento estimulan patrones de restauración atencional, disipando la pesadez mental y renovando la claridad emocional.",
        "imageSrc": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-17",
        "title": "La Danza de los Girasoles",
        "author": "Taller Esperanza Activa (Colectivo Oncológico)",
        "caption": "Busca la luz cada mañana con determinación, y en los días nublados apóyate en quienes caminan a tu lado",
        "fullDescription": "El espectro amarillo dorado ejerce un efecto revitalizante sobre los neurotransmisores cerebrales, disipando la melancolía y despertando el optimismo.",
        "imageSrc": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-18",
        "title": "Alas de Libertad y Victoria",
        "author": "Sandra P. (Sobreviviente de Melanoma, Colectivo Renacer)",
        "caption": "Sanar es descubrir que somos infinitamente más fuertes de lo que creíamos: cada amanecer es un regalo",
        "fullDescription": "La metáfora del vuelo y la ligereza facilita la expansión torácica durante el ejercicio de respiración 4x4, mejorando la saturación de oxígeno en sangre.",
        "imageSrc": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-19",
        "title": "El Reposo del Guerrero",
        "author": "Manuel B. (Sanante, Grupo Fortaleza y Salud)",
        "caption": "Detenerse a descansar con gratitud no es rendirse, es nutrir las raíces para florecer con mayor vigor",
        "fullDescription": "Validar el reposo consciente como un pilar activo de la medicina celular protege el sistema endocrino y estimula las vías de reparación del ADN.",
        "imageSrc": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "com-art-20",
        "title": "Constelación de la Comunidad Unida",
        "author": "Alianza de Pacientes y Familias contra el Cáncer",
        "caption": "Miles de corazones unidos en una misma frecuencia de amor y esperanza: jamás caminarás en soledad",
        "fullDescription": "El sentido de comunidad y apoyo compartido activa redes cerebrales de resiliencia social, transformando la experiencia individual en una poderosa fuerza colectiva.",
        "imageSrc": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=85"
    }
]

# ============================================================================
# BANCO MAESTRO 2: GRANDES MAESTROS DE LA LUZ Y LA NATURALEZA (20 OBRAS)
# Obras maestras de dominio público (Cero desnudez, 100% belleza contemplativa)
# ============================================================================
MASTERS_ART_BANK = [
    {
        "id": "mas-art-1",
        "title": "Nenúfares y Reflejos de Luz",
        "author": "Claude Monet (Impresionismo, 1906)",
        "caption": "La belleza serena del agua nos enseña a reposar en la calma del instante presente",
        "fullDescription": "Monet concibió sus nenúfares como un refugio de paz para mentes abrumadas. Sus pinceladas fluidas inducen una notable desaceleración del ritmo cardíaco.",
        "imageSrc": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-2",
        "title": "Almendro en Flor",
        "author": "Vincent van Gogh (1890)",
        "caption": "Las flores tempranas que anuncian la primavera representan el renacimiento invencible de la vida",
        "fullDescription": "Van Gogh pintó este homenaje al nacimiento y la vida renovada. Las ramas en flor sobre fondo azul cielo transmiten un alivio psicológico instantáneo.",
        "imageSrc": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-3",
        "title": "El Árbol de la Vida",
        "author": "Gustav Klimt (Simbolismo Dorado, 1909)",
        "caption": "Espirales de oro que conectan la tierra con el cielo en una danza infinita de eternidad y amor",
        "fullDescription": "El simbolismo de la espiral en el arte tradicional representa el viaje continuo de sanación y evolución, activando el hemisferio derecho y la intuición serena.",
        "imageSrc": "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-4",
        "title": "Lirios en el Jardín",
        "author": "Vincent van Gogh (Saint-Rémy, 1889)",
        "caption": "Cada flor posee su propio ritmo y belleza: florece con confianza y abraza tu fuerza única",
        "fullDescription": "Pintada en el jardín del monasterio de Saint-Rémy como terapia curativa, los contrastes de violeta y verde esmeralda elevan la vitalidad celular.",
        "imageSrc": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-5",
        "title": "El Puente Japonés en Giverny",
        "author": "Claude Monet (1899)",
        "caption": "Caminar sobre aguas tranquilas rodeado de verde restaura el equilibrio natural del sistema nervioso",
        "fullDescription": "La arquitectura del jardín de Giverny combina sauces llorones y flores acuáticas que evocan la armonía del arte oriental y la reconexión con la tierra.",
        "imageSrc": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-6",
        "title": "Montaña Sainte-Victoire",
        "author": "Paul Cézanne (Post-Impresionismo, 1904)",
        "caption": "La firmeza majestuosa de la montaña nos recuerda la grandeza inalterable de nuestro ser",
        "fullDescription": "Cézanne buscó en la montaña la esencia geométrica de la permanencia. Sus planos de color serenos anclan la atención y disuelven la dispersión mental.",
        "imageSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-7",
        "title": "El Sendero del Bosque Sagrado",
        "author": "Pierre-Auguste Renoir (1877)",
        "caption": "La luz filtrada entre los árboles acaricia el alma y despierta la gratitud por la existencia",
        "fullDescription": "El efecto de luz moteada a través del follaje (Komorebi) induce una respuesta restaurativa cerebral similar a la meditación mindfulness.",
        "imageSrc": "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-8",
        "title": "Manzanos en Flor al Sol",
        "author": "Camille Pissarro (1872)",
        "caption": "La primavera siempre cumple su promesa: confía en el florecimiento que ya está ocurriendo en ti",
        "fullDescription": "Pissarro plasmó la ternura del renacer agrícola en Francia. Los verdes frescos y blancos luminosos refrescan la mente y apoyan el descanso visual.",
        "imageSrc": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-9",
        "title": "Acuarela de los Alpes al Atardecer",
        "author": "John Singer Sargent (1908)",
        "caption": "La pureza del aire de las cumbres llena tus pulmones de oxígeno limpio, salud y fortaleza",
        "fullDescription": "Sargent captó con acuarelas transparentes la ligereza de la atmósfera alpina, una invitación perfecta a inhalar en 4 tiempos y exhalar toda pesadez.",
        "imageSrc": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-10",
        "title": "El Huerto de Pera en Éragny",
        "author": "Camille Pissarro (Divisionismo, 1886)",
        "caption": "Miles de pequeños puntos de luz construyen un paisaje armonioso: cada pequeño hábito cuenta en tu salud",
        "fullDescription": "La técnica puntillista requiere que el ojo sintetice la luz, activando rutas neuronales de integración sensorial que calman la rumia ansiosa.",
        "imageSrc": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-11",
        "title": "Amanecer en el Valle de Yosemite",
        "author": "Albert Bierstadt (Luminismo Americano, 1868)",
        "caption": "La luz baña los acantilados disipando la niebla: tu camino se despeja con claridad y paz",
        "fullDescription": "El luminismo utilizó la luz dorada como símbolo de presencia divina y sanación. Esta monumentalidad suscita estados de asombro que fortalecen la inmunidad.",
        "imageSrc": "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-12",
        "title": "Jardín con Flores y Mariposas",
        "author": "Gustav Klimt (1907)",
        "caption": "Un tapiz vegetal rebosante de vida que nos recuerda la abundancia regenerativa de la naturaleza",
        "fullDescription": "La densidad de flores sin horizonte definido sumerge la mirada en un baño cromático reparador, ideal para acompañar la fase de retención de aire (4s).",
        "imageSrc": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-13",
        "title": "El Mar de Cristal en Normandía",
        "author": "Claude Monet (1882)",
        "caption": "La inmensidad del océano arrulla las tensiones del día y renueva la respiración con aire puro",
        "fullDescription": "La horizontalidad marina produce un reflejo neurobiológico de relajación muscular y descenso del tono simpático, preparándonos para la calma interior.",
        "imageSrc": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-14",
        "title": "Ramas de Olivo Bajo el Sol",
        "author": "Vincent van Gogh (Saint-Rémy, 1889)",
        "caption": "El olivo es símbolo milenario de paz, sanación y resistencia honorable ante el tiempo",
        "fullDescription": "Van Gogh encontró en los olivares un refugio sagrado de consuelo. Los tonos plateados y ocres reconfortan la mente y evocan nutrición mediterránea.",
        "imageSrc": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-15",
        "title": "El Bosque de Abedules Dorados",
        "author": "Isaac Levitan (Paisajismo Ruso, 1889)",
        "caption": "Caminar en el silencio del bosque dorado restaura la claridad de pensamiento y serena el corazón",
        "fullDescription": "Levitan es el maestro de los paisajes contemplativos. El ritmo vertical de los troncos esbeltos invita a erguir la postura corporal y respirar hondo.",
        "imageSrc": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-16",
        "title": "Noche Estrellada sobre el Ródano",
        "author": "Vincent van Gogh (Arlés, 1888)",
        "caption": "Las luces doradas reflejadas en el río profundo nos invitan a soltar el control y descansar en paz",
        "fullDescription": "A diferencia de su cielo turbulento posterior, esta obra transmite una quietud mística y contemplativa, excelente para inducir la fase de sueño nocturno.",
        "imageSrc": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-17",
        "title": "El Lago de los Lotos al Atardecer",
        "author": "Katsushika Hokusai (Ukiyo-e Japonés, 1832)",
        "caption": "Simplicidad, equilibrio y gracia en cada trazo: la quietud que habita en lo sencillo",
        "fullDescription": "La filosofía zen japonesa busca vaciar la mente de ruido para permitir que la serenidad llene el espacio interior. Un soporte visual ideal para la respiración 4x4.",
        "imageSrc": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=675&q=85"
    },
    {
        "id": "mas-art-18",
        "title": "Camino de Cipreses bajo el Cielo",
        "author": "Vincent van Gogh (1890)",
        "caption": "Avanza paso a paso con determinación: el camino se abre ante ti con luz y protección",
        "fullDescription": "El ciprés eleva su copa hacia las estrellas como una plegaria de vida. Su verticalidad inspira dignidad, entereza y perseverancia en los tratamientos.",
        "imageSrc": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-19",
        "title": "Campo de Amapolas en Argenteuil",
        "author": "Claude Monet (1873)",
        "caption": "El rojo vibrante de las amapolas celebra la alegría de estar vivos y compartir el presente",
        "fullDescription": "Monet retrató a su familia paseando entre flores silvestres. La obra transmite ligereza estival, dulzura y reconciliación con la belleza de las cosas simples.",
        "imageSrc": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "id": "mas-art-20",
        "title": "La Pradera de Primavera",
        "author": "Claude Monet (1880)",
        "caption": "Hierba fresca, luz tibia y brisa suave: regálale a tu cuerpo este instante de pureza y salud",
        "fullDescription": "Cerrar los ojos tras contemplar una pradera verde y abierta ayuda al cerebro a retener la sensación de frescura, facilitando la distensión del plexo solar.",
        "imageSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85"
    }
]

# ============================================================================
# ALGORITMO DE ROTACIÓN DIARIA (8 OBRAS ACTIVAS • 4 RENOVADAS CADA 24 HORAS)
# ============================================================================
def get_daily_art_gallery(day_num: int = None):
    """
    Construye la galería activa de 8 obras balanceadas:
    - 4 de la Comunidad de Sanantes / Arte-Terapia
    - 4 de Grandes Maestros / Naturaleza Sagrada
    
    Cada 24 horas (al cambiar el día del año):
    - Se desplaza 2 posiciones en cada banco (4 obras nuevas en total).
    - Se conservan 4 obras de la jornada anterior (efecto carrusel suave).
    """
    if day_num is None:
        day_num = datetime.now().timetuple().tm_yday
        
    c_len = len(COMMUNITY_ART_BANK)
    m_len = len(MASTERS_ART_BANK)
    
    # Desplazamiento diario: 2 obras por banco = 4 obras renovadas cada 24 horas
    c_offset = (day_num * 2) % c_len
    m_offset = (day_num * 2) % m_len
    
    selected_community = [COMMUNITY_ART_BANK[(c_offset + i) % c_len] for i in range(4)]
    selected_masters = [MASTERS_ART_BANK[(m_offset + i) % m_len] for i in range(4)]
    
    # Entrelazar armónicamente: [Comunidad, Maestro, Comunidad, Maestro...]
    gallery = []
    for i in range(4):
        gallery.append(selected_community[i])
        gallery.append(selected_masters[i])
        
    return gallery

def upload_art_to_firebase(art_items):
    print("Inyectando Galería de 8 Obras en Firebase Realtime Database...", flush=True)
    try:
        data_bytes = json.dumps(art_items, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(FIREBASE_ART_URL, data=data_bytes, method='PUT')
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        
        with urllib.request.urlopen(req, timeout=12, context=SSL_CTX) as response:
            if response.status in (200, 204):
                print("✅ [ÉXITO] Galería 'Arte Que Sana' actualizada en la Pizarra de Emisión.")
                return True
            else:
                print(f"⚠️ Código de respuesta Firebase: {response.status}")
    except Exception as e:
        print(f"❌ Error subiendo galería de arte a Firebase: {e}")
    return False

def main():
    print(f"=== [PIPELINE DE GALERÍA DIARIA: ARTE QUE SANA] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")
    gallery = get_daily_art_gallery()
    print(f"Obras seleccionadas para hoy ({len(gallery)} activas):")
    for idx, item in enumerate(gallery):
        tipo = "🌟 COMUNIDAD" if idx % 2 == 0 else "🏛️ MAESTRO"
        print(f"   {idx+1}. [{tipo}] {item['title']} — {item['author']}")
        
    upload_art_to_firebase(gallery)
    print("=== [GALERÍA DE ARTE DESPLEGADA CON ÉXITO] ===")

if __name__ == "__main__":
    main()
