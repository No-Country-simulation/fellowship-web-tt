# Etapa 5 — autorización simplificada

Evidencia sintética de la misma aplicación; sin envíos reales de testimonios.
Las seis capturas históricas de la etapa 4 se conservan sin sobrescribir.

| Caso | Captura |
| --- | --- |
| Hero, ES 320 px | [Casilla y CTA inicialmente deshabilitado](hero-es-320.png) |
| Hero, EN escritorio 1440 px | [Hero completo](hero-en-1440.png) |
| Hero, PT 375 px con fuente al 200% | [Autorización y CTA](hero-pt-375-200.png) |
| Revisión, ES 375 px | [Texto de autorización y acciones de envío](es-375-review-submit.png) |

Reportes: [hero y acceso directo](qa-results.json),
[validación y rechazo del servidor](submit-regression/qa-results.json),
[resumen, edición e imágenes](summary-regression/qa-results.json).

Reproducción después de build:

```sh
node scripts/qa-hero-consent.mjs
node scripts/qa-form-submit-validation.mjs --hero-consent
node scripts/qa-form-summary.mjs --edit-summary --hero-consent
```

El primer script comprueba el checkbox local y su CTA de navegación, acceso directo
sin cookies, texto solo en revisión, edición y validación. Bloquea todos los POST;
el hero ya no registra una aceptación. Los otros dos interceptan los POST de
testimonios. Los servicios externos están bloqueados y no se usan claves de firma.
La matriz del resumen verifica sus PNG en memoria; no escribe nuevas imágenes.
El `.gitignore` permite solo estos cuatro PNG, los tres JSON y este README.

La selección sustituye el aviso de acceso bloqueado de la propuesta descartada
por el cierre de revisión vigente. La imagen local anterior queda ignorada, sin
enlaces documentales; no se borran imágenes históricas versionadas. No se amplía
la selección de cuatro PNG y tres JSON. `writtenCaptures` enumera lo regenerado.
`--refresh-hero-only` repite la cobertura y limita escrituras a los tres PNG del
hero si se necesita un ajuste posterior exclusivo de ese bloque.

El 200% se obtiene ampliando la fuente raíz. No sustituye zoom nativo, dispositivos
físicos, Safari/Firefox ni lectores de pantalla. La simplificación requiere revisión
manual final en localhost. La suficiencia de autorización informada por el texto y
la acción de enviar se revisará con Geraldine/Leandro y el equipo en Demo Day;
la revisión editorial/legal continúa pendiente. Las capturas no prueban una
aceptación explícita previa ni que se leyó el aviso.
