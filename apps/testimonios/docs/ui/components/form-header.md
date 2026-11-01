# FormHeader

Header exclusivo de `/enviar`: marca oficial no navegable y una instancia de `FormLanguageSelect`. No contiene navegación institucional ni footer.

```tsx
import { FormHeader } from "@/components/form-header";

// app/enviar/page.tsx, dentro del mismo FormLocaleProvider y Suspense.
<FormHeader />
<EnviarExperience />
```

No recibe props. Requiere `FormLocaleProvider`; el header declara su idioma vigente. Reutiliza `/brand/logo-no-country.png`, con el alt «No Country», dimensiones intrínsecas y carga eager. El logo no tiene enlace ni participa del orden de Tab. Los enlaces «Volver al inicio» de introducción y éxito permanecen.

`form-header.module.css` usa tokens existentes, borde inferior discreto, altura mínima de 4rem y ancho máximo de 51rem (contenido de 48rem más padding). Es sticky y permanece en el scroll del documento. Desde 320px, logo y select comparten fila; con fuentes ampliadas pueden envolver y aumentar la altura. El nombre accesible del selector se conserva en móvil con la etiqueta visualmente oculta; desde 768px también es visible. No se ocultan header/footer institucionales: esos componentes no se montan en esta ruta.

El único selector se porta al diálogo de recorte activo y sale del alcance de los estilos del header, conservando allí la etiqueta visible. Al cerrar vuelve al header; no queda otra copia inerte fuera del modal. El header permanece montado durante los cinco pasos y éxito.

Un `ResizeObserver` publica la altura real en `--site-header-height`, también al envolver filas o cambiar de fuente. Limpia observador y variable al desmontarse. `focusAndReveal` mide explícitamente `[data-form-header]`; el CSS global conserva el offset de scroll y la navegación institucional sigue usando su propio observador sin cambios.

Los encabezados estáticos enfocados programáticamente (paso, éxito y recorte) conservan foco, semántica y `tabIndex={-1}`, sin el outline de bloque completo. Los controles interactivos mantienen sus indicadores de teclado.

QA y capturas: [auditoría, etapa 4](../../form-i18n-audit.md#0d-etapa-4--header-y-layouts).

Pendientes: revisión visual humana y accesibilidad con lectores/navegadores reales. Cualquier información legal obligatoria adicional necesita definición del equipo antes del lanzamiento; no se inventan textos o destinos legales.
