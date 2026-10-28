# Copy pipeline (quote y captions)

El formulario arma el quote y los captions al enviar. No hay generación con IA.

## Plantilla del formulario

```text
story
  → excerptQuote (quote, 200–240 caracteres)
  → buildIgCaption / buildLiCaption
       intro fijo + quote entre comillas + nombre + red + #NoCountry #DemoDay #TalentoIT
```

El intro fijo es:

`Desde No Country compartimos esta historia de nuestro talento`

`/enviar` guarda `quote`, `ig_caption` y `li_caption` con esa plantilla vieja: intro genérica, cita entre comillas, nombre, la red de esa plantilla y `#NoCountry #DemoDay #TalentoIT`. No escribe `discord_caption`. El video del envío es solo un link de YouTube y no entra en el caption.

`buildIgCaption` y `buildLiCaption` viven en `lib/testimonials/quote.ts`. No reciben el tipo (simulación, primer empleo o reconversión) y no arman el texto de Discord. Instagram usa el `@usuario` guardado. LinkedIn deja la URL guardada (`https://www.linkedin.com/in/{usuario}`).

## Dónde se edita

El panel (`apps/panel-admin`, `/testimonials/[id]`) es el que separa los textos. En revisión, si el texto está vacío, es copia de la otra red o sigue la plantilla vieja, cada tab (Instagram, LinkedIn, Discord) arranca con la plantilla de esa red: intro según red y tipo (simulación, primer empleo o reconversión), nombre, mención de esa red si existe, y hashtags solo en Instagram y LinkedIn. Discord no lleva mención ni hashtags y se guarda en `discord_caption`.

Instagram usa el valor guardado (`@usuario`). LinkedIn escribe `@usuario` a partir de `linkedin.com/in/{usuario}` o de un handle suelto.

La cita queda en la imagen y no se repite en el texto del post. Cambiar la cita no rearma la descripción. Un texto ya editado a mano, que no sigue la plantilla, se deja.

Si hay video, la plantilla de LinkedIn y Discord del panel trae `Video testimonial: watch?v=…` al final. La casilla lo agrega o lo saca entero: el link no se edita. Al publicar se manda ese texto. Instagram no lo lleva.

Esas plantillas no se arman en esta app. `discord_caption` no entra en `testimonials_public`.
