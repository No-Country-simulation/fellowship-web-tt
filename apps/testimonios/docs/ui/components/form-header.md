# FormHeader

Header exclusivo de `/enviar`: marca oficial no navegable y una instancia de `FormLanguageSelect`. No contiene navegación institucional ni footer.

```tsx
import { FormHeader } from "@/components/form-header";

// app/enviar/page.tsx, dentro del mismo FormLocaleProvider y Suspense.
<FormHeader />
<EnviarExperience stories={heroStories} />
```

No recibe props. Requiere `FormLocaleProvider`; el header declara su idioma vigente. Reutiliza `/brand/logo-no-country.png`, con el alt «No Country», dimensiones intrínsecas y carga eager. El logo no tiene enlace ni participa del orden de Tab. Se retira el enlace a la galería de la introducción; el regreso al hero usa el control existente en el paso 1. El enlace de éxito apunta a `/enviar`.

`form-header.module.css` mantiene tokens, borde inferior, altura mínima de 4rem y padding vertical. El ancho/margen lateral procede exclusivamente de `form-layout.module.css`, compartido con hero y formulario: wrapper exterior con 24px y 32px desde 48rem, e interior centrado de hasta 70rem sin padding horizontal. Logo y selector coinciden con los extremos de contenido. El header sigue sticky; con fuentes ampliadas puede envolver y aumentar su altura. El botón muestra ES/EN/PT y tiene un nombre accesible localizado; el menú se abre debajo, alineado a la derecha. Navbar/footer institucionales no se montan en esta ruta.

El único selector permanece en este header durante los cinco pasos, éxito y recorte. No se porta al diálogo: la modalidad nativa lo vuelve inerte hasta cerrar el recorte. Para cambiar idioma se cancela o confirma la imagen y luego se usa el header.

Un `ResizeObserver` publica la altura real en `--site-header-height`, también al envolver filas o cambiar de fuente. Limpia observador y variable al desmontarse. `focusAndReveal` mide explícitamente `[data-form-header]`; el CSS global conserva el offset de scroll y la navegación institucional sigue usando su propio observador sin cambios.

El botón de idioma y las opciones del menú compensan el padding raíz reservado para este sticky con un `scroll-margin-block-start` negativo de altura real + 16px. Evita el salto de foco con el selector compacto, tanto por puntero como por teclado. No restaura scroll después del salto ni cambia root, History API o los desplazamientos hacia campos/pasos/éxito. Ver [reproducción y límites](../../form-i18n-audit.md#0g-ajustes-finales-de-ux-y-fidelidad-al-design-system).

Los encabezados estáticos enfocados programáticamente (paso, éxito y recorte) conservan foco, semántica y `tabIndex={-1}`, sin el outline de bloque completo. Los controles interactivos mantienen sus indicadores de teclado.

QA y capturas: [auditoría, etapa 4](../../form-i18n-audit.md#0d-etapa-4--header-y-layouts).

Pendientes: revisión visual humana y accesibilidad con lectores/navegadores reales. Cualquier información legal obligatoria adicional necesita definición del equipo antes del lanzamiento; no se inventan textos o destinos legales.

Actualización: el selector compacto replica la referencia visual de Talent y guarda preferencia en cookie; seleccionarlo no modifica `?lang=`. Los enlaces localizados siguen funcionando.

El header también rodea la introducción integrada en /enviar. Su selector actualiza hero y formulario, sin duplicar navegación institucional. Véase [integración](../../hero-form-integration.md).
