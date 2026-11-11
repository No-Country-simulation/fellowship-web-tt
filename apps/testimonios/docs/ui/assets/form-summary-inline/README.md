# Evidencia vigente de edición global

Se propone versionar seis PNG y dos reportes JSON. Ningún archivo de esta carpeta
estaba bajo seguimiento antes de esta selección. Las etapas anteriores se
conservan sin borrar sus capturas versionadas.

| Caso | Lectura | Edición |
| --- | --- | --- |
| EN, escritorio 1440 px | [PNG](en-1440-100-present.png) | [PNG](en-1440-100-present-editing.png) |
| ES, móvil 375 px | [PNG](es-375-100-present.png) | [PNG](es-375-100-present-editing.png) |

Texto ampliado PT, 320 px: [editor completo](pt-320-200-present-editing.png)
y [detalle de «Salvar alterações»](pt-320-200-editing-footer.png).

Reportes: [matriz de edición](qa-results.json) y
[regresión de validación](submit-regression/qa-results.json).

Después de build, ejecutar desde `apps/testimonios`:

```sh
node scripts/qa-form-summary.mjs --edit-summary
node scripts/qa-form-submit-validation.mjs --summary-edit
```

Para este ajuste de copy y botón se ejecuta
`node scripts/qa-form-summary.mjs --edit-summary --representative-only`:
conserva toda la matriz y verifica los PNG en memoria, pero solo reescribe las
cuatro imágenes de edición seleccionadas. Las dos vistas de lectura y el reporte
independiente de regresión se conservan de la ejecución anterior. El nuevo reporte
enumera lo escrito en `writtenCaptures`; no aumenta la selección versionable.
El botón usa «Guardar cambios» / «Save changes» / «Salvar alterações», sin cambiar
el flujo de edición local ni convertirlo en guardado en servidor.

La cobertura y las comprobaciones de todas las imágenes se mantienen. El script
genera capturas adicionales para revisar localmente y registra sus mediciones en
el reporte; `../.gitignore` permite versionar únicamente la selección de arriba.
Aliases, diagnósticos y otras combinaciones quedan ignorados, sin afectar imágenes
de otras carpetas. `--refresh-crops --edit-summary` regenera los detalles desde los
PNG completos, sin servidor ni solicitudes. No se preparan archivos con Git.

Las fotografías son sintéticas y los envíos están interceptados. Los reportes no
sustituyen la revisión manual, el zoom nativo, móviles físicos o lectores de pantalla.
