# GalleryHero

Pantalla introductoria de /enviar, dentro de EnviarExperience y bajo el mismo FormHeader que los cinco pasos. No aparece en el home público. Se conserva su CSS y composición aprobada; no genera imágenes ni modifica las tarjetas.

**Archivos:** components/gallery-hero.tsx, gallery-hero.module.css y hero-consent.tsx.

Recibe stories (hasta tres HeroStory; [] vacío y null error), locale ES/EN/PT, accepted, onAcceptedChange, onStart y error opcional. La página de servidor obtiene publicados mediante la consulta existente y selectHeroStories; el hero no consulta servicios.

Es una vista de la experiencia cliente. Textos y nombres accesibles del carrusel consumen el catálogo vigente; contenido de participantes y textos internos de publicación permanecen originales. Estado vacío/error conserva la autorización y CTA, sin fingir testimonios.

HeroConsent es controlado: comienza desmarcado, habilita el CTA al aceptar y no navega entre rutas ni ejecuta acciones. Su declaración se comparte con EnviarForm y se añade al envío como consent=on; el parser exige aceptación afirmativa. La fecha del servidor no acredita lectura, identidad ni hora de clic.

Al comenzar se desmonta el hero y el foco pasa al paso 1. Desde el primer paso se puede volver a la introducción conservando campos, archivos y aceptación en memoria; al revocarla se bloquea reanudar. Una recarga completa reinicia el flujo. No hay sexto paso, cookies de consentimiento ni footer institucional.

Fondo SVG, reflow, carrusel manual, foco visible y áreas táctiles se conservan. El ancho de 70rem y los gutters de 24/32px se centralizan en `form-layout.module.css`, junto con header y formulario; no se duplica el padding. La descripción mantiene 36rem de lectura. La selección cambia solo con una nueva carga; el carrusel reinicia su índice al volver al hero. «Leer historia» sigue dependiendo de `/t/[slug]`, funcionalidad futura sin aprobación de publicación definitiva. Alcance, despliegue y QA: [integración](../../hero-form-integration.md).

El carrusel ahora utiliza las [imágenes administrativas optimizadas](../../carousel-optimized-images.md) y una lectura textual expandible de los datos públicos. Esta sustitución no modifica la composición, copy, checkbox ni callbacks del hero. No implica aprobar la galería o las fichas futuras.
