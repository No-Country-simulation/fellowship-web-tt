# Media por red (v1)

V1 no procesa video. Si hay video, es un **link de YouTube** (`testimonials.video_url`). Sin FFmpeg, sin worker, sin mp4 propio.

El texto de los posts (Discord fijo; IG/LI editables) usa el mismo intro:

`Desde No Country compartimos esta historia de nuestro talento`

Más el quote entre comillas. IG y LI suman nombre, red y `#NoCountry #DemoDay #TalentoIT`.

| Pieza | Discord | Instagram | LinkedIn |
| --- | --- | --- | --- |
| Intro No Country | Fijo en el embed | En el caption (editable / Gemini) | En el caption (editable / Gemini) |
| Quote | Entre comillas, en la descripción | Entre comillas en la card PNG y en el caption | Entre comillas en el caption |
| Avatar | Icono del autor | En la card 1080×1080 | No (post de texto) |
| Captura del proyecto | Imagen grande del embed | No va en la card | Debajo del caption, se adjunta |
| YouTube | Campo **Video** (`watch?v=`) | No entra al caption ni a la card | Campo **Video** (`watch?v=`), como Discord |
| Publicación | Webhook automático al publicar | Buffer (PNG en `share-cards` + caption). Reintentar o copiar si falla | Buffer (`li_caption` + captura/YouTube). Reintentar o copiar si falla |

Detalles de copy: [COPY_PIPELINE.md](./COPY_PIPELINE.md).
