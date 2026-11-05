# Navegación y resumen del formulario — etapas 1, 2 y 3

Fecha: 5 de noviembre de 2026. Rama: `feat/testimonios-form-steps-summary`.

La investigación de conservación queda cerrada: el desarrollador confirmó en localhost que retroceder sin «Siguiente» y alternar categorías conserva los valores. Esta etapa no implementa una corrección de pérdida de datos.

Las etapas 1 (navegación interactiva) y 2 (validación integral antes del envío) quedaron aprobadas tras las pruebas automatizadas y la revisión manual del desarrollador en localhost. Las secciones siguientes conservan sus decisiones, resultados técnicos y limitaciones específicas de QA.

## Navegación implementada

`StepProgress`, interno de [EnviarForm](../components/enviar-form.tsx), mantiene sus cinco columnas, círculos, etiquetas desde `md` y resaltado del paso actual. Los pasos anteriores son botones nativos `type="button"`; el actual y los posteriores son texto sin interacción. El actual declara `aria-current="step"` en su elemento de lista. La lista deja de estar oculta al árbol accesible; todos los pasos tienen texto accesible incluso cuando se ocultan sus etiquetas visuales en móvil.

Los botones anteriores reciben nombres completos en ES/EN/PT mediante `form.navigation.backToStep`, con número y etiqueta del destino. Enter y Espacio usan la activación nativa del botón. El foco de teclado utiliza el cyan existente del Design System.

Los pasos anteriores muestran un borde cyan al 40% para indicar navegación disponible también en dispositivos táctiles. Los futuros y los conectores conservan su presentación neutral. No hay marcas de validación ni estilo de completado: estar antes del paso actual indica posición, no validez de sus datos.

Hover de pasos anteriores: el botón permanece transparente y el borde del círculo intensifica el cyan al 100% en 150 ms, solo si el control está habilitado y el dispositivo admite hover. Se conserva el color del número, el degradado actual, el área interactiva y el foco visible; con movimiento reducido se retira la transición. No cambia tamaño, distribución ni conectores.

Desde el paso 2 se muestra bajo el indicador una ayuda discreta solo por debajo de `md`: «Toca un paso anterior para volver», localizada en ES/EN/PT con `form.navigation.previousStepsHint`. No añade estados ni modifica la navegación. La ayuda envuelve su texto al ampliar la fuente.

QA focalizado del ajuste: build y ESLint del componente PASS; Chrome de escritorio confirma borde cyan, fondo transparente, geometría estable, foco visible y ausencia de hover al deshabilitar. La emulación táctil no aplica hover; 320/375 px y fuentes al 100/200% conservan el encaje. Se verificó movimiento reducido; no hubo POST ni solicitudes externas. Dispositivo móvil real pendiente de revisión manual.

La regresión de 18 recorridos y 30 combinaciones responsive también se repitió con la ayuda móvil: PASS. Comprueba su traducción, ausencia en el paso 1, presencia desde el paso 2, ocultación en escritorio y separación del indicador sin desbordes con texto normal y ampliado. Las capturas se actualizaron para mostrar el borde tenue y la ayuda.

Los círculos conservan su tamaño normal de `2.5rem`, limitado por el ancho de la columna y una separación mínima para no superponerse en 320 px con fuente al 200%. Los conectores se centran en la fila real del círculo. La revisión de capturas detectó esta superposición; la prueba responsive ahora comprueba también separación y proporción cuadrada, además de ausencia de desborde horizontal.

`navigateBackTo()` permite exclusivamente destinos entre 1 y `step - 1` y reutiliza `navigateTo()`. No valida ni escribe datos. No se añade historial de visitas: el avance sigue siendo secuencial y cualquier destino anterior ya fue alcanzado durante ese recorrido. Haber llegado antes al paso 5 no lo habilita después de volver al paso 1.

`goNext()` conserva las validaciones existentes. Cambiar de categoría no habilita ningún salto hacia adelante; se vuelve a recorrer «Siguiente» con los campos activos. No se modifica `changeType()`, la reconciliación de errores ni los valores profesionales retenidos.

Durante `pending`, los botones del indicador, Atrás y Siguiente permanecen deshabilitados; las funciones de navegación también comprueban ese estado. `navigateTo()` conserva la solicitud de foco y el desplazamiento que descuenta el header sticky, y limita sus destinos a los cinco pasos.

## Alcance conservado

- No hay cambios al resumen, validación integral previa al envío, almacenamiento de datos o consentimiento.
- No se modifica `FileField`, recorte, archivos, object URLs ni internacionalización del borrador o preferencias de idioma.
- Las ampliaciones de los catálogos son el nombre accesible del nuevo control y la ayuda móvil, bajo el contrato tipado y el inventario existentes.
- No se modifican Server Actions, parser, persistencia, servicios, rutas, Design System ni componentes compartidos.

## Verificación

El script [qa-form-steps.mjs](../scripts/qa-form-steps.mjs) se ejecuta después de `pnpm.cmd run build`, con Chrome instalado y sin dependencias nuevas. Inicia su propio servidor de producción local con la fixture existente, intercepta todas las solicitudes del navegador, bloquea destinos externos y mantiene los POST fuera de Next. Tres respuestas simuladas de error permiten comprobar el estado pendiente sin ejecutar la acción. Los procesos propios y el perfil temporal se limpian al finalizar.

La matriz cubre tres categorías × ES/EN/PT × 375/1440 px. Verifica saltos anteriores, destinos futuros inaccesibles incluso si fueron visitados, Enter/Espacio, Tab y foco visible, encabezado revelado bajo el header, ausencia de validación al retroceder, conservación del borrador y las dos imágenes, validación de avance y alternancia de categorías. Comprueba nombres en el árbol de accesibilidad y bloqueo de navegación durante los envíos interceptados.

La comprobación responsive adicional recorre 320, 375, 768, 1024 y 1440 px, con fuentes al 100% y 200%, en los tres idiomas. Las capturas y el resultado se guardan en [assets/form-steps](./ui/assets/form-steps/qa-results.json), sin sobrescribir QA histórico.

Resultados: **79/79 pruebas unitarias PASS**, TypeScript (`--noEmit --incremental false`), ESLint, build de producción y `git diff --check`: PASS. QA Chrome 156 contra el build de esta etapa: **18/18 recorridos PASS**, 30 combinaciones responsive PASS (cinco anchos × dos tamaños × tres idiomas), tres POST interceptados y cero envíos reales. Se comprueban tanto «Atrás» como el indicador; no se sustituyen validaciones del servidor por los resultados de navegador.

Capturas revisables: [ES, 375 px](./ui/assets/form-steps/es-375-1x.png), [EN, 1440 px](./ui/assets/form-steps/en-1440-1x.png) y [PT, 320 px con fuente al 200%](./ui/assets/form-steps/pt-320-2x.png).

La emulación de ancho y tamaño de fuente no sustituye dispositivos táctiles, zoom real del navegador ni pruebas con lectores de pantalla y Safari/Firefox. La revisión manual del desarrollador en localhost de la etapa 1 está aprobada; esa aprobación no sustituye las comprobaciones específicas anteriores. No se realiza una nueva certificación de contraste ni se alteran los fallos históricos del Design System.

## Archivos de esta etapa

| Archivo | Cambio |
| --- | --- |
| `components/enviar-form.tsx` | Indicador interactivo hacia atrás, presentación neutral y bloqueo pendiente. |
| `lib/form-i18n/types.ts`, `format.ts`, `messages/es.ts`, `messages/en.ts`, `messages/pt-BR.ts` | Contrato y traducciones del nombre accesible. |
| `lib/form-i18n/infrastructure.test.ts` | Aserciones de nombres ES/EN/PT; las pruebas existentes también verifican paridad y parámetros. |
| `scripts/qa-form-steps.mjs` | Regresión de navegador aislada para esta etapa. |
| `docs/form-i18n-text-inventory.md`, `docs/ui/README.md`, este documento | Inventario, enlace y decisiones de alcance. |
| `docs/ui/assets/form-steps/` | Reporte JSON y tres capturas sintéticas. |

## Etapa 2 — validación integral antes del envío

Estado: aprobada tras la revisión de los cambios y las pruebas manuales del desarrollador en localhost. Se conservan los resultados técnicos y las limitaciones de QA detallados a continuación.

### Decisiones de implementación

`validateForm()` en [form-validation.ts](../lib/testimonials/form-validation.ts) recorre los pasos definidos en `FIELD_STEP` y reutiliza `validateFormStep()`. No introduce reglas, historial, marcas de aprobación ni estados nuevos. Solo comprueba campos activos de la categoría vigente y devuelve también claves con `undefined`, necesarias para registrar correcciones en los overrides existentes.

La regla que preserva rechazos activos del servidor se trasladó desde `EnviarForm.validateStep()` a un tercer argumento opcional de `validateFormStep()`. La misma combinación se utiliza al pulsar «Siguiente» y al intentar el envío final: un error activo del servidor prevalece sobre la comprobación local hasta que la edición del campo lo corrige mediante la reconciliación existente. No se clona ni se sustituye la identidad de la respuesta del servidor. Los errores de categorías inactivas se filtran y vuelven a considerarse al reactivar la categoría.

En el paso 5, `onSubmit()` comprueba todos los pasos antes de construir `FormData` o retirar la respuesta anterior. Actualiza los errores y filtra las claves sin incidencia antes de llamar a `firstErrorStep()`: este helper calcula desde las claves, por lo que incluir overrides `undefined` enviaría incorrectamente al paso 1. No se modifica ese helper compartido ni el parser.

Si hay errores, el intento termina localmente. Se solicita foco en el primer campo inválido del primer paso afectado. Cuando el error corresponde al propio paso 5, se espera al render de los mensajes antes de enfocar; para otros pasos se reutiliza `navigateTo()` y el scroll con offset del header. Durante `pending`, el handler rechaza intentos adicionales.

Los valores, archivos, consentimiento, datos profesionales inactivos y construcción del payload se conservan. Solo se envían los campos profesionales activos. La acción y la validación integral del servidor permanecen intactas y siguen siendo la autoridad final. Los errores generales o de campos desconocidos conservan su ciclo previo de presentación y reintento; no se inventa un campo o paso corregible para ellos.

Esta etapa no incorpora edición del resumen ni previews nuevos. El documento conserva arriba el alcance histórico de la etapa 1.

### Pruebas y resultados

- Pruebas unitarias en `form-errors.test.ts`: validación integral por categoría, búsqueda del primer paso inválido, claves `undefined`, campos activos/inactivos, conservación de archivos y datos, rechazo vigente del servidor, corrección parcial, reactivación de categoría y presentación ES/EN/PT.
- [qa-form-submit-validation.mjs](../scripts/qa-form-submit-validation.mjs): nueve recorridos (tres categorías × ES/EN/PT), con ancho 375 px para ES/PT y 1440 px para EN. Inicia un servidor local del build actual y Chrome aislado; intercepta los POST antes de Next y bloquea servicios externos. Cuatro respuestas simuladas por recorrido prueban errores sucesivos y éxito, sin ejecutar la acción real.
- Para aislar la defensa final, el script modifica algunos controles montados pero ocultos mediante setters nativos y eventos `input`, ejecutando sus `onChange` reales. No reemplaza validadores, hooks ni navegación: el recorrido normal ya impide alcanzar el resumen con esos errores. Estos casos comprueban deliberadamente el guard del envío, sin presentarlos como un fallo de conservación de datos.
- Se verifica que los errores locales no construyan payload ni produzcan POST, que se enfoquen y describan los campos inválidos en pasos 2/3/4/5, que «Siguiente» conserve sus validaciones y que una respuesta nueva no herede correcciones de otra anterior. Se comprueba el cambio de categoría después del resumen, la exclusión de campos profesionales inactivos en `FormData`, la conservación de su valor y la reactivación de rechazos pendientes al volver.

Resultados de etapa 2: **85/85 pruebas unitarias PASS**, TypeScript (`--noEmit --incremental false`), ESLint, build y `git diff --check`: PASS. QA Chrome 156: **9/9 recorridos PASS**, 36 POST interceptados, cero envíos reales, cero solicitudes externas y cero excepciones de navegador detectadas. Los procesos propios y perfiles temporales se cerraron y limpiaron.

El reporte se guarda en [form-submit-validation/qa-results.json](./ui/assets/form-submit-validation/qa-results.json), separado de la evidencia aprobada de etapa 1. Quedan para revisión manual el lector de pantalla real y dispositivos móviles físicos; las verificaciones automáticas de foco y viewport no los sustituyen.

### Archivos de la etapa 2

| Archivo | Cambio |
| --- | --- |
| `components/enviar-form.tsx` | Comprobación integral, bloqueo local del envío y foco en el primer error. |
| `lib/testimonials/form-validation.ts` | Composición de reglas existentes y preservación compartida de errores activos del servidor. |
| `lib/testimonials/form-errors.test.ts` | Regresiones de validación integral y reconciliación. |
| `scripts/qa-form-submit-validation.mjs` | Casos de navegador con respuestas interceptadas y payload verificado. |
| `docs/ui/assets/form-submit-validation/qa-results.json` | Evidencia sintética de los nueve recorridos. |
| Este documento y `docs/ui/README.md` | Alcance, decisiones y resultados de etapa 2. |

## Etapa 3 — resumen visual con fotografías confirmadas

Estado: implementada para revisión visual del desarrollador en localhost. Las aprobaciones de etapas 1 y 2 se mantienen; esta etapa no incluye accesos «Editar» ni modifica el consentimiento.

### Composición acordada: opción A

El resumen se organiza en tres tarjetas con tokens existentes (`bg-card`, `border-border`, `rounded-card`, espaciados y tipografía del formulario):

1. **Datos personales:** avatar final, nombre, país y correo, con su aclaración de privacidad. El avatar aparece una sola vez, a tamaño contenido, y los datos se apilan en móvil.
2. **Tu experiencia:** categoría de solo lectura, campos profesionales activos y relato completo. Los pares de etiquetas y valores usan `dl`, `dt` y `dd`; el relato conserva párrafos y saltos con `whitespace-pre-wrap`, sin truncado.
3. **Fotografías y enlaces:** fotografía opcional confirmada, con altura automática y su proporción natural; el ancho se limita a `36rem`. Sin foto se presenta un texto localizado discreto, sin caja de imagen vacía. Solo se muestran enlaces con contenido, como texto de lectura: los campos admiten URL o usuario, y el resumen no los transforma ni carga embeds o terceros.

Las tres secciones tienen encabezados e identificadores accesibles. Los textos alternativos reutilizan las etiquetas localizadas de avatar y fotografía de experiencia. Se agregan `form.review.personalTitle` y `form.review.experienceTitle` en ES/EN/PT; `captureMissing` identifica ahora la fotografía ausente. El inventario y el contrato tipado se actualizan sin retirar claves históricas.

### Archivos finales y recursos

La investigación confirma que `FileField` retiene el original únicamente durante el recorte y comunica el archivo al padre solo al confirmar. `cropAvatarFile()` genera JPEG de 720×720; `cropCaptureFile()`, JPEG de 1080×608. Cancelar o fallar un reemplazo mantiene el archivo confirmado. No se cambia ese código ni su API.

`SummaryImage`, interno de `enviar-form.tsx`, recibe directamente `avatarFile` o `captureFile`. Tiene una ref al `img` y un efecto de layout dependiente del archivo: crea una URL, asigna `src` y al limpiar retira el atributo y revoca esa URL. No asigna URLs durante el render, no guarda nuevas copias del archivo, no recorta ni mantiene un cache global. Un cambio de idioma o respuesta del servidor conserva la URL si el archivo no cambia.

Las imágenes del resumen solo se montan en el paso 5. Cada instancia es dueña de una URL; no toma ni revoca las URLs privadas de `FileField`. Hay como máximo dos URLs adicionales mientras el resumen está visible, sobre los mismos archivos finales, y se liberan al retroceder, al cambiar el archivo o al desmontar por éxito. Los editores conservan su instancia y archivos al navegar.

No se aplica `object-cover`, altura fija ni proporción forzada a la fotografía opcional. La vista previa muestra el mismo archivo que se entrega a `FormData`, sin un segundo recorte visual. Se conservan íntegros los handlers de envío, validación integral, navegación, errores del servidor, consentimiento y acciones inferiores.

### Verificación y capturas

[qa-form-summary.mjs](../scripts/qa-form-summary.mjs) usa fotografías sintéticas de canvas, Chrome y el build local. Intercepta todos los POST antes de Next y bloquea servicios externos. El seguimiento de `createObjectURL`/`revokeObjectURL` comprueba identidad del archivo final entre editor, resumen y payload, actualización y cancelación de reemplazos, eliminación de la foto opcional, conservación entre pasos, estabilidad al cambiar idioma y limpieza completa tras el éxito simulado.

La matriz cubre las tres categorías × ES/EN/PT, incluyendo nombre largo, relato completo con párrafos y palabras sin espacios, y URLs extensas. La primera ejecución comprobó 320, 375 y 1440 px con fuentes al 100/200%. La investigación posterior amplía esa cobertura, según se detalla abajo. Se verifica la fotografía opcional presente y ausente, texto alternativo, proporción real y exclusión de controles o embeds dentro del resumen.

Resultados iniciales: **85/85 pruebas unitarias PASS**, TypeScript (`--noEmit --incremental false`), ESLint, build y `git diff --check`: PASS. QA inicial del resumen: **9/9 recorridos y 54 combinaciones responsive PASS**, 18 POST interceptados. Ese PASS comprobaba encaje y proporciones, pero no garantizaba legibilidad con fuente ampliada; el reporte del resumen se regenera con las comprobaciones adicionales indicadas abajo. Todos los recursos creados se revocaron una vez al cerrar cada recorrido. [Regresión de validación de etapa 2](./ui/assets/form-summary/submit-regression/qa-results.json) contra el resumen nuevo: **9/9 recorridos PASS**, 36 POST interceptados. En ambas ejecuciones hubo cero envíos reales, cero solicitudes externas y cero excepciones de navegador detectadas; procesos y perfiles propios cerrados y limpiados. No se sobrescribe la evidencia aprobada de etapas anteriores.

Capturas sintéticas para revisión visual:

- [ES, 375 px, con fotografía](./ui/assets/form-summary/es-375-100-present.png) y [sin fotografía opcional](./ui/assets/form-summary/es-375-absent.png).
- [EN, escritorio 1440 px](./ui/assets/form-summary/en-1440-100-present.png).
- [PT, 320 px](./ui/assets/form-summary/pt-320-100-present.png) y [fuente al 200%](./ui/assets/form-summary/pt-320-200-present.png).
- Categorías adicionales en escritorio: [experiencia en No Country](./ui/assets/form-summary/es-simulation-1440.png) y [reconversión profesional](./ui/assets/form-summary/es-career_change-1440.png).

Lector de pantalla real, dispositivos físicos, zoom nativo y revisión visual humana siguen fuera de la emulación automática. La etapa 3 queda pendiente de aprobación del desarrollador en localhost.

### Investigación de legibilidad con texto ampliado — 5 de noviembre de 2026

**Causa confirmada: espaciado real del layout.** En Chrome 156, viewport de 320 px y raíz de 32 px, `innerWidth` es 320, `clientWidth` y `scrollWidth` son 310 (gutter de scrollbar de 10 px). El `main` mide 310 px. Su `px-md` ocupa 48 px por lado; contenedor, formulario, `fieldset` y resumen quedan en 214 px. Cada tarjeta añade 32 px de padding por lado y dos bordes de 1 px: quedan **148 px útiles**, para texto de 32 px y títulos de 36 px. `min-w-0`, grid/flex y los límites `max-width` no están contrayendo adicionalmente las tarjetas. `wrap-anywhere`, heredado del `main`, acaba partiendo palabras que no caben en ese espacio. No existía pérdida de contenido, pero sí un problema de lectura.

La medición [anterior al ajuste](./ui/assets/form-summary/investigation/layout-before.json) registra anchos, posiciones, alturas, padding, márgenes, gaps, tamaños de fuente, `min/max-width`, grid/flex y reglas de palabras de todos esos contenedores. Se compara el mismo resumen PT con los otros anchos y fuente normal.

La repetición [después del ajuste](./ui/assets/form-summary/investigation/layout-diagnostic.json) usa el mismo recorrido, categoría, idioma, viewport y archivos sintéticos; conserva también la comparación de recortes en [diagnostic-captures.json](./ui/assets/form-summary/investigation/diagnostic-captures.json).

**La captura no causaba el estrechamiento.** El recorte anterior utilizaba el rectángulo del resumen en coordenadas CSS del documento (`getBoundingClientRect()` más scroll), con `scale: 1`. La imagen resultaba de 214 px porque ese era el ancho real del resumen; no era una captura del viewport de 320 px comprimida. Capturar también los 320 px completos muestra los mismos saltos y 148 px útiles, antes y después de la captura. El visor puede reducir aún más una imagen tan alta para mostrarla entera, por lo que se incluyen recortes superiores de 1200 px para revisión a tamaño legible.

La ampliación de la fuente raíz es una prueba útil de reflow con unidades relativas, pero **también duplica el espaciado en `rem`**. No equivale a zoom exclusivo de texto, preferencias de fuente del navegador ni zoom nativo de página. Este último cambia la relación entre píxeles CSS y físicos y el viewport efectivo. No se afirma haberlo verificado mediante CDP ni se sustituye por emulación de pinch zoom. Sigue pendiente su comprobación manual en un navegador con interfaz.

**Ajuste local:** solo el resumen por debajo de `sm` limita sus espacios horizontales a los tamaños originales de los tokens a raíz de 16 px. Los márgenes del resumen compensan únicamente el exceso de `--spacing-md` sobre 24 px; el padding horizontal de cada tarjeta usa `min(var(--spacing-sm), 16px)`. A fuente normal la compensación es cero y el padding sigue siendo 16 px. A raíz de 32 px, las tarjetas recuperan 48 px exteriores y 32 px interiores, sin modificar `main`, los otros pasos ni CSS global. Desde `sm` se conserva el estilo anterior. Los límites en píxeles son los tamaños base de los tokens existentes, no nuevos tokens de diseño.

| Viewport / fuente | Ancho de tarjeta antes → después | Ancho útil antes → después |
| --- | --- | --- |
| 320 px / 100% | 262 → 262 px | 228 → 228 px |
| 320 px / 200% | 214 → 262 px | 148 → 228 px |
| 375 px / 100% | 317 → 317 px | 283 → 283 px |
| 375 px / 200% | 269 → 317 px | 203 → 283 px |
| 768 px / 100% y 200% | 710 / 662 px, sin cambios | 660 / 564 px, sin cambios |
| 1440 px / 100% y 200% | 768 / 1334 px, sin cambios | 718 / 1236 px, sin cambios |

Se mantienen tres secciones, los tamaños de fuente ampliados, los párrafos completos y el ajuste de palabras largas y URLs. No se añaden truncados, ocultación ni recortes. Avatar, foto opcional, archivos, URLs de objeto, payload, consentimiento y todos los handlers permanecen intactos. El ajuste de producción se limita a cuatro atributos `className` de `components/enviar-form.tsx`, más un comentario explicativo.

**QA reforzado:** `scripts/qa-form-summary.mjs` espera hidratación y fuentes, mide el DOM y registra el layout. Comprueba los cuatro anchos (320/375/768/1440), fuentes al 100/200%, las tres categorías y ES/EN/PT, tanto con foto como sin ella: **144 combinaciones**. Además del encaje, exige al menos siete `em` útiles para el relato y comprueba con `Range.getClientRects()` que ninguna palabra de los títulos de tarjeta se parta entre líneas. Este umbral detectaría los 4,625 `em` anteriores, pero es una regresión geométrica concreta, no una certificación general de legibilidad. Los nombres largos, relatos y URLs se revisan también en las capturas.

Las capturas nuevas conservan todo el ancho del viewport, con `x: 0`, coordenada vertical del resumen en el documento y `scale: 1`. Se comprueban las dimensiones del PNG contra el clip, los anchos y posiciones de los contenedores y las alturas del resumen, tarjetas y textos antes y después, con tolerancia de 1 px por redondeo. Chrome puede suprimir el scrollbar en su superficie de captura y variar `clientWidth` hasta 10 px; también puede aumentar la altura del `main` flexible con `min-height: 100dvh`. El reporte conserva ambas mediciones y exige que el ancho y la composición del propio resumen se mantengan: esos efectos de la superficie de captura no explican el estrechamiento anterior. La opción `--diagnose` permite repetir la comparación entre clip de elemento y viewport sin envíos; sus archivos `diagnostic-*` no sobrescriben la evidencia `before-*`.

En la investigación se observaron vistas auxiliares incompletas al probar clips cortos y `fromSurface: false`; no se usaron como evidencia final. También hubo inconsistencias del visor al volver a abrir PNG regenerados con el mismo nombre: dos archivos con idéntico SHA-256 y 17.930 píxeles de texto bajo el avatar aparecían distintos en el visor; una copia con nombre nuevo mostró el contenido correcto. No se atribuye esa diferencia de visualización a un fallo de CSS ni se considera demostración de un recorte incorrecto de Chrome.

Para verificar los archivos, el script recorre el resumen con scroll antes de capturar y contrasta los rectángulos DOM de cada fragmento de palabra con píxeles de texto presentes en el PNG, excluyendo espacios y saltos vacíos. Así detecta regiones vacías aunque sus dimensiones sean correctas. Las vistas `*-top.png` definitivas se extraen de los primeros 1200 píxeles del PNG completo ya verificado, sin redimensionarlo ni volver a capturar una superficie parcial. Se usa `sharp`, ya instalado por Next, exclusivamente para verificar y recortar capturas de QA; no se agrega ninguna dependencia ni se toca el procesamiento de archivos del formulario. `--refresh-crops` regenera esas dos vistas desde un reporte completo existente, sin iniciar navegador, servidor o solicitudes. El reporte identifica su imagen de origen y dimensiones. Se comprobó la igualdad de píxeles de los detalles y sus regiones de origen. Esto refuerza la evidencia; el estrechamiento original queda explicado por el layout medido, no por esos efectos del visor.

**Resultados del ajuste:** **85/85 pruebas unitarias PASS**, TypeScript (`--noEmit --incremental false`), ESLint, build de producción y `git diff --check`: PASS. El primer intento de build con red restringida no pudo descargar DM Sans; la repetición con acceso a esa fuente pública completó correctamente. [Matriz del resumen actualizada](./ui/assets/form-summary/qa-results.json): **9/9 recorridos y 144 combinaciones responsive PASS**, 21 capturas o vistas de detalle, 18 POST interceptados, cero envíos reales, cero solicitudes externas y cero excepciones de navegador detectadas. Conserva las comprobaciones de archivos finales, proporciones, reemplazo/cancelación, recursos y payload. Se repitió el diagnóstico PT después del ajuste y se regeneraron las dos vistas superiores mediante `--refresh-crops`. La comparación de 13 funciones o bloques contra `HEAD` confirma navegación, indicador, validación integral, envío, consentimiento y alertas sin cambios. Servidores, navegadores y perfiles propios cerrados y limpiados.

Comparación visual conservada:

- Antes: [PT 320/200%, parte superior a ancho de viewport](./ui/assets/form-summary/investigation/before-pt-320-200-viewport-top.png), [resumen completo con contexto](./ui/assets/form-summary/investigation/before-pt-320-200-viewport-clip.png) y [recorte original del elemento](./ui/assets/form-summary/investigation/before-pt-320-200-element-clip.png).
- Después: [PT 320/200%, detalle con nombre distinto para revisión](./ui/assets/form-summary/investigation/after-pt-320-200-detail.png), [parte superior generada por el script](./ui/assets/form-summary/pt-320-200-present-top.png) y [resumen completo](./ui/assets/form-summary/pt-320-200-present.png); [sin foto opcional](./ui/assets/form-summary/pt-320-200-absent.png).
- Referencias: [PT 375/200%](./ui/assets/form-summary/pt-375-200-present.png), [PT 768/200%](./ui/assets/form-summary/pt-768-200-present.png), [ES 375/100%](./ui/assets/form-summary/es-375-100-present.png) y [EN 1440/100%](./ui/assets/form-summary/en-1440-100-present.png).

Los únicos archivos de trabajo adicionales de esta investigación son `components/enviar-form.tsx` (espaciado local), `scripts/qa-form-summary.mjs` (medición, cobertura y captura), este documento y la evidencia bajo `docs/ui/assets/form-summary/`. No se alteran las etapas aprobadas ni se incorpora edición del resumen. La revisión manual final en localhost, dispositivos físicos, zoom nativo y lectores de pantalla permanece pendiente.

### Archivos de la etapa 3

| Archivo | Cambio |
| --- | --- |
| `components/enviar-form.tsx` | Tres secciones del resumen y recurso local `SummaryImage`. |
| `lib/form-i18n/types.ts`, `messages/es.ts`, `messages/en.ts`, `messages/pt-BR.ts` | Títulos de sección y estado opcional localizado. |
| `scripts/qa-form-summary.mjs` | Regresión de fotografías, recursos, payload y responsive. |
| `docs/ui/assets/form-summary/` | Reportes y capturas de esta etapa. |
| `docs/form-i18n-text-inventory.md`, `docs/ui/README.md`, este documento | Inventario y decisiones de la etapa. |

## Trabajo futuro — ubicación del consentimiento

Leandro y Geraldine recomendaron que el consentimiento deje de ser un paso del formulario. Todavía deben definirse su ubicación y el ajuste correspondiente al flujo; esta recomendación no se implementa en esta etapa.

Cualquier rediseño debe conservar la obligatoriedad, las validaciones y el registro de consentimiento existentes.
