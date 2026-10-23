# SiteHeader

Navbar institucional de No Country: logo, navegación desktop por disclosures y diálogo móvil. Replica la referencia visual sin modificar los componentes compartidos.

**Archivo:** `components/site-header.tsx`

Se monta una sola vez en `app/layout.tsx`. No instanciarlo en páginas.

## Import

```tsx
import { SiteHeader } from "@/components/site-header";
```

## Cuándo usarlo

- Solo en el root layout. Cualquier página nueva hereda el header.

No copiar el markup del header en una página. El logo utiliza el PNG local con un enlace HTML al inicio oficial; `BrandLogo` compartido conserva su navegación a `/` y no se modifica.

## Props

Ninguna. Los textos, grupos y destinos salen del catálogo tipado de `lib/nav.ts`.

## Uso

```tsx
// app/layout.tsx
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
- El scroll sigue perteneciendo al documento. Un `ResizeObserver` publica la altura real en `--site-header-height`; `scroll-padding-block-start` deja esa altura más 16px para navegación y foco. `focusAndReveal()` del formulario sigue midiendo directamente el header.
- Desde 1280px se evalúa desktop, midiendo logo, navegación, acciones y gaps. Si no caben, se mantiene la versión compacta. Se reevalúa al redimensionar, ampliar la fuente o terminar la carga de tipografía. No se reduce la fuente ni se recortan enlaces para forzar la fila.
- El bloque desktop oculto conserva sus dimensiones para medirlas, pero está recortado, inerte y fuera del árbol accesible. No genera overflow ni enlaces de teclado duplicados.
- Los destinos institucionales usan `<a>` en la misma pestaña. Los portales de Talento y Empresas conservan sus dominios originales y abren otra pestaña con `noopener noreferrer`, icono externo decorativo y aviso accesible. No se intercepta la navegación nativa. Los enlaces locales de las páginas continúan usando `next/link`. No hay `href="#"` ni rutas inventadas.

## Teclado y desplegables

- Disclosure Navigation con botones y listas, sin roles `menu`/`menuitem` ni navegación artificial por flechas.
- Clic, Enter y Espacio alternan el grupo; Tab y Shift+Tab recorren botones y enlaces. Cada botón tiene `aria-expanded` y un `aria-controls` válido.
- En desktop solo se abre un grupo. Escape lo cierra y devuelve el foco al disparador; clic exterior o salida del foco lo cierran sin moverlo innecesariamente.
- Los paneles cerrados están inertes y con `aria-hidden`, incluso durante la transición de salida. El popup de sesión se alinea al borde derecho. Los enlaces tienen al menos 44px de altura y foco visible.
- Los disparadores usan texto rosa en hover y mientras `aria-expanded` sea verdadero, sin fondo añadido. Los enlaces directos usan texto rosa y fondo `#1d283a` en hover. El foco conserva un outline cyan independiente; las opciones enfocadas o en hover tienen texto blanco y fondo blanco al 5%.
- A fuente raíz normal, el panel conserva 16px de separación visual desde el texto: `margin-top: 4px` compensa el área táctil de 44px del botón frente a su línea de 20px. No cambiarlo a 16px sin revisar esa geometría. Padding de panel 6px, opciones 8px/12px, tipografía 14px/500, radios 8px/6px y sombra equivalente a la referencia.

## Navegación móvil

- El botón “Abrir navegación” abre un `<dialog>` mediante `showModal()`. Tiene nombre accesible, logo y botón “Cerrar navegación” dentro del propio modal; el cierre recibe el foco inicial.
- Escape o Cerrar cierran el diálogo y devuelven el foco al disparador sin desplazar la página. Una guarda local envuelve Tab/Shift+Tab en los extremos; la modalidad nativa mantiene inerte el contenido exterior.
- Los tres grupos pueden permanecer abiertos. El toolbar no se comprime y la navegación tiene un único scroll interno, limitado a `100dvh` y con padding para el área segura. Las etiquetas pueden envolver al ampliar el texto.
- Solo en el menú compacto, el SVG decorativo de “Simulación en curso” se ordena después del texto mediante CSS. El texto queda alineado con los demás enlaces; desktop conserva el SVG a la izquierda. El nombre accesible y la animación no cambian.
- La regla global `html:has(dialog:modal)` de la etapa de scroll bloquea el documento sin cambiar su ancho. El menú no agrega otro mecanismo de bloqueo.
- Cambiar a desktop cierra el modal, retira el bloqueo y dirige el foco a un control visible si corresponde. Cambiar a compacto con foco en desktop lo devuelve a la hamburguesa. No remonta el formulario ni modifica su estado.
- `prefers-reduced-motion` elimina transiciones y detiene el trazo decorativo de “Simulación en curso”. Sus IDs SVG provienen de `useId`; no anuncia un estado dinámico ni consulta servicios.

Ver la [propuesta y evidencia de QA](../official-chrome-improvements.md). Quedan pendientes la revisión visual humana, zoom real y comprobaciones con lectores de pantalla y navegadores distintos de Chrome.
