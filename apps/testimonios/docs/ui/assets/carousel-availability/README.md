# Evidencias — disponibilidad del carrusel

Corrección separada de las capturas y mediciones históricas de la migración. No hay PNG nuevos.

- [Cuatro rutas públicas](./public-check.json): los cuatro slugs indicados están publicados y sus archivos devuelven HTTP 400 / `NoSuchKey`. Incluye las URLs públicas esperadas; no contiene credenciales ni datos privados.
- [Antes](./before.json): selección sin verificación, medida antes del cambio de código. El modo `--before` del QA solo corresponde a ese checkout; ejecutarlo después no reconstruye la versión anterior.
- [Después](./after.json): tres muestras frías/calientes, fases separadas de consulta pública/HEAD/imagen, selección aleatoria y fallos. Caché caliente se refiere a disponibilidad: una elección aleatoria puede necesitar optimizar otra imagen todavía no visitada.
- [Diagnóstico con datos públicos reales](./public-cache.json): GET de `/enviar`, consulta pública existente y HEAD, sin descargar imágenes. Es anterior al presupuesto de espera de 200ms y motivó ese límite; no describe la latencia final ni el hosting desplegado.

Implementación, límites y resultados: [informe](../../../carousel-image-availability.md). La política de `.gitignore` conserva únicamente este README y los cuatro JSON; temporales y capturas adicionales quedan ignorados. No se sobrescriben evidencias de la migración anterior.
