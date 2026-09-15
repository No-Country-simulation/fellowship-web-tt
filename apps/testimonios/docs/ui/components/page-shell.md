# PageShell

Wrapper de página: `<main>` scrolleable + eyebrow, título y descripción.

**Archivo:** `components/page-shell.tsx`

Uso previsto: toda ruta de la app (galería, enviar, ficha, detalle admin). En el inbox, el frame lo pone `AdminInboxShell` (`app/admin/(protected)/layout.tsx`); `PageShell` solo cubre el pane de detalle (`fullWidth`) o el login.

## Import

```tsx
import { PageShell, adminShellClassName } from "@/components/page-shell";
```

## Cuándo usarlo

- Cualquier página que necesite frame, H1 y área de contenido
- Login admin: pasar `className={adminShellClassName}` para el ancho operativo
- Ficha admin (`/admin/[id]`): `fullWidth`; la lista vive en `AdminInboxShell`, no acá

No anidar un `PageShell` dentro de otro. No usarlo como card ni como ítem de grilla.

## Props

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | — | Texto del `<h1>` |
| `eyebrow` | `string` | — | Overline arriba del título (tipo, “Galería”, “Ficha”) |
| `description` | `string` | — | Lead bajo el título (`text-body-large`) |
| `titleStart` | `ReactNode` | — | Slot a la izquierda del H1 (p. ej. volver) |
| `titleAddon` | `ReactNode` | — | Slot a la derecha del H1 (p. ej. badge de tipo) |
| `className` | `string` | — | Clases del inner `container-content` (ancho, no el `<main>`) |
| `fullWidth` | `boolean` | `false` | Sin tope de ancho, padding horizontal `px-sm` (detalle admin) |
| `children` | `ReactNode` | — | Cuerpo de la página |

También exporta `adminShellClassName` (`"max-w-content"`). El default del contenedor es `max-w-3xl`.

## Ejemplos

### Página pública

```tsx
<PageShell
  eyebrow="Galería"
  title="Historias de talento"
  description="El equipo valida cada historia antes de que salga acá."
>
  {children}
</PageShell>
```

### Login admin (más estrecho)

```tsx
<PageShell centered title="Entrar al admin">
  {children}
</PageShell>
```

### Ficha admin (lista al lado)

```tsx
<PageShell
  fullWidth
  title={fullName}
  titleStart={<BackToInbox />}
  titleAddon={<AdminStatusBadge status={status} />}
>
  {children}
</PageShell>
```

## Notas

- El `<main>` ocupa el resto de la columna del `body` (`flex-1`, `overflow-y-auto`). El header queda fijo. En `/admin` sin ficha, el `<main>` es la lista del inbox; con ficha, el `<main>` es este `PageShell` (o el form de revisión).
- Padding de página: `px-md py-md` (`px-sm` si `fullWidth`). El inner usa `container-content`, salvo `fullWidth`.
- `className` ajusta el contenedor (ancho), no el `<main>`. Para galería ancha: `className="max-w-5xl"`.
- El H1 no acepta nodos: el copy va en `title`; acciones van en `titleStart` / `titleAddon`.
- Es Server Component (sin `"use client"`).
