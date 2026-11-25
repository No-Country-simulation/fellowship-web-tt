# Evidencias — precarga progresiva

[Informe y metodología](../../../carousel-preload.md) · [resumen compacto](./results-summary.json).

La implementación y revisión manual en localhost se completaron el 16/11/2026 y fueron aprobadas por el desarrollador. Este registro no afirma un despliegue en producción ni aprobación adicional de accesibilidad.

Se conservan medianas de tres parejas fría/caliente por modo, prioridades observadas y casos de regresión. Fuentes idénticas reproducidas localmente; sin llamadas reales ni envíos. Los dumps por ejecución y estado temporal quedan en `local/`, ignorados; no se versionan matrices grandes ni screenshots adicionales. Las capturas y reportes seleccionados de etapas anteriores se conservan.

`qa-carousel-preload-performance.mjs --before` requiere el build anterior; sin flag usa el nuevo. Tras medir ambos y ejecutar `qa-carousel-preload.mjs`, `--summarize` genera este JSON pequeño. No se confunde esperar el load del recurso con finalizar la animación, ni pintura con LCP orgánico móvil. Las limitaciones del hosting, dispositivos y lectores reales están en el informe.
