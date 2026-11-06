# Navegación y resumen del formulario — etapas 1 a 4

Fecha: 5 de noviembre de 2026. Rama: `feat/testimonios-form-steps-summary`.

La investigación de conservación queda cerrada: el desarrollador confirmó en localhost que retroceder sin «Siguiente» y alternar categorías conserva los valores. Esta etapa no implementa una corrección de pérdida de datos.

Las etapas 1 (navegación interactiva), 2 (validación integral antes del envío) y 3 (resumen visual y ajuste de legibilidad) quedaron aprobadas manualmente, documentadas y commiteadas por el desarrollador. Las secciones siguientes conservan sus decisiones, resultados técnicos y limitaciones específicas de QA. La etapa 4 queda pendiente de revisión en localhost.

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

Estado: aprobada manualmente en localhost, documentada y commiteada por el desarrollador. Su alcance histórico no incluía accesos «Editar» ni cambios al consentimiento; la edición se incorpora exclusivamente en la etapa 4.

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

Lector de pantalla real, dispositivos físicos y zoom nativo siguen fuera de la emulación automática. La revisión visual manual de la etapa 3 en localhost está aprobada; esa aprobación no sustituye las comprobaciones específicas anteriores.

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

Los únicos archivos de trabajo adicionales de esta investigación fueron `components/enviar-form.tsx` (espaciado local), `scripts/qa-form-summary.mjs` (medición, cobertura y captura), este documento y la evidencia bajo `docs/ui/assets/form-summary/`. La investigación no incorporó edición del resumen. La revisión manual final de la etapa 3 en localhost está aprobada; se mantienen las limitaciones de dispositivos físicos, zoom nativo y lectores de pantalla.

### Archivos de la etapa 3

| Archivo | Cambio |
| --- | --- |
| `components/enviar-form.tsx` | Tres secciones del resumen y recurso local `SummaryImage`. |
| `lib/form-i18n/types.ts`, `messages/es.ts`, `messages/en.ts`, `messages/pt-BR.ts` | Títulos de sección y estado opcional localizado. |
| `scripts/qa-form-summary.mjs` | Regresión de fotografías, recursos, payload y responsive. |
| `docs/ui/assets/form-summary/` | Reportes y capturas de esta etapa. |
| `docs/form-i18n-text-inventory.md`, `docs/ui/README.md`, este documento | Inventario y decisiones de la etapa. |

## Etapa 4 — edición global dentro del resumen

Estado: aprobada visual y funcionalmente en localhost y commiteada en `1490a3d`. Las etapas 1, 2 y 3 conservan su aprobación y commits. Esta sección describe el estado histórico al cierre de la etapa 4; la etapa 5 documentada abajo sustituye únicamente el flujo de consentimiento. Se descartó sin aprobar la propuesta de tres botones por tarjeta porque duplicaba el indicador. La evidencia anterior de `form-summary-edit/` es histórica y no verifica la solución vigente.

### Arquitectura y controles únicos

En lectura, el único «Editar» está junto a «Revisa tu testimonio». En edición se retira ese control del encabezado y aparece un único «Guardar cambios» al final de las tres tarjetas, antes del consentimiento (EN «Save changes»; PT-BR «Salvar alterações»). El encabezado conserva `Button` ghost; el pie usa `Button` outline del Design System con borde `accent-indigo-light`, hover `accent-cyan`, padding cómodo, altura mínima de 44 px, ancho acotado y texto envolvente. Conservan `type="button"`, nombre accesible localizado, `aria-pressed`, `aria-controls`, foco visible y bloqueo durante `pending`. No hay botones de navegación dentro de las tarjetas ni dos botones «Guardar cambios» simultáneos.

El único estado nuevo es `summaryEditing`. Los datos siguen en los estados originales de `EnviarForm`: no hay otro borrador, guardado externo ni cancelación global. Los JSX existentes se reutilizan como `identityFields`, `storyFields` y `mediaFields`, con sus mismos valores, handlers y ayudas. Cada grupo se monta en un solo lugar: su paso original o su tarjeta durante la edición. Los fieldsets anteriores permanecen, pero sin controles equivalentes montados mientras se edita el resumen. Así no hay nombres/IDs duplicados ni dos fuentes de verdad.

La categoría permanece de lectura. El indicador permite volver a pasos anteriores; salir del paso 5 desactiva la edición y conserva los cambios. Se vuelve secuencialmente con «Siguiente» y sus validaciones, sin habilitar saltos futuros. Los valores profesionales inactivos siguen en React y se excluyen del payload.

### Editar, Guardar cambios, validación y foco

- «Editar» mantiene el paso 5, no valida y enfoca el nombre visible. Cambiar idioma mantiene modo, valores y archivos; no traduce contenido del participante.
- Durante la edición el CTA de envío está deshabilitado. `onSubmit` también retorna antes de validar o construir `FormData`, para proteger Enter y submit programático.
- «Guardar cambios» usa `validateForm(values, serverErrors)` y actualiza los overrides sin retirar la respuesta del servidor. No construye payload ni llama a la acción.
- Si hay errores, mantiene la edición y enfoca el primer control inválido visible. `focusFirstError` excluye cualquier ancestro `hidden` o `inert`. Si el error no tiene control editable visible, por ejemplo categoría, vuelve al control global y conserva la alerta/corrección existente.
- Con datos válidos vuelve a lectura y enfoca el «Editar» visible del encabezado, con el scroll existente. Si un error no tiene campo visible, el fallback utiliza el control visible del modo actual, incluido «Guardar cambios» al pie. Las validaciones y la autoridad del servidor permanecen intactas.

**Limitación histórica de la etapa 4, resuelta en la etapa 5:** «Guardar cambios» llamaba a `validateForm()` y también exigía la casilla debajo del resumen; si faltaba, mantenía la edición y la enfocaba. Se conservó temporalmente y nunca se consideró una decisión de UX definitivamente aprobada. La etapa 5 separa la validación de datos editables de la aceptación exigida al enviar, sin ampliar su alcance. Las capturas y resultados de la etapa 4 se mantienen como evidencia histórica.

### Fotografías y ciclo de recursos

`FileField` recibe ahora `file: File | null` del padre. El selector mantiene localmente solo el recorte pendiente; el confirmado no tiene un segundo estado. Una ref y un efecto de layout crean la URL del preview a partir del archivo, y la revocan al cambiarlo o desmontarse. Las URLs del original de recorte se limpian por separado. Cancelar conserva el confirmado, y una operación de una instancia desmontada no modifica al padre.

Cambiar entre pasos, lectura y edición puede remontar el selector, pero utiliza el mismo objeto `File`. No se reencodea ni recorta por cambiar de modo. `SummaryImage` permanece intacto y muestra los archivos confirmados en lectura. Confirmar comunica el nuevo archivo; quitar la captura comunica `null`. El diálogo y las funciones de recorte JPEG 720×720 / 1080×608 no cambian. `FormData` sigue usando esos mismos objetos finales.

### Diseño y responsive

Se conservan las tres tarjetas, títulos, relato completo, privacidad, enlaces sin embeds y estado opcional ausente. El encabezado de lectura permite envolver «Editar» sin estrechar el título; en edición, «Guardar cambios» queda al pie con su área táctil y foco visible, junto al final del contenido que se está editando. Los grupos pasan a dos columnas desde `lg` para evitar columnas estrechas a 768 px con fuente ampliada.

La comprobación incluye el título principal, además de los títulos de tarjetas. En PT a 320/200%, «depoimento» necesita 282,66 px a 48 px de fuente. El encabezado usa una compensación local de los gutters en `rem`, con un mínimo de 8 px por lado: dispone de 294 px en ese caso, conservando márgenes normales al 100% y la disposición de escritorio. El diagnóstico previo permanece local e ignorado; el reporte vigente conserva las mediciones de la implementación actual.

El módulo CSS limita el padding solo dentro de `summaryEditor`: inputs/selector hasta 16 px y textarea hasta 8 px, dejando espacio para su scrollbar. Son tamaños base de los tokens existentes, sin reducir fuentes ni ocultar contenido. La primera medición detectó una colisión de utilidades: `cn()` conservaba `px-md` junto al ajuste arbitrario y dejaba solo 120 px útiles a 320/200%. Se resolvió con selectores locales, sin cambiar Tailwind Merge, el Design System ni CSS global.

`Field.stackTrailingInfo` apila error y contador solo en el resumen. `FileField.compact` deja espacio para el estado sin foto y utiliza `object-contain` para la captura confirmada. Los pasos normales conservan sus variantes originales.

### Internacionalización y documentación

Las claves vigentes son `form.review.edit`, `done`, `editSummary` y `doneSummary`: 172 en total. Se mantienen `done` y `doneSummary` con el nuevo copy de finalización local, documentado en el contrato. No se agrega persistencia ni estado. Se elimina `editSection` y su parámetro de la propuesta descartada, sin cambiar otras traducciones. La prueba unitaria comprueba los dos estados globales en ES/EN/PT; la suite conserva paridad de catálogos, inventario y parámetros.

### QA de la implementación vigente

Después de build:

- `node scripts/qa-form-summary.mjs --edit-summary --representative-only`
- `node scripts/qa-form-submit-validation.mjs --summary-edit`

La evidencia vigente va a `docs/ui/assets/form-summary-inline/` y `submit-regression/`. Los scripts usan servidores y perfiles Chrome propios, bloquean servicios externos e interceptan POST antes de Next. No ejecutan acciones, uploads, persistencia ni notificaciones reales. Se conserva la evidencia aprobada anterior.

La matriz cubre tres categorías × ES/EN/PT, lectura/edición, foto presente/ausente, 320/375/768/1440 px y raíz de 16/32 px. Comprueba ancho útil, palabras completas en títulos, distribución, labels/ARIA, IDs y nombres únicos, controles antiguos desmontados y previews confirmados. Verifica que el único «Guardar cambios» esté después de las tarjetas y antes del consentimiento, que no quede en el encabezado y que Tab/Enter permitan finalizar desde el último campo. También comprueba los nombres del botón en el árbol accesible, borde visible, contraste del borde y texto sobre el fondo oscuro, hover cyan y ausencia de degradado. El estado disabled se comprueba con un sondeo DOM solo de estilo, separado de los guards de pending reales: no es posible enviar mientras se edita. Los PNG se contrastan con el DOM y los detalles son recortes sin redimensionar. Los errores se comprueban también a 320/375 con ambas fuentes.

Las mediciones distinguen el ancho exterior del textarea de su ancho útil. Chrome puede ocultar su scrollbar de 10 px en la superficie de captura: se registran ambos estados y se exige estabilidad del borde, padding y fuente; solo se admite esa variación del ancho interior. El texto del textarea se desplaza al inicio únicamente al preparar las capturas, sin modificar su valor. Las comprobaciones de pintura incluyen los colores vigentes y excluyen signos aislados, sin presentarse como OCR o certificación de accesibilidad.

Los recorridos cubren Tab/Enter/Espacio, toque emulado, edición de las tres tarjetas, «Otro país», contador, validación y foco de nombre/email/país/avatar/consentimiento, cambio de idioma, bloqueo de submit implícito/programático, navegación antes de terminar y alternancia de categorías. Se prueban reemplazo, cancelación y eliminación de fotos dentro del resumen y en los pasos normales, identidad entre preview y payload y revocación de cada URL exactamente una vez.

Un rechazo activo del servidor sobre email válido localmente bloquea «Guardar cambios» hasta editarlo y enfoca el control de la tarjeta. Los errores generales siguen visibles después de Editar/Guardar cambios. Pending deshabilita el control global e impide duplicados. La regresión independiente conserva sus casos de validación final, errores sucesivos, categorías y payload.

Resultados del ajuste final de copy y botón: **86/86 pruebas unitarias PASS**, TypeScript (`--noEmit --incremental false`), ESLint sin advertencias, build de producción y `git diff --check`: PASS. [QA de edición global](./ui/assets/form-summary-inline/qa-results.json): **9/9 recorridos y 288 combinaciones PASS** (144 lectura + 144 edición), más **36 comprobaciones de distribución con errores**, y 42 capturas/detalles comprobados en memoria (solo se regeneran los cuatro PNG de edición afectados; los dos de lectura permanecen intactos). Hubo 27 POST interceptados. El botón mide 44 px de alto con fuente normal; el contraste medido del borde es 5,81:1 y el del texto 19,12:1 sobre su fondo oscuro. Hover, foco visible, disabled y nombres accesibles localizados: PASS. La ejecución anterior de [regresión de validación](./ui/assets/form-summary-inline/submit-regression/qa-results.json): **9/9 recorridos PASS**, 36 POST interceptados; se conserva sin repetirla para este ajuste visual. En ambos: cero envíos reales, cero solicitudes externas y cero excepciones de navegador detectadas; procesos propios cerrados y perfiles limpiados. Todos los recursos creados se revocaron una vez al terminar cada recorrido.

La comparación de la etapa contra `HEAD` confirma 11 funciones/bloques y 19 handlers de campo sin cambios, incluido el constructor del payload, consentimiento, `SummaryImage`, indicador y reglas de avance. Los cambios de foco, reset del modo al salir y guard del envío se limitan a la nueva interacción. Para este último ajuste de copy y estilos, se compararon además 16 funciones con el estado de trabajo previo: todas permanecen idénticas, incluidas edición, foco y envío. Tampoco cambian `enviar-fields.tsx`, el CSS de controles, el `.gitignore` específico ni los dos PNG de lectura seleccionados. Backend, parser, validadores, recorte, servicios y contratos permanecen intactos.

Capturas sintéticas para revisión:

- Escritorio EN 1440: [lectura](./ui/assets/form-summary-inline/en-1440-100-present.png) y [edición global con «Save changes» al pie](./ui/assets/form-summary-inline/en-1440-100-present-editing.png).
- Móvil ES 375: [lectura](./ui/assets/form-summary-inline/es-375-100-present.png) y [edición global con «Guardar cambios» al pie](./ui/assets/form-summary-inline/es-375-100-present-editing.png).
- PT 320/200%: [editor completo](./ui/assets/form-summary-inline/pt-320-200-present-editing.png) y [detalle final con «Salvar alterações»](./ui/assets/form-summary-inline/pt-320-200-editing-footer.png).

Selección para el repositorio: **seis PNG y dos JSON** (matriz y regresión). La auditoría previa encontró **cero archivos versionados** en `form-summary-inline/` y `form-summary-edit/`; había 47 PNG y cuatro JSON locales en la primera, y 21 PNG y dos JSON en la propuesta descartada. No se elimina ninguna captura histórica versionada ni se borran los archivos locales. `docs/ui/assets/.gitignore` limita únicamente estas carpetas: permite los seis PNG enlazados, ambos reportes y el README vigente; ignora duplicados, aliases, diagnósticos y la propuesta descartada. El script mantiene todas las comprobaciones y declara la selección en `versionedCaptures`. En este ajuste, `--representative-only` verifica la matriz y los PNG en memoria y escribe solo las cuatro capturas de edición afectadas, registradas en `writtenCaptures`; no reescribe las dos de lectura ni aumenta las seis seleccionadas. El detalle final se extrae sin redimensionar el PNG completo. Véase la [política de evidencias](./ui/assets/form-summary-inline/README.md).

### Archivos de esta etapa

- `components/enviar-form.tsx`: modo visual, controles reutilizados, foco y guard del envío.
- `components/enviar-fields.tsx`, `form-controls.module.css`: archivo controlado y variantes locales.
- Contrato, catálogos y prueba de `lib/form-i18n`; inventario de textos.
- Scripts del resumen y validación; evidencia separada, `docs/ui/assets/.gitignore` y README de la selección vigente.
- Este documento, README de UI y ficha de Field/FileField.

La edición global, la ubicación al pie y el ajuste final de copy fueron aprobados manualmente y commiteados por el desarrollador. La emulación no sustituye dispositivos físicos, zoom nativo, Safari/Firefox ni lectores de pantalla reales.

## Antecedente — ubicación del consentimiento

Leandro y Geraldine recomendaron que el consentimiento deje de ser un paso del formulario. La decisión acordada posteriormente con Geraldine se implementa en la etapa 5: autorización en el hero y quinto paso de revisión y envío. La revisión del equipo en Demo Day sigue pendiente.

También se separa «Guardar cambios» (datos editables) de «Enviar testimonio» (incluye comprobación de aceptación). La integración futura con la web oficial continúa fuera del alcance y pendiente de coordinación con Matías.

## Etapa 5 — autorización simplificada en hero y envío

Estado: implementación para revisión final en localhost, sin commit. Las etapas 1–4 están aprobadas y commiteadas; la etapa 4 corresponde a `1490a3d`. Esta decisión de producto se acordó con Geraldine y se revisará con Geraldine/Leandro y el equipo en Demo Day.

### Comportamiento vigente

- El checkbox vive únicamente en el hero/banner. Empieza desmarcado y habilita o deshabilita su CTA al alternarlo. Su texto completo de autorización conserva literalmente el alcance anterior: galería y Discord, correo privado y revisión previa a publicar.
- `GalleryHero` permanece en servidor. La pequeña isla cliente `HeroConsent` usa estado local y un botón nativo del Design System; al activarlo navega a `/enviar?lang=...`. Tab, Espacio y Enter mantienen semántica y foco visible. El `gap-sm` separa autorización y CTA; no se recupera la ayuda redundante eliminada.
- El checkbox controla **solo esa navegación**. No emite constancias, cookies o tokens, no registra aceptación ni hace peticiones adicionales de registro. La navegación normal de Next utiliza GET.
- `/enviar` acepta enlaces directos, sin comprobar aceptación previa, redirigir, mostrar avisos para volver a autorizar ni añadir otra casilla. Se conservan cinco pasos y el quinto sigue siendo «Revisión y envío» / «Review and submit» / «Revisão e envio».
- ES/EN/PT y la preferencia de idioma existente se mantienen. La cookie preexistente de idioma sigue cumpliendo exclusivamente esa función; no representa consentimiento. El resto del hero conserva su copy institucional anterior en español.

### Información final y edición

El mensaje localizado `form.consent.submission` aparece **solo en el paso 5**, después del resumen y sus tres tarjetas, en el cierre de acciones, inmediatamente antes del envío. Es texto secundario normal, sin checkbox, alerta llamativa ni interacción adicional. El botón «Enviar testimonio» lo referencia mediante `aria-describedby` y conserva separación y contraste.

ES: «Al enviar tu testimonio, autorizas a No Country a publicar tu nombre, fotografías y relato en la galería de testimonios y en Discord. Tu correo electrónico no se publicará. El equipo revisará el contenido antes de publicarlo.»

Los equivalentes EN/PT conservan exactamente esos destinos y usos, sin embeds ni canales adicionales. La suficiencia del mecanismo de autorización informada **mediante el texto y la acción de enviar** permanece pendiente de revisión editorial/legal y de Geraldine/Leandro y el equipo en Demo Day; este documento no equivale a aprobación legal.

El resumen mantiene sus tres tarjetas, fotografías confirmadas y modo global Editar/Guardar cambios. «Guardar cambios» reutiliza `validateForm()` para los datos activos, conserva errores editables del servidor, no construye FormData y no envía. El quinto paso no contiene campos a validar. «Enviar testimonio» continúa validando integralmente categoría, datos, relato, archivos, enlaces y profesionales activos; los datos inactivos se conservan en memoria y no se incluyen en el payload.

### Registro de fecha y límites de evidencia

`submitTestimonial()` llama al parser normal, sin lectura de cookies ni contexto de aceptación. Cuando la petición es válida, `parseTestimonialForm()` genera `consentAt: new Date().toISOString()` **en el servidor al procesar el envío válido**. El store conserva su contrato y persiste ese valor en la columna existente `consent_at`.

No se registra una fecha anterior de checkbox ni se aceptan fechas enviadas por el cliente. Una petición inválida no se guarda ni produce una fila con fecha. `consent_at` identifica el momento del envío/autorización informado en esta versión; **no prueba que la persona pasó por el hero, marcó el checkbox, leyó el aviso o pulsó físicamente el botón**. El endpoint puede ser invocado directamente; no se agrega evidencia explícita separada, identidad ni firma. Esta limitación es parte de la decisión provisional y debe revisarse con el equipo.

No se requiere migración: Supabase, Storage, esquema, consultas públicas, rollback y notificaciones permanecen intactos. El campo técnico `consentAt` y la columna `consent_at` mantienen sus nombres por compatibilidad; no implican validación de una aceptación previa.

### Infraestructura retirada e historial

La propuesta anterior de esta etapa, nunca commiteada, exigía una constancia firmada emitida por el hero y rechazaba accesos/envíos sin ella. Se descartó por la decisión de producto actual. Se retiraron el codec de firma, el adaptador de cookies, la acción de emisión, sus pruebas/fixture, la variable de configuración asociada, las props de aceptación y los avisos/bloqueos del formulario. No hay configuración nueva de secretos para este flujo. No se inspeccionan ni modifican archivos `.env*`.

Se retiró también la validación de checkbox como campo del testimonio y las traducciones sin consumidores: título independiente de consentimiento, estados de registro, avisos de acceso y error de aceptación obligatoria. El namespace vigente contiene `body`, `action` y `submission`; los catálogos completos tienen **172 claves**. El inventario tipado y sus pruebas reflejan la estructura actual. Las secciones de etapas 1–4 y sus evidencias describen el historial, no el flujo de consentimiento actual.

### Invitación y futura integración

La pantalla de éxito y su portapapeles invitan al hero de esta aplicación mediante `/?lang=es|en|pt#hero-consent`, usando el idioma actual incluso si cambia después del envío. `/enviar` continúa siendo válido para acceso directo. No hay redirecciones forzadas.

La integración futura del hero con `nocountry.tech` se coordinará con **Matías**, aunque el flujo nuevo no necesita transmitir el estado del checkbox. No se implementa integración entre dominios o despliegues en esta etapa.

### Archivos y QA

Implementación: `components/hero-consent.tsx`, `gallery-hero.tsx`, páginas públicas y de envío, `enviar-experience.tsx`, `enviar-form.tsx`, `lib/testimonials/parse.ts`, `form-validation.ts` y `lib/form-i18n/locales.ts`, contrato y tres catálogos. La acción vuelve a su flujo normal sin dependencia de cookies. Store, controles de imágenes y su CSS permanecen sin cambios.

Después del build, ejecutar desde `apps/testimonios`, de forma secuencial para los scripts de navegador:

```sh
node scripts/test-form-i18n.mjs
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint . --max-warnings 0
pnpm run build
node scripts/qa-hero-consent.mjs
node scripts/qa-form-submit-validation.mjs --hero-consent
node scripts/qa-form-summary.mjs --edit-summary --hero-consent
git diff --check
```

El nombre de la opción `--hero-consent` se conserva como selector de carpeta de evidencia; no habilita autenticación ni cookies. Todos los scripts bloquean o interceptan los POST de testimonios y bloquean servicios externos. Los datos, fotografías y respuestas son sintéticos. El QA del hero también bloquea cualquier POST inesperado; ya no ejecuta acciones reales de aceptación.

Se conservan **cuatro PNG y tres reportes JSON** seleccionados en [evidencias de la etapa](./ui/assets/hero-consent/README.md). La cuarta captura documenta ahora el texto final y CTA, sustituyendo al aviso retirado. La imagen local de ese aviso queda ignorada y sin enlaces. Las seis capturas versionadas de etapa 4 se mantienen intactas. El resumen conserva la matriz y sus comprobaciones de PNG en memoria sin escribir nuevas imágenes. Las reglas específicas de `.gitignore` mantienen la selección acotada.

Resultados finales de esta simplificación: **91/91 pruebas unitarias en 14 suites, PASS**. TypeScript (`--noEmit --incremental false`), ESLint sin advertencias (`--max-warnings 0`), build de producción y `git diff --check`: **PASS**. Se retiraron las pruebas de firma obsoletas; las suites actuales conservan las reglas de datos y comprueban fecha del servidor, acceso sin infraestructura de cookies, fechas de cliente ignoradas y ausencia de persistencia ante datos inválidos.

- Hero y acceso directo: **9/9 recorridos**, **24 combinaciones responsive del hero y 24 del texto final**, con 320/375/768/1440 px y fuente al 100/200% en ES/EN/PT. Casilla, CTA, teclado, foco, toque, ausencia de cookies/POST de registro, acceso directo sin avisos, texto solo en revisión, edición y validación integral: PASS.
- Validación y envío: **9/9 recorridos**, **36 POST interceptados**. Categorías, campos activos/inactivos, errores sucesivos del servidor, foco, pending, conservación de valores y destino localizado de invitación al hero: PASS.
- Resumen e imágenes: **9/9 recorridos**, **288 combinaciones responsive**, 36 distribuciones con errores y 42 capturas/detalles comprobados en memoria; **27 POST interceptados y cero PNG escritos**. Identidad de archivos/payload, proporciones, cancelación, reemplazo, navegación, modo edición y limpieza de URLs: PASS.
- En los tres reportes: **cero envíos reales de testimonios, cero solicitudes externas y cero excepciones de navegador**. Servidores, navegadores y perfiles propios cerrados y limpiados. Las 145 evidencias históricas bajo seguimiento no quedan afectadas por las reglas de exclusión. No se modifican panel, `packages/ui`, store, consultas públicas ni controles/CSS de imágenes.

Resumen de `git status --short` al cierre: **27 archivos modificados y tres entradas sin seguimiento** (`components/hero-consent.tsx`, `scripts/qa-hero-consent.mjs`, `docs/ui/assets/hero-consent/`). Nada en staging. Los cinco módulos/fixtures retirados de la propuesta nunca estuvieron bajo seguimiento, por lo que no aparecen como eliminaciones en Git; las páginas y acción restauradas al flujo previo tampoco producen diferencias netas contra `HEAD`.

Los scripts históricos de i18n, steps, contraste y UX se adaptan al flujo actual sin reescribir sus reportes antiguos ni afirmar que se repitieron todos esos recorridos. Fuente raíz al 200% no sustituye zoom nativo ni certifica accesibilidad general. Dispositivos físicos, lectores de pantalla, Safari/Firefox y revisión editorial/legal siguen pendientes.

Sin commit, push, merge ni PR. Detenido al completar la etapa para revisión manual y preparación del commit.
