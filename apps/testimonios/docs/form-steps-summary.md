# Navegación y resumen del formulario — etapas 1 y 2

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

## Trabajo futuro — ubicación del consentimiento

Leandro y Geraldine recomendaron que el consentimiento deje de ser un paso del formulario. Todavía deben definirse su ubicación y el ajuste correspondiente al flujo; esta recomendación no se implementa en esta etapa.

Cualquier rediseño debe conservar la obligatoriedad, las validaciones y el registro de consentimiento existentes.
