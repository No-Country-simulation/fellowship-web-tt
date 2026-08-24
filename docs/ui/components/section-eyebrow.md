# SectionEyebrow

Pill de sección: borde cyan, sentence case. Marca el bloque antes del H2.

**Archivo:** `components/section-eyebrow.tsx`

Uso previsto: hero, diferencial, social proof y cualquier banda que necesite un label corto encima del título.

## Import

```tsx
import { SectionEyebrow } from "@/components/section-eyebrow";
```

## Cuándo usarlo

- Label de sección (“Para empresas”, “Cómo funciona”)
- Una sola línea, sentence case, no un H2

No usarlo como chip de rol/vertical/geo; para eso está `Badge`. No usarlo como CTA.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Texto del pill |
| `className` | `string` | — | Clases extra (se mergean con `cn`) |

## Ejemplos

```tsx
<SectionEyebrow>Talento junior con evidencia real</SectionEyebrow>
```

### Encima de un heading

```tsx
<div className="flex flex-col items-center gap-md">
  <SectionEyebrow>Cómo funciona</SectionEyebrow>
  <h2 className="text-heading-2">De la llamada al perfil en 72 h</h2>
</div>
```

## Notas

- Es un `<p>`, no un heading: el H2 de la sección va aparte.
- Estilo fijo: `rounded-full`, `border-accent-cyan/70`, `text-body-small`, fondo `bg-bg-surface-1`.
- En bandas `surface="light"` el fondo pasa a wash cyan (`bg-accent-cyan/10`) y el texto a indigo (`text-accent-indigo`).
- `text-pretty` y `max-w-full` evitan desbordes en mobile.
- Es Server Component (sin `"use client"`).
