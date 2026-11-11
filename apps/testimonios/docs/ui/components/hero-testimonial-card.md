# HeroTestimonialCard

Vista del arte administrativo publicado en el carrusel de `/enviar`. Sustituye la antigua réplica HTML de Cita; no dibuja plantillas, genera derivados, consulta Storage ni importa dependencias del panel.

**Archivos:** `components/hero-testimonial-card.tsx` y `hero-testimonial-card.module.css`.

```tsx
<HeroTestimonialCard story={story} locale={locale} requested={requested} />
```

`story` contiene `type`, `quote`, `story` completo, `fullName`, `country`, `imageUrl`, `role`, `company` y `previousRole`. `imageUrl` es una URL candidata de `share-cards/{slug}/instagram.png` o `null`; su presencia no certifica que exista el archivo. El mapper pertenece a `gallery-hero-data.ts`, protegido con `server-only`.

`requested` permite montar el único `next/image` cuando la tarjeta se activa por primera vez. Luego permanece montado hasta desmontar el carrusel. El padre usa la URL como clave para reiniciar el estado de carga si cambia. La prioridad es alta y la carga eager para cada imagen solicitada; las tarjetas nunca visitadas no tienen imagen ni `srcset`. No se precargan las tres publicaciones.

El contenedor reserva 4:5, con máximo de 340px de ancho fijado por el carrusel. El `Image` declara 1080×1350 y usa `object-fit: contain`: conserva todo el diseño sin distorsionar ni recortar texto, incluso si un archivo remoto tiene otra proporción. `sizes="(max-width: 387px) calc(100vw - 48px), 340px"` corresponde al ancho móvil menos los gutters de 24px y al máximo de escritorio. Next selecciona la resolución del `srcset` según viewport y DPR; no se usa `unoptimized` ni se asigna el PNG original como fallback del navegador.

Mientras carga, el mismo espacio presenta un mensaje localizado. Si falta URL o se dispara `onError`, muestra el estado no disponible y elimina la imagen rota. No hace HEAD, reintentos ni registros de errores arbitrarios. Volver a visitar una tarjeta fallida durante el mismo montaje conserva el fallback; recargar o volver desde el formulario inicia otro montaje.

El arte es decorativo para tecnologías de asistencia (`alt=""`, wrapper `aria-hidden`). El [carrusel](./gallery-hero-carousel.md) aporta una sola alternativa semántica de la historia activa: autor y categoría visibles más lectura textual expandible con relato y contexto público. Es necesaria también para lectura visual en móvil y texto ampliado; el raster por sí solo no refluye.

Origen, optimización comprobada, caché mutable, límites y QA: [feature de imágenes optimizadas](../../carousel-optimized-images.md). La [comparación histórica de la réplica con Canvas](../capture-landing-qa.md) conserva el diseño anterior y sus evidencias; no describe la implementación actual.
