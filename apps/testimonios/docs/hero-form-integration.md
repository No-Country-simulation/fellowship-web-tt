# Hero y formulario en `/enviar`

Rama: `feat/testimonios-hero-form-integration`. La integración funcional fue aprobada en localhost por el desarrollador; el ajuste posterior de alineación queda pendiente de revisión manual antes del commit. Las cinco etapas anteriores fueron aprobadas en Demo Day y mergeadas a `dev`; se conservan sus evidencias históricas.

## Alcance de publicación

| Ruta | Alcance de producto |
| --- | --- |
| `/enviar` | Flujo aprobado para integrarse con la plataforma de simulaciones: hero, autorización, carrusel, cinco pasos, resumen, edición, envío y éxito. La plataforma deberá usar esta ruta como entrada. |
| `/` | Galería pública con navbar/footer institucionales: funcionalidad futura, sin aprobación de publicación definitiva. |
| `/t/[slug]` | Detalle de testimonios: pendiente junto con la galería. |

Se conserva el código y el comportamiento de las rutas futuras, sin rediseñarlas, eliminarlas ni trasladarlas. La aprobación funcional de `/enviar` no aprueba esas otras pantallas ni sustituye la revisión editorial/legal.

**Pendiente técnico:** definir cómo limitar la exposición de las rutas futuras en producción si se mantiene la misma aplicación Next.js. Esta documentación no las oculta. El build estándar incluye `/`, `/enviar` y `/t/[slug]`; renderizado dinámico y grupos de rutas no son restricciones de acceso.

La configuración versionada revisada es `next.config.ts` (imágenes y límite de acciones, sin restricciones), `package.json` (`next build`/`next start`) y `turbo.json` (orquestación del monorepo). Los README describen un proyecto Vercel por aplicación y Root Directory `apps/testimonios`. No se encontraron reglas versionadas de Proxy/Middleware, `vercel.json` ni un workflow de despliegue en este checkout. No se accedió a la configuración real del proyecto Vercel ni se verificó un dominio productivo: podrían existir reglas externas que el repositorio no permite confirmar. En el servidor local de producción usado para QA, las rutas futuras siguen accesibles con datos sintéticos.

Alternativas a decidir antes de exponer únicamente el flujo aprobado, sin implementarlas aquí:

1. Restringir rutas en el hosting, proxy o firewall: permitir `/enviar`, sus GET/RSC y POST de Server Actions, recursos `/_next/*`, `/brand/*`, `/icon.ico`, imágenes y fuentes; denegar las rutas futuras. La política debe cubrir también el origen y las URLs alternativas del despliegue. Requiere verificar el hosting y probar recursos, acciones y pantallas de error, evitando enlaces de retorno a rutas bloqueadas.
2. Incorporar posteriormente una restricción de rutas en la aplicación (Proxy o comprobación explícita en páginas), con política definida para rutas futuras. No se agrega ninguna variable, feature flag, redirección o restricción en este ajuste.
3. Preparar una aplicación/build independiente que contenga solo la experiencia aprobada. Implica más estructura y mantenimiento; no se realiza ahora.

Publicar un enlace únicamente a `/enviar`, quitar enlaces o usar `noindex` no impide acceder al resto por URL ni excluye rutas del build. Tampoco restringir la aplicación vuelve privados los objetos o datos que ya sean públicos en Storage; no se modifican permisos ni servicios.

## Contenedor y lectura compartidos

`components/form-layout.module.css` es exclusivo de `/enviar`. Su clase `gutter` aplica padding horizontal una sola vez, en el wrapper exterior: `min(var(--spacing-md), 24px)` por debajo de `48rem` (768px con el tamaño inicial habitual), y `min(var(--spacing-lg), 32px)` desde ese breakpoint. La clase interior `container` usa `width: 100%`, `min-width: 0`, `max-width: 70rem` y márgenes automáticos, sin padding lateral propio.

Header, hero y formulario usan estas mismas clases. Se retiran los límites independientes de 51rem/48rem y el padding duplicable del header. A fuente normal, el máximo de contenido es 1120px; en 1440/1920px el formulario puede ocupar esos 1120px, centrado en los mismos extremos que el hero. No se cambia el ancho global de la galería/ficha ni se agregan columnas a campos, categorías o resumen.

La descripción del hero conserva 36rem y la introducción 44rem. El relato de resumen y los párrafos largos de éxito se limitan a 44rem. El aviso final conserva toda la fila para no alterar los botones; su texto interno también se limita a 44rem. Las fotografías conservan los límites existentes y sus proporciones. No se modifica recorte, almacenamiento ni lógica de campos.

Se retiran las antiguas compensaciones de margen negativo del título y tarjetas del resumen: recuperaban padding en rem del wrapper anterior al ampliar texto. Con gutters ya acotados expandían el resumen y desplazaban «Editar» fuera de sus bordes. Las palabras más largas que el ancho disponible pueden partirse a 320px/200%, conservando el tamaño ampliado y el texto completo; las palabras que caben permanecen enteras. No se altera el modo de edición, sus validaciones ni la distribución de campos.

## Enlaces del flujo y dependencias futuras

- Se retira «Volver al inicio» de `EnviarIntro`: apuntaba a la galería futura. No se agrega otro enlace arriba; se reutiliza el único «Volver a la introducción» ya implementado en el paso 1, con su mismo foco y conservación de estado. Desde pasos posteriores se llega al primero mediante el progreso existente.
- El enlace de éxito «Volver al inicio» ya apunta a `/enviar` mediante `buildHeroHref(locale)`, no a la galería; se mantiene sin cambios. Las invitaciones también apuntan a `/enviar`.
- **«Leer historia» del carrusel sigue apuntando a `/t/[slug]`**. No se elimina ni cambia su lógica. Es una dependencia real con la experiencia futura: si el despliegue bloquea detalles, el enlace dejará de funcionar. El equipo debe decidir entre autorizar solo esos detalles, reemplazar la lectura por una presentación dentro del flujo o condicionar/retirar el enlace en una tarea aprobada antes de aplicar restricciones. Bloquear detalles sin resolverlo produciría enlaces rotos.
- El navegador puede volver a una página previa de galería si desde allí se entró al formulario. No se reescribe su historial ni se interpreta esto como aprobación de publicación.

## Arquitectura

Antes, `/` mostraba el hero con una casilla que solo habilitaba la navegación; `/enviar` permitía acceso directo al formulario. El parser generaba `consent_at` sin recibir una declaración afirmativa.

Ahora `app/enviar/page.tsx` resuelve el idioma y obtiene exclusivamente publicados mediante la consulta existente. `selectHeroStories()` selecciona hasta tres en servidor. La ruta es dinámica. No se importan repositorios administrativos, clientes privados ni componentes del panel. No se modifican las consultas públicas.

`FormLocaleProvider` y `FormHeader` son únicos y rodean toda la experiencia. `EnviarExperience` comparte aceptación y controla la vista. Reutiliza `GalleryHero`, `HeroConsent`, `GalleryHeroCarousel`, `EnviarIntro` y `EnviarForm`. El hero se desmonta al comenzar. El formulario permanece montado, oculto e inert durante la introducción y al volver: conserva valores, categorías, archivos y validaciones, sin almacenamiento adicional. Solo hay un main y un h1 visible; no se monta navbar/footer institucional en `/enviar`.

`GalleryHero` pasa a ser una vista de la experiencia cliente sin consultas propias. Título, descripción, estados vacío/error y nombres de controles del carrusel usan ES/EN/PT. Las tarjetas HTML/CSS, citas y textos de publicación conservan su diseño y contenido original. No se implementa la migración a PNG/WebP.

`/` recupera `TestimonialsGallery`, búsqueda, filtros, estados vacío/error y enlaces a fichas, con chrome público. Su CTA apunta a `/enviar`; los enlaces heredados `/?lang=...#hero-consent` conservan un ancla en ese CTA y transmiten el idioma explícito. `/t/[slug]` se conserva. Las nuevas invitaciones de éxito y portapapeles conducen a `/enviar?lang=...`, sin fragmento. La invitación sigue siendo un enlace nativo: en la misma sesión abre un documento nuevo y descarta el envío terminado; evita una navegación solo de hash que conservaría la pantalla de éxito. La transición normal hero → paso 1 sigue sin recarga.

## Navegación y foco

- Entrada directa o recarga completa: introducción, casilla desmarcada y CTA deshabilitado. Query/hash no representan aceptación.
- Marcar habilita el CTA y desmarcar lo bloquea. Comenzar cambia estado en la misma URL, sin POST, redirección ni History API. El foco pasa al encabezado localizado del paso 1.
- Se conservan cinco pasos, avance validado, navegación a anteriores, validación integral, resumen y edición.
- Desde el paso 1, «Volver a la introducción» enfoca el título del hero. Conserva datos y aceptación en memoria. Se puede revocar esta última; para reanudar es necesario marcar nuevamente. El carrusel reinicia al volver a montarse.
- Atrás del navegador abandona el flujo hacia la entrada anterior; introducción y pasos no crean entradas. Adelante puede restaurar el estado mediante la caché de navegación de Next. En el QA ejecutado regresó a la introducción. No se promete persistencia de borradores entre documentos, pestañas o sesiones.
- Una recarga completa reinicia borrador, archivos y aceptación, como ocurre con los datos del formulario anterior. La cookie preexistente conserva exclusivamente idioma; cambiar idioma durante el flujo no reinicia datos ni cambia la URL.
- Un rechazo `consent.required` del servidor conserva el formulario, muestra el hero, desmarca y enfoca la casilla con error localizado asociado. Renovar la aceptación reanuda el resumen conservado. Se retira solamente ese mensaje; los rechazos de datos conservan su reconciliación.

`lib/form-focus.ts` reutiliza el foco y scroll anteriores con el offset del header sticky. No hay animación nueva ni temporizadores de transición. Se mantienen foco visible de controles, áreas táctiles y movimiento reducido.

## Declaración y fecha de consentimiento

El checkbox controlado comparte su valor con `EnviarForm`. El envío comprueba ese valor y añade una única entrada `consent=on` a FormData. Los profesionales inactivos siguen excluidos. Guardar cambios continúa validando únicamente datos editables, sin construir FormData ni ejecutar acciones.

`parseTestimonialForm()` exige exactamente una entrada string igual a `on`. Ausencia, valores negativos/vacíos/alternativos, archivos y duplicados devuelven el error semántico `consent.required`. La acción retorna antes de invocar store, uploads o notificaciones. Haber habilitado un CTA en el cliente no reemplaza esta comprobación.

Solo después de validar declaración y datos se genera `consentAt` con el reloj del servidor. El store persiste ese valor en `consent_at`; ignora fechas enviadas por el cliente. Un envío inválido no crea una fila ni registra fecha. No se modifica esquema, Storage, rollback, notificaciones ni firma de la Server Action. El único campo nuevo del envío es la declaración explícita.

`consent_at` identifica el procesamiento de un envío válido que contiene aceptación afirmativa. No es la hora original del clic ni prueba criptográfica de identidad, lectura o interacción física. Un cliente que llame directamente a la acción puede declarar `on`. No se incorporan autenticación, tokens firmados, secretos, cookies de consentimiento, acciones de transferencia ni integración entre aplicaciones.

Esta semántica se aplica a los envíos procesados por la nueva versión. Los registros anteriores conservan sus fechas y no se reinterpretan como declaraciones comprobadas por este contrato. No se persisten versión del texto, idioma de aceptación ni instante del clic; no pueden reconstruirse a partir de la fecha sola. No se agrega una migración para ese propósito.

La autorización completa y el aviso final conservan el mismo alcance: galería y Discord, correo privado y moderación. El aviso final es un recordatorio, sin segunda casilla. La aprobación editorial/legal definitiva y la revisión competente PT-BR siguen siendo responsabilidad del equipo; Demo Day no implica aprobación legal.

## QA y evidencias

Desde `apps/testimonios`, con dependencias existentes:

```sh
node scripts/test-form-i18n.mjs
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint . --max-warnings 0
pnpm run build
node scripts/qa-hero-form-integration.mjs
node scripts/qa-form-submit-validation.mjs --hero-form
node scripts/qa-form-summary.mjs --edit-summary --hero-form
node scripts/qa-form-i18n.mjs --hero-form
git diff --check
```

En PowerShell se puede usar `pnpm.cmd` cuando la política local bloquea `pnpm.ps1`, sin modificarla. El build descarga DM Sans desde Google Fonts; no se inspeccionan archivos de entorno. El QA usa publicados/avatares sintéticos de `qa-public-fixture.mjs`, bloquea otros accesos externos y bloquea/intercepta los POST antes de Next. Las pruebas de acción/store usan dobles aislados.

`qa-enter-form.mjs` prepara los scripts históricos mediante la casilla/CTA reales; `qa-hero-consent.mjs` conserva una entrada compatible. `--hero-form` separa los nuevos reportes de las evidencias anteriores. Se conservan [cuatro PNG y tres JSON](./ui/assets/hero-form-integration/README.md), sin ampliar la selección con matrices redundantes.

Resultados de la integración inicial, anteriores al ajuste de layout: **PASS**. Los reportes seleccionados se regeneran durante el ajuste con los nuevos anchos; sus mediciones actualizadas se documentan al cierre de esta revisión.

- Unitarias: **93/93 en 14 suites**, incluida declaración ausente/negativa/malformada/duplicada/archivo en las tres categorías, rechazo antes de persistencia/notificación y fecha de servidor. Contrato y catálogos ES/EN/PT: **190 claves**, sin problemas de codificación.
- TypeScript (`--noEmit --incremental false`), ESLint (`--max-warnings 0`), build de producción y `git diff --check`: **PASS**. El primer build restringido no pudo descargar la fuente; el build normal con acceso a Google Fonts terminó correctamente, sin cambiar configuración.
- Introducción: **9 recorridos**, **24 combinaciones del hero y 24 del aviso final**, más **8 de galería**, a 320/375/768/1440 px y fuente al 100/200%. Entrada, gate, teclado, toque, AX, foco, idioma en vivo, retorno con datos/foto, revocación, carrusel, rutas públicas e historial: PASS. Cero POST de registro.
- Validación/envío: **9 recorridos y 45 POST interceptados**. Datos inválidos, cambio de categoría, errores sucesivos del servidor, aceptación renovada tras rechazo y apertura de invitación desde éxito con borrador/aceptación reiniciados: PASS.
- Resumen/edición/imágenes: **9 recorridos y 288 combinaciones responsive**, **36 distribuciones con errores**, **42 capturas/detalles verificados en memoria**, **27 POST interceptados y cero PNG escritos**. Confirmación, recortes, proporciones, reemplazo, cancelación, conservación de archivos, edición y limpieza de URLs: PASS. El único campo adicional de envío es `consent`; los archivos finales mantienen identidad.
- Regresión histórica de i18n: metadata SSR/cliente, query/cookie/History, layouts, 404, cinco pasos, tres categorías, modal, estado pendiente, éxito y portapapeles: **PASS**, con **2 POST interceptados**. Su reporte y capturas auxiliares quedan ignorados en `.next/hero-form-i18n`, sin sobrescribir evidencia histórica ni aumentar la selección versionable.
- En los reportes: **cero envíos reales, cero solicitudes externas y cero excepciones de navegador**. Se cerraron servidores, navegadores y perfiles propios. No se modificaron componentes/CSS de fotografías, tarjetas ni Design System, consultas públicas, configuración de Next, dependencias, store o notificaciones.

Pendientes manuales: revisión localhost del desarrollador, dispositivos físicos, zoom nativo, Safari/Firefox y lectores de pantalla. Fuente raíz al 200% comprueba reflow y no equivale a certificación de accesibilidad. La revisión editorial/legal sigue pendiente del equipo.

## QA del ajuste de layout y alcance

Estado: **PASS técnico**, pendiente de revisión manual del desarrollador. Los cambios de este ajuste son contenedor/lectura, retirada del enlace redundante, QA y documentación. Consentimiento, parser, `consent_at`, validaciones, carrusel, tarjetas, Storage y notificaciones conservan la implementación aprobada. Las diferencias de esos módulos que aún aparecen en Git pertenecen a la integración anterior sin commit.

- **93/93 unitarias en 14 suites**. TypeScript, ESLint sin advertencias, build de producción y `git diff --check`: PASS.
- **576 mediciones de alineación**: 540 en los cinco pasos de nueve recorridos y 36 en el hero. ES/EN/PT, 320/375/768/1024/1440/1920px y fuente raíz al 100/200%. Diferencia máxima medida entre extremos de header y contenido: **0px**; sin doble padding ni desbordamiento. Logo y selector coinciden con sus extremos.
- A fuente normal, se midió contenido de **1120px en 1440 y 1920px**, centrado en el mismo eje que el hero. La distribución mantiene cinco celdas de progreso y las columnas existentes de categorías/campos, con controles dentro del contenedor.
- Resumen, edición e imágenes: **432 combinaciones responsive**, 36 distribuciones con errores móviles, **42 capturas/detalles comprobados en memoria** y **27 POST interceptados**. Conservación, reemplazo, cancelación, proporciones y revocación de object URLs: PASS. Las palabras más anchas que su contenedor se registran como tales; se conserva la prueba de palabras enteras cuando caben y la comprobación de texto pintado y sin recortes.
- Consentimiento/validación: **9 recorridos, 45 POST interceptados**, sin alterar reglas ni payload. Regresión adicional de idiomas, metadata, layouts, 404, recorte, teclado/foco y portapapeles: **PASS**, con **2 POST interceptados**. La prueba de Shift+Tab parte ahora de la primera categoría y la de regreso a galería usa el historial; no requiere recuperar el enlace retirado.
- Transición hero → formulario → hero con datos confirmados, cambio de idioma, navegación por teclado y foco: PASS. Galería/detalle continúan accesibles en el servidor local de producción con fixtures, confirmando que no se implementó una restricción.
- **Cero envíos reales, uploads o notificaciones externas**; cero solicitudes externas y excepciones de navegador en los reportes. Servidores, navegadores y perfiles propios cerrados.

Se regeneran las **cuatro imágenes seleccionadas y tres reportes** de la carpeta de integración. La captura auxiliar `layout-en-1440-step1.png` se genera para inspección local y queda ignorada; no se añade a la selección ni se enlaza como evidencia versionada. Los PNG de etapas anteriores se conservan. La matriz de resumen no escribe PNG nuevos. Zoom nativo, dispositivos físicos, Safari/Firefox y lectores de pantalla reales siguen pendientes; ampliar la fuente raíz no equivale a zoom nativo ni certifica accesibilidad.

## Archivos de implementación

Todos los caminos son relativos a `apps/testimonios`:

| Grupo | Archivos |
| --- | --- |
| Rutas | `app/(public)/page.tsx`, `app/enviar/page.tsx` |
| Experiencia | `components/enviar-experience.tsx`, `enviar-form.tsx`, `enviar-intro.tsx`, `form-header.tsx`, `gallery-hero.tsx`, `hero-consent.tsx`, `gallery-hero-carousel.tsx` |
| Layout | `components/form-layout.module.css` (nuevo), `form-header.module.css`, `gallery-hero.module.css`, `form-controls.module.css` |
| Foco y declaración | `lib/form-focus.ts` (nuevo), `lib/testimonials/parse.ts` |
| Idiomas | `lib/form-i18n/locales.ts`, `types.ts`, `messages/es.ts`, `messages/en.ts`, `messages/pt-BR.ts` |
| Unitarias | `lib/form-i18n/infrastructure.test.ts`, `lib/testimonials/form-errors.fixtures.ts`, `server-errors.test.ts` |
| QA | `scripts/qa-enter-form.mjs` y `qa-hero-form-integration.mjs` (nuevos); adaptaciones de `qa-hero-consent.mjs`, `qa-public-fixture.mjs`, `qa-form-i18n.mjs`, `qa-form-steps.mjs`, `qa-form-submit-validation.mjs`, `qa-form-summary.mjs`, `qa-form-acceptance.mjs`, `qa-form-ux.mjs` |
| Documentación | Este documento; `README.md`, `docs/form-steps-summary.md`, `form-i18n-audit.md`, `form-i18n-text-inventory.md`, `docs/ui/README.md` y fichas de hero, carrusel y header |
| Evidencia | `docs/ui/assets/.gitignore`; nueva carpeta `hero-form-integration/` con README, cuatro PNG y tres JSON |

Estado al cierre de la integración inicial: **32 archivos modificados y 12 nuevos**. El ajuste de layout añade cambios a ese trabajo aún sin commit; el estado actualizado se informa al entregar la revisión. Todos los archivos permanecen dentro de `apps/testimonios`, sin staging.

Estado tras el ajuste: **38 archivos modificados y 13 nuevos** (`git status --short --untracked-files=all`), incluidos los cambios previos de integración. El estado corto agrupa los nuevos archivos en seis entradas. No hay eliminaciones ni archivos en staging.

Sin commit, push, merge, PR ni cambios fuera de `apps/testimonios`.
