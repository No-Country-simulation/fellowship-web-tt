# Issue 2 — Auditoría del formulario multilingüe de Testimonios

Auditoría original: 31 de octubre de 2026. Etapas 1–4 actualizadas: 1 de noviembre de 2026. Rama: `feat/testimonios-form-i18n`.

**Estado actual: etapas 1–4 implementadas; pendiente de revisión visual humana y revisión editorial/legal antes del lanzamiento.** El formulario ES/PT-BR tiene header propio y conserva reglas, datos y navegación de cinco pasos. Home y fichas conservan su navbar/footer mediante un grupo público. El [inventario editorial ES/PT-BR](./form-i18n-text-inventory.md) conserva los textos históricos; los catálogos existentes alimentan todo el árbol propio del formulario. Cada sección 0 registra el cierre de su etapa; las secciones 1–12 conservan el diagnóstico y propuestas originales salvo sus estados actualizados.

## 0. Etapa 1 — estado al cerrar la infraestructura

Los módulos siguientes son puros y compartibles entre Server Components y Client Components. No contienen providers, hooks de navegación, detección automática, cookies ni persistencia. Al cerrar etapa 1 ninguna página ni componente los importaba; etapa 2 conecta exclusivamente la presentación de errores en ES, como se detalla abajo. **Visitar `?lang=pt-BR` aún no traduce el formulario**.

| Archivo | Implementación |
| --- | --- |
| [locales.ts](../lib/form-i18n/locales.ts) | `FormLocale`, normalización estricta, resolución desde query y constructor de enlaces relativos. |
| [types.ts](../lib/form-i18n/types.ts) | Contrato compartido `FormMessages`, claves hoja `FormMessageKey` y claves de países. Hojas `string`, independientes de los literales españoles. |
| [messages/es.ts](../lib/form-i18n/messages/es.ts), [messages/pt-BR.ts](../lib/form-i18n/messages/pt-BR.ts) | 163 claves por idioma, basadas en las propuestas del inventario, con `satisfies FormMessages`. Incluyen los tres labels confirmados del formulario; no sustituyen labels globales. |
| [format.ts](../lib/form-i18n/format.ts) | Contrato de nueve mensajes parametrizados; deriva tipos de argumentos y valida sus tipos en ejecución. Interpolación de texto plano. |
| [messages.ts](../lib/form-i18n/messages.ts) | Acceso serializable a catálogos, `createFormTranslator`, lookup con fallback y metadatos de revisión del consentimiento. |
| [limits.ts](../lib/form-i18n/limits.ts) | Valores de presentación derivados de las constantes existentes de `parse.ts`; no introduce reglas de validación. |
| [countries.ts](../lib/form-i18n/countries.ts) | Mapea los 19 valores actuales a claves semánticas; traduce etiquetas sin cambiar valores ni orden. |
| [infrastructure.test.ts](../lib/form-i18n/infrastructure.test.ts) | Pruebas de infraestructura y aserciones negativas compiladas de tipos. |
| [scripts/test-form-i18n.mjs](../scripts/test-form-i18n.mjs) | Runner con TypeScript existente y `node:test`; compila en un directorio temporal y lo elimina tras terminar. No añade framework ni modifica `package.json`. |

### Locale y enlaces

- Solo `es` y `pt-BR` son válidos, respetando exactamente mayúsculas y guion. El valor predeterminado es `es`.
- `resolveFormLocale` acepta el objeto de `searchParams` de una página o una interfaz cliente con `getAll`. La página deberá esperar su promesa antes de llamar a la utilidad.
- Un `lang` ausente, vacío, desconocido o repetido vuelve a ES. También se rechazan arrays, incluso de un elemento; no se selecciona arbitrariamente el primer valor. `lang=pt-BR&lang=pt-BR` es repetido y vuelve a ES.
- No se normalizan alias como `pt`, `pt-br` o espacios. No se infiere nada de país, IP, navegador o relato.
- `buildFormHref("es")` devuelve `/enviar?lang=es`; `buildFormHref("pt-BR")` devuelve `/enviar?lang=pt-BR`. También `/enviar` se resuelve como ES, sin redirección.
- El constructor admite `search` y `hash`, conserva parámetros ajenos y reemplaza cualquier `lang` anterior por un único valor canónico. Devuelve un enlace relativo codificado; no navega, escribe History API ni modifica estado.

### Contrato, interpolación y fallback

Cada catálogo usa el mismo contrato de secciones y claves semánticas. `FormMessageKey` admite solo hojas traducibles; los parámetros de `FormTranslator` se derivan de `FORM_MESSAGE_PARAMETERS`. Faltas de claves, parámetros mal escritos o tipos incorrectos se detectan en TypeScript; las pruebas verifican además los placeholders reales de ambos catálogos.

Ejemplos para consumidores futuros, sin integración actual:

```ts
import { createFormTranslator } from "@/lib/form-i18n/messages";
import { FORM_LIMITS } from "@/lib/form-i18n/limits";

const t = createFormTranslator("pt-BR");
t("form.progress", { step: 2, total: 5, title: t("form.steps.identity.title") });
// Etapa 2 de 5 · Nome, país, e-mail e foto
t("form.story.hintWithLimits", { hint: t("form.story.defaultHint"), ...FORM_LIMITS.story });
// Com suas próprias palavras. Entre 20 e 4000 caracteres.
t("form.fields.avatar.requirements", FORM_LIMITS.avatar);
// JPG, PNG ou WebP · Máximo de 5 MB.
t("form.story.counter", { current: 38, max: FORM_LIMITS.story.max });
// 38/4000
```

Los números de límites se importan de las reglas existentes; el catálogo solo contiene placeholders. Los mensajes son frases completas por idioma, sin interpolación de HTML ni concatenación de fragmentos gramaticales. El resultado es un `string` para renderizar como texto; no se utiliza `dangerouslySetInnerHTML`.

Fallbacks implementados:

1. Locale no admitido → catálogo ES completo.
2. Clave conocida ausente o vacía en un catálogo → texto ES de esa clave.
3. Clave desconocida recibida en ejecución → error público genérico del idioma seleccionado, con último fallback ES. Los tipos impiden usarla normalmente.
4. Parámetro obligatorio ausente, de tipo incorrecto o numérico no finito → `TypeError` explícito; no se exponen tokens sin resolver ni valores personales en ese error. No se oculta un fallo de programación como traducción válida.

### Revisión humana e integración pendiente

El catálogo copia el consentimiento ES vigente íntegro y la propuesta PT del inventario. `FORM_CONSENT_REVIEW_STATUS` marca **ambos idiomas como `pending-editorial-legal-review`**. Ese estado es metadata técnica; no se añade al texto de autorización. Se conservan galería y Discord, sin ampliar canales.

Las propuestas PT-BR requieren revisión brasileña; también siguen pendientes el matiz de la pregunta sobre empleo, el footer y el destino del logo. La lista de países sigue siendo provisional. Implementar sus claves no equivale a aprobación editorial/legal. Al integrar las categorías se debe conservar el orden existente de `TESTIMONIAL_TYPES`/`TYPE_OPTIONS`, consultando el catálogo por ID; el orden de propiedades del diccionario no define opciones ni lógica de negocio.

La etapa 1 preparó catálogos, acceso puro, tipos, formateo, límites y enlaces. La migración de errores se completó en etapa 2. Siguen pendientes el provider, el selector, la lectura de query desde la página, metadata/lang, el header y el resto de las traducciones visibles.

### Verificación de esta etapa

Desde `apps/testimonios`, ejecutar `node scripts/test-form-i18n.mjs`, `pnpm.cmd exec tsc --noEmit --incremental false` y `pnpm.cmd run lint`. Desde la raíz, `git diff --check`. En Windows se utiliza `pnpm.cmd` para evitar la restricción local de scripts PowerShell; no se modifica esa política.

Resultados del 1 de noviembre de 2026:

- `node scripts/test-form-i18n.mjs`: **33/33 pruebas correctas**, siete grupos, sin omitidas; también compila las aserciones negativas del contrato.
- `pnpm.cmd exec tsc --noEmit --incremental false`: correcto, sin errores.
- `pnpm.cmd run lint`: correcto, sin errores ni advertencias de ESLint.
- `git diff --check`: correcto, sin errores de whitespace; también se verificó whitespace en los archivos nuevos y referencias locales de los documentos.
- Manifests raíz/app y `pnpm-lock.yaml`: sin diferencias. Sin dependencias nuevas.

La suite cubre locales válidos/ausentes/inválidos/repetidos, enlaces y encoding, 163 claves y estructura idéntica, placeholders, interpolación, constantes reales, categorías, países, consentimiento y fallback. La cobertura de claves usa el inventario histórico; no congela las traducciones propuestas, que podrán corregirse tras revisión conservando la referencia histórica.

En etapa 1 no se inició navegador, servidor Next ni batería funcional del formulario, y no se ejecutaron envíos ni escrituras externas. El plan de QA funcional de la sección 10 sigue pendiente para la integración.

## 0.b. Etapa 2 — incidencias semánticas y validaciones localizables

### Contrato y archivos

| Archivo | Cambio implementado |
| --- | --- |
| [lib/testimonials/issues.ts](../lib/testimonials/issues.ts), nuevo | `FormIssue`, `FormIssueCode` y constructor `formIssue`. Códigos derivados de las claves `form.errors.*`; parámetros derivados del contrato existente de interpolación. Sin importaciones runtime de catálogos. |
| [parse.ts](../lib/testimonials/parse.ts) | `FieldErrors` asocia campos a incidencias, `ParseResult` devuelve `issue`. Mismas condiciones, límites y normalizadores; `validateCountry` y `validateImageFile` devuelven códigos. |
| [form-validation.ts](../lib/testimonials/form-validation.ts) | Validación local por incidencias y reconciliación independiente de textos; exporta `ResolvedFormErrors`. |
| [submit-state.ts](../lib/testimonials/submit-state.ts) | Estado de error serializable con `issue`, `fieldErrors` y `step`; se preservan `idle/error/success`. |
| [actions.ts](../lib/testimonials/actions.ts) | Códigos de validación, extracto y fallos de guardado; captura de excepciones inesperadas con respuesta pública controlada. No recibe locale. |
| [store.ts](../lib/testimonials/store.ts) | `SaveTestimonialResult` diferencia disponibilidad, upload y persistencia con códigos públicos. Sin cambios de operaciones, queries, reintentos o rollback. |
| [lib/form-i18n/issues.ts](../lib/form-i18n/issues.ts), nuevo | `formatFormIssue` y `presentFormErrors`: localización segura después de reconciliar errores activos. Usa los catálogos y parámetros existentes, sin duplicarlos. |
| [enviar-form.tsx](../components/enviar-form.tsx) | Adaptación mínima: llama al resolvedor con la respuesta original y luego proyecta errores a texto ES. Los componentes de campo siguen recibiendo strings. |
| [enviar-fields.tsx](../components/enviar-fields.tsx) | Solo el callback `onInvalid` pasa a incidencias y el catch de crop emite `image.cropFailed`; misma lógica de recorte, preview, limpieza y foco. |
| [form-errors.test.ts](../lib/testimonials/form-errors.test.ts), [fixtures](../lib/testimonials/form-errors.fixtures.ts), [server-errors.test.ts](../lib/testimonials/server-errors.test.ts), nuevos | Regresiones de validación, reconciliación, localización, acción y repositorio con dobles. |
| [test-form-i18n.mjs](../scripts/test-form-i18n.mjs) | Ejecuta infraestructura y regresiones; compila en un temporal con alias locales y lo elimina al terminar. |

Ejemplo del nuevo contrato público:

```ts
{
  status: "error",
  issue: { code: "validation.summary" },
  fieldErrors: {
    story: { code: "story.minLength", params: { min: 20 } }
  },
  step: 3
}
```

El ejemplo numérico corresponde a `STORY_MIN_CHARS`; los productores usan esa constante, no el literal. La asociación al campo está en la clave de `FieldErrors`, sin duplicar un campo potencialmente contradictorio dentro de cada incidencia. Los mensajes no viajan en `SubmitState` ni en el resultado del repositorio.

### Reconciliación, navegación y cambio futuro de idioma

Se mantiene el objeto original de `useActionState`. `updateFormErrors` y `resolveFormErrors` siguen comparando referencias con `===`: una respuesta nueva, aunque tenga los mismos valores, no hereda los overrides de la anterior. Una propiedad propia con `undefined` sigue descartando solo ese error; una propiedad ausente conserva el error de servidor. `retired` y `pending` mantienen su efecto previo, incluidos los overrides locales que corresponden a esa respuesta.

Se eliminó `server.message.trim().replace(/\.$/, "") === "Revisá los campos marcados"`. El resumen se identifica con **`server.issue.code === "validation.summary"`** y solo se oculta cuando ya no quedan errores de servidor activos/desconocidos. Los campos profesionales inactivos siguen filtrándose sin destruir valores o respuestas. `firstErrorStep`, las claves de campos, el orden DOM y la navegación al error conservan su función.

La secuencia de presentación es:

```ts
const resolved = resolveFormErrors(state, validation, type, pending);
const text = presentFormErrors(resolved, "es"); // puente temporal de etapa 2
```

El objeto `state` no se clona ni transforma para traducir. Las incidencias resueltas siguen disponibles para decisiones; la proyección de strings solo se usa al renderizar errores. En etapa 3 se reemplazará el ES fijo por el locale vigente: el mismo error ya visible, o una respuesta recibida después de cambiar idioma, se formateará de nuevo sin revalidar, reenviar ni borrar contenido. No se añade provider ni selector en esta etapa.

**Cambio visible acotado:** los mensajes de error usan el ES neutro del catálogo ya aprobado («Revisa», «Ingresa», etc.); no se conserva otro catálogo de errores en voseo. El resto de títulos, pasos, categorías, controles, ayudas y éxito permanece sin traducir. Consentimiento, ubicación y obligatoriedad intactos.

### Fallos públicos y diagnósticos

- Revalidación integral → `validation.summary` y mapa de incidencias por campo.
- Extracto/caption ausente → `submit.excerptFailed`.
- Configuración/disponibilidad conocida → `submit.unavailable`.
- Subida fallida → `submit.uploadFailed`.
- Inserción fallida después del mismo manejo de colisiones → `submit.saveFailed`.
- Excepción inesperada en la acción → `submit.unexpected`.
- Fallo local de recorte → `image.cropFailed`. Los errores internos de Canvas no se muestran ni serializan.

El repositorio ya no devuelve `error.message` ni nombres de variables internas. Los diagnósticos nuevos son marcadores fijos de fase, únicamente en servidor: no imprimen objetos `Error`, detalles arbitrarios del backend, nombres/paths de archivos o datos personales. La comparación técnica de `error.code === "23505"` conserva el reintento existente y no depende del idioma.

`formatFormIssue` admite entradas desconocidas en la frontera de presentación: código desconocido, forma antigua con texto o parámetros inválidos producen el genérico seguro del idioma seleccionado. No se hace matching de frases antiguas. Se reutiliza `interpolateFormMessage`, capturando errores de parámetros para que no aparezcan excepciones ni placeholders en la UI. Los fallbacks de traducción conocidos a ES siguen siendo los de etapa 1.

### Pruebas, compatibilidad y límites

Antes de migrar producción se añadieron y ejecutaron 12 caracterizaciones contra el comportamiento original: **45/45** junto con las 33 pruebas de infraestructura. Después se adaptaron las expectativas a incidencias y se ampliaron los casos.

Verificación final de etapa 2:

- **74/74 pruebas**, 12 grupos: 33 de infraestructura, 21 de validación/reconciliación/localización y 20 de acción/repositorio; ninguna omitida, incluida la corrección puntual de notificación.
- TypeScript (`pnpm.cmd exec tsc --noEmit --incremental false`) y ESLint (`pnpm.cmd run lint`): correctos.
- `git diff --check`, whitespace de archivos nuevos y referencias locales de la documentación: correctos. Manifests, lockfile, rutas, labels globales y archivos fuera de la app sin cambios.
- Build de producción (`pnpm.cmd run build`): correcto. La primera ejecución no pudo descargar DM Sans por la restricción de red; el reintento con acceso de red completó compilación, tipos y generación estática. No se cambiaron fuentes ni configuración para eludir esa verificación.
- Se contrastaron con HEAD los nueve handlers de foco, navegación, validación de paso, categoría y envío: idénticos tras normalizar finales de línea.
- Las pruebas de acción/repositorio ejecutan su fuente en una VM con imports explícitamente reemplazados. El entorno no suministra servicios reales ni `fetch`. Verifican tres intentos por colisión, corte ante otro código, rollback y payload/timestamp conservados usando operaciones falsas.
- Se conserva incluso la diferencia previa de archivo de cero bytes: el cliente admite formato/extensión válida, mientras `readFile` del parser lo trata como ausente. No se armonizó introduciendo otra regla.

Esta etapa no cubre una prueba de interfaz en navegador ni errores de transporte que ocurran antes de entrar a la Server Action. La captura general tampoco revierte operaciones ya terminadas ni añade reintentos automáticos. Los resultados `posted/skipped/failed` y las excepciones de la notificación secundaria conservan el éxito de un guardado ya confirmado; los fallos de parseo, validación, extracto, subida y persistencia siguen siendo errores.

**Corrección puntual antes del cierre:** se revisó `notifyInboxNewTestimonial` solo en lectura. Su contrato es `Promise<DiscordPostStatus>`; los fallos de red se convierten normalmente en `failed`, pero no existe una captura global que garantice que nunca rechace. Se reprodujo que el catch general devolvía `submit.unexpected` tras guardar si la notificación lanzaba una excepción. Ahora esa fase tiene un catch propio, con el marcador fijo de servidor `Testimonial inbox notification failed unexpectedly`, sin datos personales ni detalles de la excepción. Las pruebas verifican throw/rechazo, éxito en los tres estados, un único guardado seguido de una única notificación y datos/payload intactos. No se añadieron reintentos ni se modificó el servicio de notificación.

Para esta corrección pasaron las 74 pruebas, TypeScript, ESLint y `git diff --check`. No se repitió el build: el contrato de la acción, las dependencias y la composición de Next permanecen sin cambios; el build de etapa 2 registrado arriba sigue siendo la referencia.

Para etapa 3 quedan pendientes provider/selector, query en la página, metadata/lang y traducción de todo el formulario, incluido el recorte y éxito. La prueba de foco con navegador, el cambio real de idioma durante una petición y los lectores de pantalla se harán al integrar esa UI. Las traducciones PT y la revisión editorial/legal del consentimiento siguen abiertas. No se cambiaron tablas, servicios, payloads, `FormData`, timestamps, generación de publicaciones, otras aplicaciones o `packages/ui`. No hubo envíos reales, lectura de credenciales ni operaciones Git de escritura.

## 0.c. Etapa 3 — formulario bilingüe integrado

### Archivos y arquitectura

| Archivo | Responsabilidad implementada |
| --- | --- |
| [form-locale-provider.tsx](../components/form-locale-provider.tsx), nuevo | Contexto exclusivo de formulario: locale, traductor tipado y `setLocale`; sin wrapper DOM, cookies ni storage. `useSearchParams` es la fuente de verdad. |
| [form-language-select.tsx](../components/form-language-select.tsx), nuevo | Una instancia del selector nativo reutilizable, con label traducido y nombres propios de idiomas. Ubicación provisional en el contenido; portal al recorte activo. |
| [enviar-experience.tsx](../components/enviar-experience.tsx), nuevo | Mantiene el `<main>` y ancho existente, añade `lang` reactivo y mantiene selector fuera de la rama de éxito. |
| [enviar-intro.tsx](../components/enviar-intro.tsx), nuevo | Extrae la composición editorial/SVG existente y convierte únicamente sus textos en consumidores del contexto. |
| [app/enviar/page.tsx](../app/enviar/page.tsx) | Espera el query, normaliza locale inicial y compone provider bajo Suspense. `generateMetadata` resuelve título absoluto y descripción solo de `/enviar`. |
| [metadata.ts](../lib/form-i18n/metadata.ts), nuevo | Una función pura compartida entre metadata inicial y sincronización cliente; añade solo la identidad No Country, evitando el sufijo español heredado. |
| [enviar-form.tsx](../components/enviar-form.tsx) | Traduce pasos, categorías, campos, resumen, consentimiento, botones, errores y éxito. Utiliza locale vigente después del resolvedor, sin transformar `state`. |
| [enviar-fields.tsx](../components/enviar-fields.tsx), [capture-crop-dialog.tsx](../components/capture-crop-dialog.tsx) | Copy propio, requisitos recibidos, ARIA, sr-only y diálogo localizados, conservando procesamiento y refs. |
| [infrastructure.test.ts](../lib/form-i18n/infrastructure.test.ts) | Agrega cobertura de metadata y conserva la autorización ES exacta contra el inventario histórico, ya que ahora la UI consume el catálogo. |
| [qa-form-i18n.mjs](../scripts/qa-form-i18n.mjs), nuevo | QA de navegador con Chrome/CDP existente, fixtures de respuesta y bloqueo de todos los POST, sin dependencias nuevas. |
| Catálogos ES/PT y docs UI | Solo se actualizan los comentarios de estado de los catálogos; sus valores no se modifican. Se documentan contexto y selector reutilizable. |

`/enviar`, `?lang=es` y query ausente/inválido/repetido se resuelven a ES; `?lang=pt-BR` a portugués. El selector usa `history.replaceState(null, "", href)` con el constructor validado, conservando parámetros ajenos y fragmento. La integración nativa de Next notifica a `useSearchParams`, incluso con navegación atrás/adelante. No hay `router.refresh`, recarga, otro segmento o key por locale. La preferencia vive únicamente en la URL; una recarga mantiene idioma y pierde borrador, archivos y paso como antes.

La página espera `searchParams`, por lo que `/enviar` pasa de estática a dinámica por petición. La lectura cliente está bajo Suspense explícito y el build de Next 16.3 confirmó esa composición. El provider permanece en la misma posición; sus cambios de contexto actualizan copy sin sustituir `EnviarForm`, `FileField` o `CaptureCropDialog`.

### Selector, recorte y accesibilidad

Un diálogo nativo deja inerte el exterior. Para permitir cambiar idioma durante el recorte hay **un solo `FormLanguageSelect`**, que se presenta mediante portal en el host registrado por el diálogo. No se duplica la lógica ni hay dos selectores montados. Al cerrar vuelve a la zona provisional. Se conserva el effect original de apertura/retorno de foco y se incorpora el `select` a la guarda de Tab/Shift+Tab.

El `<main>`, el selector y el diálogo declaran `lang` reactivo. Las opciones usan sus propios `lang="es"`/`lang="pt-BR"`. El root, navbar y footer siguen en español; no se cambia idioma de otras rutas. Indicadores siguen siendo decorativos y no se añade edición desde el resumen.

### Datos, errores, consentimiento y éxito

Las categorías se recorren en `TESTIMONIAL_TYPES`, conservando orden e IDs; las etiquetas y preguntas vienen del catálogo exclusivo. No se modifican opciones/labels globales. Los países usan valores originales y labels traducidos, incluido el resumen. El país libre queda tal como fue escrito y se conserva al alternar «Otro país».

Se mantiene `resolveFormErrors(state, validation, type, pending)` antes de `presentFormErrors(resolved, locale)`. Contexto no revalida ni limpia incidencias; las correcciones parciales y respuestas recibidas durante un cambio de idioma utilizan el mismo mecanismo semántico de etapa 2. El mismo DOM de formulario y los handlers de estado, foco y envío se preservan. Los límites se interpolan desde constantes; no se concatenan fragmentos gramaticales ni se interpreta HTML.

El consentimiento ES coincide exactamente con la autorización histórica; PT usa el texto existente, todavía pendiente de revisión editorial/legal. No cambian ubicación, obligatoriedad, valor `1` o timestamp. No se envía locale ni una versión de consentimiento. Los textos y datos introducidos por participantes nunca se traducen.

La introducción sigue desapareciendo al recibir éxito, que mantiene un único H1 y el foco. El selector permanece disponible. La URL de invitación se deriva en cada render del origen ya utilizado y del locale vigente; cambia también después del éxito. Se preserva el comportamiento de copia y confirmación de dos segundos.

La metadata inicial utiliza el mismo catálogo y helper que el effect cliente que actualiza `document.title` y la descripción existente al cambiar locale. No se agrega otro meta tag ni se modifica el layout o la metadata de home/fichas. El idioma accesible se aplica a la región del formulario, sin cambiar globalmente `<html lang>`.

### QA ejecutado y evidencias

- `node scripts/test-form-i18n.mjs`: **75/75 pruebas**, 12 grupos; incluye las 74 de infraestructura/errores previas y la nueva prueba de metadata.
- `pnpm.cmd exec tsc --noEmit --incremental false`, `pnpm.cmd run lint` y `pnpm.cmd run build`: correctos, sin errores; ESLint sin advertencias. `git diff --check`, whitespace de archivos nuevos y referencias locales de la documentación: correctos.
- `node scripts/qa-form-i18n.mjs`: **PASS en Chrome de producción**, sin errores de navegador/hidratación; usa el Chrome instalado, CDP y un perfil temporal propio. Admite una ruta a Chrome como argumento opcional. Servidor local y navegador propios se cierran al terminar.
- Se verificaron ambos idiomas, cinco pasos, tres categorías y retorno a los datos profesionales conservados; datos parciales/completos, país libre, valor canónico de España y label «Espanha», enlaces, consentimiento y archivos JPEG confirmados.
- Se comprobó identidad del mismo formulario, selector único, recorte abierto con mismo nodo/zoom/transform/original object URL, preview confirmado, nombre accesible del select en el árbol de Chrome, ciclo de Tab/Shift+Tab, foco inicial y retorno al input.
- SSR y metadata en query válido, inválido y repetido, actualización de título/description sin navegación, query ajeno/hash, historial atrás/adelante y recarga sin borrador persistido.
- Dos POST reales del navegador fueron **interceptados antes de llegar a Next** y respondidos con fixtures Flight: error de validación y éxito, ambos retenidos para cambiar idioma durante `pending`. Se comprobó respuesta en idioma vigente, corrección parcial, foco al campo, mismo `FormData`, un POST por intento, éxito, enlace actualizado y portapapeles. No se ejecutó ninguna Server Action, escritura de Storage, webhook o publicación real durante ese QA.
- Se comprobó ausencia de desbordamiento horizontal y controles fuera del viewport a **375 y 1440 px**. Las cuatro capturas se revisaron para evitar artefactos del header sticky y corresponden exclusivamente a datos sintéticos de QA.

Evidencia reproducible: [qa-results.json](./ui/assets/form-i18n/qa-results.json).

| Captura | Estado representativo |
| --- | --- |
| [ES · 375 px](./ui/assets/form-i18n/form-es-375.png) | Datos y correcciones locales; avatar aún obligatorio. |
| [PT · recorte · 375 px](./ui/assets/form-i18n/crop-pt-375.png) | Selector único dentro del diálogo, zoom conservado y acciones accesibles. |
| [PT · resumen · 1440 px](./ui/assets/form-i18n/form-pt-1440.png) | Campos completos, contenido del participante sin traducir y consentimiento. |
| [ES · éxito simulado · 1440 px](./ui/assets/form-i18n/success-es-1440.png) | H1, selector persistente, invitación y botón de copia. La dirección mostrada es local de QA. |

### Pendientes y etapa 4

La integración está implementada y verificada técnicamente; **no equivale a revisión visual humana, revisión brasileña definitiva o aprobación legal del consentimiento**. Tampoco es certificación con lectores de pantalla reales. Los errores de transporte previos a la acción y la experiencia del picker nativo de cada sistema siguen fuera de los dobles empleados.

La etapa 4 reutilizará el mismo selector en el header simplificado y resolverá la composición de layouts/route groups y el footer. Esta entrega conserva navbar/footer, no persiste borradores, no añade navegación por indicadores ni edición del resumen y no cambia backend, servicios, otras apps o `packages/ui`. No incorpora dependencias ni operaciones Git de escritura.

## 0.d. Etapa 4 — header y layouts

### Archivos y composición final

| Archivo | Cambio |
| --- | --- |
| [app/layout.tsx](../app/layout.tsx) | Root único: HTML/body flex de altura mínima `100dvh`, DM Sans, estilos globales y metadata general; retira solamente imports y montaje del chrome institucional. |
| [app/(public)/layout.tsx](../app/(public)/layout.tsx), nuevo | Compone `SiteHeader`, children y `SiteFooter` en un fragmento, sin wrapper adicional. |
| `app/page.tsx` → `app/(public)/page.tsx`; `app/t/[slug]/page.tsx` → `app/(public)/t/[slug]/page.tsx` | Movidos íntegros: mismas consultas, metadata, `force-dynamic`, componentes y URLs. |
| [app/not-found.tsx](../app/not-found.tsx), [app/(public)/not-found.tsx](../app/(public)/not-found.tsx), nuevos | El primero compone el layout público para URLs no resueltas; el segundo reutiliza `PageShell` y hereda ese layout para `notFound()` de una ficha. Un header/footer y un main en ambos casos. |
| [app/enviar/page.tsx](../app/enviar/page.tsx) | Mismo Suspense y provider por query; agrega `FormHeader` antes de `EnviarExperience`. Metadata localizada intacta. |
| [form-header.tsx](../components/form-header.tsx), [form-header.module.css](../components/form-header.module.css), nuevos | Logo oficial no navegable y selector existente; idioma local, tokens y altura responsive observada. |
| [enviar-experience.tsx](../components/enviar-experience.tsx), [form-language-select.tsx](../components/form-language-select.tsx) | Retira selector del contenido y su margen provisional. No añade otra instancia ni cambia la API. |
| [enviar-form.tsx](../components/enviar-form.tsx) | `focusAndReveal` mide `[data-form-header]`; elimina outline solo del encabezado estático de paso/éxito y asocia feedback de copia a la URL actual. No cambia handlers de pasos, validación o envío. |
| [capture-crop-dialog.tsx](../components/capture-crop-dialog.tsx) | Solo elimina outline del título estático enfocado; portal, procesamiento y manejo de foco permanecen. |
| [qa-form-i18n.mjs](../scripts/qa-form-i18n.mjs), [qa-public-fixture.mjs](../scripts/qa-public-fixture.mjs) nuevo | Amplía QA existente con rutas/layouts, responsive, foco y regresión de copia; fixture precargado solo en servidor QA, sin importación desde la aplicación. |
| Documentación UI | Crea `ui/components/form-header.md`. Modifica `ui/README.md` y fichas `form-language-select.md`, `capture-crop-dialog.md`, `site-header.md`, `site-footer.md`, `gallery-hero.md`, `gallery-hero-carousel.md`, `testimonial-detail.md` y `testimonials-gallery.md`. Evidencias nuevas: seis PNG y `qa-results.json` en `ui/assets/form-layouts/`, enlazados abajo. |

```text
app/layout.tsx  (único HTML/body, fuente, estilos y metadata general)
├── (public)/layout.tsx → SiteHeader + página + SiteFooter
│   ├── page.tsx → /
│   ├── t/[slug]/page.tsx → /t/[slug]
│   └── not-found.tsx → PageShell 404, chrome heredado
├── enviar/page.tsx → Suspense → FormLocaleProvider
│   ├── FormHeader → logo + único FormLanguageSelect
│   └── EnviarExperience → main → EnviarForm / éxito
└── not-found.tsx → PublicLayout + PublicNotFound (URLs no resueltas)
```

### Header, portal, foco y copia

`/enviar` no monta navbar/footer institucionales. No hay detección de pathname para elegir chrome, CSS para ocultarlo, segundo root layout o navegación por locale. El logo conserva alt, proporción y asset, sin enlace. «Volver al inicio» permanece en introducción y éxito. Header sticky con borde sutil, altura mínima de 4rem y contenedor alineado al formulario. La etiqueta del selector queda visualmente oculta en el header móvil conservando su nombre accesible; es visible en desktop y modal. Al ampliar texto puede envolver y crecer.

El provider conserva responsabilidad y posición, sin DOM extra. Cambiar idioma conserva identidad del formulario, datos, errores, previews, archivos, paso y consentimiento. El único selector se porta al host existente del recorte y desaparece del header; vuelve al cerrar. Se comprobaron original object URL, zoom, posición, foco inicial, Tab/Shift+Tab y retorno al input.

Un `ResizeObserver` publica `--site-header-height` y limpia la variable al desmontarse. La navegación pública conserva su observador y estilos sin cambios. `focusAndReveal` usa `[data-form-header]` en lugar de `body > header`; sigue descontando altura real más 16px. Paso, éxito y título del recorte mantienen foco, semántica y `tabIndex={-1}`, con `focus:outline-none` acotado a esos encabezados estáticos. Los controles interactivos mantienen sus indicadores de teclado.

El estado de copia registra `{ url, copied }`. Cambiar la URL reinicia el feedback durante render, también ES → PT → ES antes del plazo; no se remonta `SuccessCard` ni `EnviarForm`. Se limpia el timeout al copiar de nuevo, cambiar de URL o desmontar. Una respuesta asíncrona solo marca como copiada la misma URL. Se conserva el plazo de dos segundos y el formato de invitación.

### Rutas, metadata y 404

Home y ficha mantienen los archivos originales movidos íntegros, sin segmentos nuevos en las URLs ni wrappers DOM. `/enviar` conserva SSR localizado y sincronización cliente. Los enlaces existentes formulario → home y home/ficha → formulario, y Atrás formulario → ficha, restauran metadata y chrome públicos; no permanece la descripción PT. HTML sigue en ES; header, main y modal del formulario declaran su idioma vigente.

Se comprobaron `/ruta-inexistente-qa`, `/enviar/ruta-inexistente-qa` y `/t/no-existe-qa`: un header/footer institucional, un main, retorno al inicio y `noindex`. Diferencia deliberada: el 404 nativo inglés se reemplaza por «Página no encontrada» con `PageShell` y tokens existentes. Next conserva su semántica de 404 no transmitido/200 transmitido con `noindex`. El 404 raíz compone el chrome explícitamente porque una URL no resuelta no entra al route group.

### Verificación y evidencias

- Suite i18n/errores: **75/75**, 12 grupos, sin omitidas. TypeScript, ESLint, build de producción y `git diff --check` correctos; mismas URLs, con home, formulario y ficha dinámicos. Se verificaron whitespace de archivos nuevos y enlaces locales de docs. Se retiró un `validator.ts` generado de `.next/dev/types` que apuntaba a ubicaciones previas, sin cambiar `tsconfig`.
- Chrome de producción: ambos idiomas, cinco pasos, tres categorías, **320/375/768/1024/1440px**, fuente al **200% en 320px**, sin overflow horizontal. Datos profesionales, enlaces, archivos JPEG y consentimiento conservados.
- Foco: selector con nombre accesible e indicador de teclado; avance/retroceso, error y corrección de servidor revelados bajo sticky; recorte con selector único, ciclo de Tab y retorno; éxito con un H1 enfocado sin outline de bloque completo.
- Regresión de copia sobre el componente real: copiar ES → PT normal → ES normal; copiar PT → ES normal. Portapapeles igual a la URL copiada, sin otro envío al cambiar idioma/copiar.
- Dos POST interceptados **antes de Next**, error/éxito simulados con cambios durante pending; mismo FormData y un POST por intento. El servidor QA usa consulta pública sintética y bloquea otros fetch externos; la imagen de participante se sustituye por logo local. Sin datos reales, Server Actions, Storage, webhooks ni escrituras externas.
- Sin errores de navegador/hidratación ni dependencias nuevas. Servidor/Chrome propios se cierran y perfil temporal se elimina. Evidencia reproducible: [qa-results.json](./ui/assets/form-layouts/qa-results.json). Capturas de etapa 3 conservadas como referencia histórica.

| Captura | Evidencia |
| --- | --- |
| [Formulario ES, escritorio](./ui/assets/form-layouts/form-es-1440.png) | Header propio y selector, sin footer. |
| [Formulario ES, móvil](./ui/assets/form-layouts/form-es-375.png) | Fila compacta y contenido original. |
| [Formulario PT-BR, móvil](./ui/assets/form-layouts/form-pt-375.png) | Mismo header y wizard localizado. |
| [Recorte PT-BR, móvil](./ui/assets/form-layouts/crop-pt-375.png) | Selector en diálogo y zoom conservado. |
| [Home](./ui/assets/form-layouts/home-1440.png), [ficha](./ui/assets/form-layouts/detail-1440.png) | Dos vistas de comparación con chrome institucional completo; datos sintéticos. |

### Pendientes antes del lanzamiento

Etapa detenida para revisión visual humana. Falta validar con lectores de pantalla reales, Safari/Firefox y zoom real del navegador; texto al 200% no sustituye esas comprobaciones. Traducciones PT-BR y consentimiento siguen pendientes de revisión editorial/legal. **Cualquier información legal obligatoria adicional necesita definición del equipo antes del lanzamiento**; no se inventaron textos legales o enlaces de privacidad. El logo queda no navegable en esta versión. Una recarga o salida sigue perdiendo el borrador en memoria.

No se modificaron backend, Supabase, Storage, migraciones, consentimiento, validaciones, payloads, publicaciones, panel, `packages/ui`, catálogos ni dependencias. No se inspeccionaron `.env*` o credenciales ni se hicieron commit, push, merge o PR.

## 1. Arquitectura aprobada e integración

Usar **diccionarios locales tipados, un contexto exclusivo del formulario y el parámetro `lang`**, con `/enviar` en español por defecto y `/enviar?lang=pt-BR` para portugués brasileño. Evitar una biblioteca y prefijos de ruta en esta primera entrega.

La separación de mensajes y reglas ya está implementada mediante **códigos y parámetros**. La presentación usa ES fijo hasta etapa 3. La selección futura de idioma no debe remontar `EnviarForm`, reiniciar sus estados ni traducir datos de participantes.

Para el header exclusivo, mantener **un único root layout** y trasladar el chrome institucional a un route group público. La página `/enviar` puede componer su propio header y provider, sin detectar su pathname desde un componente global ni ocultar el navbar por CSS. El footer queda como decisión abierta del equipo.

Las etiquetas ES acordadas se aplican únicamente al catálogo del formulario, sin tocar `TYPE_LABELS`, badges, enums o payloads compartidos con otras vistas.

## 2. Arquitectura auditada — referencia del 31 de octubre

Esta sección conserva el diagnóstico previo a la implementación. El estado vigente de los errores y sus contratos está en la sección 0.b; las reglas y flujos descritos aquí se mantienen.

Fuentes principales:

- [Página de envío](../app/enviar/page.tsx).
- [EnviarForm, StepProgress y SuccessCard](../components/enviar-form.tsx).
- [Field y FileField](../components/enviar-fields.tsx).
- [CaptureCropDialog](../components/capture-crop-dialog.tsx).
- [Validación cliente y composición de errores](../lib/testimonials/form-validation.ts).
- [Parser, límites y normalizadores compartidos](../lib/testimonials/parse.ts).
- [Server Action](../lib/testimonials/actions.ts), [SubmitState](../lib/testimonials/submit-state.ts) y [persistencia](../lib/testimonials/store.ts).
- [Categorías](../lib/testimonials/types.ts), [países](../lib/testimonials/countries.ts), [preparación de imágenes](../lib/testimonials/prepare-image.ts).
- [Layout raíz](../app/layout.tsx), [SiteHeader](../components/site-header.tsx) y [SiteNavigation](../components/site-navigation.tsx).

El paquete declara Next.js `16.3.0`, React/React DOM `19.2.8`, TypeScript, Tailwind v4, `react-easy-crop`, Supabase y componentes `@repo/ui`. No declara una biblioteca i18n. Las versiones declaradas no equivalen a haber probado una biblioteca adicional con este proyecto.

### Límites servidor/cliente

| Archivo/componente | Ejecución actual | Responsabilidad y textos |
| --- | --- | --- |
| `app/layout.tsx` | Server Component | Fuente DM Sans, metadata general, `<html lang="es">`, header y footer para todas las rutas. |
| `app/enviar/page.tsx` | Server Component | Metadata estática y encabezado editorial: enlace, H1, instrucciones y SVG. Pasa ese header como `children` a `EnviarForm`. |
| `EnviarForm` | Client Component (`use client`) | Estado de cinco pasos, campos controlados, validación local, construcción de `FormData`, resultado de la acción y resumen. |
| `StepProgress` / `SuccessCard` | Dentro del módulo cliente | Progreso y foco; éxito, invitación y portapapeles. |
| `Field` / `FileField` | Dentro del grafo cliente de `EnviarForm` | Labels y ayudas recibidos por props; sufijos propios, errores y estado local de imágenes. El módulo no declara `use client`, pero se importa desde ese límite cliente y usa hooks. |
| `CaptureCropDialog` | Client Component explícito | Modal nativo, teclado/foco, zoom y área de recorte. |
| `form-validation.ts` | Consumido por cliente | Reglas por campo y paso, errores locales y reconciliación con errores de servidor. |
| `parse.ts` | Compartido; parser completo utilizado por servidor | Constantes/normalizadores reutilizados por cliente; revalidación integral antes de guardar. Contiene copy hardcodeado. |
| `actions.ts` | Server Action (`use server`) | Parsear, guardar, notificar inbox y devolver `idle/error/success`. |
| `store.ts` | Infraestructura de servidor, llamada por la acción | Uploads y fila `in_review`; también devuelve mensajes visibles a través de la acción. No debe importarse en el contexto cliente. |

`TestimonialCapture`, `TestimonialDetail` y `YoutubeEmbed` pertenecen a fichas públicas, no al árbol del formulario. El diálogo relevante es `CaptureCropDialog`, no el de ampliación de una foto publicada. `Button` recibe sus textos por children y no requiere modificar `packages/ui`.

### Cinco pasos y preservación de campos

1. **Tipo**: radios con valores `simulation`, `first_job`, `career_change`.
2. **Datos**: nombre, país, correo y avatar obligatorio.
3. **Historia**: campos profesionales condicionales y relato común.
4. **Medios**: fotografía testimonial, YouTube, Instagram y LinkedIn; todo opcional.
5. **Consentimiento**: resumen, autorización obligatoria y envío.

`step`, categoría, relato, datos profesionales de todas las categorías, contacto, selecciones de país, archivos y consentimiento viven en `useState` de `EnviarForm`. Los fieldsets de pasos permanecen montados y cambian mediante `hidden`; los controles profesionales sí se montan condicionalmente, pero sus valores se conservan en el padre.

Al cambiar de categoría, `changeType` conserva el relato y los datos; si había relato, activa `storyNeedsReview`. No traduce, sustituye ni reinicia lo escrito. Solo se envían los campos profesionales de la categoría activa. «Otro país» conserva su texto por separado al alternar opciones.

No hay borrador persistido en URL, cookie, `sessionStorage` o `localStorage`. **Una recarga real o un desmontaje pierde el estado en memoria, incluidos archivos y paso.** No se propone añadir persistencia del borrador como parte de i18n. Preservar el idioma tras recargar no debe describirse como preservar también los datos.

Los indicadores de pasos son un `ol` decorativo con `aria-hidden`, no navegación interactiva. El resumen usa `dl` y no ofrece edición por sección. Ambas funcionalidades pertenecen a otras issues.

### Validación y envío

| Dato/regla | Comportamiento verificado |
| --- | --- |
| Categoría | Requerida, validada contra los tres valores internos. |
| Nombre | Requerido después de trim; máximo 120 caracteres. |
| País | Requerido; máximo 120; letras Unicode y puntuación admitida, sin números. No exige pertenecer a la lista provisional. |
| Correo | Requerido; regex simple del parser compartida. No se añade otra regla durante i18n. |
| Historia | Entre 20 y 4000 caracteres después de trim. El textarea además tiene `maxLength=4000` sobre el valor de entrada; preservar esta diferencia existente. |
| Campos profesionales | Máximo 120; requeridos según categoría, salvo puesto principal de Simulación, opcional. |
| Avatar | Requerido; JPG/PNG/WebP; máximo 5 MiB, mostrado como 5 MB. |
| Foto testimonial | Opcional; JPG/PNG/WebP; máximo 8 MiB, mostrado como 8 MB. |
| YouTube | Opcional; se normaliza/valida con los hosts y reglas existentes. No se sube video. |
| Instagram / LinkedIn | Opcionales; aceptan los formatos y handles de sus normalizadores actuales. No imponerles el límite genérico de 120 sin una decisión nueva. |
| Consentimiento | Debe llegar como `consent="1"`. |

`noValidate` evita mensajes de validación nativa del formulario; los mensajes normales son propios. `goNext` valida el paso actual y enfoca el primer error. La revalidación al editar ocurre si ese campo tenía error. El intento final valida el paso 5 localmente; el servidor vuelve a validar **todos** los datos y la categoría antes de guardar. No sustituir esta validación integral por la traducción del cliente.

`FormData` se construye manualmente: `type`, `full_name`, `country`, `email`, `story`, campos profesionales activos, enlaces, archivos y `consent`. Los nombres de claves y valores técnicos no se traducen. El parser produce payload, extracto y captions con sus funciones actuales. La persistencia sube imágenes, inserta estado `in_review` y registra `consent_at`. Después se intenta notificar el inbox; `notifyInboxNewTestimonial` devuelve estado propio, pero la acción no transforma ese resultado en otra pantalla de éxito/error.

### Errores y éxito

- `useActionState` administra `state`, `formAction` y `pending`. Atrás y enviar se deshabilitan durante el envío; la UI visible del paso 5 muestra «Enviando…».
- `SubmitState` contiene mensajes ya redactados y `fieldErrors` como strings, no incidencias independientes del idioma.
- `resolveFormErrors` mezcla errores de servidor y correcciones locales, omite campos inactivos y conserva errores de servidor sin editar. **Compara por identidad `validation.response === state`.** Traducir no debe fabricar una copia nueva de `state` antes de llamar a esta función.
- Existe una dependencia directa de copy: `server.message.trim().replace(/\.$/, "") === "Revisá los campos marcados"`. Cambiar esa frase sin modificar el criterio semántico puede dejar un resumen viejo o retirarlo incorrectamente.
- Los errores generales y desconocidos se muestran en el paso 5 con `role="alert"`; «Ir a corregir» enfoca el paso del primer campo activo. La respuesta incluye `step`, pero el cliente calcula `correctionStep` desde `serverErrors`; no consume directamente ese `state.step` para navegar.
- Una excepción no convertida a `SubmitState` no tiene un mensaje universal propio del formulario; no asumir que cualquier rechazo de red ya está localizado. Planificar una respuesta genérica controlada sin alterar el resultado real del guardado.
- Con `success`, `EnviarForm` devuelve `SuccessCard` y retira el header editorial pasado como children. El éxito tiene su propio H1 enfocado, revisión previa a publicar e invitación. El nuevo header de idioma debe quedar fuera de esa rama para seguir disponible.
- La invitación actual usa `{origin}/enviar`, sin idioma, y el indicador de copia dura dos segundos. Su base se actualiza al enviar. La implementación futura debe derivar el query del idioma vigente incluso si se cambia después del envío.

### Imágenes y diálogos

`FileField` conserva preview confirmado y original en recorte en estados propios, con object URLs distintas. El nuevo archivo se aplica al padre solo tras confirmar; cancelar conserva el anterior. Un contador de operación evita aplicar resultados tardíos y las URLs se liberan al dejar de usarse o al desmontar.

El avatar se recorta a 720×720 y la foto a 1080×608 aproximadamente 16:9; ambos se convierten a JPEG con calidad `0.9`. El nombre del archivo se deriva del original. No cambiar formatos, dimensiones, límites ni procesamiento por idioma.

`CaptureCropDialog` conserva `crop`, `zoom` y área localmente. Su efecto de apertura/retorno de foco depende de `returnFocusRef`, no de sus textos. Mantener instancia, ref y key del object URL permite cambiar copy sin reiniciar el recorte. La versión instalada de `react-easy-crop` reduce a `0.2` el movimiento con Shift: la ayuda de mayor precisión es correcta.

## 3. Inventario editorial

El [inventario completo por archivo/componente](./form-i18n-text-inventory.md) contiene texto actual, propuesta de español neutro, propuesta inicial de portugués brasileño y clave. Cubre metadata, títulos, cinco pasos, categorías, labels, placeholders, ayudas, resumen, consentimiento, errores compartidos y de servidor, carga, éxito, portapapeles, imágenes, ARIA, `sr-only` y las 19 opciones de país.

El voseo está distribuido entre página, constantes de categorías, validadores, componentes de imagen y pantalla de éxito. Corregir solo `enviar-form.tsx` dejaría instrucciones y errores en voseo. También se propone sustituir anglicismos evitables en ES, manteniendo los usos naturales brasileños en PT.

No se traducen nombres, relatos, empresas, profesiones, puestos, países libres, emails, handles, URLs o archivos elegidos por participantes. Tampoco se presume que el idioma de UI sea el idioma del relato.

## 4. Mapa de categorías y dependencias

| Valor interno, sin cambios | Label actual | Label ES confirmado solo para formulario | Propuesta pt-BR | Datos profesionales activos |
| --- | --- | --- | --- | --- |
| `simulation` | Simulación | **Tu experiencia en No Country** | Sua experiência na No Country | `primary_role`, opcional. |
| `career_change` | Reconversión | **Reconversión Profesional** | Transição de carreira | `previous_profession` y `new_role`, requeridos. |
| `first_job` | Primer empleo | **Conseguiste Empleo** | Conseguiu um emprego | `company` y `role_achieved`, requeridos. |

Dependencias verificadas:

- `TYPE_OPTIONS` / `typeOption` contienen label, descripción y pregunta/ayuda del relato; los consume el formulario.
- `public.ts` también usa `typeOption(...).label`; `TestimonialsGallery` usa `TYPE_LABELS`. **Editar esos labels globales cambiaría fichas/galería fuera de alcance.** Proponer `messages.form.categories[type]` para el formulario, conservando su enum.
- `PROFESSIONAL_FIELDS`, `FIELD_STEP`, `isFieldActive` y parser condicionan reglas por identificador, no por label. Deben permanecer independientes de traducciones.
- `actions.ts` usa el label global para el aviso del inbox; no necesita convertirse en el label localizado del formulario.
- El panel tiene su copia de tipos, DTO/payload y campos de edición. Usa los mismos identificadores y propiedades, no un contexto i18n de la app pública. No requiere importaciones cruzadas ni modificaciones.
- El badge de publicación **«Conseguí empleo»** es primera persona del testimonio. **«Conseguiste Empleo»** es una categoría de selección dirigida al participante. Son claves y responsabilidades distintas; no centralizarlas como una sola traducción.
- El identificador heredado `first_job` no cambia al mostrar una etiqueta más amplia. Confirmar editorialmente la pregunta propuesta sin introducir reglas de elegibilidad o renombrar datos.

Los países también mezclan `value` y label actualmente. Mantener como `value` la cadena canónica existente y traducir únicamente su representación para el selector/resumen. «Otro país» sigue enviando el texto libre; nunca `__other_country__`. El listado provisional no se sustituye por una nueva fuente en esta issue.

## 5. Alternativas de internacionalización

| Opción | Ventajas | Coste/riesgo para este alcance | Evaluación |
| --- | --- | --- | --- |
| Diccionarios tipados locales + provider + query `lang` | Scope pequeño, misma ruta, TS, UI y SSR explícitos, enlace compartible y sin dependencias. Mantiene montado el wizard al cambiar solo mensajes. | Hay que diseñar fallback, parámetros, errores y sincronización de URL/metadata. | **Recomendada ahora.** |
| Prefijos como `/es/enviar` y `/pt-BR/enviar` | Idioma visible en pathname, estructura útil para muchas páginas traducidas. | Añade rutas y política para `/enviar`; navegar entre segmentos puede remontar el estado si no se eleva. Requiere revisar enlaces/redirects/metadata y no aporta valor suficiente para un único wizard. | Evaluar si se internacionaliza toda la app. No aplicarlo al home/panel en esta issue. |
| Biblioteca, por ejemplo `next-intl` | Ofrece integración App Router, mensajes estructurados, interpolación y plurales; útil al crecer el producto. | Nueva dependencia, plugin/configuración y estrategia de providers/request. No resuelve por sí sola la persistencia del formulario ni la semántica de errores. | No justificada inicialmente; reevaluar si crecen rutas, idiomas o necesidades ICU. |

La evaluación de `next-intl` se contrastó con su documentación oficial de [App Router](https://next-intl.dev/docs/getting-started/app-router), [mensajes e interpolación/plurales](https://next-intl.dev/docs/usage/translations) y [routing](https://next-intl.dev/docs/routing). No se instaló ni se afirma compatibilidad probada de una versión concreta con este repo.

### Protocolo recomendado de idioma

- Locales permitidos: exactamente `es` y `pt-BR`, mediante normalizador común y acotado. Entrada ausente, desconocida o ambigua: `es`. Definir explícitamente el trato de parámetros repetidos; no interpolarlos como rutas de importación libres.
- `/enviar` sigue accesible y español por defecto. `/enviar?lang=es` y `/enviar?lang=pt-BR` permiten compartir idioma.
- Fuente de preferencia inicial: query validado. No deducir idioma del país, nombre, IP o relato. No introducir detección automática ni cookies/localStorage en esta primera versión.
- El provider cliente lee/sincroniza únicamente el query de idioma y actualiza mensajes. Al seleccionar, usar la History API nativa para reemplazar `lang`, conservando otros parámetros y hash; no `location.href`, `router.refresh`, cambio de segmento ni `key={locale}` en el wizard.
- `useSearchParams` puede sincronizar contexto y URL, también al navegar por el historial. No es un detector global de ruta para ocultar navbar.
- La preferencia persiste durante los cinco pasos y en recarga por estar en la URL. Los datos del borrador solo se conservan durante la sesión montada, como hoy; recuperar un borrador tras recarga sería otra funcionalidad.
- El enlace de invitación del éxito se construye con el idioma actual. No fijarlo al locale que había al comenzar una petición pendiente.

### TypeScript, fallback y formato

Usar un contrato `FormMessages` cuyos valores sean strings y dos catálogos completos con `satisfies FormMessages`. No tipar PT con los literales exactos de un objeto ES `as const`, porque impediría traducir sus valores. Namespaces separados: intro, pasos, categorías, campos, imágenes/recorte, resumen, consentimiento, errores, éxito y selector.

Los parámetros de mensajes son datos primitivos tipados; no traducir fragmentos sueltos como «Máximo» + número + «caracteres». Los catálogos que crucen el límite servidor/cliente deben ser serializables; si se utilizan funciones de formato, importarlas en cada entorno, no pasarlas como props RSC. Renderizar texto normal de React, sin HTML arbitrario.

La completitud ES/PT se comprueba antes de publicar. Como defensa runtime: clave faltante en PT → ES; código desconocido de respuesta → error genérico localizado. No mostrar una ruta de clave técnica como UI final. Añadir un idioma requiere completar el mismo contrato y QA, no nuevos enums de testimonios.

El wizard no muestra fechas localizadas: el consentimiento produce un ISO UTC de servidor y no debe reformatearse ni reinterpretarse. Los contadores y máximos usan números; los bytes, longitudes, ratios y validaciones no dependen del locale. `Intl` puede utilizarse para presentación futura, nunca para analizar el payload o cambiar el conteo actual.

### Errores generados en cliente y servidor

La propuesta original de los puntos 1–5 se completó en etapa 2 (sección 0.b). El punto 6 está preparado y probado a nivel de representación; falta conectarlo a la UI de etapa 3:

1. Definir una incidencia serializable con `code` y parámetros controlados, manteniendo los campos y estados actuales. Ejemplo conceptual: código `story.minLength`, parámetro `min: 20`.
2. Mantener las reglas, orden y normalizadores de cliente/parser. Cambiar solo cómo representan un mensaje, sin eliminar la doble validación.
3. Preservar el objeto original de respuesta y el mecanismo `response/overrides/retired`. Traducir después de resolver errores, no clonando `state` antes de `resolveFormErrors`.
4. Sustituir la comparación con «Revisá los campos marcados» por un código semántico de resumen de validación.
5. Convertir fallos de infraestructura a códigos públicos acotados. El `lastError` de Supabase y el mensaje con un nombre de variable detectados en la auditoría ya no se devuelven al cliente; no crear traducciones de mensajes arbitrarios por matching de texto.
6. Hacer que los errores ya visibles cambien al nuevo idioma sin reenviar, perder valores ni borrar errores pendientes. Si cambia el idioma mientras se envía, el resultado se presenta en el idioma vigente al recibirlo.

Con códigos independientes del idioma, la Server Action no necesita recibir el locale para redactar UI. Si se eligiese en cambio enviar `locale` y devolver strings traducidos desde servidor, habría que validarlo, compartir los mensajes y resolver los errores antiguos/de una petición en curso al cambiar idioma. Se considera menos robusto para este formulario.

La etapa 2 cambia el **contrato de presentación de Server Actions locales**, no las operaciones de Supabase/Storage, tablas, migraciones, payloads persistidos o publicación. Los archivos de servidor modificados se enumeran en la sección 0.b.

## 6. Encabezado exclusivo y layouts

### Problema actual verificado

`SiteHeader` y `SiteFooter` están en `app/layout.tsx`. Un `app/enviar/layout.tsx` anidado **se suma** a ellos: no puede reemplazar el header del ancestro. Ocultarlo con CSS o leer el pathname en un header global sería un acoplamiento innecesario y no es la recomendación.

### Estructura recomendada

Esquema conceptual, no archivos creados:

```text
app/
  layout.tsx                  html/body, fuente, estilos y metadata base
  (public)/
    layout.tsx                SiteHeader + children + SiteFooter existentes
    page.tsx                  home actual, contenido sin cambios
    t/[slug]/page.tsx          ficha actual, contenido sin cambios
  enviar/
    page.tsx                  locale inicial y metadata; provider, header propio y main
  not-found.tsx               si hace falta preservar el chrome del 404 global
```

Los route groups no aparecen en la URL. Mantener el root común evita múltiples roots y sus recargas completas. Reubicar los archivos de ruta es un cambio estructural futuro a revisar: no significa rediseñar home/fichas ni tocar sus componentes, consultas o estilos. No deben coexistir dos páginas que resuelvan `/` o `/t/[slug]`.

La alternativa de dejar todos los headers en cada página duplica composición; slots paralelos añaden estructura innecesaria para una sola excepción. Se prefiere un grupo público y una composición de formulario explícita.

El provider puede vivir en la **página** `/enviar`: los layouts no reciben `searchParams` actualizados. La página y `generateMetadata` normalizan el mismo query, y el contexto cliente mantiene las traducciones vivas. Un layout de formulario adicional solo se justifica si aparece otra ruta de ese flujo; no debe introducirse para intentar leer allí el query.

### Composición del formulario y accesibilidad

- Nuevo `FormHeader`: recurso existente `/brand/logo-no-country.png`, logo a la izquierda y selector nativo etiquetado a la derecha; opciones «Español» y «Português (Brasil)», sin banderas. Header separado del navbar institucional.
- Mantener un único `EnviarForm` y un provider **sin wrapper DOM** que altere la columna flexible o esconda el header de su selector actual.
- La introducción actual llega como JSX de servidor con textos estáticos. Para cambiar de idioma en vivo necesita un consumidor cliente, por ejemplo `EnviarIntro`, que preserve su composición/SVG y deje de recibir copy fijo de servidor. Continuaría dentro de `EnviarForm` como children y se retiraría en éxito igual que hoy.
- El header de idioma queda fuera de `EnviarForm`, por lo que no desaparece al mostrar `SuccessCard`.
- Preservar el contrato de foco: `focusAndReveal` consulta `body > header`; el header nuevo debe permanecer como hijo directo del body o debe adaptarse ese selector explícitamente y probarlo. No insertar un div de provider que haga fallar silenciosamente esa medición.
- `SiteNavigation` publica `--site-header-height` mediante ResizeObserver. El header simplificado necesita conservar esa medición o un contrato equivalente para scroll/foco, sin copiar la lógica de menús institucionales.
- Marcar el idioma de los textos del formulario y su header con `lang` reactivo, incluyendo recorte, errores y éxito. El contexto no añade por sí mismo un atributo `lang` al DOM.
- El root general puede seguir en `es` si el chrome institucional sigue español. Los bloques de formulario PT deben declarar `lang="pt-BR"`. No se internacionaliza todo el documento ni se cambia el root según el pathname desde el cliente. Exigir un `<html lang="pt-BR">` SSR para toda la página implicaría revisar una estrategia de root/request más amplia.
- No añadir cambios de foco o anuncios de todos los mensajes al cambiar idioma. Conservar IDs, refs, claves de categoría/pasos y del recorte; evitar usar textos traducidos como identidad de componentes con estado.

### Metadata y renderizado

Actualmente `/enviar` no consume query y su metadata es estática. Leer `searchParams` para seleccionar idioma inicial hará la página dependiente de la petición; considerar ese cambio de renderizado/cache, aunque no agregue consultas de negocio.

Proponer título y descripción propios por idioma. Usar título absoluto de formulario con marca «No Country» para no heredar en PT el sufijo español «Testimonios». Home y fichas mantienen su metadata.

La History API no vuelve a ejecutar `generateMetadata`. Al cambiar idioma sin navegación de servidor, debe sincronizarse también el título de pestaña y la descripción existentes mediante un efecto acotado al formulario; verificar que Next recupere la metadata correcta al salir hacia otras rutas. No prometer que basta con modificar el query para traducir metadata ya renderizada.

### Footer: decisión expresamente abierta

| Alternativa | A favor | Aspectos a revisar |
| --- | --- | --- |
| Conservar footer institucional | Mantiene identidad y comportamiento existentes; no requiere inventar destinos. | Es extenso, agrega salidas y quedaría en español dentro de una experiencia PT si no se amplía el alcance. Marcar correctamente ese idioma. |
| Footer simplificado del formulario | Menos distracciones y menor volumen de copy. | Requiere definición UX/editorial y destinos legales válidos; no inventar URLs ni textos aprobados. |

La arquitectura propuesta deja un punto de composición específico para el footer del formulario. **No se decide eliminarlo, simplificarlo o traducirlo en esta etapa.** Tampoco se cambia el destino del logo sin revisar si debe mantener el sitio institucional o volver a la landing local.

## 7. Consentimiento — hechos y límites

Se define en `enviar-form.tsx`, sección `testimonial-consent-title`, dentro del paso 5. El estado es `consent`; el input lleva `name="consent"`, `value="1"`; el `FormData` solo incluye ese valor cuando está marcado. Cliente y parser exigen aceptación. El parser asigna `consentAt: new Date().toISOString()` a un envío válido y `store.ts` lo persiste en `consent_at`.

No se registra el locale ni la versión textual de la autorización en este flujo. No añadir esos campos o migraciones por iniciativa de i18n; cualquier necesidad de registro adicional corresponde a otra decisión.

El texto actual autoriza **nombre, foto y texto en galería y Discord**, indica que el email no se publica y que existe revisión previa. No menciona Instagram/LinkedIn, aunque otras partes del producto hablan de esos canales. Se registra la diferencia para coordinación; **no se amplía el texto** ni se presenta esta auditoría como validación de su alcance legal.

La propuesta PT del inventario mantiene los mismos elementos, canales y condiciones. Requiere revisión del equipo correspondiente. La consulta de ubicación con Geraldine sigue en su issue separada: no se mueve la casilla ni se altera su obligatoriedad, significado o timestamp.

## 8. Riesgos funcionales y controles propuestos

| Riesgo concreto | Control para la futura implementación |
| --- | --- |
| Navegar a otra ruta/segmento de idioma o usar `key={locale}` | Cambiar contexto/query sin remontar el wizard; probar estado, paso, archivos, relato y consentimiento. |
| Header editorial de servidor queda en ES al cambiar contexto | Convertir únicamente el bloque de copy a consumidor cliente estable; no duplicar H1 en éxito. |
| Errores antiguos quedan en ES o desaparecen | Códigos + parámetros; traducir al presentar, manteniendo identidad de respuesta, overrides y retired. |
| Mensaje literal participa de la lógica | Sustituir la comparación textual del resumen por un discriminante semántico. |
| Cambio de idioma con petición pendiente | Presentar el resultado en locale vigente sin duplicar envío ni interpretar el fallo como éxito; probar con acción diferida/mock. |
| Recorte abierto pierde zoom/área o URLs | No cambiar keys/refs por idioma; conservar el componente y el control de operaciones asíncronas. |
| País traducido modifica un dato persistido | Separar label visible de value canónico; texto de «Otro país» intacto. |
| Labels nuevos afectan fichas, badges o inbox | Diccionario exclusivo del formulario; no cambiar opciones globales ni importar del panel. |
| Header deja de medirse | Mantener posición/contrato del header y variable CSS; probar foco y scroll en pasos, errores y modal. |
| Metadata o idioma hablado quedan desincronizados | SSR y cliente usan el mismo normalizador; `lang` por región; comprobar transición y navegación hacia home/fichas. |
| Recarga se vende como borrador persistido | Documentar que solo persiste el idioma; no añadir guardado de PII/archivos en navegador. |
| Consentimiento traducido amplía autorización | Texto equivalente revisado, mismas condiciones/canales; ubicación y registro sin cambios. |
| Texto PT más largo desborda | Layout flexible y medidas existentes; probar categorías, cinco indicadores, botones, errores, recorte y texto ampliado. |
| Flujo social mezcla idiomas | Mantener generación actual sin traducir captions/cards. UI PT no promete que el panel o publicaciones automáticas estén localizados. |

## 9. Archivos que se modificarían o crearían — propuesta

No se modifican ahora. Lista para dimensionar la futura issue:

| Archivo/área | Cambio futuro propuesto |
| --- | --- |
| `lib/form-i18n/locales.ts` (nuevo) | `FormLocale`, normalización de query, default ES y constructor de enlaces. |
| `lib/form-i18n/messages/es.ts`, `pt-BR.ts`, `types.ts` (nuevos) | Catálogos completos y contrato tipado acotado al formulario. |
| `lib/form-i18n/format.ts` (nuevo, si se necesita) | Parámetros de mensajes controlados, fallback y acceso a catálogo sin React. |
| `components/form-locale-provider.tsx` (nuevo) | Contexto/query del formulario, sin wrapper que cambie la estructura ni keys por locale. |
| `components/form-header.tsx` y estilos locales (nuevos) | Logo institucional, selector accesible y medición de altura. |
| `components/enviar-intro.tsx` (nuevo o extracción equivalente) | Introducción traducible en vivo, reutilizando composición existente. |
| `app/enviar/page.tsx` | Leer locale inicial, generar metadata y componer header/provider/main. |
| `components/enviar-form.tsx` | Consumir mensajes para pasos, campos, resumen, estados, errores y éxito; conservar los estados y handlers. |
| `components/enviar-fields.tsx` | Recibir/consumir mensajes comunes e incidencias de imagen, sin reiniciar previews. |
| `components/capture-crop-dialog.tsx` | Copy, alt e instrucciones accesibles por contexto; misma lógica de crop/foco. |
| `lib/testimonials/parse.ts`, `form-validation.ts`, `submit-state.ts`, `actions.ts` | Representar incidencias por códigos y presentar por idioma, preservando reglas y flujo. |
| `lib/testimonials/store.ts` (solo si se distingue causa) | Añadir discriminantes de fallos al resultado, sin cambiar queries, uploads, rollback o persistencia. Alternativa mínima: fallo genérico desde la acción; validar si se necesita conservar la distinción de upload. |
| `app/layout.tsx`, `app/(public)/layout.tsx` nuevo | Root común sin chrome fijo; chrome institucional en grupo público. |
| `app/page.tsx` → `app/(public)/page.tsx`; `app/t/[slug]/page.tsx` → grupo público | Reubicación estructural, sin cambiar contenido, URLs, consultas o componentes públicos. |
| `app/not-found.tsx` u otra composición de 404 | Revisar si es necesario conservar el chrome actual al sacar header/footer del root. |
| Documentación UI y plan de la app | Reflejar comportamiento aprobado e inventario final una vez implementado. |

No deberían cambiar `lib/testimonials/types.ts`/labels globales, valores del listado de países, `quote.ts`, generación de cards, hero/carrusel, formulario de consentimiento como flujo, panel, `packages/ui`, esquema, migraciones o servicios. No añadir dependencias por defecto. El nombre final de los módulos es orientativo; no obliga a fragmentar más de lo necesario.

## 10. Plan de integración y QA funcional — pendiente

### Etapas propuestas

1. **Revisión del diagnóstico**: aprobar copy ES/PT, etiquetas y alcance; resolver footer/destino del logo y revisar autorización con el equipo. No bloquear la auditoría esperando esa decisión.
2. **Catálogo y errores semánticos, completados**: catálogos/parámetros de etapa 1 y discriminantes/reconciliación/localización de etapa 2 verificados con pruebas. Límites, normalizadores y payload conservados. Falta integrar el locale vigente en etapa 3.
3. **Idioma en el mismo wizard, implementado**: provider/query, traducción de intro/campos/pasos/resumen/éxito/recorte, `lang`, metadata e invitación; verificación de no desmontaje en Chrome. Pendiente revisión visual y editorial humana.
4. **Header aislado por arquitectura, implementado**: root común y grupo público, header exclusivo del formulario sin footer institucional, altura/foco, URLs, 404 y metadata comprobados. Ver sección 0.d; pendiente revisión visual humana.
5. **QA y revisión humana**: fixtures temporales, respuestas simuladas y entorno de pruebas autorizado. Entregar capturas ES/PT, resultados y diferencias. Detenerse antes de commit/PR si se mantiene la restricción.

### Matriz futura de QA

| Área | Casos y evidencia esperada |
| --- | --- |
| Catálogos | Igualdad de claves y parámetros, ausencia de voseo en copy ES propio, labels confirmados, PT brasileño revisado y fallback conocido/desconocido. |
| Cinco pasos × dos idiomas × tres categorías | Labels, preguntas, ayudas, resumen y datos activos correctos; no cambiar el número/orden de pasos. |
| Reglas cliente/servidor | Vacíos, mínimos/máximos/límites exactos, campos condicionales inactivos, país Unicode, normalizadores de enlaces e imágenes. Mantener resultados equivalentes entre locales. |
| Errores existentes | Cambiar idioma con error local, error de servidor, corrección parcial, categoría alternada, error desconocido y respuesta retirada. No borrar errores sin editar. |
| Cambio ES↔PT con datos | Mantener paso, categoría, relato con saltos de línea, todos los datos profesionales conservados, país libre, contacto, archivos y consentimiento. Ningún valor se traduce o envía por cambiar idioma. |
| Recarga y enlaces | `/enviar`, `?lang=es`, `?lang=pt-BR`, query inválido/repetido y navegación atrás/adelante. Idioma estable; borrador no persistido según contrato actual. |
| Imágenes | Avatar y foto: seleccionar, cancelar reemplazo, confirmar, quitar, volver a elegir el mismo archivo, fallo de crop y fallo de upload simulado. Cambiar idioma con modal abierto/en proceso sin perder área/zoom/preview. |
| Envío | Mock/deferred action para pending, error, excepción y éxito; probar idioma cambiado durante petición, botón y retorno al paso correcto, sin duplicar envío. |
| Consentimiento | Mismo lugar, casilla obligatoria, valor `1`, error localizado y timestamp generado en servidor. No aceptar/revocar automáticamente por idioma. |
| Éxito e invitación | Un H1, foco correcto, revisión antes de publicar, copiar/enlace en idioma actual también al cambiarlo después de enviar. |
| Responsive | 320, 375, 768, 1024 y 1440px; fuentes raíz 16/24/32px; PT largo en categorías, cinco indicadores, ayuda/error y botones. Sin desbordamientos ni recortes esenciales. |
| Teclado y lectores | Radio group, selector nativo con nombre/idioma, tabulación, foco al error/paso/éxito, `aria-describedby`, `aria-invalid`, nombres en PT y ausencia de anuncios duplicados. Revisar con lectores reales, no solo árbol accesible. |
| Header y layouts | Solo logo/selector en `/enviar`; navbar/footer públicos sin cambios en `/` y `/t/[slug]`; medición de altura correcta y 404 esperado; sin flashes por ocultación cliente. |
| Metadata e hidratación | Direct link SSR PT, cambio in-place, recarga y salida a otras rutas; título/description/lang correctos sin discrepancia SSR/cliente. |
| Persistencia y social | Comparar `FormData`/payload antes y después, sin campos UI filtrados a negocio ni traducción de relato/captions/cards. |
| Técnico | TypeScript, ESLint, build de producción y `git diff --check`, una vez implementado. No ejecutarlos como sustituto de la auditoría editorial o aprobación visual. |

Usar fixtures inequívocos y dobles para la acción/repositorio/inbox. La integración real de envío, si se requiere más adelante, debe hacerse en un entorno de pruebas expresamente autorizado, sin testimonios reales ni webhooks/redes de producción. Las etapas 2 y 3 ejecutaron pruebas locales con dobles; no se lanzó una batería de envíos contra servicios.

## 11. Coordinación y límites de certeza

**Hechos verificados**: estructura y copy del checkout, reglas descritas, conservación en memoria, mensajes/labels compartidos, registro de consentimiento, uso de imágenes, header raíz y ausencia de i18n instalada.

**Estado de las propuestas**: etapas 1–4 implementadas sin dependencias adicionales. UI ES/PT-BR, selector, query, metadata, idioma accesible y header/layouts separados. Revisión visual, copy PT y consentimiento siguen sujetos a revisión humana.

**Decisiones pendientes**: revisión brasileña, autorización equivalente, información legal adicional y matiz editorial de empleo. En esta versión se aprobó retirar el footer institucional del formulario y dejar su logo sin enlace. La ubicación del consentimiento y navegación/edición por pasos permanecen en sus propias issues.

No se verificó paridad pregunta por pregunta con Tally porque no se adjuntó su definición/URL. Para confirmar la sustitución completa más adelante hará falta contrastar esa referencia; no se inventa ni se declara cubierta aquí.

No se hicieron envíos reales, consultas de datos de participantes o cambios en servicios. Las pruebas de UI se ejecutaron en un servidor de producción local con datos sintéticos y respuestas interceptadas. El contrato local de errores cambió en etapa 2 y se mantuvo en etapa 3; sus operaciones de persistencia se conservan. No se abrieron archivos `.env*` ni credenciales. Build y servidor pueden cargarlos automáticamente según las reglas del proyecto, sin inspeccionar sus valores. No se ejecutaron operaciones Git de escritura. El alcance por etapa queda registrado en las secciones 0, 0.b y 0.c.

## 12. Fuentes técnicas consultadas

Además de los archivos del proyecto enlazados, se leyó la documentación distribuida con la instalación local de Next:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`: grupos sin prefijo de URL, conflictos y múltiples roots.
- `.../layout.md`: composición, root compartido y ausencia de `searchParams` en layouts.
- `.../page.md`: `searchParams` asíncrono y renderizado dependiente de petición.
- `.../01-getting-started/04-linking-and-navigating.md`: History API nativa e integración con hooks del router.
- `.../02-guides/internationalization.md`: diccionarios y alternativa de rutas localizadas.

La documentación oficial externa de `next-intl` se cita en la comparación de estrategias; no se usaron fuentes secundarias ni se instaló la biblioteca. Para una implementación futura se deberán comprobar otra vez las APIs y compatibilidad de cualquier dependencia que se decida incorporar.
