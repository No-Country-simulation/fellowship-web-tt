# AdvisorCta

CTA primario de la landing Empresa: “Hablar con un asesor”.

**Archivo:** `components/advisor-cta.tsx`

Uso previsto: hero, garantía y cierre. Es un `Button` `size="lg"` renderizado como `<a>`.

## Import

```tsx
import { AdvisorCta } from "@/components/advisor-cta";
```

## Cuándo usarlo

- El mismo CTA comercial en más de un bloque (mismo copy, mismo destino)
- Variante `gradient` en hero / cierre; `outline` en garantía

No usarlo para acciones genéricas (submit, login, nav). Ahí va `Button`. Hasta tener Calendly o ruta real, el destino default es `#contacto`.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `href` | `string` | `"#contacto"` | Destino del ancla |
| `variant` | `"gradient" \| "outline"` | `"gradient"` | Estilo del `Button` |
| `label` | `string` | `"Hablar con un asesor"` | Texto del botón |
| `className` | `string` | — | Clases extra |

## Ejemplos

### Hero / cierre

```tsx
<AdvisorCta />
```

### Garantía (secundario visual)

```tsx
<AdvisorCta variant="outline" />
```

### Destino o copy distintos

```tsx
<AdvisorCta href="https://calendly.com/…" label="Agendar 20 minutos" />
```

## Notas

- Siempre `size="lg"` y `h-11` / `px-lg` / `text-body`. No pasar otro size.
- `nativeButton={false}` + `render={<a href={href} />}`: es un link, no un `<button>`.
- El destino real (Calendly / form) se cambia por `href`, no tocando el componente en cada bloque.
- Es Server Component (sin `"use client"`).
