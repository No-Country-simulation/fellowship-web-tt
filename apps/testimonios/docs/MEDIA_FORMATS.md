# Media por red (v1)

V1 no procesa video. Si hay video, es un **link de YouTube** (`testimonials.video_url`). Sin FFmpeg, sin worker, sin mp4 propio.

Hay **una sola publicación** para Discord, Instagram y LinkedIn: la misma card PNG 1080×1350 y el mismo texto. El texto usa este intro:

`Desde No Country compartimos esta historia de nuestro talento`

Más el quote entre comillas, el nombre, el Instagram y el LinkedIn de la persona (los que haya) y `#NoCountry #DemoDay #TalentoIT`. Se edita en el panel.

| Pieza | Discord | Instagram | LinkedIn |
| --- | --- | --- | --- |
| Texto del post | Descripción del embed | Caption | Texto del post |
| Card 1080×1350 | Imagen grande del embed | Imagen del post | Imagen del post |
| Quote | En la card y en el texto | En la card y en el texto | En la card y en el texto |
| Avatar | En la card + icono del autor | En la card | En la card |
| Foto testimonial | Foto de arriba de la card (si no hay, foto de respaldo) | Igual | Igual |
| YouTube | Campo **Video** (`watch?v=`) | No entra | Al final del texto (`Video: watch?v=…`) |
| Publicación | Webhook al publicar | Buffer | Buffer |

La card se sube a `share-cards/{slug}/instagram.png` antes de publicar. Si alguna red falla, la ficha reintenta las que falten; también se puede descargar la card y copiar el texto.

Detalles de copy: [COPY_PIPELINE.md](./COPY_PIPELINE.md).
