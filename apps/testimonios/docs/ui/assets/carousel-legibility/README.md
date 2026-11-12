# Evidencias — nitidez y carrusel compacto

[Informe de la iteración](../../../carousel-legibility.md). Evidencias nuevas, sin sobrescribir etapas anteriores.

- Las [tablas del informe](../../../carousel-legibility.md) conservan la comparación 75/85/90, transferencia y rendimiento frío/caliente. Los dumps del experimento quedan locales e ignorados.
- [Comparación de texto oscuro](./comparison-2.png) y [texto en fondo claro](./comparison-4.png): columnas 75/85/90/PNG y filas 384/750/1080; inspección de recortes, no screenshots de UI.
- UI: [desktop EN](./en-1440.png), [320px ES](./es-320.png), [375px PT al 200%](./pt-375-200.png), [fallback ES](./es-375-fallback.png). Las imágenes son PNG públicos; los datos semánticos de QA son sintéticos, no representan otra consulta real de esas personas.
- [Resumen de regresiones](./qa-summary.json): 270 estados visuales, 15 selecciones iniciales, streaming, nueve flujos de formulario, 576 alineaciones y 45 envíos interceptados.
- [Lecturas públicas del build final](./public-verification.json): snapshot pequeño, sin URLs ni datos personales.

La allowlist conserva este README, el resumen, el snapshot público y los seis PNG seleccionados. Los reportes completos, coordenadas, payloads, originales, variantes WebP y capturas adicionales permanecen locales e ignorados. Los seis PNG seleccionados contienen publicaciones ya públicas para la revisión visual solicitada.

Reproducción: los scripts de presentación, streaming, formulario y envíos siguen ejecutando la cobertura completa y escriben sus JSON locales. Después de ejecutarlos con `--legibility`, actualizar el resumen con `node scripts/qa-carousel-summarize.mjs legibility` (presentación no necesita flag). El generador falla si falta algún reporte; no convierte una ausencia en PASS.

En un checkout nuevo, los PNG locales de prueba no se versionan: `qa-carousel-quality-capture.mjs` puede obtenerlos mediante lecturas públicas explícitamente autorizadas. Alternativamente se pueden proporcionar las tres fuentes 1080×1350 como `local/source-1.png` a `source-3.png`; el fixture no hace lecturas externas en modo replay. `qa-carousel-images.mjs` usa el generador sintético existente y no requiere imágenes públicas. Los experimentos `quality-matrix`/`quality-visual` se retiraron del seguimiento; no son dependencias de las regresiones.
