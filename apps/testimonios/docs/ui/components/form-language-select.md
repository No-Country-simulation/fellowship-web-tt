# FormLanguageSelect

Selector nativo exclusivo del formulario, reutilizable en el header de la etapa 4.

```tsx
import { FormLanguageSelect } from "@/components/form-language-select";
```

No recibe props: requiere `FormLocaleProvider` y consume su locale, traductor y función de cambio. Montar **una sola instancia**, fuera de la rama de éxito de `EnviarForm`. Por ahora vive al comienzo del contenido de `/enviar`, sin cambiar navbar o footer.

`FormLocaleProvider` recibe `initialLocale` y `children`, no genera un wrapper DOM y usa `useSearchParams` como fuente de verdad. El cambio llama a History API `replaceState`, conservando query ajeno y fragmento. No recarga ni crea otro wizard. El provider requiere el límite de Suspense que compone `app/enviar/page.tsx`; la página espera el query para render inicial y metadata.

El label se traduce; los nombres «Español» y «Português (Brasil)» llevan sus propios atributos `lang`, sin banderas. El `<main>` del formulario declara el idioma vigente; navbar y footer conservan el idioma del sitio.

Un diálogo nativo vuelve inerte la UI exterior. Mientras `CaptureCropDialog` está montado, su ref registra un `selectorHost` en el contexto y **la misma instancia de selector** se presenta allí mediante portal. No hay dos selectores simultáneos, no se cierra el diálogo y no se desmontan `EnviarForm`, `FileField` o el cropper por cambiar idioma. Al cerrar, el selector vuelve a su ubicación provisional. La guarda de Tab incluye ahora el select nativo.

No usar el locale como key. La URL conserva solo la preferencia de idioma: no existe borrador persistido. El consentimiento PT sigue pendiente de revisión editorial/legal antes del lanzamiento.

QA reproducible y capturas: [auditoría de i18n](../../form-i18n-audit.md), sección de etapa 3.
