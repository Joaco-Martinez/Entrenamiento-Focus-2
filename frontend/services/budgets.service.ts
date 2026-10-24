import { apiFetch } from "@/lib/api";

export type BudgetRow = { label: string; description: string; price: number; note?: string };
export type BudgetPackage = { name: string; description: string; price: number; installments: number };
export type BudgetHighlight = { value: string; label: string };
export type BudgetImagePosition = { x: number; y: number; zoom: number };
export const defaultImagePosition: BudgetImagePosition = { x: 50, y: 50, zoom: 1 };
export type BudgetContent = {
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
export type Budget = { id: string; shareToken: string; title: string; clientName: string; shared: boolean; content: BudgetContent; createdAt: string; updatedAt: string };
export const budgetsService = {
  list: () => apiFetch("/budgets/admin") as Promise<{ budgets: Budget[] }>,
  create: (payload: { title: string; clientName: string; content: BudgetContent }) => apiFetch("/budgets/admin", { method: "POST", body: JSON.stringify(payload) }) as Promise<{ budget: Budget }>,
  update: (id: string, payload: { title: string; clientName: string; content: BudgetContent; shared: boolean }) => apiFetch("/budgets/admin/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify(payload) }) as Promise<{ budget: Budget }>,
  remove: (id: string) => apiFetch("/budgets/admin/" + encodeURIComponent(id), { method: "DELETE" }),
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
  playlistUrl: "", heroImage: "", portraitImage: "",
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