# HeroTestimonialCard

Vista del arte administrativo publicado en el carrusel de `/enviar`. Sustituye la antigua réplica HTML de Cita; no dibuja plantillas, genera derivados, consulta Storage ni importa dependencias del panel.

**Archivos:** `components/hero-testimonial-card.tsx` y `hero-testimonial-card.module.css`.

```tsx
<HeroTestimonialCard story={story} locale={locale} requested={requested} />
```

`story` contiene `type`, `quote`, `story` completo, `fullName`, `country`, `imageUrl`, `role`, `company` y `previousRole`. `imageUrl` es una URL candidata de `share-cards/{slug}/instagram.png` o `null`; su presencia no certifica que exista el archivo. El mapper pertenece a `gallery-hero-data.ts`, protegido con `server-only`.

`requested` permite montar el único `next/image` cuando la tarjeta se activa por primera vez. Luego permanece montado hasta desmontar el carrusel. El padre usa la URL como clave para reiniciar el estado de carga si cambia. La prioridad es alta y la carga eager para cada imagen solicitada; las tarjetas nunca visitadas no tienen imagen ni `srcset`. No se precargan las tres publicaciones.

El contenedor reserva 4:5, con máximo de 340px de ancho fijado por el carrusel. El `Image` declara 1080×1350, `quality={85}` y usa `object-fit: contain`: conserva todo el diseño sin distorsionar ni recortar texto, incluso si un archivo remoto tiene otra proporción. `sizes="(max-width: 387px) calc(100vw - 48px), 340px"` corresponde al ancho móvil menos los gutters de 24px y al máximo de escritorio. Next selecciona la resolución del `srcset` según viewport y DPR; no se usa `unoptimized` ni se asigna el PNG original como fallback del navegador. `images.qualities=[75,85]` conserva el predeterminado 75 para los otros recursos. Comparación visual 75/85/90 y DPR: [nitidez](../../carousel-legibility.md).

Mientras carga, el mismo espacio presenta un mensaje localizado. Si falta URL o se dispara `onError`, muestra el estado no disponible **junto con la historia completa dentro del marco** y elimina la imagen rota. No hace HEAD, reintentos ni registros de errores arbitrarios. Volver a visitar una tarjeta fallida durante el mismo montaje conserva el fallback; recargar o volver desde el formulario inicia otro montaje.

`.placeholder[hidden]` establece explícitamente `display: none`, sin depender de Preflight. Ocultar el mensaje no cambia el área 4:5 ni controla la opacidad de la imagen. El [streaming del hero](../../carousel-first-visit.md) incorpora el HTML de la tarjeta cuando se confirma su fuente; la carga/pintura no espera al estado React `onLoad`. El reemplazo del fallback de streaming requiere JavaScript.

El `img` es decorativo para tecnologías de asistencia (`alt=""`, `aria-hidden`); el wrapper también contiene una región semántica y no se oculta. Esa única región presenta nombre, categoría/país, relato completo (cita solo si falta relato) y contexto público activo. La tarjeta inactiva queda excluida por `inert`/`aria-hidden` del carrusel; no hay una segunda transcripción inferior.

`.textAlternative` está recortada visualmente en el estado normal. Se revela como texto con scroll dentro del marco si falta/falla el arte, recibe `:focus-visible` o el contenedor tiene hasta 11em de ancho. El contenedor usa `container-type: inline-size`; la condición se cumple en la matriz al 200% de fuente raíz. Tab permite enfocar la región y leerla/recorrerla con teclado sin otro botón o enlace. El foco visible cyan permanece dentro de la tarjeta y Tab continúa a los controles existentes.

Esto no garantiza lectura del raster con cualquier zoom/ajuste del SO. El texto integrado no refluye; el umbral y el foco son alternativas sencillas sin otro control visible, no una certificación de accesibilidad visual. Zoom nativo, dispositivos físicos, descubrimiento del scroll y lectores reales quedan pendientes de revisión manual. Los textos completos no se clampa; se desplazan dentro de 4:5 para conservar la pila y las animaciones.

Origen, optimización comprobada, caché mutable, límites y QA: [feature de imágenes optimizadas](../../carousel-optimized-images.md). La [comparación histórica de la réplica con Canvas](../capture-landing-qa.md) conserva el diseño anterior y sus evidencias; no describe la implementación actual.
