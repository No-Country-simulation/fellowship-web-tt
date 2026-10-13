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

`/enviar` guarda `quote`, `ig_caption` y `li_caption`. El equipo los retoca a mano en el panel (`/testimonials/[id]`) antes de guardar o publicar. Discord comunidad, Instagram y LinkedIn salen de ahí.
