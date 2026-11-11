# Evidencias — carrusel optimizado

Datos sintéticos y Canvas del panel local, Chrome headless contra build de producción. No representan testimonios reales ni aprobación visual del desarrollador. [Decisiones y límites](../../../carousel-optimized-images.md).

Se conservan únicamente cuatro PNG:

- [Desktop EN, 1440px](./en-1440.png): arte y controles, lectura textual cerrada.
- [Móvil ES, 320px](./es-320-text.png): relato expandido y navegación.
- [Móvil PT, 375px, fuente 200%](./pt-375-200.png): reflow del texto y controles.
- [Móvil ES, fallo de imagen](./es-375-error.png): respaldo y texto disponible.

Reportes:

- [Carrusel](./qa-results.json): 216 estados responsive (3 idiomas × 6 anchos × 2 DPR × 2 tamaños de fuente × 3 diapositivas), siete diseños, cantidades, teclado y errores. Incluye DPR3, pintura del arte sin JavaScript y negociación de PNG redimensionado cuando no se acepta WebP.
- [Rendimiento antes](./performance-before.json) y [después](./performance-after.json): 12 muestras cada uno, caché fría/caliente, escritorio y móvil lento. Comparación y cautelas en la documentación principal.
- [Muestras públicas limitadas](./public-probe.json): primera candidata con 400 sin causa clasificada; otras tres imágenes publicadas respondieron 200 y se verificó realmente PNG 1080×1350 → WebP 750×938. No acredita cobertura de todos los registros ni disponibilidad de transformaciones de Supabase.
- [Regresión integrada](./form-regression/qa-results.json): nueve flujos categoría/idioma, 576 controles de alineación, 36 estados del checkbox, navegación/foco, edición y archivos conservados; cero POST reales.
- [Regresión de envío](./submit-regression/qa-results.json): nueve flujos y 45 POST interceptados; validación, cambio de categoría, reconciliación y payload existentes conservados.

Pruebas unitarias de selector: 5/5. Suite i18n/validación/servidor con dobles: 94/94. TypeScript, ESLint sin warnings, build y `git diff --check` comprobados; ver entrega de la tarea para el resultado final. No se instalaron dependencias ni se leyeron credenciales.

`.gitignore` permite solo estas imágenes y reportes. Los siete PNG originales de `generated/`, capturas adicionales y capturas de regresión del formulario quedan ignorados. Los scripts conservan la matriz completa. Las evidencias de features anteriores no se sobrescriben: los dos scripts de regresión admiten `--carousel-images` para escribir aquí.

El 200% usa fuente raíz, no zoom nativo. Dispositivos físicos, Safari/Firefox, lectores de pantalla, legibilidad de cada arte real, caché y rendimiento del hosting desplegado requieren revisión manual. No hay envíos, uploads ni cambios de servicios reales; solo la muestra GET pública expresamente acotada. Los servidores y perfiles creados por QA se cierran al finalizar.
