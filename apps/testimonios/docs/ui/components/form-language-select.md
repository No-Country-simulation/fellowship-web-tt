# FormLanguageSelect

Selector nativo exclusivo del formulario, montado en el [FormHeader](./form-header.md).

```tsx
import { FormLanguageSelect } from "@/components/form-language-select";
```

No recibe props: requiere `FormLocaleProvider` y consume su locale, traductor y función de cambio. Montar **una sola instancia**, en `FormHeader`, fuera de la rama de éxito de `EnviarForm`. El grupo público conserva su navbar y footer independientes.

`FormLocaleProvider` recibe `initialLocale` y `children`, no genera un wrapper DOM y usa `useSearchParams` como fuente de verdad. El cambio llama a History API `replaceState`, conservando query ajeno y fragmento. No recarga ni crea otro wizard. El provider requiere el límite de Suspense que compone `app/enviar/page.tsx`; la página espera el query para render inicial y metadata.

El label se traduce; los nombres «Español» y «Português (Brasil)» llevan sus propios atributos `lang`, sin banderas. En el header móvil el label queda visualmente oculto, conservando el nombre accesible; es visible en desktop. Header, `<main>` y diálogo declaran el idioma vigente; navbar y footer públicos conservan el idioma del sitio.

El selector permanece **exclusivamente en FormHeader**, incluso con recorte abierto. No hay portal, host ni setter en el provider, y el diálogo no contiene otro select. La modalidad nativa deja el header inerte: para cambiar idioma, cancelar o terminar el recorte y usar el selector del header. El diálogo usa el locale vigente al abrirse; no se añade estado ni lógica de imagen.

El padding de scroll raíz reserva la altura del sticky para el contenido. `form-header.module.css` aplica solo al select `scroll-margin-block-start: calc(-1 * (var(--site-header-height, 0px) + 16px))`, evitando que el foco nativo vuelva a revelar un control ya visible en esa zona reservada. Mantiene click, teclado, foco y select nativo; no añade scrollTo, preventDefault, recarga o navegación. Los offsets legítimos del contenido permanecen.

No usar el locale como key. La URL conserva solo la preferencia de idioma: no existe borrador persistido. El consentimiento PT sigue pendiente de revisión editorial/legal antes del lanzamiento.

El borde vuelve al token oficial `border`; el foco conserva outline cyan. El contraste insuficiente de ese borde queda registrado como FAIL por decisión de fidelidad al Design System, sin alterar tokens globales ni umbrales de QA.

QA actual, registros antes/después y limitación del popup nativo en headless: [auditoría de i18n](../../form-i18n-audit.md#0g-ajustes-finales-de-ux-y-fidelidad-al-design-system). Las etapas 3–4 conservan la decisión histórica del portal, ya retirada.
