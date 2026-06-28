## Qué cambia

Describe el problema y la solución en 2-5 líneas.

## Issue relacionada

Closes #

## Tipo de cambio

- [ ] Bug fix
- [ ] Mejora de producto
- [ ] Documentación
- [ ] Migración de base de datos
- [ ] Ingesta o fuentes externas
- [ ] Seguridad/privacidad
- [ ] Refactor sin cambio funcional

## Validación

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] Prueba manual en desktop
- [ ] Prueba manual en móvil
- [ ] No aplica: cambio solo de documentación

Notas de validación:

## Seguridad, privacidad y datos humanitarios

- [ ] No agrego datos personales, coordenadas sensibles, capturas privadas,
      secretos ni dumps.
- [ ] No expongo `phone_private`, `contact`, `manage_token` ni contactos de
      relay en vistas o APIs públicas.
- [ ] No cambia RLS, grants, vistas `public_*`, rate-limit ni server actions.
- [ ] Si cambia algo sensible, el riesgo y el rollback están explicados aquí:

Notas de riesgo/rollback:

## Migraciones (si aplica)

- [ ] No aplica: sin cambios en `supabase/migrations/`
- [ ] Nueva migración SQL secuencial y revisada
- [ ] Campos sensibles excluidos de vistas `public_*`

## UI

Agrega capturas o video si cambia la interfaz pública.
