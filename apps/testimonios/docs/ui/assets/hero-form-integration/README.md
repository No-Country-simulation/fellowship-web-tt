# Evidencias — hero y formulario integrados

Selección limitada. Datos y fotos sintéticos; todos los POST interceptados o bloqueados. No se eliminan ni sobrescriben evidencias históricas.

- [Hero ES, 320 px](./hero-es-320.png): autorización y CTA móvil.
- [Hero EN, 1440 px](./hero-en-1440.png): composición completa, carrusel y copy localizado.
- [Hero PT-BR, 375 px, texto 200%](./hero-pt-375-200.png): reflow de autorización y acción.
- [Revisión ES, 375 px](./es-375-review-submit.png): aviso final y acciones, sin otra casilla.
- [QA de introducción y rutas](./qa-results.json).
- [QA de validación y envío simulado](./submit-regression/qa-results.json).
- [QA de resumen, edición y fotografías](./summary-regression/qa-results.json).

Los scripts conservan las matrices completas y verifican PNG en memoria sin escribir capturas adicionales del resumen. `.gitignore` limita esta carpeta a los archivos enlazados y este README. Ejecución y límites: [documentación técnica](../../../hero-form-integration.md).

Actualización de alineación: los cuatro PNG seleccionados reflejan el contenedor compartido de 70rem y gutters de 24/32px. El reporte principal incluye 576 mediciones de extremos en seis anchos y ES/EN/PT; el resumen amplía su matriz a 432 combinaciones. La captura auxiliar de formulario de escritorio queda local e ignorada, sin ampliar las cuatro imágenes versionables. Ninguna ruta futura queda bloqueada por estas pruebas o esta documentación.
