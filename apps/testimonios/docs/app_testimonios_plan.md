# Plan: sistema de testimonios

## Estado actual de implementación

**Última revisión:** 22 de octubre de 2026.

Este checklist resume el estado de desarrollo de Testimonios. Las secciones siguientes conservan la planificación y las decisiones originales del proyecto.

### V1 — Interfaz pública de Testimonios

- [x] Formulario `/enviar` de cinco pasos y tres categorías de testimonios.
- [x] Validaciones, avatar obligatorio y fotografía testimonial opcional.
- [x] Consentimiento, resumen y confirmación del envío pendiente de moderación.
- [x] Galería pública con búsqueda, filtros, contador y estados vacíos.
- [x] Carrusel de hasta tres testimonios publicados.
- [x] Ficha individual con historia completa, fotografía testimonial y video de YouTube.
- [x] Mejoras responsive, de accesibilidad y adaptación a texto ampliado.
- [x] Documentación UI de los componentes implementados y modificados.

### V1 — Funcionalidades del equipo

- [x] Panel administrativo de revisión, edición y moderación de testimonios.
- [x] Generación de cards para redes sociales.
- [x] Integraciones con Discord y Buffer, demostradas funcionando por el equipo en dev.

### Pendientes de revisión técnica

- [ ] Revisar la protección de fotografías pendientes de moderación en Supabase Storage.
- [ ] Verificar los controles de autenticación y autorización del panel antes de utilizar datos reales.
- [x] Límites de la card PNG y Storage: la card y el bucket `share-cards` cortan en 5 MB. El body de la Server Action queda en 8 MB para que entren la card y el texto.
- [x] Recuperación si Buffer falla después de crear el post: el reintento borra fecha e id solo si siguen siendo los de ese post y vuelve a publicar esa red.
- [x] Definir la política de conservación o eliminación de testimonios rechazados y sus archivos: se borran en lote desde la pestaña Rechazados (tope 100 por vez), de forma definitiva, con avatar, foto testimonial y card. Si Storage falla en una, esa fila queda para reintentar. Sin migración.

### V2 — Fuera del alcance actual

- [ ] Grabación y subida directa de archivos de video.
- [ ] Procesamiento y generación de videos con identidad de marca.
- [ ] Generación de Reels verticales.
- [ ] Evaluación de FFmpeg, OpenCut u otras herramientas de procesamiento.

**Nota:** los puntos de V2 son funcionalidades futuras, no tareas incumplidas de V1. Los pendientes relacionados con el panel, Supabase y las publicaciones requieren evaluación por sus responsables.

---

El inbox ya no vive en esta app. Galería y `/enviar` quedan en `apps/testimonios`. Revisar y publicar está en `apps/panel-admin` (`/testimonials`). Quote y captions salen de la plantilla; no hay generación con IA.

Brief: capturar → almacenar → validar → compartir (Discord, Instagram y LinkedIn). Tally/Excel son referencia de campos. Formato base: **texto**. **Avatar obligatorio**. Foto testimonial y YouTube opcionales. Se pide en **Demo Day**.

App nueva `apps/testimonios` (Next + Supabase). No se mezcla con la landing de empresas.

---

# V1 — Cómo funciona el sistema

```mermaid
flowchart LR
  form["1. Talento envía /enviar"] --> db["2. Supabase guarda"]
  db --> auto["3. Quote captions aviso"]
  auto --> admin["4. Admin publica o rechaza"]
  admin --> out["5. Discord Instagram LinkedIn galería"]
```



El talento no entra al admin. El equipo **solo valida y publica**. El resto corre solo.

**V1 no procesa video.** Si hay video, es un **link de YouTube**: se guarda y se embebe. Sin grabar en el form, sin subir mp4, sin FFmpeg, sin worker, sin OpenCut.

## Cuándo se pide — Demo Day

El pedido y el recordatorio se dicen **en la Meet del demo day**. El mismo día, además, un aviso en el **canal general de Discord**.

1. **Inicio de la Meet.** Speech corto + link `/enviar` en el chat.
2. **Mismo día, Discord general.** Un mensaje en el canal general con el mismo link, para quien no está en la Meet o entra tarde.
3. **Cierre de la Meet.** Recordatorio + el mismo link otra vez en el chat.

Cadencia: cada simulación / al menos un lote al mes.

## Capturar — `/enviar`

Wizard corto, sin login.

1. Qué querés contar
2. Nombre, país, email y foto de perfil
3. Historia según el tipo
4. Foto testimonial (opcional) + YouTube, Instagram y LinkedIn (opcionales)
5. Consentimiento y enviar

**Todos**

- Qué querés contar — obligatorio
- Nombre completo — obligatorio
- País — obligatorio en el form. En DB puede ser null (envíos anteriores). Se muestra junto al nombre en `/t/[slug]` y en la card de las redes
- Email — obligatorio (no sale en público)
- **Avatar** — **obligatorio**. Foto de la **persona** (cara / perfil). Va redondo en la card y en Discord junto al nombre. Sin avatar no se puede enviar.
- **Foto testimonial** — opcional. **No es el avatar.** Foto del **entorno de trabajo** (equipo, oficina, reunión), no una captura del proyecto. Es la foto de arriba de la card (diseño Foto arriba); si no hay, se usa `public/brand/ig-fallback.jpg`
- Video — opcional: **solo URL de YouTube**
- Instagram — opcional, para mención en el caption de IG
- LinkedIn — opcional, perfil (`linkedin.com/in/…`) o handle, para el caption de LI
- Consentimiento — obligatorio

**Según el tipo**

- Simulación: puesto principal (opcional) + *Contanos tu experiencia en la simulación*
- Primer empleo: empresa, puesto, *Cómo te ayudó la simulación*
- Reconversión: oficio anterior, rol nuevo, *Por qué cambiaste y cómo te está ayudando No Country*

Totales: simulación 7 obligatorios (incluye país y avatar); empleo y reconversión 9.

Al enviar, el sistema arma los textos **sin IA**: recorta lo que escribió la persona.

- **Quote** (la frase de la card): primeras ~200–240 caracteres o las primeras 2 oraciones, cortando en un punto o espacio.
- **Captions** de Instagram y LinkedIn (la misma plantilla vieja, distinta red). El formulario guarda los dos y no escribe `discord_caption`:

```
Desde No Country compartimos esta historia de nuestro talento

"{quote}"

{fullName}
{instagram | linkedin}

#NoCountry #DemoDay #TalentoIT
```

`buildIgCaption` y `buildLiCaption` arman esa plantilla en `lib/testimonials/quote.ts`. No reciben el tipo ni arman Discord. El video no entra.

El panel (`apps/panel-admin`, `/testimonials/[id]`) separa los textos. En revisión, si el texto está vacío, es copia de la otra red o sigue la plantilla vieja, cada tab (Instagram, LinkedIn, Discord) arranca con la plantilla de esa red: intro según red y tipo (simulación, primer empleo o reconversión), nombre, mención de esa red si existe, y hashtags solo en Instagram y LinkedIn. Discord no lleva mención ni hashtags y se guarda en `discord_caption`. Instagram usa el valor guardado (`@usuario`). LinkedIn escribe `@usuario` a partir de `linkedin.com/in/{usuario}` o de un handle suelto. La cita queda en la imagen y no se repite en el texto del post. Cambiar la cita no rearma la descripción. Un texto ya editado a mano, que no sigue la plantilla, se deja. Si hay video, la plantilla de LinkedIn y Discord trae `Video testimonial: watch?v=…` al final. La casilla lo agrega o lo saca entero: el link no se edita. Al publicar se manda ese texto. Instagram no lo lleva. Detalle: [COPY_PIPELINE.md](./COPY_PIPELINE.md).

## Guardar

Supabase: una fila (`in_review`). Avatar obligatorio y captura opcional en Storage. `video_url` = YouTube. Email solo admin.

Tablas, enums y SQL: [app_testimonios_v1_db.md](app_testimonios_v1_db.md).

## Validar — panel (`/testimonials`)

Revisar y publicar está en `apps/panel-admin`, en `/testimonials` y `/testimonials/[id]`, dentro del mismo shell que el resto del panel. No hay login propio ni generación con IA: el quote y los captions salen de la plantilla y se editan a mano.

Inbox master-detail (`InboxShell`): lista a la izquierda, ficha a la derecha. Los filtros viven en la URL: `?status=` (`in_review`, `published`, `archived`, `rejected`), `?type=` (`simulation`, `first_job`, `career_change`) y `?s=` (hasta 100 caracteres, sin caracteres de control). Un valor inválido redirige a la query válida. La lista aplica esos filtros en memoria. Al elegir un envío, el detalle muestra un esqueleto (`DetailLoading` / `[id]/loading.tsx`) hasta que carga `/testimonials/[id]`.

En la ficha (`ReviewForm`): envío original arriba (desplegable) y una sola **Publicación** para las tres redes. A la izquierda, el diseño de la card y la preview 1080×1350; a la derecha, la **Cita de la historia** (quote) y la **Descripción del post** de la red activa (tabs Instagram, LinkedIn y Discord). Arriba se ve a qué redes sale (`ShareTargets`). Publicar, guardar borrador o rechazar.

Después de publicar, la ficha (`PublishedPanel`) muestra el estado por red, la card que salió y los botones para descargarla y copiar el texto. Si alguna red falla, un solo botón reintenta las que falten.

Flujo de estados: `in_review` pasa a `published` o a `rejected`. Un publicado se archiva con motivo (`published` → `archived`): sale de la galería y `archive_reason` guarda el texto (obligatorio, hasta 500 caracteres). Los posts ya enviados y sus ids no se tocan. Desde archivado se puede volver a publicar (`archived` → `published`, sin reenviar a Discord, Instagram ni LinkedIn) o rechazar (`archived` → `rejected`; el motivo queda null). `rejected` es el rechazo del admin, no un archivo. Desde la pestaña Rechazados del inbox se marcan varios o todos los visibles (tope 100 por operación). «Eliminar definitivamente» pide confirmación con la cantidad y solo corre sobre filas que siguen `rejected`. Por cada una borra primero el avatar (bucket `avatars`), la foto testimonial (bucket `captures`, si existe) y `share-cards/{slug}/instagram.png`, y después la fila. Si Storage falla en una, esa fila queda y se puede reintentar. Al terminar se queda en el inbox con los filtros de la URL y muestra un resultado. No requiere migración (`service_role`).

## Publicar en Discord de comunidad (post validación)

No hay bot, ni OAuth, ni Discord Developer Portal. Son **dos Incoming Webhooks** (una URL por canal). En Discord: Editar canal → Integraciones → Webhooks → Nuevo webhook. Cada URL va a un env distinto. El de comunidad **no dispara** hasta que un admin publica.

```mermaid
sequenceDiagram
  participant Form as Formulario
  participant App as Server
  participant Inbox as CanalInterno
  participant Admin as Admin
  participant Community as CanalComunidad

  Form->>App: POST /enviar
  App->>Inbox: webhook inbox
  Admin->>App: publicar
  App->>Community: webhook comunidad
```



**Setup**

No hace falta ser dueño ni “Admin” del servidor. Hace falta el permiso **Manage Webhooks** en ese canal (o que un admin te cree el webhook y te pase la URL).

1. Canal interno del equipo (privado): crear webhook → `DISCORD_INBOX_WEBHOOK_URL`.
2. Canal de comunidad (el de testimonios, no el general del Demo Day): crear webhook → `DISCORD_COMMUNITY_WEBHOOK_URL`.
3. Pegar las URLs en `.env.local` / Vercel. Si una está vacía, ese aviso no se manda; el resto de la app sigue.

El aviso del Demo Day en el canal **general** es a mano (link `/enviar`). Los webhooks son otro canal: inbox del equipo y publicación a la comunidad.

**Al enviar** (aún `in_review`): `POST` JSON al webhook interno. Aviso corto: nombre, tipo, “nuevo testimonio”, link a `{ADMIN_PANEL_URL}/testimonials/{id}`. Username del webhook: algo tipo “Testimonios inbox”. La comunidad no ve nada.

**Al publicar:** el server action pasa la fila de `in_review` a `published` y escribe `published_at`. Solo sigue el request que cambia la fila. Ese sube el PNG a `share-cards`. Si el PNG no se genera, pasa de 5 MB o no llega, no se publica. Si Storage falla, la fila vuelve a `in_review` con `published_at` en null. Con la card guardada reserva cada red (la fecha solo si sigue en null) y **después** postea Discord (webhook) e Instagram/LinkedIn (Buffer). Si la llamada falla, borra esa fecha. El testimonio no espera a las redes para quedar publicado.

Cuerpo del `POST` (comunidad): solo `embeds[0]` (sin `content`). Username del webhook: No Country. `avatar_url` de la raíz: logo de No Country.

Cuerpo del post (embed), en `postCommunityTestimonial`:

- Autor: `full_name` + avatar. El archivo **no se sube a Discord**. Se manda `embeds[0].author.icon_url` con la URL pública de Storage del avatar. Discord la descarga.
- Descripción: el texto de Discord. La cita queda en la imagen. No es el texto de Instagram ni el de LinkedIn.
- Imagen grande: la **card** de `share-cards` (la misma que Instagram y LinkedIn).
- Si hay YouTube, el link va en la descripción solo cuando el admin lo deja en ese texto. Un embed no reproduce YouTube.
- Color: magenta de No Country. Sin título ni footer.

Si el webhook falla, el testimonio **igual queda publicado** (`published_at`). `discord_posted_at` queda null. La ficha muestra Falló y un solo botón reintenta las redes que falten. Si el POST sale bien, se escribe `discord_posted_at`. El webhook no devuelve la URL del mensaje: Discord no tiene **Ver post**.

### Cómo se usa cada media (sin galería)

Tabla por red: [MEDIA_FORMATS.md](./MEDIA_FORMATS.md). Las tres redes reciben **la misma card**. Cada una lleva su texto. La cita queda en la imagen. Solo cambia cómo va el video.

- **Avatar** (cara / perfil, siempre hay): va en la **card generada**. En Discord, además, es el icono junto al nombre.
- **Foto testimonial** (entorno de trabajo, opcional): es la foto de arriba de la card (si no hay, fallback de marca). No se postea cruda en ninguna red.
- **YouTube** (URL, no un mp4 nuestro, opcional): la plantilla de Discord y de LinkedIn lo trae al final (`Video testimonial: watch?v=…`). La casilla lo agrega o lo saca entero: el link no se edita. Al publicar se manda ese texto. En Instagram no entra (no admite links en el caption y un Reel pide archivo). El Reel queda para v2.

**Discord, en la práctica**

1. Siempre: nombre + avatar chico + la descripción de Discord + la card de imagen grande.
2. Si hay YouTube y el admin dejó el link en la descripción, ese texto lo incluye. Un embed **no** reproduce YouTube. No se manda `content` aparte ni un campo Video extra.
3. No se sube el video como archivo. No hace falta.

**La card (las tres redes)**

Instagram no acepta un post de solo texto, así que el post es **una imagen 4:5 (1080×1350) + un texto**, y esa misma imagen sale en Discord y LinkedIn. La imagen **se genera** en el panel: no se postea la captura ni el avatar crudos.

La card se dibuja en el browser (`drawIgCard` sobre un `<canvas>` en `apps/panel-admin`) y se exporta a PNG con `igCardPngBlob`. La foto de arriba es la captura que subió la persona; si no hay, `public/brand/ig-fallback.jpg` del panel. Tope del PNG: 5 MB (`SHARE_CARD_MAX_BYTES`), el mismo corte del bucket `share-cards`.

**Logo:** el chrome y la card usan el mismo PNG (`public/brand/logo-no-country.png`). El header usa [`BrandLogo`](../../../packages/ui/docs/brand-logo.md) (`@repo/ui`); el PNG es el default del componente. No hay SVG en esta app.

El admin elige el diseño en la ficha (**Diseño de la imagen**). **Foto arriba** es el base de todos los tipos; los otros dos son propios de cada tipo:

- Simulación: Foto arriba, Cita (sin foto, la frase grande) y Retrato (la persona al centro)
- Primer empleo: Foto arriba, Empresa (la empresa que lo contrató en grande) y Recorrido (de la simulación al puesto)
- Reconversión: Foto arriba, Antes y ahora (oficio anterior → rol nuevo) y Perfil (tarjeta con la foto de portada)

El diseño elegido no se guarda: la card publicada queda en `share-cards/{slug}/instagram.png` y es la que se descarga después. Los handles van en el texto, no en la card.

```mermaid
flowchart LR
  capture[Captura o fallback] --> card[PNG 1080x1350]
  quote[Quote] --> card
  avatar[Avatar] --> card
  logo[Logo] --> card
  card --> storage[share-cards]
  storage --> discord[Discord]
  storage --> buffer[Buffer Instagram y LinkedIn]
  intro[Texto de Discord] --> discord
  caption[Texto de Instagram y de LinkedIn] --> buffer
```

**LinkedIn, en la práctica (v1)**

Buffer publica la card. Instagram y LinkedIn usan **cada una su texto**. El formulario dejó la plantilla vieja en `ig_caption` y `li_caption`; el panel guarda cada red por separado, incluida `discord_caption`. Si hay video, la plantilla de LinkedIn y Discord trae `Video testimonial: watch?v=…`. La casilla lo agrega o lo saca entero: el link no se edita. Al publicar se manda ese texto. Instagram no lo lleva.

La app pública arma la plantilla vieja (`buildIgCaption` y `buildLiCaption`, con la cita y sin tipo). En el panel cada tab edita el texto de su red.

**Cómo se publica**

1. En revisión (`/testimonials/[id]`): elegir el diseño, retocar la cita y la descripción de cada red. Publicar.
2. Al publicar: el update a `published` gana solo si la fila sigue `in_review`. El que gana sube el PNG a `share-cards`. Si el PNG no se genera, pasa de 5 MB o no llega, no se publica y el panel muestra **Reintentar imagen**. Si Storage falla, la fila vuelve a `in_review`. Después reserva cada red y postea: Discord (webhook, el texto del campo), Instagram (Buffer: card + texto) y LinkedIn (Buffer: card + el texto del campo). El link del video no se agrega después. `BUFFER_ENV=production` publica ya (`shareNow`); `development` o si falta programa a 1 semana.
3. Si Discord o Buffer fallan, el testimonio **igual queda en la galería**. La ficha reintenta las redes sin fecha, y las de Buffer cuyo estado es `error`, con un solo botón. Si Buffer creó el post y después informa error, ese reintento borra fecha e id solo si siguen siendo los de ese post. También se puede descargar la card y copiar el texto para subirlo a mano.
4. Se guarda el id de cada post de Buffer (`buffer_*_post_id`). Al abrir la ficha publicada, el panel consulta el estado real en Buffer y, si ya salió, muestra **Ver post** con el link.
5. Sin `BUFFER_API_KEY` o sin channel ID, esa red se saltea.

**Lo que no se puede en v1**

- Pasar el YouTube a un Reel o a un mp4 con logo (hace falta bajar/procesar el archivo → v2).
- Que Discord “incruste” el video dentro de la imagen del embed.
- Postear la captura cruda en Instagram (la imagen del feed es la card, que ya la usa como foto de arriba).

## Stack v1

- Next 16 en `apps/testimonios`, puerto 3001: galería, `/enviar` y `/t/[slug]`
- Inbox en `apps/panel-admin`, puerto 3002: `/testimonials` y `/testimonials/[id]`. Sin login propio
- Supabase: Postgres, Storage (`avatars` + `captures` + `share-cards`), RLS. Escrituras con `service_role`
- Vercel. Sin worker de video
- Env de testimonios: Supabase, `DISCORD_INBOX_WEBHOOK_URL`, `ADMIN_PANEL_URL`
- Env del panel: service role, `DISCORD_COMMUNITY_WEBHOOK_URL`, Buffer (`BUFFER_ENV`, `BUFFER_API_KEY` + channel IDs)

## Orden de implementación (v1)

1. Scaffold de la app
2. Supabase (tabla, Storage avatares + capturas, RLS)
3. Formulario + quote/captions auto (IG + LI) + aviso inbox
4. Admin validar / publicar
5. Galería + embed YouTube
6. Discord webhooks + Buffer (IG/LI) + card única para las tres redes

---

# V2 — Video: qué métodos hay y cuál elegir

Objetivo de v2: marca, portada y formato (Reels 9:16 / Discord 16:9), como pedía el brief. En v1 no se construye. Se **evalúa** qué está disponible entonces y qué encaja (costo, ops, calidad, abandono del form).

## Candidatos a comparar

- **Grabar en el form** (30–60 s, como Senja) — genera archivo nuestro
- **Subir mp4** — mismo archivo, más abandono que grabar
- **Seguir solo YouTube** — embeber, sin marca automática
- **Job FFmpeg** (worker Fly/Railway o API tipo FFmpeg Micro) — logo + tamaños; hace falta archivo, no un link
- **OpenCut** — editor a mano hoy; API / headless del rewrite [aún no está para producción](https://github.com/OpenCut-app/OpenCut/issues/811)

Criterio: el que permita automatizar marca **sin** un servidor caro, y sin alargar tanto el form que lo abandonen. Si OpenCut headless ya existe en ese momento, se compara contra FFmpeg. Hasta entonces v1 no depende de ninguno.