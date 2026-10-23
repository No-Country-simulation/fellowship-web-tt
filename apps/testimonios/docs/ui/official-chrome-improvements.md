# Chrome oficial: propuesta de mejoras desde Testimonios

**Revisión:** 23 de octubre de 2026. **Alcance implementado:** adaptación al scroll del documento, navbar y footer institucional. La etapa 3 no sustituye la revisión humana ni inicia la etapa 4 de QA integral.

Este documento propone alternativas al equipo de la [web oficial](https://www.nocountry.tech/). Busca conservar su identidad visual y aportar evidencia reproducible. No es una auditoría completa del sitio ni implica que todas las soluciones deban trasladarse automáticamente: la navegación modal, el layout y las necesidades de cada aplicación requieren evaluación propia.

## Referencia visual preservada

Se reutiliza el logo existente y DM Sans. La fila mide 64px más 1px de borde, con fondo `rgba(3, 7, 17, 0.8)`, blur de 12px y padding horizontal de 16px. Los enlaces desktop conservan 14px/20px con fuente raíz de 16px, color `#e1e7ef`, hover rosa y desplegables oscuros. Los neutros específicos se aíslan en un CSS Module; no se remapean tokens globales ni se copia CSS compilado del sitio oficial.

Referencia, 1440px:

![Navbar oficial en desktop, fuente raíz de 16px](./assets/official-chrome/reference-desktop.png)

Testimonios, mismas condiciones:

![Navbar de Testimonios en desktop, fuente raíz de 16px](./assets/official-chrome/testimonios-desktop.png)

## Problemas reproducidos y alternativas implementadas

| Condición observada en la referencia | Alternativa en Testimonios | Beneficio y diferencia deliberada |
| --- | --- | --- |
| A 1440px, cambiando la fuente raíz a 24px, el documento mide 1583px de ancho frente a 1425px disponibles; el header crece a 97px. | Se mide el ancho real del logo, navegación, acciones y gaps. Desde 1280px se habilita desktop solo si todo cabe; en caso contrario aparece el botón de navegación compacta. | Mantiene el tamaño del texto y evita recortar enlaces. A 1280px y fuente normal puede mostrarse compacto; no se comprime la tipografía para forzar la fila. |
| A 375×568px, con los tres grupos móviles abiertos, el header inline mide 730px. Su posición sticky deja enlaces fuera del viewport al desplazar la página. | Diálogo nativo limitado a `100dvh`, toolbar estable y navegación vertical con scroll interno. | Todos los destinos siguen disponibles en pantallas bajas. Es una navegación modal sobre el contenido, a diferencia de la expansión inline de la referencia. |
| El botón móvil del HTML de referencia se identifica como “Toggle menu”, sin `aria-expanded` ni `aria-controls`. | Botón “Abrir navegación” con estado, asociación al diálogo y nombre accesible. Cerrar y Escape devuelven el foco. | Comunica propósito y estado; no cambia el icono visible de la referencia. |
| Los desplegables de la referencia utilizan roles `menu`/`menuitem`. | Disclosure Navigation: botones con estado y listas de enlaces; Tab/Shift+Tab nativos, Enter/Espacio y Escape. | El contrato de teclado corresponde a navegación web. No se afirma que los roles aislados demuestren por sí mismos un incumplimiento del sitio oficial. |

La primera medición es una **simulación mediante `document.documentElement.style.fontSize`**, no una prueba de las preferencias reales de fuente ni de zoom del navegador. Esas comprobaciones manuales permanecen pendientes.

Fuente raíz de 24px en la referencia:

![Referencia a 1440px con fuente raíz de 24px: enlaces extendidos más allá del viewport](./assets/official-chrome/reference-text24.png)

Testimonios en las mismas condiciones:

![Testimonios a 1440px con fuente raíz de 24px: versión compacta sin recortes](./assets/official-chrome/testimonios-text24.png)

Menú oficial con tres grupos abiertos a 375×568px:

![Parte visible del menú oficial expandido, más alto que el viewport](./assets/official-chrome/reference-mobile-expanded.png)

Testimonios, mismos grupos y viewport:

![Diálogo móvil de Testimonios con navegación desplazable y cierre visible](./assets/official-chrome/testimonios-mobile-expanded.png)

## Decisiones propias de Testimonios

- El header y el layout permanecen en servidor; `SiteNavigation` concentra los eventos y el estado cliente. El catálogo tipado evita duplicar destinos entre desktop y móvil.
- Los destinos institucionales son absolutos. Los portales mantienen `talent.nocountry.tech` y `companies.nocountry.tech`; no se reescriben sus rutas de inicio. Los CTA y enlaces locales continúan usando `next/link`.
- Se verificaron los 14 destinos del catálogo mediante HEAD: todos terminan en HTTP 200; los dos portales redirigen a sus entradas actuales. `#live` existe en el HTML oficial. No se incorporan placeholders ni fragmentos sin verificar.
- Se conserva un solo grupo abierto en desktop. Clic exterior y salida de foco cierran sin robarlo; Escape devuelve el foco al disparador. Los paneles cerrados quedan inertes y fuera del árbol accesible durante su salida.
- Los controles y enlaces de los desplegables tienen un mínimo de 44px. Esto puede aumentar moderadamente la altura de los popups frente a la referencia. El de sesión se alinea al borde derecho y los paneles limitan su altura disponible.
- El diálogo móvil reutiliza el bloqueo de scroll y el gutter estable de la etapa anterior. Una guarda local envuelve Tab/Shift+Tab: Chrome permitía alcanzar el documento al completar el recorrido de un diálogo nativo sin esa guarda. Esta es una necesidad de la variante modal de Testimonios, no un defecto atribuido al menú inline oficial.
- Al cambiar de modo se cierra el contenido incompatible y se conserva el foco en un control visible, sin remontar el formulario. La altura real del header actualiza el offset global; `focusAndReveal()` sigue midiéndola directamente.
- El indicador de simulación es decorativo y enlaza a `/#live`; no anuncia datos dinámicos ni consulta un servicio. El trazo y las transiciones se detienen con `prefers-reduced-motion`.

## Evidencia de QA y límites

Pruebas en Chrome headless 156 sobre Windows y el build de producción de localhost, con perfil temporal limpio y bloqueo de solicitudes distintas de GET/HEAD. No se enviaron formularios ni se alteraron registros. La ejecución final completó 228 comprobaciones del navbar y 20 de integración sin fallos ni excepciones de JavaScript en el navegador. Una comprobación adicional de las tres rutas registró cero errores de consola y de hidratación.

- Matriz del navbar: 320, 375, 768, 1024, 1280, 1440, 1536 y 1920px con fuentes raíz de 16, 20, 24 y 32px.
- A 1440px con fuente raíz de 24px, Testimonios conserva 1430px de ancho disponible y de documento, header de 65px y modo compacto. A 375×568px con todos los grupos abiertos, el diálogo mide 568px: su navegación desplaza 812px de contenido dentro de 504px, sin overflow horizontal (355px disponibles y de contenido).
- Geometría del header sticky, ausencia de overflow horizontal del navbar, cambio automático a compacto, bloqueo/restauración del documento y scroll local del diálogo.
- Apertura/cierre de los tres grupos desktop, exclusividad, clic exterior, salida de foco, Enter/Espacio, Tab/Shift+Tab, Escape y retorno de foco.
- Diálogo a 320×320px con fuente raíz de 32px y todos los grupos abiertos; recorrido completo de teclado y cambio a desktop con el modal abierto.
- IDs ARIA y SVG únicos, controles asociados, paneles inertes, foco visible y movimiento reducido.
- Regresión de búsqueda, filtros, contador, estados vacíos y navegación del carrusel. En `/enviar`, cinco pasos, errores, altura real del header, datos conservados y recorte. En la ficha, fotografía ampliable, Escape, foco y posición. Los envíos reales quedan excluidos.
- TypeScript, ESLint, build y `git diff --check` finalizaron correctamente. ESLint general conserva el warning conocido de `landing-contratar`, ajeno a este cambio.

Las capturas muestran solo el navbar para separar la comparación de las diferencias de contenido entre sitios. Las comprobaciones geométricas y de teclado no sustituyen la aprobación visual humana ni certifican accesibilidad completa. Quedan pendientes zoom real, preferencias de fuente del navegador, lectores de pantalla, Safari/iOS y Firefox.

El servidor de Next registró `The destination stream closed early` en el contexto de las sesiones de QA que se cierran e interrumpen peticiones. El mismo mensaje se observó en la etapa de scroll anterior al navbar; no se atribuye a esta implementación. Conviene observar también el uso habitual en localhost sin esos cierres automatizados.

## Footer institucional — etapa 3

Se conserva la composición de la [referencia oficial](https://www.nocountry.tech/): fondo `#090a15`, contenedor de hasta 1280px a fuente normal, espaciados, columnas, descripción institucional, logo PNG, trazados sociales, luces y geometría decorativa. `SiteFooter` permanece en servidor y reutiliza el catálogo tipado del navbar. No introduce dependencias, estado ni consultas.

### Observaciones verificadas y propuestas

| Evidencia en la referencia | Implementación en Testimonios | Alcance y beneficio |
| --- | --- | --- |
| “Simulaciones abiertas” apunta a `/#proxima-simulacion`, pero ese ID no existe en el documento consultado. “Modelo de validación” y los dos legales apuntan a `#`. `#faq` sí existe. | Se conservan los cuatro textos pendientes, sin enlaces, eventos ni foco artificial. Los demás destinos son absolutos y reutilizan el catálogo. | Evita aparentar una navegación disponible. Las URLs pendientes requieren confirmación del equipo, no una sustitución por páginas relacionadas. |
| Copyright de 12px, color `#71717a` y fondo base `#090a15`: contraste calculado de 4,08:1, inferior a 4,5:1 para texto normal. | Copyright y textos secundarios usan `#a1a1aa`. | Las luces y figuras se mantienen. El peor fondo de las capturas de Testimonios a 375 y 1440px da un límite inferior de 6,04:1 para esos textos. Componer ambas luces al 10% y ambos trazos blancos al 5%, simultáneamente y a opacidad máxima, mantiene al menos 4,85:1. Este último valor es una cota conservadora calculada, no una muestra del copyright oficial. |
| Los tres enlaces sociales miden 40×40px a fuente raíz de 16px. | Controles de 44×44px, nombres con aviso de nueva pestaña y foco visible. | Aumenta el área táctil solicitada. La medida original de 40px no implica por sí sola un incumplimiento de WCAG. |
| A 320px y fuente raíz simulada de 32px, la fila legal sin wrapping mide 271,156px dentro de un contenedor de 241px. Sus textos todavía quedan dentro del footer: no se afirma un recorte del texto en ese caso. | Fila legal con wrapping; grilla con tracks que ceden columnas cuando crece el texto. | Mantiene el contenido dentro de su columna sin reducir la fuente ni fijar alturas. La matriz de Testimonios no presentó desbordamientos. |

Los fondos se midieron en capturas PNG sin el contenido frontal, conservando las luces y figuras en la sesión de prueba. Se decodificaron los píxeles y se tomó la mayor luminancia del fondo como límite conservador para el contraste de los textos. El fondo de los botones sociales se trata aparte del texto secundario, y sus iconos mantienen contraste suficiente con su superficie.

### Diferencias visuales deliberadas

- Logo de 237,484×40px en ambos sitios a 375 y 1440px. El enlace local tiene un mínimo de 44px de alto; el recurso PNG no se modifica.
- Footer local 8px más alto a fuente normal: 897,5px frente a 889,5px a 375px, y 406px frente a 398px a 1440px. Corresponde al enlace de marca y a los controles sociales de 44px.
- Copyright más claro y destinos pendientes sin hover ni interacción. Se conservan sus textos, ubicación y tipografía.
- A fuente ampliada, la grilla puede tener menos columnas y los legales pueden pasar de fila. A fuente normal se mantiene la distribución oficial.
- Las capturas tienen 5px de diferencia en el ancho disponible por los scrollbars preexistentes de ambas aplicaciones. No se modifica el scrollbar para esta etapa.

### Capturas comparativas

Capturadas en Chrome 156, viewport de 900px de alto, DPR 1 y fuente raíz de 16px. Se oculta temporalmente el header solo durante la captura del footer para evitar su superposición sticky; no se cambia su implementación. Los enlaces de los sitios externos no se activaron.

| Ancho | Referencia | Testimonios |
| --- | --- | --- |
| 375px | [Footer oficial](./assets/official-chrome/footer-reference-375.png) | [Footer de Testimonios](./assets/official-chrome/footer-testimonios-375.png) |
| 1440px | [Footer oficial](./assets/official-chrome/footer-reference-1440.png) | [Footer de Testimonios](./assets/official-chrome/footer-testimonios-1440.png) |

[Testimonios a 320px y fuente raíz de 32px](./assets/official-chrome/footer-testimonios-320-text32.png).

### QA realizado y límites de la evidencia

- Build de producción, Chrome headless y perfil limpio. Las solicitudes del navegador distintas de GET/HEAD se bloquearon; no se enviaron formularios ni se modificaron registros.
- 24 combinaciones: 320, 375, 768, 1024, 1280 y 1440px × fuentes raíz simuladas de 16, 20, 24 y 32px. Sin desbordamiento horizontal de página, footer ni sus textos.
- Tab y Shift+Tab por los diez enlaces del footer, foco de 2px visible a 320×320px y fuente de 32px, nombres sociales, destinos HTTPS, nuevas pestañas protegidas y tres grupos de navegación identificados.
- Movimiento reducido, menú móvil abierto sobre el footer a 375×320px y fuente de 24px, grupos expandibles, bloqueo del documento, Escape, foco y restauración de posición. Orientación horizontal a 768×375px con fuente de 32px.
- Las tres rutas conservan el footer después de su contenido y el scroll del documento. Se recorrieron los cinco pasos del formulario con archivos locales: error de avatar y foco bajo el header, recortes, resumen y persistencia al retroceder, sin enviar.
- Ficha publicada: fotografía ampliable, Escape, bloqueo/restauración de scroll y retorno de foco. La ruta inexistente conserva el footer.
- Éxito del formulario y error de `PageShell`: renderizados aislados de los componentes reales para comprobar posición y crecimiento flexible del layout. No representan un envío real ni un fallo provocado del backend.
- Cero errores de JavaScript en las ejecuciones finales del footer y de integración. TypeScript, ESLint general y build correctos; solo permanece el warning preexistente de `landing-contratar`.

El servidor volvió a registrar `The destination stream closed early` durante estas sesiones de QA. Es el mismo mensaje documentado en las etapas anteriores; no apareció como error de JavaScript del navegador ni se atribuye al footer. Queda observar el uso manual habitual sin cierres automatizados de páginas.

La simulación de fuente raíz y las capturas no sustituyen zoom real, preferencias de fuente, lectores de pantalla o pruebas en otros navegadores. La revisión visual humana y esas comprobaciones permanecen pendientes. Esta propuesta registra alternativas para evaluar con el equipo oficial; no presupone que deban trasladarse automáticamente a su aplicación.

## Pulido visual y UX del navbar

Comparación de los tres dropdowns en Chrome 156 con perfiles limpios, viewports de 1440×900 y 1920×900px, zoom 100%, DPR 1 y fuente raíz de 16px. Se midieron estilos computados y geometría; no se trasladaron utilidades Tailwind suponiendo sus valores. El footer, layout, formulario y catálogo de destinos permanecen intactos en este pulido.

### Diferencias visuales corregidas

| Elemento | Referencia medida | Ajuste local |
| --- | --- | --- |
| Hover de enlaces directos | Texto `rgb(236,70,153)` y fondo `rgb(29,40,58)` | El texto ya coincidía. Se reemplaza el fondo blanco al 5% por `#1d283a`, sin aplicarlo a los disparadores. |
| Sombra de los paneles | Dos capas negras al 40%: `0 10px 15px -3px` y `0 4px 6px -4px` | Se sustituye la capa única sin spread por esas dos capas. |
| Opciones con foco visible | Texto blanco y fondo blanco al 5% | Se agrega el fondo que faltaba al enfocar, conservando el outline cyan local. Hover mantiene los mismos colores. |
| Acceso a portales | Icono externo de 12px, gap de 8px y `target="_blank"` protegido | El checkout inicial no tenía iconos y abría en la misma pestaña. Se incorporan el indicador y la apertura equivalente a la referencia, con aviso accesible. |

No se modifican valores que ya coinciden en los elementos visibles:

| Propiedad | Oficial y Testimonios, fuente raíz de 16px |
| --- | --- |
| Padding del panel | 6px |
| Padding de cada opción | 8px vertical / 12px horizontal |
| Tipografía de las opciones | 14px, peso 500, interlínea 20px |
| Fondo / borde del panel | `#000115` / 1px `#1c1b29` |
| Texto de las opciones | `#9ca3af` |
| Radio del panel / opciones | 8px / 6px |

**Separación del panel:** la referencia tiene un botón de 20px de alto, cuyo texto termina en `y=42px`, y margen de 16px: el panel empieza en `y=58px`. Testimonios conserva el botón accesible de 44px: su caja termina en `y=54px`, pero el texto también termina en `y=42px`. El margen local de 4px coloca el panel en los mismos `y=58px`, con 16px visuales desde el texto. Copiar `mt-4` desplazaría innecesariamente el panel 12px hacia abajo. Se conserva el margen local y se documenta su propósito.

Las opciones locales conservan un mínimo de 44px frente a los 36px medidos en la referencia. Por ello los paneles locales son más altos; es una diferencia deliberada de accesibilidad, no un padding incorrecto. El ancho del panel de sesión pasa de 102,938 a 122,938px al incorporar los iconos, igualando su ancho oficial a fuente normal.

### Mejoras funcionales verificadas

- Disparadores rosas mientras `aria-expanded="true"`, incluso al retirar el puntero. Los cerrados conservan su color normal cuando no hay hover. El foco continúa comunicándose mediante el outline cyan, independientemente de hover y apertura.
- Los portales conservan `talent.nocountry.tech` y `companies.nocountry.tech`, con `target="_blank"` y `rel="noopener noreferrer"`. El SVG es decorativo y el texto accesible avisa que se abre otra pestaña. Se comprobó la creación nativa de ambas pestañas con su ejecución pausada mediante CDP; no se inició sesión ni se probó un flujo autenticado.
- El panel de sesión conserva su alineación al borde derecho y los límites de ancho. Los iconos no se comprimen y el texto móvil puede envolver sin desbordar.
- Solo en compacto, el SVG de “Simulación en curso” se coloca a la derecha mediante `order`. El comienzo del texto coincide con el de los enlaces directos, conservando su nombre accesible, URL, SVG y soporte de movimiento reducido. Desktop no cambia su orden.
- Disclosure Navigation, exclusividad desktop, clic exterior, Tab/Shift+Tab, Enter/Espacio, Escape y retorno de foco se mantienen.

### Problema reproducido en la web oficial

Abrir “Iniciar sesión” genera una barra horizontal a fuente normal: el panel está alineado a la izquierda del disparador y su borde derecho supera el ancho disponible. La altura útil del viewport pasa de 900 a 885px, confirmando la presencia de la barra, además del incremento de `scrollWidth`.

| Viewport | Ancho disponible | Documento cerrado → abierto | Borde derecho del panel |
| --- | --- | --- | --- |
| 1280px | 1265px | 1265 → 1270px | 1269,797px |
| 1440px | 1425px | 1425 → 1430px | 1429,797px |
| 1920px | 1905px | 1905 → 1910px | 1909,797px |

A 1440px y fuente raíz simulada de 24px existe además desbordamiento del header antes de abrir el panel: 1583px de documento frente a 1425px disponibles; abrirlo aumenta el documento a 1613px. Se distingue el problema previo del header del incremento debido al dropdown.

Testimonios no reproduce ese desbordamiento: a 1440px y fuente de 16px, documento y ancho disponible miden 1430px; el panel termina en 1414px. A 1920px, el panel termina en 1894px dentro de 1910px disponibles, con fuentes de 16, 20 y 24px. Cuando falta espacio se utiliza el menú compacto ya implementado.

### Propuesta editorial pendiente de aprobación

Evaluar **Empresas**, **Instituciones** y **Talento** en lugar de “Para Empresas”, “Para instituciones” y “Para Talento”. Son etiquetas más breves, equilibran la fila y reducen la repetición de “Para”.

La decisión requiere revisar la nomenclatura del sitio oficial, capitalización y consistencia con las páginas de destino. “Talento” y “Empresas” también identifican portales dentro de “Iniciar sesión”; conviene conservar clara la diferencia entre navegación institucional y acceso a cuentas. Esta propuesta no sustituye la adaptación responsive ni está aprobada: **no se cambió ninguna de esas tres etiquetas ni sus destinos**.

### Evidencias y alcance del QA

| Evidencia | Captura |
| --- | --- |
| Dropdown oficial de sesión, 1440px | [Referencia](./assets/official-chrome/polish-reference-login-1440.png) |
| Dropdown local de sesión, 1440px | [Testimonios](./assets/official-chrome/polish-testimonios-login-1440.png) |
| Menú compacto local, 375×568px | [Indicador a la derecha y texto alineado](./assets/official-chrome/polish-testimonios-mobile-375.png) |

Las capturas recortan el área de navegación; la barra horizontal oficial se fundamenta en las mediciones de ancho y alto útil anteriores. El contenido de las páginas detrás del navbar es distinto. Las capturas finales locales usan movimiento reducido para fijar el SVG decorativo.

- Build de producción y Chrome headless: 28 combinaciones de 320, 375, 768, 1024, 1280, 1440 y 1920px × fuentes raíz simuladas de 16, 20, 24 y 32px. Sin overflow de página, paneles ni opciones: se abre el panel de sesión en desktop y los tres grupos en compacto. Los tres dropdowns desktop se comprueban por separado a 1440px y fuente normal.
- Tres dropdowns desktop: estilos computados, hover, apertura con texto rosa sin hover, foco de opciones, Enter/Espacio, Tab/Shift+Tab, Escape, paneles cerrados inertes, exclusividad y clic exterior.
- Modal a 320×320px y fuente de 32px: recorrido completo de teclado, retorno en ambos extremos y restauración del foco. Se verifica el orden visual del SVG móvil y desktop y la detención de la animación con movimiento reducido.
- Ambos enlaces de portal crean pestañas nativas; la ejecución de sus documentos queda pausada y se cierran sin probar autenticación. No se enviaron formularios ni se activaron acciones del backend.
- Cero errores de JavaScript en la ejecución final. TypeScript, ESLint general, build y `git diff --check` correctos; permanece únicamente el warning preexistente de `landing-contratar`.

Quedan para revisión humana la fidelidad visual final, zoom real, preferencias de fuente y lectores de pantalla. La simulación mediante `style.fontSize` y las pruebas de Chrome no certifican esos escenarios ni otros navegadores.
