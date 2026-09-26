# Field

Label, hint, error y wiring a11y para un control. También exporta `FileField` y las classes de input.

**Archivo:** `components/enviar-fields.tsx`

Uso previsto: `/enviar` y el form de revisión del admin. El control lo pasa el caller (render prop).

## Import

```tsx
import {
  Field,
  FileField,
  fieldClassName,
  textareaClassName,
} from "@/components/enviar-fields";
```

## Cuándo usarlo

- Cualquier input, textarea o grupo de radios de esta app
- Upload de avatar o captura (`FileField`)
- Textareas sueltos que deban verse igual (`textareaClassName` en quote o captions)

No armar labels e inputs a mano con otros bordes. No usarlo para botones.

`Field` y `FileField` son Client Components (`useId` / preview local).

## Props — `Field`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | — | Texto del label |
| `children` | `(control) => ReactNode` | — | Render prop: recibe `{ id, describedBy, invalid }` |
| `id` | `string` | `useId()` | Id del control |
| `hint` | `string` | — | Ayuda bajo el label |
| `error` | `string` | — | Mensaje `role="alert"` |
| `optional` | `boolean` | `false` | Sufijo “Opcional” muted |
| `labelAs` | `"label" \| "span"` | `"label"` | `span` si el click lo maneja un hijo (file, radios) |
| `hideLabel` | `boolean` | `false` | Label `sr-only` (sigue anunciado) |
| `className` | `string` | — | Clases del wrapper |

`children` debe aplicar `id`, `aria-describedby={describedBy}` y `aria-invalid={invalid}` al control.

## Props — `FileField`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `name` | `string` | — | `name` del `<input type="file">` |
| `label` | `string` | — | Texto del label |
| `hint` | `string` | — | Qué foto pedir (cara vs entorno de trabajo) |
| `accept` | `string` | — | p. ej. `"image/jpeg,image/png,image/webp"` |
| `preview` | `"avatar" \| "capture"` | — | Avatar cuadrado; captura 16:9 |
| `onFileChange` | `(file: File \| null) => void` | — | Archivo elegido o `null` si lo quitan |
| `onInvalid` | `(message?: string) => void` | — | Error de recorte o lectura |
| `error` | `string` | — | Mensaje de error |
| `optional` | `boolean` | `false` | Foto testimonial; el avatar no |
| `hideLabel` | `boolean` | `false` | Label `sr-only` |
| `className` | `string` | — | Clases del wrapper |

## Classes

| Export | Uso |
| --- | --- |
| `fieldClassName` | `<input>` de una línea (alto 44px) |
| `textareaClassName` | `<textarea>` (min-height 144px, resize vertical) |

Focus: borde y ring cyan. `aria-invalid`: borde y ring destructive.

## Ejemplos

### Input de texto

```tsx
<Field label="Nombre completo" error={errors.full_name}>
  {({ id, describedBy, invalid }) => (
    <input
      id={id}
      name="full_name"
      aria-describedby={describedBy}
      aria-invalid={invalid}
      className={fieldClassName}
    />
  )}
</Field>
```

### Textarea

```tsx
<Field label="Contanos tu experiencia" hint="En tus palabras.">
  {({ id, describedBy, invalid }) => (
    <textarea
      id={id}
      name="story"
      aria-describedby={describedBy}
      aria-invalid={invalid}
      className={textareaClassName}
    />
  )}
</Field>
```

### Avatar y captura

```tsx
<FileField
  name="avatar"
  label="Tu foto"
  hint="Cara o perfil. Va redonda en la card."
  accept="image/jpeg,image/png,image/webp"
  preview="avatar"
  error={errors.avatar}
  onFileChange={setAvatar}
/>

<FileField
  name="capture"
  label="Foto testimonial"
  hint="Una foto real de tu experiencia: vos trabajando, con tu equipo o en una reunión."
  accept="image/jpeg,image/png,image/webp"
  preview="capture"
  optional
  onFileChange={setCapture}
/>
```

## Notas

- `labelAs="span"` cuando el control clickeable no es el label nativo (`FileField`, radios).
- El preview de `FileField` es un `objectURL` local; se revoca al cambiar o desmontar. No es la URL de Storage. Avatar y captura abren [`CaptureCropDialog`](./capture-crop-dialog.md) al elegir el archivo (cuadrado o 16:9).
- El input file es `sr-only`; el hit area es el label dashed. Avatar es cuadrado; captura es 16:9. Con una imagen cargada, una X la quita.
- Hint y error se anidan en `aria-describedby` en ese orden.
