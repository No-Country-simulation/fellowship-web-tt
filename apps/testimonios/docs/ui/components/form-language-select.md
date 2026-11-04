# FormLanguageSelect — ES / EN / PT

Control de idioma **exclusivo de `FormHeader`** en `/enviar`. Sigue el patrón visual compacto observado en Talent: disparador con `ES`, `EN` o `PT` y menú oscuro con opciones en orden **EN, ES, PT**. No usa flags, la cookie de Talent (`NEXT_LOCALE`) ni dependencias adicionales. Se aproxima a su CSS: disparador sin borde, menú slate y opción activa azul.

```tsx
import { FormLanguageSelect } from "@/components/form-language-select";

<FormLanguageSelect />
```

### Contrato de locale

- Códigos canónicos de la app y de `?lang=`: `es`, `en`, `pt`.
- `?lang=pt-BR` sigue siendo **alias de lectura** del portugués para no romper enlaces previos.
- La variante del contenido portugués es de Brasil y su atributo HTML utiliza `lang="pt-BR"`.
- Query `lang` inválida o duplicada: fallback `es`. Sin query: preferencia guardada en `testimonios_locale` o, en una primera visita, `es`.
- Seleccionar un idioma **no modifica la URL**: guarda una cookie funcional `testimonios_locale` (ruta `/enviar`, `SameSite=Lax`, duración de un año). Los enlaces directos `?lang=...` tienen prioridad en una navegación nueva; al cambiar manualmente desde uno, la URL permanece igual y un *refresh* vuelve a aplicar el idioma explícito de esa URL.
- No se escribe `NEXT_LOCALE`; Talent se tomó como referencia de códigos visibles y estilo, no como dependencia técnica.

El control utiliza un `button` con nombre accesible localizado que incluye el idioma activo, `aria-haspopup="listbox"`, `aria-expanded` y un popup `role="listbox"` cuyas opciones tienen `role="option"`, `aria-selected`, nombre completo y `lang` correspondiente. Teclado: Enter/Espacio para abrir o elegir, flechas para navegar, Inicio/Fin para primera/última opción, Escape para cerrar y devolver foco al disparador, Tab para continuar. Pulsar fuera cierra el menú. Se aplica `focus({preventScroll:true})` **solo** para colocar/retornar el foco dentro del menú, no para restaurar un scroll que ya saltó.

`FormLocaleProvider` mantiene `useSearchParams` únicamente para reaccionar a enlaces directos y navegación History, pero **no llama `history.replaceState` al seleccionar idioma**. La preferencia se guarda en cookie; `app/enviar/page.tsx` lee la cookie en servidor para el HTML y metadata inicial cuando no hay `?lang=`. Esto no remonta `EnviarForm`. Los datos, archivos, recorte confirmado, paso, validaciones y consentimiento siguen en sus estados originales. Metadata de página y atributo `html.lang` se sincronizan en cliente; este último se restablece a `es` al desmontar el formulario. **Limitación**: el root layout compartido emite `html lang="es"` en el HTML SSR inicial; el locale de EN/PT se aplica al hidratar. Se necesita otra decisión arquitectónica si se requiere `html.lang` localizado desde el primer byte del HTML. `main`, header y diálogo se sirven con su `lang` localizado.

El menú está posicionado sobre el documento, no en un portal ni dentro de `CaptureCropDialog`. El `dialog` nativo hace inerte al header; la persona debe cerrar o confirmar el recorte antes de cambiar idioma. La compensación específica del scroll en `form-header.module.css` ahora aplica al disparador y a las opciones enfocables, sin cambiar padding global ni foco legítimo hacia campos con error.

La UI de este selector usa los colores slate de la referencia aportada por Talent (`#1e293b`, `#334155`, `#cbd5e1`, `#60a5fa`) sin cambiar los tokens globales ni otros componentes. El foco visible conserva `--accent-cyan`. Mantener documentados los contrastes insuficientes conocidos; no se declaran corregidos.

QA manual necesario: menú con puntero y teclado a mitad del formulario, Escape y selección sin salto de scroll, 375/1440px, tres idiomas, diálogo de recorte abierto/cerrado, respuesta al zoom del navegador y lectores de pantalla reales. Ver auditoría `docs/form-i18n-audit.md` sección 0.h.
