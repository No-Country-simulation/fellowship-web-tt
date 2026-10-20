# Copy pipeline (quote y captions)

El formulario arma el quote y los captions al enviar. No hay generación con IA.

## Plantilla

```text
story
  → excerptQuote (quote, 200–240 caracteres)
  → buildIgCaption / buildLiCaption
       intro fijo + quote entre comillas + nombre + red + #NoCountry #DemoDay #TalentoIT
```

El intro fijo es:

`Desde No Country compartimos esta historia de nuestro talento`

Quote, nombre, handle y hashtags los arma `lib/testimonials/quote.ts`. El video del envío es solo un link de YouTube y no entra en el caption.

## Dónde se edita

`/enviar` guarda `quote`, `ig_caption` y `li_caption`. En el panel (`/testimonials/[id]`) el equipo retoca la frase de la card (`quote`) y un solo **Texto del post**, que parte de `ig_caption`. Si sigue la plantilla, el panel lo rearma con el Instagram y el LinkedIn de la persona (los que haya). Al guardar o publicar se escribe en `ig_caption` y se copia a `li_caption`. Discord comunidad, Instagram y LinkedIn reciben ese mismo texto.
