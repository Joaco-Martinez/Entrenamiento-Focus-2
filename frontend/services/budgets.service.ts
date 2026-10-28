import { apiFetch } from "@/lib/api";

export type BudgetProducer = "fran" | "mati";
export type BudgetCurrency = "ARS" | "USD";
export type BudgetRow = { label: string; description: string; price: number; usdPrice?: number; note?: string };
export type BudgetPackage = { name: string; description: string; price: number; usdPrice?: number; installments: number };
export type BudgetHighlight = { value: string; label: string };
export type BudgetImagePosition = { x: number; y: number; zoom: number };
export const defaultImagePosition: BudgetImagePosition = { x: 50, y: 50, zoom: 1 };
export type BudgetContent = {
  currency?: BudgetCurrency;
  brand: string; subtitle: string; accent: string; producerName?: string; highlights?: BudgetHighlight[];
  bio: string; instagram: string; email: string; phone: string; location: string;
  playlistUrl: string; heroImage: string; portraitImage: string;
  imagePositions?: Record<string, BudgetImagePosition>;
  services: BudgetRow[]; packages: BudgetPackage[];
  extras: { label: string; description: string }[];
  terms: string; paymentMethods: string; discountPercent: number;
  totalOverride: number | null; note: string;
  studioName: string; studioText: string; studioImages: string[]; equipment: string[];
};
export type Budget = { id: string; shareToken: string; title: string; clientName: string; shared: boolean; producer: BudgetProducer; content: BudgetContent; createdAt: string; updatedAt: string };
export const budgetsService = {
  list: (producer: BudgetProducer) => apiFetch("/budgets/admin?producer=" + producer) as Promise<{ budgets: Budget[] }>,
  create: (payload: { producer: BudgetProducer; title: string; clientName: string; content: BudgetContent; shared: boolean }) => apiFetch("/budgets/admin", { method: "POST", body: JSON.stringify(payload) }) as Promise<{ budget: Budget }>,
  update: (id: string, producer: BudgetProducer, payload: { title: string; clientName: string; content: BudgetContent; shared: boolean }) => apiFetch("/budgets/admin/" + encodeURIComponent(id) + "?producer=" + producer, { method: "PUT", body: JSON.stringify(payload) }) as Promise<{ budget: Budget }>,
  remove: (id: string, producer: BudgetProducer) => apiFetch("/budgets/admin/" + encodeURIComponent(id) + "?producer=" + producer, { method: "DELETE" }),
  getShared: (token: string) => apiFetch("/budgets/share/" + encodeURIComponent(token)) as Promise<{ budget: Pick<Budget, "title" | "clientName" | "content" | "updatedAt"> }>,
  uploadImage: (file: File) => { const form = new FormData(); form.append("image", file); return apiFetch("/budgets/admin/image", { method: "POST", body: form }) as Promise<{ url: string }> },
};
export const defaultBudget: BudgetContent = {
  brand: "PROD BY KNNO", subtitle: "PRODUCCIÓN MUSICAL", accent: "#e5bd42",
  producerName: "Franco Cano",
  highlights: [
    { value: "10+", label: "años de experiencia" },
    { value: "1.500+", label: "proyectos entregados en 5 años" },
    { value: "20 M+", label: "reproducciones en plataformas" },
    { value: "9+", label: "países con artistas colaboradores" },
  ],
  bio: "Hola, soy Franco Cano y me dedico profesionalmente desde hace más de diez años a la creación, composición, grabación, mezcla y mastering de música latina y urbana. Trabajo con diversas salas de grabación en Córdoba, Argentina, y a la fecha llevo más de 1500 proyectos entregados en los últimos cinco años. Mi trabajo acumula más de 20 millones de reproducciones en plataformas digitales como Spotify y YouTube, colaborando junto a cientos de artistas de más de nueve países.",
  instagram: "@knnoknno", email: "Knnoofficial@gmail.com", phone: "+549 3513785963", location: "Argentina, Córdoba, Capital",
  playlistUrl: "https://open.spotify.com/playlist/21Nlj9vZjmj9t2rwkQ8qmH", heroImage: "", portraitImage: "",
  imagePositions: {},
  services: [
    { label: "Instrumental", description: "Partiendo de una maqueta. Selección y diseño de sonidos. Vos elegís cómo debería sonar tu pista.", price: 130000 },
    { label: "Grabación x 2hs", description: "Sesión de grabación de 2 horas en sala acústicamente tratada, con acceso a micrófonos, preamplificadores y conversores profesionales.", price: 80000 },
    { label: "Afinación de voces", description: "Afinación de voces con Melodyne, aplicada con criterio musical para lograr un resultado natural, preciso o agresivo según el estilo y los requerimientos del proyecto.", price: 50000 },
    { label: "Mezcla", description: "Limpieza y edición general de pistas y voces, balance de la mezcla, ecualización, compresión, efectos y automatizaciones.", price: 90000 },
    { label: "Mastering", description: "Optimización final del balance tonal, la dinámica y el nivel, asegurando una correcta traducción en distintos sistemas de reproducción y plataformas.", price: 50000 }
  ],
  packages: [
    { name: "A", description: "Instrumental, grabación (2 horas incluidas), afinación de voces, mezcla y mastering.", price: 250000, installments: 2 },
    { name: "B", description: "Grabación (2 horas incluidas), afinación de voces, mezcla y mastering.", price: 170000, installments: 2 },
    { name: "C", description: "Afinación de voces, mezcla y mastering.", price: 130000, installments: 2 },
    { name: "D", description: "Instrumental, afinación de voces, mezcla y mastering.", price: 210000, installments: 2 }
  ],
  extras: [
    { label: "Composición de canciones", description: "Composición de letra, armonía, melodía y ritmo de diversos géneros musicales." },
    { label: "Músicos sesionistas", description: "Guitarra, piano, percusiones, acordeón, etc." },
    { label: "Vocal coach", description: "Asistencia en la interpretación vocal, afinación, timing y expresividad durante la grabación." },
    { label: "Letrista", description: "Especialista en la creación de letras para diversos géneros musicales, con enfoque en identidad artística, métrica y coherencia expresiva." },
    { label: "Resguardo DNDA & registro SADAIC", description: "Gestoría completa de cada trámite." }
  ],
  terms: "Los servicios de producción completa, instrumental y mezcla pueden abonarse en dos pagos: el primero al solicitar el servicio y el segundo al finalizar el trabajo. Los servicios de grabación, afinación y mastering se abonan en un solo pago al momento de solicitar el servicio.",
  paymentMethods: "Efectivo, transferencia bancaria, billeteras virtuales.",
  discountPercent: 0, totalOverride: 250000, note: "Los servicios adicionales se presupuestan por separado.",
  studioName: "EL BRUJO ESTUDIO", studioText: "Sala de grabación y producción en Córdoba, Argentina.",
  studioImages: ["", "", ""],
  equipment: ["Micrófono Neumann U87", "Preamplificador ISA 828", "Preamplificador Avalon 737", "Conversor Avid HD", "Monitoreo Focal Solo6 + SUB", "Comp / Limitador Weiss DS1 MK3", "Comp / Limit / EQ Finalizer Express", "Comp / API 2500", "Auriculares Sennheiser HD 600 & 650", "Auriculares Beyerdynamic DT 770 Pro"]
};

// Plantilla independiente para preparar la propuesta de Mati en otro momento.
// No hereda precios, fotografías ni datos de contacto de Fran.
// Borrador inicial de Mati. No se publican precios históricos ni datos de contacto
// no confirmados; el administrador puede completarlos antes de compartir un enlace.
// Limpieza puntual de la redacción anterior de Mati: respeta cualquier condición
// personalizada que se haya agregado y no modifica las propuestas de Fran.
const retiredMatiTerms = [
  "El servicio incluye revisiones hasta alcanzar la conformidad del artista y los archivos de exportación que sean necesarios.",
  "El plazo de entrega, la forma de pago y la vigencia de las tarifas se confirman al presupuestar.",
];
export function cleanMatiTerms(value: string): string {
  let terms = value;
  for (const phrase of retiredMatiTerms) {
    terms = terms.replace(phrase, "");
  }
  return terms.replace(/ {2,}/g, " ").trim();
}

// Retira exclusivamente los avisos anteriores que Mati pidió eliminar.
// Las notas personalizadas de cada presupuesto permanecen disponibles.
const removedMatiNotes = [
  "Valores de referencia registrados en noviembre de 2025. Confirmar vigencia y alcance antes de contratar. Tarifas expresadas por canción; desde 4 canciones se aplica la escala por cantidad.",
  "Tarifas en dólares estadounidenses por canción. Valores de referencia registrados en noviembre de 2025; confirmar vigencia antes de contratar. Desde 4 canciones se aplica la tarifa por cantidad.",
];
export function cleanMatiNote(value: string): string {
  let note = value;
  for (const oldText of removedMatiNotes) {
    note = note.replace(oldText, "");
  }
  return note.replace(/ {2,}/g, " ").trim();
}

export const defaultBudgetMati: BudgetContent = {
  currency: "ARS",
  brand: "MATIAS LEDESMA",
  subtitle: "INGENIERO DE MEZCLA Y MASTERING",
  accent: "#e5bd42",
  producerName: "Matias Ledesma",
  highlights: [
    { value: "10+", label: "años de experiencia en audio" },
  ],
  bio: "Soy Matias Ledesma, ingeniero de mezcla y mastering en Córdoba, Argentina. Me dedico a trabajar el sonido de cada canción para que conserve su identidad, tenga claridad, impacto y se traduzca bien en distintos sistemas de escucha. Mi enfoque combina criterio musical, técnica y atención al detalle, siempre al servicio de la canción.",
  instagram: "",
  email: "",
  phone: "",
  location: "Córdoba, Argentina",
  playlistUrl: "",
  heroImage: "",
  portraitImage: "",
  imagePositions: {},
  services: [
    {
      label: "Mezcla",
      description: "Balance y definición de las pistas. Ecualización, dinámica, efectos, profundidad y automatizaciones para que la canción transmita lo que buscás.",
      price: 120000, usdPrice: 120,
    },
    {
      label: "Mastering",
      description: "Optimización final del balance tonal, la dinámica y el nivel. Preparación del máster para una escucha consistente en diferentes equipos y plataformas.",
      price: 60000, usdPrice: 60,
    },
    {
      label: "Mezcla + Mastering",
      description: "Un proceso completo, desde la mezcla de tus pistas hasta la finalización del máster. Ambas etapas trabajadas con el mismo criterio musical y sonoro.",
      price: 150000, usdPrice: 150,
    },
  ],
  packages: [
    { name: "Mezcla", description: "Tarifa por canción para proyectos de 4 canciones o más.", price: 105000, usdPrice: 105, installments: 1 },
    { name: "Mastering", description: "Tarifa por canción para proyectos de 4 canciones o más.", price: 50000, usdPrice: 50, installments: 1 },
    { name: "Mezcla + Mastering", description: "Tarifa por canción para proyectos de 4 canciones o más.", price: 130000, usdPrice: 130, installments: 1 },
  ],
  extras: [],
  terms: "Antes de confirmar cada proyecto, necesito escuchar el material y evaluar si puedo realizar el trabajo.",
  paymentMethods: "",
  discountPercent: 0,
  totalOverride: null,
  note: "",
  studioName: "Mi estudio",
  studioText: "",
  studioImages: ["", "", ""],
  equipment: [],
};

export const defaultBudgetMatiUSD: BudgetContent = {
  ...defaultBudgetMati,
  currency: "USD",
  note: "",
};

export function budgetDefaultFor(producer: BudgetProducer, currency: BudgetCurrency = "ARS"): BudgetContent {
  return producer === "fran" ? defaultBudget : currency === "USD" ? defaultBudgetMatiUSD : defaultBudgetMati;
}
