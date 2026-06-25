# Venezuela Ayuda 🇻🇪

Plataforma comunitaria de coordinación de emergencia tras un terremoto. Permite
a las personas marcarse a salvo, buscar a familiares, pedir ayuda, ofrecer ayuda
y ver todo en un mapa — **sin necesidad de cuenta**, optimizada para **móviles y
conexiones lentas**, en **español**.

## Funciones

- **✅ Estoy a salvo** — reporte rápido con enlace público para compartir (`/persona/{id}`).
- **🔎 Busco a alguien** — búsqueda por nombre y ciudad.
- **🆘 Necesito ayuda** — solicitudes por categoría y urgencia, con autollenado por IA.
- **🙌 Puedo ayudar** — ofertas de transporte, comida, refugio, etc.
- **🗺️ Mapa** — mapa interactivo con clustering y filtros.
- **✨ Clasificación IA** — `/api/classify` clasifica texto libre (con fallback sin IA).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + PostGIS)
· MapLibre GL · OpenAI (opcional).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa las variables
npm run dev
```

### 1. Base de datos (Supabase)

Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta la migración
`supabase/migrations/0001_init.sql` (SQL Editor o `supabase db push`). Crea las
tablas, los tipos, PostGIS, índices, las **vistas públicas sin teléfono** y las
políticas RLS.

### 2. Variables de entorno

Ver `.env.example`. Mínimo para datos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor) **o** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (para enlaces de compartir)

Opcionales: `NEXT_PUBLIC_MAP_STYLE_URL` (proveedor de mapas con SLA),
`OPENAI_API_KEY` (IA; sin clave funciona con clasificador por palabras clave).

### 3. Despliegue (Vercel)

Importa el repo en Vercel, define las variables de entorno y despliega. El
`SUPABASE_SERVICE_ROLE_KEY` debe ir como variable **del servidor** (no `NEXT_PUBLIC_`).

## Privacidad y seguridad

- Los teléfonos/contactos **se guardan pero nunca se exponen**: el cliente solo lee
  de las vistas `public_*` que omiten esas columnas.
- Las escrituras pasan por *server actions* con validación, límites de longitud,
  *rate limiting* por IP y honeypot anti-bots.
- RLS activado como defensa en profundidad.

## Estructura

```
src/
  app/            # páginas (App Router) + actions.ts + /api
  components/     # componentes reutilizables (+ forms/)
  lib/            # constantes, tipos, validación, datos, mapa
supabase/
  migrations/     # esquema SQL (PostGIS, vistas, RLS)
public/           # sw.js, offline.html, icon.svg, manifest
```

## Notas

- Las fotos no se suben en el MVP (decisión de privacidad/fiabilidad); la columna
  `photo_url` queda lista para el futuro.
- El *rate limiter* es en memoria (suficiente para una instancia). Para múltiples
  instancias, cámbialo por Upstash Redis manteniendo la misma API.
