# SiteFooter

Footer institucional de No Country para las rutas públicas de Testimonios y sus estados de error y éxito.

```tsx
import { SiteFooter } from "@/components/site-footer";

// app/layout.tsx, después del contenido de la ruta
<SiteHeader />
{children}
<SiteFooter />
```

## Responsabilidad y API

Server Component sin props, estado, eventos ni consultas. `next/image` reutiliza el PNG oficial de `public/brand/`; no utiliza `BrandLogo`, cuyo destino local no corresponde al inicio institucional. Los estilos propios se aíslan en `site-footer.module.css`, sin modificar tokens globales ni componentes compartidos.

El layout mantiene una columna flexible con altura mínima del viewport. Cada página conserva su único `<main>` con `flex-1`; el footer permanece después del contenido, con scroll del documento. No es fijo ni crea un área de scroll propia.

## Composición visual y responsive

- Fondo `#090a15`, borde superior sutil, padding superior de `4rem` e inferior de `3rem`.
- Contenedor centrado de hasta `80rem`, padding horizontal de `1rem` y `2rem` desde 768px.
- Logo de 40px de alto, proporción explícita `1229/207`, enlace con área de al menos 44px de alto y descripción institucional original.
- Una columna en móvil; dos desde 768px. Desde 1024px, cinco tracks a fuente raíz normal, con la marca ocupando dos. `auto-fit` y un mínimo relativo al texto permiten reducir las columnas cuando la fuente aumenta. Los tracks vacíos colapsan.
- Colores y trazados sociales equivalentes a la referencia, con controles de 44×44px y wrapping. Los enlaces de texto conservan su espaciado original.
- Parte inferior apilada en móvil; fila con wrapping desde 768px. Los textos legales también pueden pasar a otra fila.
- Luces rosa/cyan y figuras delineadas en una capa decorativa independiente. Solo esa capa recorta su contenido; no recorta enlaces ni outlines.

Las alturas crecen con el texto. No se debe introducir una altura fija para igualar las capturas.

## Destinos

`lib/nav.ts` centraliza las URLs, los grupos y sus etiquetas. Se reutilizan los destinos del header; las etiquetas específicas “Historias de éxito” y “Hackathon” apuntan a `successStories` y `productValidation`.

| Grupo | Destinos confirmados |
| --- | --- |
| Marca | Inicio absoluto de No Country |
| Para talento | `/casos-de-exito`, `/#faq`, ambos sobre el dominio oficial |
| Para empresas | `/para-empresas/contratar`, sobre el dominio oficial |
| Ecosistema | `/showcase`, `/para-empresas/validacion-de-producto` y WhatsApp de contacto |
| Redes | Comunidad de WhatsApp, LinkedIn e Instagram oficiales |

Los enlaces institucionales usan HTML `<a>` y URLs absolutas. Redes sociales y Contacto abren otra pestaña con `noopener noreferrer` e indicación accesible. WhatsApp social y WhatsApp de contacto son destinos diferentes.

**Pendientes:** Simulaciones abiertas, Modelo de validación, Términos de servicio y Políticas de privacidad. Se mantienen como texto sin `href`, rol de enlace, foco ni hover interactivo. No se inventan destinos ni se enlaza a `#`. Al aprobar una URL, actualizar el catálogo y la composición correspondiente.

## Accesibilidad

- Landmark `<footer>` y tres `<nav>` identificados mediante sus encabezados `h2` y `aria-labelledby`.
- Iconos con `aria-hidden`; el nombre de cada red proviene de su enlace. Las decoraciones no reciben eventos ni aparecen en el árbol accesible.
- Foco cyan de 2px con offset de 4px, fuera de la capa decorativa recortada.
- Texto secundario y copyright `#a1a1aa`. Sobre el fondo base supera 4,5:1; incluso componiendo ambas luces al máximo y dos trazos decorativos blancos al 5%, el cálculo conservador da 4,85:1. En los fondos capturados a 375 y 1440px, el límite inferior medido supera 6:1.
- `prefers-reduced-motion` elimina transiciones y el escalado del logo al hacer hover.
- Sin roles `menu`, controles deshabilitados ficticios ni anuncios dinámicos añadidos.

## QA y límites

Ver [evidencias y propuesta para el sitio oficial](../official-chrome-improvements.md#footer-institucional--etapa-3).

Chrome headless sobre el build final de producción: matriz de siete anchos (320, 375, 768, 1024, 1280, 1440 y 1920px) y cuatro fuentes raíz simuladas (16, 20, 24 y 32px), teclado, foco, pantalla baja, orientación horizontal y movimiento reducido. Se comprobó la integración con galería, formulario, ficha publicada, fotografía ampliable, recorte y ruta inexistente, sin enviar formularios. Los diez enlaces se recorrieron en ambos sentidos con foco visible, sin recorte bajo el header.

Éxito y error de `PageShell` se verificaron con renderizados aislados de sus componentes reales para comprobar la composición y posición del footer; no se invocó la acción de envío ni se provocó un fallo del backend. Esta comprobación no equivale a ejecutar el flujo de envío completo.

La etapa 4 revalidó contraste sobre fondos PNG con decoraciones: límite inferior de 6,04:1 a 1440px/fuente 16px y 6,15:1 a 320px/fuente 32px para los textos secundarios. El manifiesto del build no incluye `SiteFooter` como límite cliente; los helpers del framework y de `next/image` pueden seguir utilizando JavaScript propio.

Pendientes de revisión humana: fidelidad visual final, zoom real del navegador, preferencias de fuente, lectores de pantalla, Safari/iOS y Firefox. Los cambios mediante `style.fontSize` simulan texto ampliado; no certifican esas modalidades reales.
