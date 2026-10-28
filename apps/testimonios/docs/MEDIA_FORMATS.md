# Media por red (v1)

V1 no procesa video. Si hay video, es un **link de YouTube** (`testimonials.video_url`). Sin FFmpeg, sin worker, sin mp4 propio.

Hay **una sola card** PNG 1080×1350 para Discord, Instagram y LinkedIn. El formulario público (`/enviar`) guarda `ig_caption` y `li_caption` con la plantilla vieja: intro "Desde No Country compartimos esta historia de nuestro talento", cita entre comillas, nombre, la red de esa plantilla y `#NoCountry #DemoDay #TalentoIT`. No escribe `discord_caption`. El video no entra en esos textos.

El panel (`apps/panel-admin`, `/testimonials/[id]`) separa los textos. En revisión, si el texto está vacío, es copia de la otra red o sigue la plantilla vieja, cada tab arranca con la plantilla de esa red: intro según red y tipo (simulación, primer empleo o reconversión), nombre, mención de esa red si existe, y hashtags solo en Instagram y LinkedIn. Discord no lleva mención ni hashtags. Instagram usa el valor guardado (`@usuario`). LinkedIn escribe `@usuario` a partir de `linkedin.com/in/{usuario}` o de un handle suelto. La cita queda en la imagen y no se repite en el texto. Cambiar la cita no rearma la descripción. Un texto ya editado a mano, que no sigue la plantilla, se deja.

Se edita en el panel, en tabs Instagram, LinkedIn y Discord. Si hay video, la plantilla de LinkedIn y Discord trae `Video testimonial: watch?v=…` al final. La casilla lo agrega o lo saca entero: el link no se edita. Al publicar se manda ese texto. Instagram no lo lleva.

| Pieza | Discord | Instagram | LinkedIn |
| --- | --- | --- | --- |
| Descripción del post | Caption de Discord | Caption de Instagram | Caption de LinkedIn |
| Card 1080×1350 | Imagen grande del embed | Imagen del post | Imagen del post |
| Quote | En la card | En la card | En la card |
| Avatar | En la card + icono del autor | En la card | En la card |
| Foto testimonial | Foto de arriba de la card (si no hay, foto de respaldo) | Igual | Igual |
| YouTube | `Video testimonial: watch?v=…` al final, si el admin lo deja | No entra | `Video testimonial: watch?v=…` al final, si el admin lo deja |
| Publicación | Webhook al publicar | Buffer | Buffer |

La card se sube a `share-cards/{slug}/instagram.png` antes de publicar. Si alguna red falla, la ficha reintenta las que falten; también se puede descargar la card y copiar el texto.

Detalles de copy: [COPY_PIPELINE.md](./COPY_PIPELINE.md).
