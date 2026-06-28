# Guía para contribuir

Gracias por ayudar a mejorar Venezuela Ayuda. Este proyecto recibe aportes de
código, documentación, pruebas, accesibilidad, datos públicos verificables y
operaciones. Como la app se usa en un contexto humanitario, la prioridad es
proteger a las personas afectadas y mantener la plataforma confiable.

## Antes de empezar

- Revisa si ya existe una issue o PR relacionado en
  [mawmawmaw/venezuela-ayuda](https://github.com/mawmawmaw/venezuela-ayuda).
- Para bugs, mejoras pequeñas o documentación, abre una issue con pasos para
  reproducir, impacto y contexto técnico.
- Para cambios grandes de arquitectura, esquema de datos, ingesta, moderación,
  despliegue o UX crítica, abre primero una issue para alinear alcance.
- No publiques datos personales, coordenadas privadas, teléfonos, correos,
  documentos de identidad, fotos privadas, secretos, tokens ni dumps de base de
  datos en GitHub.
- GitHub no es un canal de emergencia. Los reportes reales deben entrar por la
  app ([venezuela-ayuda.com](https://venezuela-ayuda.com)) o por los canales de
  coordinación del proyecto.

## Formas de contribuir

- **Bugs:** reproduce el problema, describe el impacto y adjunta capturas
  redaccionadas cuando ayuden.
- **Mejoras de producto:** explica a qué usuario ayuda, en qué flujo ocurre y qué
  comportamiento esperas.
- **Datos o fuentes externas:** documenta origen, licencia/permiso, frescura,
  formato, campos sensibles y estrategia de deduplicación. Los cambios de ingesta
  viven en `scripts/ingest.mjs`.
- **Documentación:** mantén el español claro, enlaza archivos existentes y
  actualiza `README.md` si cambias flujos de desarrollo o despliegue.
- **Seguridad o privacidad:** no abras issue pública; escribe a
  [hola@maw.dev](mailto:hola@maw.dev) con el asunto `[Seguridad] venezuela-ayuda`.

## Flujo fork-first

Usa este flujo si no eres maintainer con permiso de escritura en el repo
principal.

1. Haz fork de `mawmawmaw/venezuela-ayuda` en GitHub.
2. Clona tu fork:

   ```bash
   git clone https://github.com/TU_USUARIO/venezuela-ayuda.git
   cd venezuela-ayuda
   ```

3. Agrega el repo original como `upstream`:

   ```bash
   git remote add upstream https://github.com/mawmawmaw/venezuela-ayuda.git
   git fetch upstream
   ```

4. Crea una rama desde `upstream/main`:

   ```bash
   git switch -c fix/descripcion-corta upstream/main
   ```

5. Instala dependencias y corre la app:

   ```bash
   npm install
   # crea .env.local con NEXT_PUBLIC_SUPABASE_URL,
   # NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y SUPABASE_SECRET_KEY
   npm run dev
   ```

6. Haz cambios pequeños y enfocados. Si el alcance crece, abre una issue nueva o
   separa otro PR.
7. Valida antes de subir:

   ```bash
   npm run lint
   npm run build
   npm test
   ```

8. Sube tu rama y abre un PR contra `mawmawmaw/venezuela-ayuda:main`.

Si eres maintainer, puedes crear una rama en el repo principal, pero conserva la
misma disciplina: rama desde `main`, PR pequeño, issue enlazada y validación
clara.

## Crear issues útiles

Antes de abrir una issue:

- Busca duplicados en issues abiertas y cerradas.
- Incluye pasos para reproducir, resultado actual, resultado esperado y contexto
  técnico cuando aplique.
- Redacta capturas: tapa nombres, teléfonos, direcciones, IDs y ubicaciones
  sensibles.
- Para incidentes de seguridad, privacidad o datos sensibles, escribe por el
  canal privado indicado arriba.

Una buena issue debe dejar claro:

- **Impacto:** a quién afecta y por qué importa.
- **Alcance:** qué parte de la app toca.
- **Evidencia:** enlaces, capturas redaccionadas, logs sin secretos o pasos
  reproducibles.
- **Criterio de cierre:** cómo sabremos que quedó resuelta.

## Expectativas para pull requests

Cada PR debe incluir:

- Issue relacionada (`Closes #123`) o una explicación de por qué no aplica.
- Descripción breve del problema y de la solución.
- Capturas o video si cambia UI.
- Validaciones ejecutadas (`npm run lint`, `npm run build`, `npm test`, pruebas
  manuales).
- Riesgos conocidos y plan de rollback si toca datos, migraciones, ingesta,
  moderación o endpoints públicos.
- Notas de privacidad/seguridad si se agregan campos, logs, formularios,
  imágenes, geocodificación o integraciones externas.

Mantén el PR revisable:

- Prefiere cambios pequeños a un PR grande con muchas responsabilidades.
- No mezcles refactors estéticos con fixes funcionales.
- No subas credenciales, `.env.local`, backups ni datos reales.
- Rebasea o actualiza tu rama si `main` cambió mucho antes de mergear.
- Responde comentarios con commits nuevos; evita resolver conversaciones sin
  explicar el cambio.

## Estilo de código

- TypeScript estricto, sin `as any` salvo justificación clara.
- Validaciones del lado servidor para entradas públicas (server actions y
  rutas API).
- Mensajes de error visibles cuando una escritura falla.
- Helpers compartidos en `src/lib/` antes de duplicar lógica.
- UI accesible en móvil y escritorio.
- Variables de entorno nuevas documentadas en `.env.example`.
- Traducciones nuevas en `messages/{es,en}/` cuando cambie copy visible.

## Migraciones de base de datos (OBLIGATORIO)

El esquema vive en `supabase/migrations/` y es la **única fuente de verdad**. No
modifiques tablas solo en el dashboard de Supabase.

- Cada cambio de esquema es un archivo SQL nuevo y secuencial
  (`0021_descripcion.sql`, etc.).
- Las migraciones se auto-aplican al hacer push a `main` o `staging` (GitHub
  Action). Cada archivo corre una sola vez vía `applied_migrations`.
- Los clientes **solo** leen las vistas `public_*`, que excluyen campos privados
  (`phone_private`, `contact`, `manage_token`, contactos de relay).
- Mantén RLS habilitado y revoca escrituras directas para `anon`/`authenticated`;
  las escrituras públicas pasan por server actions con service key.
- Si agregas una columna con datos sensibles, asegúrate de que **no** aparezca en
  las vistas `public_*` ni en respuestas de API públicas.

## Privacidad y server actions

- Los contactos **nunca** son públicos. Usa campos privados y el patrón de relay
  (`sightings`, `request_responses`) para conectar a desconocidos.
- No expongas `manage_token` en URLs públicas salvo en el enlace privado de
  gestión que ya recibe quien reportó.
- Rate limit y honeypots en server actions que aceptan input anónimo.
- Para ingesta externa, respeta la deduplicación por `dedup_key` y no confíes
  ciegamente en estados de fuentes no verificadas.

## Estilo de documentación

- Escribe en español (el copy de producto también existe en inglés vía
  next-intl).
- Enlaza documentos existentes en lugar de copiar bloques largos.
- Si cambias flujos de desarrollo, migraciones o ingesta, actualiza `README.md`.

## Conducta esperada

Este repositorio existe para ayudar en una emergencia. Se espera trato
respetuoso, colaboración de buena fe y cuidado especial al hablar de personas
afectadas. No se aceptan doxxing, acoso, especulación sobre víctimas, uso de
datos sensibles para demostrar un punto, ni presión para publicar información
que no haya sido verificada por los canales del proyecto.
