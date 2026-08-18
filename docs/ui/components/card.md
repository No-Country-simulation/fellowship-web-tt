# Card

Contenedor de contenido agrupado (header, body, footer). Basado en shadcn (`base-nova`).

**Archivo:** `components/ui/card.tsx`

Uso previsto en la landing: diferencial, evidencia, pasos, stats, garantía, testimonial.

## Import

```tsx
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

## Cuándo usarlo

- Bloques autónomos en una grilla (evidencia, pasos, stats)
- Testimonial, garantía, comparativas

No usarlo como wrapper de toda una sección: para el padding de página está `Section` (producto). El card es la unidad visual interna.

## Composición

```
Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter
```

Todas las partes son opcionales. Un card puede ser solo `Card` + `CardContent`.

## Props

### `Card`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `size` | `"default" \| "sm"` | `"default"` | Densidad / spacing interno |
| `className` | `string` | — | Clases extra |

El spacing interno usa `--card-spacing` (`spacing(4)` default, `spacing(3)` en `sm`). Se puede overridear:

```tsx
<Card className="[--card-spacing:--spacing(6)]">…</Card>
```

### Subcomponentes

Todos aceptan `className` y las props nativas de `div`.

| Componente | Rol |
| --- | --- |
| `CardHeader` | Título, descripción y acción |
| `CardTitle` | Título (`div`; poner un `h2`/`h3` adentro si hace falta heading) |
| `CardDescription` | Texto de apoyo (`text-muted-foreground`) |
| `CardAction` | Esquina superior derecha del header |
| `CardContent` | Cuerpo |
| `CardFooter` | Pie con borde superior y fondo muted |

## Ejemplos

### Evidencia / paso

```tsx
<Card>
  <CardHeader>
    <CardTitle>Peer review</CardTitle>
    <CardDescription>
      Cada perfil pasa por revisión de pares antes de llegar a empresas.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Feedback de builders que ya entregaron en producción.</p>
  </CardContent>
</Card>
```

### Compacto (`sm`) con acción

```tsx
<Card size="sm">
  <CardHeader>
    <CardTitle>+30.000</CardTitle>
    <CardAction>
      <Badge variant="outline">Talento</Badge>
    </CardAction>
    <CardDescription>perfiles en la red</CardDescription>
  </CardHeader>
</Card>
```

## Notas

- Un solo `h1` en la landing: títulos de cards son `h2`/`h3` o el `CardTitle` tal cual (es un `div`).
- Color de superficie: `bg-card` / `text-card-foreground` (tokens shadcn). Para surfaces de marca, overlayar `bg-bg-surface-1` etc. desde el design system.
- `CardTitle` usa `font-heading text-base`. Para stats grandes, aplicar `text-data-number` en el children, no agrandar el title a ciegas.
- Primera/última imagen hija se recorta al radio del card (`rounded-xl`).
