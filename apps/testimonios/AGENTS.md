<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Instrucciones del proyecto — Testimonios

### Alcance
- Trabajar únicamente en `apps/testimonios`, salvo autorización explícita para modificar otras aplicaciones o `packages/ui`.
- Inspeccionar la implementación existente antes de modificar código.
- Priorizar cambios pequeños, mantenibles y fáciles de revisar.
- No introducir refactorizaciones, dependencias ni funcionalidades fuera del alcance solicitado.
- Preservar el comportamiento existente salvo que la tarea requiera modificarlo.

### Diseño y componentes
- Usar `app/globals.css` como referencia de los tokens visuales implementados.
- Para trabajos de UI, consultar `docs/ui/README.md` y la documentación del componente correspondiente cuando resulte relevante.
- `apps/landing-contratar/docs/ui/design-system.md` es una referencia interna que puede estar desactualizada respecto de la web oficial.
- Tomar `nocountry.tech` como referencia visual cuando la tarea lo requiera, sin copiar directamente su CSS compilado.
- Utilizar las convenciones existentes de Tailwind CSS v4.
- Evaluar el impacto de cambios globales sobre galería, ficha individual y formulario.
- Evitar modificar componentes compartidos sin comprobar qué otras pantallas los utilizan.
- Actualizar la documentación y el JSDoc cuando cambie la API o el comportamiento documentado de un componente.

### Lógica y datos
- No modificar consultas de Supabase, validaciones ni lógica de negocio en tareas exclusivamente visuales.
- Preservar la configuración de renderizado dinámico de la galería y su comportamiento de publicación.
- No enviar datos de prueba, ejecutar migraciones ni modificar servicios compartidos sin autorización.
- No mostrar ni copiar credenciales, tokens o contenido de archivos `.env*`.

### Protección de credenciales y secretos
- No abrir ni leer archivos `.env`, `.env.local`, `.env.production` u otros archivos de credenciales, ni imprimir, copiar o inspeccionar sus valores, sin autorización explícita del desarrollador.
- La restricción incluye claves públicas y privadas, tokens, contraseñas y cadenas de conexión. No leer una clave innecesariamente aunque sea pública por diseño.
- Para comprender la configuración, priorizar `.env.example`, la documentación y los nombres de variables presentes en el código, sin acceder a sus valores reales.
- No incluir secretos ni valores de credenciales en respuestas, logs, scripts de prueba, capturas, documentación o archivos generados.
- Si una tarea requiere consultar credenciales, explicar qué información hace falta y solicitar autorización antes de acceder a ella.
- Si aparece accidentalmente un secreto en una salida, no reproducirlo ni continuar exponiéndolo; informar del incidente sin mostrar el valor.
- Se permite ejecutar herramientas normales del proyecto, como build, lint y pruebas, aunque carguen variables de entorno automáticamente. La restricción se refiere a inspeccionar o exponer sus valores.

### Flujo de trabajo
- Respetar la arquitectura y los patrones existentes.
- No ejecutar `git add`, `commit`, `push`, `merge`, `rebase` ni `reset` sin autorización explícita.
- No crear Pull Requests ni desplegar cambios automáticamente.
- Realizar las validaciones pertinentes y ejecutar `git diff --check`.
- Informar errores preexistentes sin corregirlos fuera del alcance solicitado.
- No afirmar que una prueba pasó si no se ejecutó.
- Al terminar, explicar qué cambió, qué archivos se modificaron, qué se validó y qué riesgos quedan.
- Detenerse al completar la etapa solicitada para permitir revisión humana.
- No dejar servidores de desarrollo ni procesos de prueba
  ejecutándose al terminar una tarea. Si se inician para
  validaciones, detenerlos antes de finalizar, sin afectar
  procesos iniciados por el usuario.
