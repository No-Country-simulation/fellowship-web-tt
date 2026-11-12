# Evidencias — primera visita

Selección auditada antes de publicar `07ea72e`. [Informe completo y tablas de mediciones](../../../carousel-first-visit.md).

- [Resumen de regresiones](./qa-summary.json): nueve casos de streaming, 36 estados responsive, nueve flujos del formulario, 576 alineaciones y 45 envíos interceptados; conserva resultados, comprobaciones y límites manuales.
- [Traza final](./trace.json): TTFB, carga parcial, recurso, decode, ocultamiento del mensaje y pintura. Una ejecución representativa, no comparación controlada.
- [Pipeline de un MISS](./pipeline.json): descarga completa de un PNG público y Sharp medidos en proceso local; una resolución ya admitida, sin modificar la UI.

Los JSON completos de presupuestos, preload y regresiones permanecen locales e ignorados; sus conclusiones y límites se conservan en el informe. No son dependencias de los tests. No se versionan dumps repetidos de coordenadas/payloads ni nuevas capturas.

Los tests siguen ejecutando todas sus comprobaciones y generan los reportes completos. Después de ejecutar las tres regresiones con `--first-visit` (streaming sin flag), ejecutar `node scripts/qa-carousel-summarize.mjs first-visit` para actualizar el resumen. Requiere que los tres reportes locales existan; no infiere éxitos ni reduce cobertura. Dispositivos físicos, lectores y zoom nativo siguen pendientes.
