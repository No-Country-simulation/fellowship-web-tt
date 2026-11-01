# FormLanguageSelect

Selector nativo exclusivo del formulario, montado en el [FormHeader](./form-header.md).

```tsx
import { FormLanguageSelect } from "@/components/form-language-select";
```

No recibe props: requiere `FormLocaleProvider` y consume su locale, traductor y función de cambio. Montar **una sola instancia**, en `FormHeader`, fuera de la rama de éxito de `EnviarForm`. El grupo público conserva su navbar y footer independientes.

`FormLocaleProvider` recibe `initialLocale` y `children`, no genera un wrapper DOM y usa `useSearchParams` como fuente de verdad. El cambio llama a History API `replaceState`, conservando query ajeno y fragmento. No recarga ni crea otro wizard. El provider requiere el límite de Suspense que compone `app/enviar/page.tsx`; la página espera el query para render inicial y metadata.

El label se traduce; los nombres «Español» y «Português (Brasil)» llevan sus propios atributos `lang`, sin banderas. En el header móvil el label queda visualmente oculto, conservando el nombre accesible; es visible en desktop y dentro del diálogo. Header, `<main>` y diálogo declaran el idioma vigente; navbar y footer públicos conservan el idioma del sitio.

Un diálogo nativo vuelve inerte la UI exterior. Mientras `CaptureCropDialog` está montado, su ref registra un `selectorHost` en el contexto y **la misma instancia de selector** se presenta allí mediante portal. No hay dos selectores simultáneos, no se cierra el diálogo y no se desmontan `EnviarForm`, `FileField` o el cropper por cambiar idioma. Al cerrar, el selector vuelve al header. La guarda de Tab incluye el select nativo.

No usar el locale como key. La URL conserva solo la preferencia de idioma: no existe borrador persistido. El consentimiento PT sigue pendiente de revisión editorial/legal antes del lanzamiento.

QA reproducible y capturas: [auditoría de i18n](../../form-i18n-audit.md), secciones de etapas 3 y 4.
