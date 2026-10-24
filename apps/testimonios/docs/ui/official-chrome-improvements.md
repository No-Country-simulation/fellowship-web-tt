# Chrome oficial: propuesta de mejoras desde Testimonios

**Última revisión:** 23 de octubre de 2026. **Estado:** implementación y QA automatizado de etapas 1–4 completados; revisión visual humana y pruebas manuales pendientes.

Este documento propone mejoras al equipo de la [web oficial](https://www.nocountry.tech/). Conserva la identidad aprobada y distingue observaciones comprobadas, decisiones propias de Testimonios y propuestas sin aprobar. No es una certificación de accesibilidad ni presupone que todas las soluciones deban trasladarse automáticamente a otra aplicación.

## Alcance y arquitectura

El documento proporciona el scroll. El layout es una columna flexible con altura mínima del viewport, un único main por ruta normal, SiteHeader sticky y SiteFooter después del contenido. SiteNavigation concentra la interacción; el footer permanece en servidor. Los estilos específicos se aíslan en CSS Modules, sin remapear tokens globales ni modificar componentes compartidos.

El catálogo tipado de lib/nav.ts conserva URLs institucionales absolutas, dominios independientes de los portales y rutas locales de Testimonios. WhatsApp social y Contacto son destinos diferentes. No se modifica la arquitectura de caché, publicación, consultas, procesamiento de archivos ni consentimiento.

## QA integral — etapa 4

Chrome headless 156 en Windows, perfiles limpios y build de producción en localhost:3002. Se eligió ese puerto porque 3001 estaba ocupado; no se detuvo su proceso. Las solicitudes del navegador distintas de GET/HEAD se bloquearon. No se enviaron testimonios, no se cambiaron registros ni se inspeccionaron valores de credenciales.

| Verificación final | Resultado y límite |
| --- | --- |
| Matriz responsive | 320, 375, 768, 1024, 1280, 1440 y 1920px × fuentes raíz simuladas de 16, 20, 24 y 32px: 28 combinaciones. Sin overflow horizontal de página, footer, paneles ni opciones. En desktop se abrieron los tres dropdowns; en compacto, los tres grupos. |
| Pantallas bajas y horizontal | Recorrido completo a 320×320px/fuente 32px; horizontal a 768×375px/fuente 32px. Controles alcanzables mediante scroll interno. |
| Navbar y foco | Tab/Shift+Tab, Enter/Espacio, Escape, clic exterior, salida del foco, exclusividad desktop, contenido inerte al cerrar, IDs únicos y asociaciones ARIA. Cambiar de breakpoint cierra el modal, retira el bloqueo y conserva un foco visible. |
| Footer y foco | Diez enlaces recorridos en ambos sentidos; outlines visibles y sin recorte bajo el header. Tres nav identificados, iconos decorativos, redes de 44×44px y pendientes sin interacción falsa. |
| Movimiento reducido | Animaciones detenidas y transiciones eliminadas. Se comprueba transition-property:none, no solo la duración computada: Tailwind puede conservar una duración aunque la transición esté desactivada. |
| Galería viva | Búsqueda por nombre y extracto, normalización Unicode, cuatro filtros, combinación, contador único, resultado vacío, restablecimiento y foco. Carrusel publicado con siguiente/anterior e inercia de las tarjetas inactivas. |
| Navegación interna | Link reales galería → ficha → galería → formulario. Un scroll de documento y footer después del contenido. |
| Formulario | Cinco pasos, errores de categoría/avatar/historia/consentimiento, offset bajo el header, selección, previews, recortes, resumen, conservación al retroceder y cambiar categoría. Consentimiento inválido bloquea el envío; no se envía con consentimiento válido. |
| Ficha viva | Historia completa, fotografía ampliable, Escape, foco, posición y ancho al bloquear el scroll. Se encontró un iframe de YouTube con nombre, fullscreen y proporción 16:9; no se probó reproducción remota. |
| Estados aislados | Renderizados de componentes reales para éxito, PageShell de error, galería sin publicados y ficha sin medios. Verifican composición/semántica; no equivalen a enviar al servidor ni a hidratar esas fixtures. Ruta inexistente comprobada también por HTTP. |
| Errores cliente | Cero errores de JavaScript en las ejecuciones finales del chrome y de regresión; sin avisos de hidratación observados. |
| Zoom real | Se intentó Ctrl++ mediante CDP: DPR 1, innerWidth 1440 y visualViewport.scale 1 no cambiaron. No se cuenta como zoom real verificado. La matriz usa style.fontSize y no sustituye preferencias del navegador. |
| Estáticos | TypeScript, ESLint y build correctos. ESLint general conserva el warning previo de landing-contratar. git diff --check sin errores. |

### Rendimiento y alcance de Git

- El manifiesto cliente del build contiene SiteNavigation y no contiene SiteFooter como límite cliente. Esto no significa que next/image o el framework no utilicen su propio JavaScript.
- Abrir/cerrar navegación no remonta el formulario, su input ni el footer: se comprobaron las identidades de sus nodos. No se realizó perfilado de React ni Lighthouse; no se deducen tiempos de render a partir de esa comprobación.
- El PNG original pesa 21.129 bytes, mide 1229×207 y coincide byte a byte con el PNG público oficial. No se cambió ni convirtió. Las capturas de documentación no se sirven desde public/.
- El diff acumulado origin/dev...HEAD comprende 37 archivos de apps/testimonios; el commit del pulido 6d1f893 apareció durante el QA. Sus componentes y capturas coinciden por hash con el estado inicial probado. La corrección local de FileField y la documentación de cierre se revisan además como cambios de trabajo. No hay cambios en dependencias, lockfile, consultas, backend, panel, migraciones ni archivos de credenciales. Se usa la referencia local origin/dev, sin fetch ni operaciones Git de escritura por parte del agente.
- Se conservan las 14 capturas existentes: 771.797 bytes en total, sin duplicados por SHA-256 y todas incluidas en el HEAD actual. Sus referencias relativas Markdown se verificaron. No se ejecutó git add desde este QA.

El servidor repitió The destination stream closed early al terminar sesiones automatizadas, mensaje ya documentado en etapas anteriores. No apareció como error de JavaScript del navegador y no se atribuye al chrome. Queda observar el uso manual habitual sin interrupciones de sesiones.

## Navbar — hallazgos y mejoras

### NC-N01: Navbar con texto ampliado

1. **Situación oficial:** a 1440px con fuente raíz de 24px, el header mide 97px y el documento alcanza 1583px frente a 1425px disponibles, antes de abrir sesión.
2. **Reproducción:** viewport 1440px, zoom 100%, cambiar style.fontSize a 24px y medir scrollWidth/clientWidth. Es simulación de fuente, no zoom real.
3. **Impacto:** navegación fuera del ancho útil y scroll horizontal.
4. **Testimonios:** medición de logo, enlaces, acciones y gaps; modo compacto cuando no caben. No se comprime la fuente.
5. **Diferencia visual:** a 1280px/fuente normal puede aparecer compacto. A 1440px/fuente 24px el header local conserva 65px y el documento mide 1430px dentro de 1430px útiles.
6. **Evidencia:** capturas reference-text24.png y testimonios-text24.png; matriz integral final.
7. **Validación:** implementado y probado en Chrome; preferencias reales de fuente y zoom pendientes.
8. **Recomendación:** evaluar adaptación según espacio real, sin sustituirla por copy más corto o reducción de tipografía.
9. **Tipo:** problema reproducido en la referencia y alternativa funcional implementada.

### NC-N02: Navegación móvil en pantallas bajas

1. **Situación oficial:** con tres grupos expandidos a 375×568px, el header inline sticky alcanza 730px y deja destinos fuera de la zona visible.
2. **Reproducción:** abrir hamburguesa y los tres grupos; desplazar la página y medir el header.
3. **Impacto:** dificultad para alcanzar y cerrar la navegación con poca altura.
4. **Testimonios:** diálogo nativo limitado a 100dvh, toolbar estable y navegación con scroll interno; Escape y retorno del foco.
5. **Diferencia visual:** modal superpuesto en lugar de expansión inline. El diseño normal conserva logo, orden, colores y tipografía.
6. **Evidencia:** reference-mobile-expanded.png y testimonios-mobile-expanded.png; prueba final a 320×320px/fuente 32px y cambios de breakpoint.
7. **Validación:** implementado, sin bloqueo residual ni foco oculto en las pruebas; revisión táctil Safari/iOS pendiente.
8. **Recomendación:** valorar panel limitado al viewport y elegir modalidad según las necesidades del sitio, incluyendo su contrato de foco.
9. **Tipo:** problema de alcance vertical reproducido; solución modal propia de Testimonios.

### NC-N03: Semántica y nombres de navegación

1. **Situación oficial:** el HTML compartido usa menu/menuitem en dropdowns y el botón móvil Toggle menu sin aria-expanded/aria-controls.
2. **Reproducción:** inspeccionar el HTML de referencia. Los roles aislados no prueban por sí mismos un incumplimiento del sitio oficial.
3. **Impacto:** el patrón elegido debe corresponder a su teclado y comunicar el estado del contenido.
4. **Testimonios:** Disclosure Navigation con botones/listas, aria-expanded y aria-controls; diálogo con nombre, contenido cerrado inerte y foco visible.
5. **Diferencia visual:** controles mínimos de 44px y outlines cyan; el área del botón puede superar la de la referencia.
6. **Evidencia:** código de SiteNavigation, asociaciones e IDs y recorrido de ambos sentidos verificados en la etapa 4.
7. **Validación:** teclado y semántica DOM comprobados. No se probó lector de pantalla ni se auditó por completo el patrón ARIA oficial.
8. **Recomendación:** revisar el contrato completo de teclado; para navegación web simple, considerar Disclosure sin roles de menú de aplicación.
9. **Tipo:** mejora semántica implementada; no es un dictamen global de conformidad del sitio oficial.

### NC-N04: Dropdown de sesión y scroll horizontal

1. **Situación oficial:** el panel alineado a la izquierda del disparador rebasa el ancho útil al abrirse.
2. **Reproducción:** a 1440×900px/fuente 16px, el documento pasa de 1425 a 1430px; clientHeight baja de 900 a 885px. El borde derecho del panel está en 1429,797px. También se reprodujo en etapas previas a 1280 y 1920px.
3. **Impacto:** aparece una barra horizontal incluso con fuente normal. A fuente 24px el header ya desborda antes de abrir el panel; el dropdown agrega otro incremento.
4. **Testimonios:** panel alineado a la derecha, con ancho/altura limitados y modo compacto cuando hace falta.
5. **Diferencia visual:** a 1440px termina en 1414px, dentro de 1430px disponibles. Opciones de 44px de alto frente a 36px oficiales.
6. **Evidencia:** capturas polish-reference-login-1440.png y polish-testimonios-login-1440.png; medición repetida en etapa 4.
7. **Validación:** reproducido oficialmente; el caso local y los tres paneles pasan la matriz sin overflow.
8. **Recomendación:** alinear los paneles cercanos al borde y medir sus límites, incluyendo iconos y texto ampliado.
9. **Tipo:** defecto visual reproducido; prevención funcional local verificada.

### NC-N05: Fidelidad de dropdowns y estado abierto

1. **Situación oficial:** opciones de 14px/peso 500/interlínea 20px, padding 8px/12px; panel con padding 6px, radio 8px, borde #1c1b29 y fondo #000115. Hover directo rosa con fondo #1d283a; disparadores sin ese fondo.
2. **Reproducción:** comparar estilos computados a 1440×900 y 1920×900px, zoom 100%, DPR 1 y fuente raíz de 16px.
3. **Impacto:** copiar nombres de utilidades sin considerar sus valores ni las áreas táctiles puede desplazar o alterar el panel.
4. **Testimonios:** se igualaron hover, sombra de dos capas negras al 40% y fondo de foco. El texto rosa persiste mientras aria-expanded sea verdadero. Portales con icono externo de 12px, gap 8px, nueva pestaña protegida y aviso accesible.
5. **Diferencia visual:** margen local 4px frente a 16px oficial: el botón local mide 44px, pero ambos textos terminan en y=42px y ambos paneles empiezan en y=58px. Se conserva la separación visual de 16px; no se copia mt-4. Las opciones mantienen 44px para accesibilidad.
6. **Evidencia:** capturas del pulido y estilos/teclado de etapa 4. En la etapa de pulido se verificó la creación nativa de las dos pestañas con sus documentos pausados; no se intentó autenticación.
7. **Validación:** fidelidad medida y estados comprobados. Color persistente y SVG a la derecha solo en compacto son mejoras deliberadas, no errores atribuidos a la referencia.
8. **Recomendación:** conservar jerarquía visual y foco independiente del hover; advertir nueva pestaña y mantener coherentes los dominios.
9. **Tipo:** diferencias visuales corregidas y mejoras de UX implementadas.

## Footer institucional — etapa 3

Se conserva la composición institucional, descripción, PNG, luces y geometría. La etapa 4 revalida el footer en el conjunto del layout y amplía su matriz a siete anchos.

### NC-F01: Destinos pendientes sin enlaces ficticios

1. **Situación oficial:** Simulaciones abiertas apunta a /#proxima-simulacion, ID no encontrado; Modelo de validación y los dos legales usan #. El fragmento #faq sí existe.
2. **Reproducción:** inspeccionar href y los IDs del documento oficial.
3. **Impacto:** los placeholders aparentan una navegación disponible y pueden mover el scroll sin ofrecer destino.
4. **Testimonios:** mantener los cuatro textos sin href, rol de enlace, foco ni hover interactivo; reutilizar el catálogo para los demás destinos.
5. **Diferencia visual:** textos y orden conservados; pendientes sin interacción.
6. **Evidencia:** HTML compartido, captura footer-reference-375.png, inspección de IDs y semántica final.
7. **Validación:** tratamiento implementado. Las cuatro URLs continúan sin aprobar.
8. **Recomendación:** confirmar destinos con sus responsables; no sustituirlos automáticamente por páginas relacionadas.
9. **Tipo:** navegación pendiente de producto; presentación segura implementada.

### NC-F02: Contraste del copyright

1. **Situación oficial:** copyright de 12px, color #71717a y fondo base #090a15: contraste calculado de 4,08:1.
2. **Reproducción:** medir colores computados a fuente normal y calcular luminancia relativa, incluyendo la composición del fondo.
3. **Impacto:** por debajo del objetivo de 4,5:1 para texto normal.
4. **Testimonios:** copyright y secundarios #a1a1aa, conservando luces y figuras.
5. **Diferencia visual:** copyright más claro; geometría y tipografía permanecen.
6. **Evidencia:** pares de capturas del footer. En etapa 4 se decodificaron fondos PNG sin primer plano, conservando decoraciones: límite inferior de 6,04:1 a 1440px/fuente 16px y 6,15:1 a 320px/fuente 32px.
7. **Validación:** colores y píxeles comprobados. Componer ambas luces al 10% y ambos trazos blancos al 5% simultáneamente da además una cota conservadora de 4,85:1; no es una muestra del copyright oficial.
8. **Recomendación:** ajustar el neutro secundario lo mínimo necesario y revisar los fondos finales, no solo el color base.
9. **Tipo:** contraste insuficiente confirmado sobre el fondo base; mejora local validada.

### NC-F03: Controles sociales y foco

1. **Situación oficial:** enlaces sociales de 40×40px a fuente normal.
2. **Reproducción:** medir los tres enlaces a 375 y 1440px.
3. **Impacto:** área menor al objetivo táctil de 44×44px acordado para Testimonios; 40px por sí solo no demuestra incumplimiento de WCAG.
4. **Testimonios:** áreas de 44×44px, nombres con aviso de nueva pestaña, rel protegido y outline cyan. Decoración aria-hidden, sin eventos y recortada en una capa independiente.
5. **Diferencia visual:** footer 8px más alto: 897,5 frente a 889,5px en 375px; 406 frente a 398px en 1440px. Incluye el enlace de marca de al menos 44px.
6. **Evidencia:** capturas del footer; Tab/Shift+Tab por los diez enlaces y outlines completos verificados.
7. **Validación:** implementación y teclado comprobados; lectores de pantalla pendientes.
8. **Recomendación:** evaluar áreas táctiles y foco con los neutros/hover existentes, sin cambiar los iconos ni la identidad.
9. **Tipo:** mejora deliberada de interacción y accesibilidad.

### NC-F04: Columnas y legales con texto ampliado

1. **Situación oficial:** a 320px/fuente raíz simulada 32px, la fila legal sin wrapping mide 271,156px en un contenedor de 241px; sus textos todavía quedan dentro del footer.
2. **Reproducción:** ampliar style.fontSize y medir la fila y su contenedor.
3. **Impacto:** excede su columna; no se afirma un recorte del texto en esa condición.
4. **Testimonios:** wrapping en legales y filas inferiores, tracks que ceden columnas y altura natural. A fuente normal se mantiene una/dos/cinco columnas con marca de dos tracks.
5. **Diferencia visual:** puede cambiar la cantidad de filas/columnas al ampliar el texto; no se reduce la tipografía ni se fija la altura.
6. **Evidencia:** footer-testimonios-320-text32.png y matriz integral final.
7. **Validación:** 28 combinaciones sin overflow, controles superpuestos ni textos cortados en el footer. Zoom real pendiente.
8. **Recomendación:** permitir crecimiento y wrapping dentro de los contenedores antes de reducir fuente o recortar.
9. **Tipo:** adaptación responsive implementada; observación acotada de la referencia.

## Integración local y corrección durante el QA

### QA-L01: Anclaje del placeholder durante el recorte

1. **Situación:** hallazgo local con scroll del documento; no se atribuye a la web oficial. El placeholder cambia al montar el diálogo y Chrome puede elegirlo como ancla.
2. **Reproducción:** /enviar, 375×800px, categoría Simulación, avanzar sin datos, completar nombre/país/email y elegir una imagen local para el avatar.
3. **Impacto:** el fondo pasaba de scrollY 457 a 483 al abrir el recorte y volvía a 457 al cancelar, aunque no cambiaban la altura del documento ni el área de carga.
4. **Corrección:** una utilidad CSS overflow-anchor:none en el label del área de archivos. No cambia validación, foco, datos, recorte, archivos ni APIs; evita elegir ese subárbol cambiante como ancla.
5. **Diferencia visual:** ninguna en el diseño; desaparece el desplazamiento del fondo.
6. **Evidencia:** medición antes/abierto/cerrado 457/483/457; con la corrección 457/457/457. Regresión repetida en el build final con archivo local.
7. **Validación:** corregido; apertura, Escape, confirmación, previews, datos y foco pasan las regresiones. El placeholder ya existía; no se hizo ejecución completa de dev para atribuirle un origen histórico.
8. **Recomendación:** mantener excluido del anclaje este elemento de geometría cambiante; no agregar otro bloqueo imperativo del body ni sincronizar estado adicional.
9. **Tipo:** corrección menor de integración del scroll, aplicada en etapa 4.

### QA-C01: Ajustes del menú compacto tras revisión humana

1. **Situación local:** los grupos expandibles tenían fuente 16px/interlínea 24px frente a 14px/20px en los enlaces directos; su padding era 0 frente a 8px verticales. Los fondos hover heredados de desktop llegaban al borde izquierdo. La toolbar modal medía 64px incluyendo el borde, frente a 65px totales del header normal. No se atribuyen estos detalles a la web oficial ni se considera la preferencia de hover un fallo de accesibilidad.
2. **Reproducción:** `/enviar`, Chrome 156, zoom 100%, DPR 1 y 375×568px/fuente raíz 16px; medir antes, abierto y cerrado. Se repitió a 1280px y a 320×320px/fuente 32px. La scrollbar reservaba 10px; aunque clientWidth cambiaba al bloquear, el ancho efectivo del header y diálogo seguía siendo 365px a viewport 375px. No había desplazamiento horizontal causado por la scrollbar.
3. **Impacto:** jerarquía tipográfica inconsistente y desplazamiento vertical del logo/cierre de 0,5px. Abrir/cerrar era inmediato y pulsar el fondo visible no cerraba el menú.
4. **Corrección local:** enlaces principales y disparadores comparten 0,875rem/500, interlínea 1,25rem, padding 8px/0 y mínimo de 44px; las opciones mantienen sangrado de 16px, línea e indicadores externos. Compacto usa hover rosa sin fondo, limitado a hover/puntero fino, y outline cyan independiente. Toolbar de 65px incluyendo borde, sin transforms compensatorios. Fade de panel y backdrop de 190ms con `@starting-style`, `display`/`overlay` y `allow-discrete`, limitado por `@supports`. Sin animar alturas ni retrasar el cierre mediante JavaScript; los grupos se restablecen al abrir, evitando su colapso durante la salida.
5. **Cierre exterior:** `closedby="any"` nativo. Si falta la propiedad DOM `closedBy`, el fallback exige inicio y final fuera del rectángulo y descarta movimientos de más de 8px y pointercancel. Dentro, padding y disclosures permanecen interactivos. La modalidad nativa impide activar la página de fondo; X, Escape, foco y bloqueo se conservan. Si el panel llena el viewport, no hay fondo exterior visible: se usan X o Escape.
6. **Diferencia visual y evidencia:** logo a 375px: `(16;19,5;142,484;24)` → `(16;20;142,484;24)`; cierre `(305;9,5;44;44)` → `(305;10;44;44)`. Coinciden con el header normal y también tras cerrar. En 1280px se corrige el mismo medio píxel, sin cambio de ancho. Capturas locales comparables [antes](./assets/official-chrome/compact-ux-before-375.png) y [después](./assets/official-chrome/compact-ux-after-375.png): misma ruta, viewport, fuente y grupos cerrados; el trazo decorativo está animado y puede tener distinta fase. En QA-C01 desktop conservaba sus fondos; QA-C02 retira posteriormente el fondo hover de los enlaces principales por decisión visual aprobada, sin alterar tipografía ni distribución.
7. **Validación:** 28 combinaciones de los siete anchos/fuentes del QA integral; tres grupos expandidos en compacto y tres dropdowns en desktop, sin overflow. Tab/Shift+Tab completos a 320×320px/fuente 32px; Enter, Espacio, Escape, clic interior/exterior, toque emulado, cuatro ciclos X, cambio de breakpoint y scroll previo conservado. Native light-dismiss y fallback simulado probados por separado, sin click-through. A 60ms se midió opacidad intermedia en ambos sentidos; a 240ms el cierre ya era `display:none`/`overlay:none`. La altura expandida permanece durante la salida. Movimiento reducido elimina fade y señal. No hay errores de JavaScript ni intentos de escritura de negocio.
8. **Regresiones y límites:** formulario de cinco pasos, error y foco bajo header, recorte confirmado con PNG local, datos/resumen conservados al retroceder y al usar navegación, desktop/hover y composición del footer comprobados. En esta ejecución la consulta pública mostró su estado de error; búsqueda, carrusel y fotografía de ficha vivos no pudieron revalidarse, a diferencia de la etapa 4 anterior. No se enviaron formularios. TypeScript, ESLint y build correctos; lint general conserva únicamente el warning previo de landing-contratar. Zoom real, lectores de pantalla y navegadores distintos de Chrome siguen pendientes. El fallback se simuló desactivando la detección de soporte y el light-dismiss nativo; no constituye una prueba de Safari.
9. **Recomendación:** revisar visualmente esta corrección local antes del PR. La homogeneidad de tipografía/hover es una decisión de UX de Testimonios; para proponerla al sitio oficial debe evaluarse con su equipo. La adopción de cierre exterior y animación nativos debe conservar una degradación funcional y probarse en sus navegadores objetivo.

Compatibilidad consultada: [atributo y animación de dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [closedBy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy) y [light dismiss en HTML](https://html.spec.whatwg.org/multipage/interactive-elements.html#dialog-light-dismiss). `closedBy` y `overlay` no tienen soporte universal; no se depende de ellos para poder cerrar o usar el menú. Los navegadores sin las transiciones discretas utilizadas conservan la apertura/cierre inmediatos.

### QA-C02: Layout durante el cierre y hover desktop

1. **Situación local:** la revisión humana detectó un fotograma desacomodado al cerrar el menú. Es un bug de Testimonios introducido con la animación de QA-C01, no un defecto atribuido a la referencia oficial. La eliminación del fondo hover desktop es una preferencia visual solicitada, no una corrección de accesibilidad.
2. **Reproducción:** Chrome 156, `/enviar`, 375×568px, fuente raíz 16px. Abrir el modal, esperar la entrada y pulsar X. Registrar por requestAnimationFrame `open`, estilos computados, rectángulos de hijos, scroll y eventos de cierre/transición. Se capturó además el fotograma de salida con el reloj de animación de Chrome pausado.
3. **Causa e impacto:** `flex-direction:column` estaba condicionado a `[open]`. `close()` retira el atributo inmediatamente, mientras la transición discreta mantiene `display:flex` y `overlay:auto` durante el fade. La dirección volvía a `row`: navegación de `(0;65;365;412)` a `(234,484;0;130,516;492)`, logo de y=20 a y=233,5 y panel de 477 a 492px de alto. Permanecía fijo y montado; no hubo retorno al flujo normal, reapertura ni doble cierre. Medir solo opacidad o altura con grupos expandidos en el QA anterior no detectaba esta pérdida de disposición.
4. **Corrección mínima:** mover `flex-direction:column` al estilo base del diálogo y conservar `[open]` para `display`/opacidad. No cambiar duración, métodos nativos, estado React, fallback, foco, scroll ni añadir temporizadores. Retirar únicamente la regla de fondo hover de `.desktop .directLink` y `.desktop .liveLink`; conservar rosa, estado expandido y outline cyan.
5. **Diferencia visual:** ninguna en las dimensiones o distribución habituales; desaparece la disposición horizontal transitoria al cerrar. Los enlaces principales desktop tienen hover rosa sin rectángulo gris/azulado, diferencia deliberada respecto de la referencia. Los paneles de dropdown conservan sus propios estados.
6. **Evidencia:** capturas internas [antes](./assets/official-chrome/close-layout-before-375.png)/[después](./assets/official-chrome/close-layout-after-375.png), misma ruta, viewport, fuente y salida pausada. Tras la corrección, todos los fotogramas visibles mantienen dirección column, logo `(16;20;142,484;24)`, navegación `(0;65;365;412)` y panel 365×477px. La opacidad desciende hasta 0 y finaliza con `display:none`/`overlay:none`; el nodo no se desmonta.
7. **Validación:** 15 casos de cierre disponibles en 320×320px con fuente 16/32px, 375×568px con fuente 16/32px, 768px y 1280px, con geometría estable en cada fotograma visible. X produce una llamada JS y un evento close; Escape y light-dismiss nativos producen un cierre sin llamadas JS duplicadas. Foco/ARIA, Tab/Shift+Tab, Enter/Espacio, clic interior, arrastre dentro-fuera, cambios de breakpoint, repetición rápida, scroll y movimiento reducido comprobados. La página vuelve a recibir clics tras finalizar la salida. Desktop a 1440px conserva dimensiones y disclosures; enlaces directos/live transparentes en hover, texto rosa y foco cyan.
8. **Límites y verificaciones técnicas:** Chrome automatizado; Safari/Firefox, lectores de pantalla, zoom real y revisión visual humana siguen pendientes. TypeScript, ESLint y build correctos; el primer build encontró sintaxis inválida en tipos generados de `.next/dev/types`, corregida al regenerarlos mediante Next sin editar código de aplicación. ESLint general conserva el warning previo de landing-contratar. Sin escrituras de negocio ni cambios en destinos, formulario, footer, consultas o dependencias.
9. **Recomendación:** revisar visualmente el cierre corregido antes del PR. La regla general que puede compartirse con el equipo oficial es mantener los estilos estructurales durante toda la transición; no se afirma que su navbar tenga este mismo bug.

## Propuestas todavía pendientes

### NC-E01: Nomenclatura compacta

1. **Situación oficial:** etiquetas Para Empresas, Para instituciones y Para Talento.
2. **Reproducción:** observar la navegación institucional a cualquier ancho donde se presente.
3. **Impacto potencial:** repetir Para ocupa espacio; retirarlo podría equilibrar la fila, pero reducir claridad de audiencia.
4. **Testimonios:** ninguna modificación aplicada; se propone evaluar Empresas, Instituciones y Talento.
5. **Diferencia visual:** ninguna actualmente.
6. **Evidencia:** catálogo tipado y capturas vigentes conservan las etiquetas originales.
7. **Validación:** propuesta editorial sin aprobación; no se presenta como mejora comprobada.
8. **Recomendación:** revisar capitalización, nomenclatura institucional y títulos de destino. Talento/Empresas también nombran portales en Iniciar sesión: distinguir navegación institucional de acceso a cuentas.
9. **Tipo:** decisión editorial del equipo; no sustituye la adaptación responsive.

## Evidencias y capturas

Todas permanecen en docs/ui/assets/official-chrome/, fuera de public/. No se eliminaron ni sobrescribieron capturas anteriores.

| Comparación | Referencia oficial | Testimonios | Condiciones / estado |
| --- | --- | --- | --- |
| Header desktop | [Referencia](./assets/official-chrome/reference-desktop.png) | [Local](./assets/official-chrome/testimonios-desktop.png) | 1440px/fuente 16px; etapa 2, estado cerrado. |
| Texto ampliado | [Referencia](./assets/official-chrome/reference-text24.png) | [Local](./assets/official-chrome/testimonios-text24.png) | 1440px/fuente raíz simulada 24px. |
| Menú alto | [Referencia](./assets/official-chrome/reference-mobile-expanded.png) | [Local](./assets/official-chrome/testimonios-mobile-expanded.png) | 375×568px, tres grupos abiertos; captura histórica previa al movimiento del indicador local. |
| Footer mobile | [Referencia](./assets/official-chrome/footer-reference-375.png) | [Local](./assets/official-chrome/footer-testimonios-375.png) | 375px/fuente 16px; viewport de 900px de alto. |
| Footer desktop | [Referencia](./assets/official-chrome/footer-reference-1440.png) | [Local](./assets/official-chrome/footer-testimonios-1440.png) | 1440px/fuente 16px; viewport de 900px de alto. |
| Sesión después del pulido | [Referencia](./assets/official-chrome/polish-reference-login-1440.png) | [Local](./assets/official-chrome/polish-testimonios-login-1440.png) | 1440×900px/fuente 16px; panel abierto, recorte superior de 220px. |

Evidencia adicional: [footer a 320px/fuente 32px](./assets/official-chrome/footer-testimonios-320-text32.png) y [menú compacto del pulido previo de 375×568px](./assets/official-chrome/polish-testimonios-mobile-375.png). El ajuste posterior QA-C01 agrega dos capturas locales [antes](./assets/official-chrome/compact-ux-before-375.png)/[después](./assets/official-chrome/compact-ux-after-375.png), sin reemplazar las 14 anteriores.

Las comparaciones usan Chrome, zoom 100% y DPR 1. El contenido detrás del chrome pertenece a páginas distintas. La captura del footer oculta temporalmente el header para evitar superposición sticky; las del pulido local fijan movimiento reducido. El ancho útil difiere 5px por los scrollbars propios de cada aplicación. Las mediciones finales revalidan proporciones: logo móvil 142,484×24px y desktop 189,984×32px; a 1280px la referencia comprime el logo a 181,969×32px, deformación que Testimonios no copia.

## Cierre y revisión humana

**Recomendación:** lista para PR con observaciones de QA manual. No se encontraron bloqueos técnicos del chrome después de la corrección QA-L01. La decisión de crear o aprobar el PR corresponde al equipo; no se ejecutaron operaciones Git de escritura.

Pendientes: aprobación visual final, zoom real y preferencias de fuente, lectores de pantalla, Safari/iOS y Firefox, reproducción remota de YouTube y flujo real de envío. Los cuatro destinos pendientes del footer y la propuesta editorial requieren confirmación. No se certifican autenticación del panel, Storage ni políticas de publicación desde esta tarea.

La revisión de alcance se basa en la referencia local origin/dev disponible. Si el remoto cambia, corresponde evaluar esa nueva base antes de integrar. Las observaciones sobre la web oficial son propuestas constructivas con condiciones y evidencia concretas, no una exigencia de trasladar toda la arquitectura de Testimonios.
