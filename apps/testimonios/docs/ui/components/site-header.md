# SiteHeader

Navbar institucional de No Country: logo, navegación desktop por disclosures y diálogo móvil. Replica la referencia visual sin modificar los componentes compartidos.

**Archivo:** `components/site-header.tsx`

Se monta una sola vez en `app/(public)/layout.tsx`. El 404 raíz reutiliza ese layout para URLs no resueltas. No instanciarlo en páginas ni en `/enviar`.

## Import

```tsx
import { SiteHeader } from "@/components/site-header";
```

## Cuándo usarlo

- Solo en el layout público; sus páginas heredan el header. `/enviar` utiliza `FormHeader`.

No copiar el markup del header en una página. El logo utiliza el PNG local con un enlace HTML al inicio oficial; `BrandLogo` compartido conserva su navegación a `/` y no se modifica.

## Props

Ninguna. Los textos, grupos y destinos salen del catálogo tipado de `lib/nav.ts`.

## Uso

```tsx
// app/(public)/layout.tsx
<SiteHeader />
{children}
```

## Composición

```
SiteHeader (Server Component, sticky)
└── SiteNavigation (límite cliente privado del header)
    ├── logo de servidor
    ├── navegación institucional + Simulación en curso + acceso a portales
    └── diálogo nativo móvil con logo, cierre y navegación vertical
```

## Cómo cambiar copy o rutas

Editar `lib/nav.ts`, sin duplicar destinos en los renderizados desktop y móvil:

| Export | Qué controla |
| --- | --- |
| `institutionalDestinations` | URLs absolutas y rótulos verificados |
| `navigationGroups` | Simulación Laboral, Para Empresas e Iniciar sesión |
| `institutionalNavigation` | Orden de grupos y enlaces principales |
| `publicNav` | Catálogo local conservado de Galería y Enviar; el navbar institucional no lo presenta |

## Notas

- `SiteHeader` y el layout permanecen en servidor. Solo `SiteNavigation` incorpora estado y eventos. El logo se recibe como contenido de servidor.
- `site-header.module.css` aísla los neutros y dimensiones de la referencia: fila mínima de 64px, borde de 1px, fondo translúcido y blur de 12px. No remapea tokens globales. El logo mide 24px de alto y 32px desde 1024px; conserva su proporción.
- El scroll sigue perteneciendo al documento. Un `ResizeObserver` publica la altura real en `--site-header-height`; `scroll-padding-block-start` deja esa altura más 16px para navegación y foco. En `/enviar`, `FormHeader` publica su propia altura y `focusAndReveal()` mide `[data-form-header]`.
- Desde 1280px se evalúa desktop, midiendo logo, navegación, acciones y gaps. Si no caben, se mantiene la versión compacta. Se reevalúa al redimensionar, ampliar la fuente o terminar la carga de tipografía. No se reduce la fuente ni se recortan enlaces para forzar la fila.
- El bloque desktop oculto conserva sus dimensiones para medirlas, pero está recortado, inerte y fuera del árbol accesible. No genera overflow ni enlaces de teclado duplicados.
- Los destinos institucionales usan `<a>` en la misma pestaña. Los portales de Talento y Empresas conservan sus dominios originales y abren otra pestaña con `noopener noreferrer`, icono externo decorativo y aviso accesible. No se intercepta la navegación nativa. Los enlaces locales de las páginas continúan usando `next/link`. No hay `href="#"` ni rutas inventadas.

## Teclado y desplegables

- Disclosure Navigation con botones y listas, sin roles `menu`/`menuitem` ni navegación artificial por flechas.
- Clic, Enter y Espacio alternan el grupo; Tab y Shift+Tab recorren botones y enlaces. Cada botón tiene `aria-expanded` y un `aria-controls` válido.
- En desktop solo se abre un grupo. Escape lo cierra y devuelve el foco al disparador; clic exterior o salida del foco lo cierran sin moverlo innecesariamente.
- Los paneles cerrados están inertes y con `aria-hidden`, incluso durante la transición de salida. El popup de sesión se alinea al borde derecho. Los enlaces tienen al menos 44px de altura y foco visible.
- En desktop, los disparadores usan texto rosa en hover y mientras `aria-expanded` sea verdadero, sin fondo añadido. Los enlaces directos y “Simulación en curso” usan texto rosa sin fondo en hover, por decisión visual posterior a la réplica oficial. El foco conserva un outline cyan independiente; las opciones de los dropdowns enfocadas o en hover mantienen texto blanco y fondo blanco al 5%.
- A fuente raíz normal, el panel conserva 16px de separación visual desde el texto: `margin-top: 4px` compensa el área táctil de 44px del botón frente a su línea de 20px. No cambiarlo a 16px sin revisar esa geometría. Padding de panel 6px, opciones 8px/12px, tipografía 14px/500, radios 8px/6px y sombra equivalente a la referencia.

## Navegación móvil

- El botón “Abrir navegación” abre un `<dialog>` mediante `showModal()`. Tiene nombre accesible, logo y botón “Cerrar navegación” dentro del propio modal; el cierre recibe el foco inicial.
- Escape, Cerrar o una pulsación sobre el backdrop visible cierran el diálogo y devuelven el foco al disparador sin desplazar la página. Una guarda local envuelve Tab/Shift+Tab en los extremos; la modalidad nativa mantiene inerte el contenido exterior.
- `closedby="any"` proporciona el cierre exterior nativo. Donde no existe `HTMLDialogElement.prototype.closedBy`, un fallback comprueba que la pulsación empiece y termine fuera del rectángulo del diálogo y que no se haya desplazado más de 8px. Pulsar el padding del panel o arrastrar desde dentro no cierra. No se activa el contenido de fondo. Si el panel ocupa toda la pantalla, se usan X o Escape porque no hay backdrop visible.
- Los enlaces principales y disparadores comparten tipografía `0.875rem`, peso 500, interlínea `1.25rem`, padding `8px 0` y altura mínima de 44px. Las opciones conservan el sangrado de 16px y la línea lateral. En compacto no hay fondos de hover; solo cambia el texto a rosa en dispositivos con hover y puntero fino. El outline cyan de teclado y el rosa de los grupos abiertos no dependen del hover.
- La toolbar mide 65px incluyendo su borde de 1px, equivalente al header normal (fila de 64px y borde exterior de 1px). Logo y botones mantienen las mismas coordenadas al abrir y cerrar; no se compensan con traslaciones.
- El fade de entrada/salida y del backdrop dura 190ms, sin transformar la geometría ni animar alturas. Usa `@starting-style` y transiciones discretas de `display`/`overlay` mediante `@supports`; los navegadores sin esas capacidades mantienen el comportamiento inmediato nativo. Los grupos se restablecen al volver a abrir, conservando su altura durante la salida. No hay temporizadores de cierre en JavaScript.
- `flex-direction: column` pertenece al estilo base del diálogo: al retirar `[open]`, la transición discreta conserva `display:flex` durante la salida y necesita la misma dirección. Condicionarla a `[open]` vuelve temporalmente a `row` y desacomoda la toolbar y los enlaces. El atributo nativo sigue controlando apertura/cierre; React refleja el estado en ARIA sin controlar la prop `open` ni añadir otra ruta de cierre.
- Los tres grupos pueden permanecer abiertos. El toolbar no se comprime y la navegación tiene un único scroll interno, limitado a `100dvh` y con padding para el área segura. Las etiquetas pueden envolver al ampliar el texto.
- Solo en el menú compacto, el SVG decorativo de “Simulación en curso” se ordena después del texto mediante CSS. El texto queda alineado con los demás enlaces; desktop conserva el SVG a la izquierda. El nombre accesible y la animación no cambian.
- La regla global `html:has(dialog:modal)` de la etapa de scroll bloquea el documento sin cambiar su ancho. El menú no agrega otro mecanismo de bloqueo.
- Cambiar a desktop cierra el modal, retira el bloqueo y dirige el foco a un control visible si corresponde. Cambiar a compacto con foco en desktop lo devuelve a la hamburguesa. No remonta el formulario ni modifica su estado.
- `prefers-reduced-motion` elimina también las transiciones del diálogo y su backdrop, y detiene el trazo decorativo de “Simulación en curso”. Sus IDs SVG provienen de `useId`; no anuncia un estado dinámico ni consulta servicios.

Ver la [propuesta y evidencia de QA](../official-chrome-improvements.md). Quedan pendientes la revisión visual humana, zoom real y comprobaciones con lectores de pantalla y navegadores distintos de Chrome.

## QA integral — etapa 4

El build final se comprobó en Chrome con siete anchos de 320 a 1920px y fuentes raíz simuladas de 16, 20, 24 y 32px. Los tres dropdowns se probaron en desktop y los tres grupos en compacto, incluyendo pantallas bajas, recorrido completo de teclado, cambios de breakpoint con modal abierto y foco en desktop al pasar a compacto. No se detectaron desbordamientos, bloqueos residuales ni foco oculto.

Se verificó que abrir/cerrar la navegación conserva los nodos del formulario y del footer; esto no sustituye un perfilado de renderizado. El intento de Ctrl++ mediante CDP no modificó DPR, viewport ni escala y no se presenta como zoom real. Resultados, límites y observaciones del servidor en el [informe final](../official-chrome-improvements.md#qa-integral--etapa-4).

## Ajuste posterior a revisión humana — menú compacto

En Chrome headless 156 se repitió la matriz de 28 combinaciones, con los tres grupos abiertos y medición de geometría. A 375×568px, el logo del modal pasó de y=19,5 a y=20px y el cierre de y=9,5 a y=10px, iguales al header normal. A 1280px también desapareció la diferencia vertical de 0,5px; el ancho reservado por la scrollbar no causaba desplazamiento horizontal.

Se comprobaron fade en ambos sentidos, conservación de altura al cerrar con grupos expandidos, clic exterior sin click-through, toque emulado y fallback con detección de soporte desactivada. El recorrido completo de teclado se repitió a 320×320px/fuente 32px. No equivale a ejecutar Safari, lectores de pantalla ni zoom real. Las [capturas antes/después y límites](../official-chrome-improvements.md#qa-c01-ajustes-del-menú-compacto-tras-revisión-humana) distinguen estas correcciones locales de las propuestas para la web oficial.

La revisión humana posterior detectó que esas pruebas no cubrían las posiciones de los hijos en cada fotograma de salida. La corrección [QA-C02](../official-chrome-improvements.md#qa-c02-layout-durante-el-cierre-y-hover-desktop) mantiene la dirección de columna fuera de `[open]`. A 375×568px el logo permanece en `(16;20)` y la navegación en `(0;65)`, con panel de 365×477px hasta ocultarse, sin reapertura ni cierre duplicado. Se retiró además el fondo de hover de los enlaces principales desktop, conservando el foco cyan.
