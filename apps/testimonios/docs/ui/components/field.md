# Field

Label, hint, error y wiring a11y para un control. También exporta `FileField` y las classes de input.

**Archivo:** `components/enviar-fields.tsx`

Uso previsto: `/enviar`. El control lo pasa el caller (render prop).

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

- Cualquier input, select, textarea o grupo de radios de esta app
- Upload de avatar o captura (`FileField`)
- Textareas sueltos que deban verse igual (`textareaClassName` en quote o captions)

No armar labels e inputs a mano con otros bordes. No usarlo para botones.

`Field` y `FileField` son Client Components (`useId` / preview local).

## Props — `Field`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `label` | `string` | — | Texto del label |
| `children` | `(control) => ReactNode` | — | Render prop: recibe `{ id, labelledBy, describedBy, invalid }` |
| `id` | `string` | `useId()` | Id del control |
| `hint` | `string` | — | Ayuda bajo el label |
| `error` | `string` | — | Mensaje asociado al control mediante `describedBy` |
| `optional` | `boolean` | `false` | Sufijo “Opcional” muted |
| `labelAs` | `"label" \| "span"` | `"label"` | `span` si el click lo maneja un hijo (file, radios) |
| `hideLabel` | `boolean` | `false` | Label `sr-only` (sigue anunciado) |
| `className` | `string` | — | Clases del wrapper |

`children` debe aplicar `id`, `aria-describedby={describedBy}` y `aria-invalid={invalid}` al control.
`labelledBy` identifica el nombre visible estable; usar `aria-labelledby={labelledBy}`
cuando el control necesita esa asociación explícita, como el input de `FileField`.

`error` recibe un único mensaje vigente, sea local o devuelto por el servidor.
El formulario decide cuándo validarlo: al intentar avanzar y, si el campo tiene
un error, al editarlo. La corrección local reemplaza el mensaje anterior o lo
retira, sin borrar los errores de otros controles. `Field` solo presenta ese
resultado y actualiza `invalid` y `describedBy`; no ejecuta validaciones ni
administra los intentos de envío. Los errores generales se muestran fuera del
campo.

Revalidar un paso o volver a una categoría conserva los errores del servidor de
campos sin editar. Esos errores siguen impidiendo avanzar hasta corregirlos.

Los errores de campo no son regiones de alerta independientes. Al fallar una
validación, el formulario enfoca el primer control inválido en orden de DOM y su
`aria-describedby` incluye el error, evitando anunciar a la vez todos los campos.
Los errores generales del servidor mantienen su región de alerta separada.

En el paso 2 de `/enviar`, País usa un `select` nativo con `fieldClassName`.
Las opciones de `lib/testimonials/countries.ts` son provisionales, pendientes de
la lista oficial de No Country. “Otro país” muestra el input “Especificá tu país”
para admitir participantes de países no incluidos. Su texto se conserva al
cambiar de opción, categoría o paso; el valor final se deriva de la selección
activa y se envía una sola vez como `country`, sin el marcador interno.

Solo el control activo recibe el error de `country`: el selector si falta elegir
una opción o el input si está seleccionado “Otro país”. Ese control conserva
`name="country"` para que la navegación al primer error lo enfoque. La validación
compartida entre cliente y servidor exige contenido, hasta `FIELD_MAX_CHARS`
(120), letras Unicode y ausencia de números; admite espacios y puntuación
habitual, como guiones y apóstrofes, sin exigir pertenecer a la lista provisional.

## Props — `FileField`

| Prop | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `name` | `string` | — | `name` del `<input type="file">` |
| `label` | `string` | — | Texto del label |
| `hint` | `string` | — | Qué foto pedir (cara vs entorno de trabajo) |
| `accept` | `string` | — | p. ej. `"image/jpeg,image/png,image/webp"` |
| `preview` | `"avatar" \| "capture"` | — | Avatar cuadrado; captura 16:9 |
| `onFileChange` | `(file: File \| null) => void` | — | Archivo recortado confirmado o `null` al quitarlo explícitamente |
| `onInvalid` | `(message?: string) => void` | — | Error de recorte o lectura |
| `error` | `string` | — | Mensaje de error |
| `optional` | `boolean` | `false` | Foto testimonial; el avatar no |
| `hideLabel` | `boolean` | `false` | Label `sr-only` |
| `className` | `string` | — | Clases del wrapper |

## Classes

| Export | Uso |
| --- | --- |
| `fieldClassName` | `<input>` de una línea o `<select>` nativo (alto 44px) |
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
- El preview confirmado y el original pendiente usan `objectURL` locales distintos.
  Las URLs se liberan cuando el DOM deja de usarlas y al desmontar. No son URLs
  de Storage. Avatar y captura abren [`CaptureCropDialog`](./capture-crop-dialog.md)
  al elegir el archivo (cuadrado o 16:9).
- El input file es `sr-only`; el hit area es el label dashed. Avatar es cuadrado; captura es 16:9. Con una imagen cargada, una X la quita.
- Hint y error se anidan en `aria-describedby` en ese orden.
- El input de archivo conserva el nombre del label visible al cargar o reemplazar
  una imagen. El recuadro muestra un contorno cyan cuando el input recibe foco con
  teclado; Enter o Espacio abre el selector nativo.
- La acción de quitar tiene un área de 44×44 px y contorno de foco. Al quitar una
  imagen, el foco vuelve al input sin abrir el selector.
- El diálogo de recorte recibe la referencia del input para devolverle el foco al
  cerrar. Durante un reemplazo, el archivo confirmado y su preview se conservan
  hasta generar correctamente el nuevo recorte. Cancelar no cambia el archivo ni
  sus errores; si es la primera carga, el campo sigue vacío.
- Si el procesamiento falla, se conserva la foto anterior y `onInvalid` informa
  el problema. Al confirmar, `onFileChange` entrega el nuevo archivo para aplicar
  las validaciones existentes; al quitarlo, entrega `null`.
- El input nativo se vacía después de leer la selección para permitir elegir el
  mismo original otra vez. El archivo confirmado permanece en el estado del
  formulario; no depende de `input.files`.
- Una operación anterior o un recorte terminado después del desmontaje no puede
  reemplazar la selección actual ni actualizar el formulario.
