# AdminStatusBadge

Pill de estado del testimonio: en revisión, publicado o rechazado.

**Archivo:** `components/admin-status-badge.tsx`

Uso previsto: chrome del admin (título de `/admin/[id]`). El inbox filtra por estado con links, no con este badge.

## Import

```tsx
import { AdminStatusBadge, adminPillClassName } from "@/components/admin-status-badge";
```

## Cuándo usarlo

- Mostrar el `status` de un envío junto al título
- `adminPillClassName` para un pill hermano (tipo, no estado)

No usarlo en la galería pública. Ahí no hay estado: solo publicados.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `status` | `TestimonialStatus` | — | `in_review` / `published` / `rejected` |

Labels: `STATUS_LABELS` en `lib/testimonials/types.ts`.

## Ejemplos

```tsx
<AdminStatusBadge status={testimonial.status} />
<span className={cn(adminPillClassName, "border-border bg-bg-surface-3 text-text-secondary")}>
  {testimonial.typeLabel}
</span>
```

## Notas

- Cyan = en revisión, mint = publicado, destructive = rechazado.
- Es Server Component (sin `"use client"`).
