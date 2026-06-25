// Directory of places abroad where people can help the Venezuela relief effort —
// by volunteering or dropping off donations at a collection point ("centro de
// acopio"). All data lives here as constants so it can be edited without
// touching the page or component logic. Rendered by HelpAbroadList.tsx on the
// /ayudar-fuera page.

export type HelpNeed = "voluntarios" | "centro-de-acopio";

// Labels + tint colors reuse the existing badge style (tintBg/tintText), see
// CHECKIN_STATUSES in src/lib/constants.ts.
export const HELP_NEEDS: Record<
  HelpNeed,
  { label: string; emoji: string; tintBg: string; tintText: string }
> = {
  "voluntarios": { label: "Voluntarios", emoji: "🤝", tintBg: "#e9f1fb", tintText: "#2563a8" },
  "centro-de-acopio": { label: "Centro de acopio", emoji: "📦", tintBg: "#eef9f2", tintText: "#1f7a52" },
};

export const HELP_NEED_KEYS = Object.keys(HELP_NEEDS) as HelpNeed[];

export type HelpPlace = {
  name: string;
  description?: string; // optional short "how to help"
  address: string;
  website?: string; // optional, rendered as ↗ link
  phone?: string; // optional display number; the tel: link strips punctuation
  needs: HelpNeed[]; // drives badges + global tab filter
};

export type HelpCity = {
  city: string;
  country: string; // for display + search ("Madrid · España")
  places: HelpPlace[];
};

export const HELP_ABROAD_CITIES: HelpCity[] = [
  // Colombia
  {
    city: "Bogotá",
    country: "Colombia",
    places: [
      {
        name: "Centro de acopio Bogotá",
        address: "Calle 104 #54-31, Barrio Pasadena, en Suba.",
        needs: ["centro-de-acopio"],
      },
    ],
  },
  {
    city: "Santa Marta",
    country: "Colombia",
    places: [
      {
        name: "Centro de acopio Santa Marta",
        address: "Parque La Tenería, Carrera 2 con 1D36, cerca de Playa Los Cocos.",
        needs: ["centro-de-acopio"],
      },
    ],
  },
  {
    city: "Bucaramanga",
    country: "Colombia",
    places: [
      {
        name: "Centro de acopio Bucaramanga",
        address:
          "Calle 18 #21-52 San Francisco, Bucaramanga Santander, diagonal a la Iglesia San Francisco.",
        needs: ["centro-de-acopio"],
      },
    ],
  },
  {
    city: "Cali",
    country: "Colombia",
    places: [
      {
        name: "Centro de acopio Cali",
        address: "Carrera 28 B3 #72S-32 Comuneros II (cerca Troncal Unida).",
        needs: ["centro-de-acopio"],
      },
    ],
  },

  // Estados Unidos
  {
    city: "San Antonio, Texas",
    country: "Estados Unidos",
    places: [
      {
        name: "Centro de acopio San Antonio TX",
        address: "16111 San Pedro Ave, San Antonio, TX 78232.",
        needs: ["centro-de-acopio"],
      },
    ],
  },
  {
    city: "Doral, Florida",
    country: "Estados Unidos",
    places: [
      {
        name: "Global Empowerment Mission (GEM) Headquarters",
        address: "1850 NW 84th Avenue #100, Doral FL 33126.",
        needs: ["centro-de-acopio", "voluntarios"],
      },
    ],
  },

  // Panamá
  {
    city: "Panamá",
    country: "Panamá",
    places: [
      {
        name: "Centro de acopio Panamá",
        address: "Edificio El Hatillo P.B, Alcaldía de Panamá.",
        needs: ["centro-de-acopio"],
      },
      {
        name: "Centro de acopio Casa Club Parque Omar Panamá",
        address: "Casa Club Parque Omar.",
        needs: ["centro-de-acopio"],
      },
    ],
  },

  // Ecuador
  {
    city: "Quito",
    country: "Ecuador",
    places: [
      {
        name: "Centro de acopio Quito",
        address:
          'Av Naciones Unidas con Av 6 de Agosto, Quito-Norte - "Cachapas El Felix".',
        needs: ["centro-de-acopio"],
      },
    ],
  },
  {
    city: "Guayaquil",
    country: "Ecuador",
    places: [
      {
        name: "Centro de acopio Guayaquil",
        address:
          'Víctor Emilio Estrada y Jiguas, diagonal al Novagym Urdesa "Local Chamos Burger".',
        needs: ["centro-de-acopio"],
      },
    ],
  },

  // México
  {
    city: "Ciudad de México",
    country: "México",
    places: [
      {
        name: "Pasticho Express · Centro de acopio solidario",
        description:
          "Insumos médicos: analgésicos y antipiréticos (paracetamol, ibuprofeno), antisépticos, material de curación (gasas, vendas, apósitos, algodón), suero salino, cremas antibióticas, sales de rehidratación, antidiarreicos, guantes, cubrebocas, gel antibacterial y termómetros.",
        address:
          "Centro Comercial Parques Polanco (al lado del Walmart), Lago Alberto 320, Granada, Miguel Hidalgo, Ciudad de México.",
        phone: "+52 55 49 14 5083",
        needs: ["centro-de-acopio"],
      },
    ],
  },
];
