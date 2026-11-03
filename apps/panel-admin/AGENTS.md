<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Instrucciones del proyecto — Panel admin

`apps/panel-admin` es un mock reducido del panel oficial (`admin-panel-v2`). El entregable es la sección de testimonios, escrita para copiarla a producción sin arrastrar piezas de este mock.

### Dónde se trabaja

- Los cambios van en `apps/panel-admin`.
- Inspeccionar la implementación existente antes de modificar código.
- Priorizar cambios pequeños, mantenibles y fáciles de revisar.
- Cada archivo nuevo tiene que ser algo que producción conserve. No introducir refactorizaciones, dependencias ni funcionalidades fuera del alcance solicitado.
- Preservar el comportamiento existente salvo que la tarea requiera modificarlo.
- En `apps/testimonios` solo se editan documentación (`docs/`) y migraciones (`supabase/migrations/`), cuando el cambio del panel lo exige. El código de esa app no se toca. Leerla para entender datos y contratos está permitido.
- Dashboard, simulaciones, proyectos, staffing y completion son mock. No se editan, no se conectan a datos reales y no se usan desde testimonios.

### Cómo se escribe testimonios

Seguir la estructura que ya usa el panel:

- Páginas en `app/(panel)/testimonials`: componen la pantalla y leen por el repository.
- Feature en `features/testimonials`: `components/`, `types/`, `infrastructure/`, `actions/`.
- Supabase solo en `infrastructure/`. Las mutaciones son Server Actions.
- Reutilizar el shell (`features/shell`) y `shared/ui`. El shell se toca solo para que testimonios entre en la navegación existente.
- Respetar la arquitectura y los patrones existentes. Un helper de testimonios no importa mocks del dashboard ni de otras secciones.

### Autenticación

No hay login, guards ni sesión en este mock. En producción el shell ya queda detrás del JWT. Acá `/` redirige a `/dashboard` y `/testimonials` usa el mismo shell, sin chequeo propio. No agregar un login local para probar el panel.

### Diseño y componentes

- Reutilizar `shared/ui` y los patrones visuales que ya usa el shell antes de crear un componente nuevo.
- Evaluar el impacto de un cambio de testimonios sobre el inbox (`/testimonials`) y la ficha (`/testimonials/[id]`).
- Evitar modificar componentes compartidos del shell o de `shared/ui` sin comprobar qué otras pantallas los utilizan.
- Actualizar la documentación cuando cambie la API o el comportamiento documentado de un componente.

### Lógica y datos

- En tareas exclusivamente visuales, no modificar consultas de Supabase, validaciones ni Server Actions.
- El repository de testimonios lee y escribe Supabase con `service_role`. El resto del panel sigue en mock.
- No enviar datos de prueba, ejecutar migraciones ni modificar servicios compartidos sin autorización. Una migración nueva va en `apps/testimonios/supabase/migrations` solo cuando el panel necesita un cambio de esquema.
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

- No ejecutar `git add`, `commit`, `push`, `merge`, `rebase` ni `reset` sin autorización explícita.
- No crear Pull Requests ni desplegar cambios automáticamente.
- Realizar las validaciones pertinentes y ejecutar `git diff --check`.
- Informar errores preexistentes sin corregirlos fuera del alcance solicitado.
- No afirmar que una prueba pasó si no se ejecutó.
- Al terminar, explicar qué cambió, qué archivos se modificaron, qué se validó y qué riesgos quedan.
- Detenerse al completar la etapa solicitada para permitir revisión humana.
- No dejar servidores de desarrollo ni procesos de prueba ejecutándose al terminar una tarea. Si se inician para validaciones, detenerlos antes de finalizar, sin afectar procesos iniciados por el usuario.

### Ejemplos

❌ Un login local para “probar” el panel
❌ Editar `features/simulations` mientras se arregla el inbox
❌ Un helper de testimonios que importa mocks del dashboard
❌ Cambiar un componente o una consulta de `apps/testimonios`
✅ Publicar vive en `features/testimonials/actions` y `infrastructure/repositories`
✅ Una migración en `apps/testimonios/supabase/migrations` cuando el panel necesita una columna nueva