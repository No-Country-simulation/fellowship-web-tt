# Disponibilidad de imágenes del carrusel

Corrección del 11/11/2026 sobre `feat/testimonios-carousel-optimized-images`, pendiente de revisión manual. Complementa la [migración a imágenes optimizadas](./carousel-optimized-images.md). No modifica calidad, resolución, compresión, diseño, transcripción, enlaces, consentimiento, formulario, acciones ni esquema. La migración anterior todavía está sin commit; su estado Git también aparece en la entrega.

## Cuatro archivos verificados

Se usaron la fuente pública existente y GET con `Range: bytes=0-0`. No hubo listado de bucket, acceso administrativo, uploads ni cambios de registros. Los cuatro slugs están entre los diez publicados de la consulta auditada.

| Slug / URL esperada | HTTP origen | Cuerpo de error | Conclusión |
| --- | --- | --- | --- |
| [lautaro-duran-99d4858c](https://zfxdyfoycrjoluegnubx.supabase.co/storage/v1/object/public/share-cards/lautaro-duran-99d4858c/instagram.png) | 400 | `404`, `not_found`, `Object not found`, `NoSuchKey` | No existe en esa ruta. |
| [lautaro-duran-149e8cab](https://zfxdyfoycrjoluegnubx.supabase.co/storage/v1/object/public/share-cards/lautaro-duran-149e8cab/instagram.png) | 400 | `404`, `not_found`, `Object not found`, `NoSuchKey` | No existe en esa ruta. |
| [lautaro-duran-duran-d9970b40](https://zfxdyfoycrjoluegnubx.supabase.co/storage/v1/object/public/share-cards/lautaro-duran-duran-d9970b40/instagram.png) | 400 | `404`, `not_found`, `Object not found`, `NoSuchKey` | No existe en esa ruta. |
| [lautaro-duran-2872f91e](https://zfxdyfoycrjoluegnubx.supabase.co/storage/v1/object/public/share-cards/lautaro-duran-2872f91e/instagram.png) | 400 | `404`, `not_found`, `Object not found`, `NoSuchKey` | No existe en esa ruta. |

[Registro público de la comprobación](./ui/assets/carousel-availability/public-check.json). El HTTP real es 400 aunque `statusCode` del cuerpo sea `"404"`. No es una prueba de fallo del codec de Next: el origen ya informa que no hay objeto. Las rutas usan exactamente el slug publicado y el contrato `{slug}/instagram.png` del panel. No hay evidencia de un typo ni de otra ruta correcta. No se exploraron carpetas alternativas para inventar una asociación por nombre, ni se determina la causa histórica de que no se guardaran esos archivos.

El panel local usa `shareCardPath`, `prepareShareCard` y `uploadShareCard` en `features/testimonials/infrastructure/repositories/testimonialRepository.ts`. `storedShareCardUrl()` consulta `shareCardExists()`, que lista Storage con el cliente administrativo: no es un dato público reutilizable. El aviso de preview local es compatible con la ausencia observada, pero una preview Canvas no acredita persistencia. El panel local no prueba la implementación oficial desplegada.

La vista `testimonials_public`, su tipo en `lib/supabase/database.ts` y el mapper `lib/testimonials/public.ts` no tienen disponibilidad, ruta de share card ni versión de imagen. `published_at`, `avatar_path`, `capture_path`, flags de redes o una fecha general de actualización no acreditan ese archivo. No se añadieron columnas ni consultas privadas.

## Selección y caché elegidas

1. `/enviar` conserva una sola consulta a `testimonials_public` y `force-dynamic`. No se filtran la galería `/` ni `/t/[slug]`.
2. `selectAvailableHeroStories()` deriva las URLs candidatas únicamente de esos publicados. La selección pura y el mapper `selectHeroStories()` conservan Fisher–Yates parcial, límite tres y datos profesionales del tipo activo.
3. `share-card-availability.ts` hace HEAD público por URL, sin cookies ni credenciales, y almacena únicamente `available`, `unavailable` o `unknown` con **Next Data Cache durante 300s**. No usa Storage como catálogo. Los slugs problemáticos no aparecen como exclusión en código de producción.
4. HTTP 2xx con MIME PNG/JPEG/WebP se considera candidato disponible. 400/404/410 significa no utilizable en la ruta solicitada; el HEAD no permite atribuir automáticamente todo 400 a `NoSuchKey`. 401/403/429/5xx, red y timeout se mantienen como desconocidos. Una consulta fallida no se representa como prueba de inexistencia.
5. Cada HEAD tiene timeout de **800ms**, redirecciones rechazadas, `cache: no-store` para no sumar otra caché de fetch, y hasta **seis comprobaciones simultáneas por selección**. La caché explícita envuelve el resultado, incluyendo negativos y desconocidos. Un Map de promesas pendientes reúne probes simultáneos de la misma URL dentro del proceso; no es una segunda caché sin vencimiento.
6. La selección espera como máximo **200ms** al conjunto. Aprovecha los positivos confirmados dentro de ese plazo y registra el trabajo pendiente con `after()` de Next para terminarlo tras responder. Se evita bloquear todo el hero ante Storage lento; no hay cola, worker, nueva ruta API, servicio externo ni configuración global nueva.
7. Con positivos confirmados se eligen hasta tres de ellos; con uno/dos se muestran uno/dos. Si no hay ninguno confirmado se conservan hasta tres publicados aleatorios con `imageUrl: null`, utilizando el fallback textual existente. Si no hay publicados se conserva el estado vacío original.

**Compromiso de la primera visita:** si toda la caché está fría y los HEAD superan 200ms, esa respuesta puede mostrar solo texto aunque haya archivos válidos. No se envían URLs sin verificar para evitar los 400 conocidos. Las próximas visitas, después de completar las comprobaciones, pueden mostrar las imágenes. Con parte de la caché confirmada se aprovecha ese subconjunto; la selección aleatoria completa se obtiene cuando el conjunto está verificado. No se actualiza automáticamente una página ya renderizada desde el trabajo en background.

`unstable_cache` sigue soportado por el Next 16.3 instalado; su guía recomienda Cache Components/`use cache` para migraciones generales. Aquí se utiliza la API compatible con la configuración existente para no activar Cache Components ni cambiar el renderizado del proyecto. Se leyeron las guías locales de `unstable_cache`, `fetch` y `after` y se verificó su comportamiento en el build real, no solo con dobles.

## Peticiones y revalidación

Para **N URLs publicadas distintas**: en frío hay como máximo N HEAD para llenar sus entradas, con concurrencia seis. En caliente hay **cero HEAD adicionales**, además de la consulta pública preexistente. No hay GET de los PNG para averiguar disponibilidad, ni descarga de las tres imágenes al navegador. La imagen activa sigue siendo la única solicitada inicialmente; las demás cargan al navegar.

La caché es por URL, no por visitante ni por combinación aleatoria de historias. Un nuevo publicado verifica solo su URL no cacheada; las restantes aprovechan entradas existentes. Las visitas concurrentes frías pueden compartir probes en el mismo proceso. No se promete una exclusión mutua distribuida entre regiones/instancias.

Después de 300s, Next puede servir el resultado anterior mientras revalida en background; una visita posterior recibe el resultado actualizado. Esto aplica también a ausencias y errores temporales: **no se excluye indefinidamente** un archivo generado después. Si se elimina un archivo previamente confirmado, una respuesta todavía puede seleccionarlo hasta la revalidación; `onError` conserva el fallback accesible. HEAD no garantiza integridad ni disponibilidad atómica entre comprobar y descargar.

Los resultados desconocidos también se cachean cinco minutos para evitar repetir verificaciones fallidas durante una caída. Puede haber una degradación temporal a texto incluso después de recuperarse el origen, hasta que se revalide. No es un SLA de actualización instantánea: depende del tráfico, la caché/CDN de origen y el hosting.

`after()` respeta la duración máxima de la plataforma. Si el proceso se termina, otro miss vuelve a intentarlo en una visita posterior; no es una cola durable. Con el conjunto auditado de diez URLs el trabajo es pequeño. Si crece mucho, debe evaluarse publicar disponibilidad/ruta/versionado con los datos públicos desde el panel, en lugar de ampliar barridos de HEAD. No se implementa esa dependencia ahora.

La caché de **disponibilidad** no invalida la caché de **píxeles optimizados** de Next (actualmente mínimo 4h) ni resuelve regenerar el PNG sobre la misma URL. Ese asunto, nitidez y carga visual permanecen pendientes como en la etapa anterior.

## Verificación y evidencias

[Antes](./ui/assets/carousel-availability/before.json), [después](./ui/assets/carousel-availability/after.json) y [diagnóstico público del caché](./ui/assets/carousel-availability/public-cache.json). No son Core Web Vitals ni latencia de producción.

Comparación controlada local, tres muestras por condición, 375px/DPR2, sin throttling. Diez publicados sintéticos, consulta pública de 50ms y HEAD de 50ms; archivos y optimizador existentes, con la misma calidad/resolución. Fría significa servidor/perfil nuevos y URLs sintéticas nuevas; caliente significa entradas de disponibilidad completas en el mismo servidor. La selección sigue siendo aleatoria, por lo que en caliente la primera imagen elegida puede ser otra y requerir un MISS del optimizador.

| Mediana | Antes | Después |
| --- | ---: | ---: |
| TTFB `/enviar`, fría | 209,1ms | 337,0ms |
| TTFB `/enviar`, disponibilidad caliente | 81,4ms | 85,5ms |
| Primera imagen cargada, fría | 457,9ms | 615,7ms |
| Primera imagen cargada, disponibilidad caliente | 257,7ms | 252,3ms |
| HEAD de disponibilidad, fría | 0 | 10 |
| HEAD de disponibilidad, caliente | 0 | 0 |
| Transferencia inicial de publicación, mediana | 21,6KiB | 21,6KiB |

La consulta pública continúa siendo una por visita, aproximadamente 51–61ms en el modelo. Los diez HEAD toman ~118,5ms de pared en paralelo; no se suman sus diez duraciones como si fueran secuenciales. El GET del PNG **al optimizador** tomó 4–15ms en frío en el fixture local; la petición HTTP al optimizador, que también incluye codificación/transporte, tuvo mediana ~260ms fría / ~158ms caliente con elección aleatoria. No se midió el tiempo puro de CPU del codec ni se comparó su calidad. Solo se monta inicialmente una imagen de publicación; no se descargan tres PNG al navegador.

El coste medido de descubrimiento fue +128ms en TTFB frío y +4ms con disponibilidad caliente. El caso lento (HEAD simulados de 2s) se interrumpe por timeout a 800ms por probe; completa sus diez comprobaciones en ~1,6s **después** de haber devuelto el fallback. Los valores exactos están en el reporte. Esta prueba comprueba `after()` real sin prolongar la respuesta hasta terminar Storage.

El diagnóstico con red pública real se hizo **antes de introducir el presupuesto de 200ms**, y se conserva para mostrar por qué se añadió: primera respuesta ~2332ms, con consulta pública ~1376ms y diez HEAD (seis 200, cuatro 400); segunda respuesta ~410ms, con consulta pública ~363ms y cero HEAD. No son los tiempos finales del camino con espera acotada ni una comparación de producción. El coste de red real varía y no se extrapola desde las latencias sintéticas.

```text
node scripts/test-carousel-images.mjs
node scripts/test-form-i18n.mjs
pnpm.cmd exec tsc --noEmit --incremental false
pnpm.cmd exec eslint . --max-warnings 0
pnpm.cmd run build
node scripts/qa-carousel-availability.mjs
git diff --check
```

El nuevo QA usa diez registros públicos sintéticos, consulta pública simulada de 50ms y HEAD de 50ms; contempla caché fría y caliente, selección aleatoria, 0/1/2/3/6 disponibles, desaparición, red, HTTP 503 y timeout. Los HEAD lentos se completan después de la respuesta y se comprueba que el carrusel mantiene contenido/controles. La galería conserva sus diez registros sin imagen y una ficha sin imagen sigue accesible. El optimizador y el carrusel son reales; todos los envíos y destinos externos del navegador permanecen bloqueados.

Las transiciones de ausente→generada, disponible→ausente y recuperación de error se verifican con reloj controlado y un doble de Data Cache que reproduce stale-while-revalidate. La reutilización entre visitas y `after()` se comprueban además con Next real. No se esperaron cinco minutos reales ni se cambiaron relojes/archivos de caché del framework. No se repite la matriz de calidad WebP ni se generan nuevas capturas: el diseño está fuera del alcance. Los diagnósticos públicos temporales quedan fuera del commit y se retiran al terminar; se conservan solo reportes pequeños.

Resultados: 12/12 pruebas de selector/disponibilidad y 94/94 de i18n/validación/servidor con dobles; QA del build con seis muestras de rendimiento y once comprobaciones/escenarios. TypeScript, ESLint sin warnings, build y `git diff --check`: PASS. No hubo envíos reales, uploads ni mutaciones de Supabase.

Archivos de esta corrección: `app/enviar/page.tsx`, `components/gallery-hero-data.ts`, nuevo `lib/testimonials/share-card-availability.ts`, pruebas `test-carousel-images.mjs`, fixture público y nuevo `qa-carousel-availability.mjs`; documentación y reglas de selección de evidencias. Los demás cambios visibles de tarjetas, CSS, catálogos y capturas pertenecen a la migración anterior todavía sin commit.
