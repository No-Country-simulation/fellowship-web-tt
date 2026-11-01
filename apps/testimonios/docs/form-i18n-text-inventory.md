# Issue 2 — Inventario editorial del formulario

Inventario original: 31 de octubre de 2026. Estado actualizado: 1 de noviembre de 2026. **Referencia histórica; sus textos originales se conservan.** Diagnóstico, implementación de etapa 1 y plan: [form-i18n-audit.md](./form-i18n-audit.md).

La arquitectura general de diccionarios locales tipados ES/PT-BR, sin dependencias adicionales, fue aprobada. Las 163 claves sugeridas de las tablas ya existen en [messages/es.ts](../lib/form-i18n/messages/es.ts) y [messages/pt-BR.ts](../lib/form-i18n/messages/pt-BR.ts), bajo el contrato compartido [FormMessages](../lib/form-i18n/types.ts). **Etapa 3 integra ambos idiomas en todo el árbol propio de `/enviar`**, incluidos errores después de resolver incidencias semánticas mediante [presentFormErrors](../lib/form-i18n/issues.ts). Provider, selector único y History API conservan el estado al cambiar idioma. Metadata, accesibilidad y QA se detallan en la auditoría. Las columnas «Texto actual» corresponden al checkout auditado y se mantienen como referencia histórica, incluidos sus mensajes antiguos. La integración sigue pendiente de revisión visual y editorial humana antes de lanzamiento.

Implementación de claves no equivale a aprobación de sus textos: PT-BR sigue pendiente de revisión humana brasileña; la autorización ES/PT está marcada en [FORM_CONSENT_REVIEW_STATUS](../lib/form-i18n/messages.ts) como pendiente de revisión editorial/legal. Se mantienen íntegros el cuerpo ES vigente y la propuesta PT, solo galería y Discord. El matiz de la pregunta de empleo, el footer y el destino del logo continúan abiertos.

Los textos actuales se verificaron en el código del checkout `feat/testimonios-form-i18n`. Las propuestas `es` y `pt-BR` son borradores, salvo las tres etiquetas ES confirmadas por el equipo. Una fila puede cubrir varias apariciones de la misma cadena; las variantes parametrizadas representan todos los valores de sus parámetros. No se traduce contenido introducido por participantes.

Abreviaturas de archivo en las tablas, relativas a `apps/testimonios`:

- **P**: `app/enviar/page.tsx`.
- **F**: `components/enviar-form.tsx`, incluidos `StepProgress` y `SuccessCard`.
- **T**: `lib/testimonials/types.ts`, `TYPE_OPTIONS`. Solo se propone una copia de presentación específica del formulario; no cambiar sus labels globales.
- **E**: `components/enviar-fields.tsx`, `Field` y `FileField`.
- **C**: `components/capture-crop-dialog.tsx`.
- **V**: `lib/testimonials/form-validation.ts`, validaciones cliente.
- **R**: `lib/testimonials/parse.ts`, parser servidor y utilidades compartidas.
- **A**: `lib/testimonials/actions.ts`.
- **S**: `lib/testimonials/store.ts`.
- **I**: `lib/testimonials/prepare-image.ts`.

Las claves son propuestas semánticas estables, no cadenas españolas usadas como claves. `{step}`, `{total}`, `{title}`, `{min}`, `{max}`, `{current}`, `{hint}` y `{maxMb}` son parámetros; se conservan los límites reales. Marcas, URLs técnicas, `name`, valores internos e identificadores ARIA no son traducciones.

## 1. Página, pasos y navegación

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| P / metadata.title | Enviar testimonio | Comparte tu testimonio | Compartilhe seu depoimento | `form.metadata.title` |
| P / descripción heredada de `lib/site.ts` | Historias de talento de No Country: simulación, primer empleo y reconversión. | Comparte tu experiencia con No Country. Completa cinco pasos para enviar tu testimonio a revisión. | Compartilhe sua experiência com a No Country. Preencha cinco etapas para enviar seu depoimento para análise. | `form.metadata.description` |
| P / enlace | Volver a testimonios | Volver al inicio | Voltar ao início | `form.navigation.home` |
| P / H1 | Contanos tu experiencia | Comparte tu experiencia | Compartilhe sua experiência | `form.intro.title` |
| P / descripción | Tu experiencia puede ayudar a otras personas a dar el próximo paso. Compartí qué aprendiste, cómo empezaste o qué cambió en tu camino. | Tu experiencia puede ayudar a otras personas a dar el siguiente paso. Comparte lo que aprendiste, cómo comenzaste o qué cambió en tu trayectoria. | Sua experiência pode ajudar outras pessoas a dar o próximo passo. Compartilhe o que aprendeu, como começou ou o que mudou na sua trajetória. | `form.intro.description` |
| P / explicación de asterisco | Los campos con * son obligatorios. | Los campos marcados con * son obligatorios. | Os campos marcados com * são obrigatórios. | `form.intro.requiredHint` |
| P / sr-only | asterisco | asterisco | asterisco | `form.common.asterisk` |
| F / título del paso 1 | Qué querés contar | Qué quieres compartir | O que você quer compartilhar | `form.steps.type.title` |
| F / título y legend del paso 2 | Nombre, país, email y foto | Nombre, país, correo electrónico y foto | Nome, país, e-mail e foto | `form.steps.identity.title` |
| F / título, legend y fallback del paso 3 | Tu historia | Tu historia | Sua história | `form.steps.story.title` |
| F / título y legend del paso 4 | Foto testimonial y enlaces | Foto de tu experiencia y enlaces | Foto da sua experiência e links | `form.steps.media.title` |
| F / título y legend del paso 5 | Consentimiento | Consentimiento | Consentimento | `form.steps.consent.title` |
| F / indicador visual 1 | Tipo | Experiencia | Experiência | `form.steps.type.short` |
| F / indicador visual 2 | Datos | Datos | Dados | `form.steps.identity.short` |
| F / indicador visual 3 | Historia | Historia | História | `form.steps.story.short` |
| F / indicador visual 4 | Links | Enlaces | Links | `form.steps.media.short` |
| F / indicador visual 5 | Consentimiento | Consentimiento | Consentimento | `form.steps.consent.short` |
| F / H2 enfocado | Paso {step} de {STEPS} · {STEP_TITLES[step - 1]} | Paso {step} de {total} · {title} | Etapa {step} de {total} · {title} | `form.progress` |
| F / legend de selección | Elegí el tipo de experiencia | Elige el tipo de experiencia | Escolha o tipo de experiência | `form.categories.legend` |
| F / botón | Atrás | Atrás | Voltar | `form.navigation.back` |
| F / botón | Siguiente | Siguiente | Próximo | `form.navigation.next` |
| F / botón de corrección del servidor | Ir a corregir | Corregir los datos | Corrigir os dados | `form.navigation.correct` |
| F / botón final | Enviar testimonio | Enviar testimonio | Enviar depoimento | `form.submit.label` |
| F / botón pendiente | Enviando… | Enviando… | Enviando… | `form.submit.pending` |

El formato de la explicación del asterisco deberá conservar el asterisco visual decorativo y su equivalente hablado, sin duplicar anuncios. Las cinco etiquetas de progreso son hoy decorativas (`aria-hidden`); no se convierten en botones en esta issue.

## 2. Categorías y preguntas condicionales

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| T / label de `simulation` | Simulación | **Tu experiencia en No Country** | Sua experiência na No Country | `form.categories.simulation.label` |
| T / descripción de `simulation` | Tu experiencia en una simulación laboral. | Comparte lo que aprendiste y cómo fue tu experiencia en No Country. | Compartilhe o que aprendeu e como foi sua experiência na No Country. | `form.categories.simulation.description` |
| T / pregunta de `simulation` | Contanos tu experiencia en la simulación | Cuéntanos tu experiencia en No Country | Conte como foi sua experiência na No Country | `form.categories.simulation.storyLabel` |
| T / ayuda de `simulation` | ¿Qué aprendiste? ¿Cómo fue trabajar en equipo y qué experiencia te llevaste? | ¿Qué aprendiste? ¿Cómo fue trabajar en equipo y qué te aportó la experiencia? | O que você aprendeu? Como foi trabalhar em equipe e o que essa experiência trouxe para você? | `form.categories.simulation.storyHint` |
| T / label de `career_change` | Reconversión | **Reconversión Profesional** | Transição de carreira | `form.categories.career_change.label` |
| T / descripción de `career_change` | Por qué cambiaste de oficio y cómo te está ayudando No Country. | Comparte por qué cambiaste de profesión y cómo te está ayudando No Country. | Compartilhe por que mudou de profissão e como a No Country está ajudando você. | `form.categories.career_change.description` |
| T / pregunta de `career_change` | Por qué cambiaste y cómo te está ayudando No Country | Cuéntanos por qué cambiaste de profesión y cómo te está ayudando No Country | Conte por que mudou de profissão e como a No Country está ajudando você | `form.categories.career_change.storyLabel` |
| T / ayuda de `career_change` | ¿De dónde venís? ¿Qué motivó el cambio y cómo estás transitando este nuevo camino? | ¿Cuál era tu ocupación anterior? ¿Qué motivó el cambio y cómo estás viviendo esta nueva etapa? | Qual era sua ocupação anterior? O que motivou a mudança e como está sendo essa nova etapa? | `form.categories.career_change.storyHint` |
| T / label de `first_job` | Primer empleo | **Conseguiste Empleo** | Conseguiu um emprego | `form.categories.first_job.label` |
| T / descripción de `first_job` | Cómo la simulación te ayudó a entrar a IT. | Comparte cómo tu experiencia en No Country te ayudó a conseguir empleo. | Compartilhe como sua experiência na No Country ajudou você a conseguir um emprego. | `form.categories.first_job.description` |
| T / pregunta de `first_job` | Cómo te ayudó la simulación | Cuéntanos cómo te ayudó la experiencia en No Country | Conte como a experiência na No Country ajudou você | `form.categories.first_job.storyLabel` |
| T / ayuda de `first_job` | ¿Cómo fue pasar a tu primer empleo? ¿Qué te aportó la experiencia previa? | ¿Cómo fue conseguir ese empleo? ¿Qué aportó tu experiencia previa? | Como foi conseguir esse emprego? Qual foi a contribuição da sua experiência anterior? | `form.categories.first_job.storyHint` |

Se mantiene `first_job` como identificador técnico. La propuesta de pregunta evita imponer «primer» cuando la etiqueta acordada es más amplia; es una recomendación editorial para confirmar, no una decisión de cambiar elegibilidad, payload o reglas. «Transição de carreira» es la propuesta brasileña natural; «Reconversão profissional» sería una alternativa más literal para revisión del equipo. Ninguna sustituye el badge de publicaciones «Conseguí empleo».

## 3. Campos, ejemplos y ayudas

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| F / avatar y resumen | Foto de perfil | Foto de perfil | Foto de perfil | `form.fields.avatar.label` |
| F / requisitos de avatar | JPG, PNG o WebP · Máximo 5 MB. | JPG, PNG o WebP · Máximo {maxMb} MB. | JPG, PNG ou WebP · Máximo de {maxMb} MB. | `form.fields.avatar.requirements` |
| F / label de identidad | Nombre completo | Nombre completo | Nome completo | `form.fields.full_name.label` |
| F / placeholder de nombre | María López | Tu nombre completo | Seu nome completo | `form.fields.full_name.placeholder` |
| F / país y resumen | País | País | País | `form.fields.country.label` |
| F / primera opción de país | Seleccioná un país | Selecciona un país | Selecione um país | `form.fields.country.placeholder` |
| F / opción especial | Otro país | Otro país | Outro país | `form.fields.country.other` |
| F / país libre | Especificá tu país | Especifica tu país | Informe seu país | `form.fields.country.customLabel` |
| F / label y resumen | Email | Correo electrónico | E-mail | `form.fields.email.label` |
| F / placeholder | tu@email.com | nombre@example.com | nome@example.com | `form.fields.email.placeholder` |
| F / `simulation` y resumen | Puesto principal | Puesto principal | Função principal | `form.fields.primary_role.label` |
| F / ayuda | El rol que tuviste en la simulación. | El rol que desempeñaste en la simulación. | A função que você desempenhou na simulação. | `form.fields.primary_role.hint` |
| F / `first_job` y resumen | Empresa | Empresa | Empresa | `form.fields.company.label` |
| F / `first_job` y resumen | Puesto | Puesto | Cargo | `form.fields.role_achieved.label` |
| F / `career_change` y resumen | Oficio anterior | Ocupación anterior | Ocupação anterior | `form.fields.previous_profession.label` |
| F / `career_change` y resumen | Rol nuevo | Nuevo rol | Nova função | `form.fields.new_role.label` |
| F / aviso al cambiar categoría | Cambiaste el tipo de experiencia. Revisá que tu historia responda a la nueva pregunta. | Cambiaste el tipo de experiencia. Revisa que tu historia responda a la nueva pregunta. | Você mudou o tipo de experiência. Confira se sua história responde à nova pergunta. | `form.story.reviewNotice` |
| F / ayuda de relato sin categoría | En tus palabras. | Con tus propias palabras. | Com suas próprias palavras. | `form.story.defaultHint` |
| F / composición de ayuda | {storyHint} Entre {STORY_MIN_CHARS} y {STORY_MAX_CHARS} caracteres. | {hint} Entre {min} y {max} caracteres. | {hint} Entre {min} e {max} caracteres. | `form.story.hintWithLimits` |
| F / contador | {story.trim().length}/{STORY_MAX_CHARS} | {current}/{max} | {current}/{max} | `form.story.counter` |
| F / aviso de paso 4 | Todo este paso es opcional. | Todo este paso es opcional. | Esta etapa é inteiramente opcional. | `form.media.optionalStep` |
| F / foto y resumen | Foto testimonial | Foto de tu experiencia | Foto da sua experiência | `form.fields.capture.label` |
| F / ayuda de foto | Una foto real de tu experiencia: trabajando, con tu equipo o en una reunión. | Una foto de tu experiencia: trabajando, con tu equipo o en una reunión. | Uma foto da sua experiência: trabalhando, com sua equipe ou em uma reunião. | `form.fields.capture.hint` |
| F / requisitos de foto | JPG, PNG o WebP · Máximo 8 MB. | JPG, PNG o WebP · Máximo {maxMb} MB. | JPG, PNG ou WebP · Máximo de {maxMb} MB. | `form.fields.capture.requirements` |
| F / label | Video de YouTube | Video de YouTube | Vídeo do YouTube | `form.fields.video_url.label` |
| F / ayuda | Solo un link de YouTube. No se sube un archivo. | Solo un enlace de YouTube. No se sube un archivo de video. | Apenas um link do YouTube. Não é feito o upload de um arquivo de vídeo. | `form.fields.video_url.hint` |
| F / placeholder técnico | https://www.youtube.com/watch?v= | https://www.youtube.com/watch?v= | https://www.youtube.com/watch?v= | `form.fields.video_url.placeholder` |
| F / label y resumen | Instagram | Instagram | Instagram | `form.fields.instagram.label` |
| F / ayuda | Para mencionarte en el caption si publicamos. | Para mencionarte en la descripción de Instagram si publicamos tu testimonio. | Para mencionar você na legenda do Instagram, caso seu depoimento seja publicado. | `form.fields.instagram.hint` |
| F / placeholder | @tu.usuario | @tu.usuario | @seu.usuario | `form.fields.instagram.placeholder` |
| F / label y resumen | LinkedIn | LinkedIn | LinkedIn | `form.fields.linkedin.label` |
| F / ayuda | Para mencionarte en el post de LinkedIn si publicamos. | Para mencionarte en la publicación de LinkedIn si publicamos tu testimonio. | Para mencionar você na publicação do LinkedIn, caso seu depoimento seja publicado. | `form.fields.linkedin.hint` |
| F / placeholder | https://www.linkedin.com/in/tu-usuario | https://www.linkedin.com/in/tu-usuario | https://www.linkedin.com/in/seu-usuario | `form.fields.linkedin.placeholder` |
| F / resumen de enlace | YouTube | YouTube | YouTube | `form.fields.video_url.summaryLabel` |

Los valores `5`, `8`, `20`, `4000` y `120` se obtendrían de las constantes existentes, nunca de un catálogo. Los ejemplos de placeholder no son datos de una persona: solo cambian el ejemplo vacío; no se modifica el valor de un campo ya completado.

## 4. Resumen y consentimiento

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| F / título | Revisá tu testimonio | Revisa tu testimonio | Revise seu depoimento | `form.review.title` |
| F / introducción | Comprobá que los datos estén correctos antes de enviarlo. | Comprueba que los datos sean correctos antes de enviarlo. | Confira se os dados estão corretos antes de enviar. | `form.review.description` |
| F / sección | Resumen | Resumen | Resumo | `form.review.summaryTitle` |
| F / subsección | Datos de tu testimonio | Datos de tu testimonio | Dados do seu depoimento | `form.review.testimonialTitle` |
| F / término | Tipo de experiencia | Tipo de experiencia | Tipo de experiência | `form.review.typeLabel` |
| F / término | Nombre | Nombre | Nome | `form.review.nameLabel` |
| F / categoría ausente | Sin seleccionar | Sin seleccionar | Não selecionado | `form.review.notSelected` |
| F / campo vacío | Falta completar | Pendiente de completar | Preenchimento pendente | `form.review.missing` |
| F / subsección | Datos de contacto | Datos de contacto | Dados de contato | `form.review.contactTitle` |
| F / privacidad | El email es privado: se usa como dato de contacto y no se publica. | El correo electrónico es privado: se usa como dato de contacto y no se publica. | O e-mail é privado: é usado como dado de contato e não é publicado. | `form.review.emailPrivacy` |
| F / subsección | Fotografías y enlaces | Fotografías y enlaces | Fotos e links | `form.review.mediaTitle` |
| F / avatar presente | Lista | Lista | Pronta | `form.review.avatarReady` |
| F / avatar ausente | Falta (obligatoria) | Pendiente (obligatoria) | Pendente (obrigatória) | `form.review.avatarMissing` |
| F / foto presente | Adjunta | Adjunta | Anexada | `form.review.captureAttached` |
| F / foto ausente | No agregada (opcional) | Sin adjuntar (opcional) | Não anexada (opcional) | `form.review.captureMissing` |
| F / moderación | El equipo de No Country revisará tu testimonio antes de publicarlo. | El equipo de No Country revisará tu testimonio antes de publicarlo. | A equipe da No Country revisará seu depoimento antes da publicação. | `form.review.moderationHint` |
| F / título de autorización | Consentimiento | Consentimiento | Consentimento | `form.consent.title` |
| F / autorización completa | Acepto que No Country publique mi testimonio (nombre, foto y texto) en la galería y en Discord. El email no se muestra en público. El equipo lo revisa antes de publicarlo. | Acepto que No Country publique mi testimonio (nombre, foto y texto) en la galería y en Discord. El email no se muestra en público. El equipo lo revisa antes de publicarlo. | Concordo que a No Country publique meu depoimento (nome, foto e texto) na galeria e no Discord. O e-mail não é exibido publicamente. A equipe revisa o depoimento antes da publicação. | `form.consent.body` |

**La autorización no se da por aprobada en portugués.** El texto ES se conserva íntegro para evitar ampliar su significado. Ambos deben pasar por revisión del equipo correspondiente. No se añaden Instagram, LinkedIn, video, otros usos o canales; no se mueve la casilla ni se altera su obligatoriedad o el registro `consent_at`. Las etiquetas reutilizadas de País, Empresa, Puesto, Ocupación y enlaces están inventariadas arriba; sus valores dinámicos no se traducen.

## 5. Campos reutilizables, imágenes y recorte

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| E / sr-only; F / tipo y consentimiento | (obligatorio) | (obligatorio) | (obrigatório) | `form.common.required` |
| E / sufijo disponible, no usado en los campos actuales | Opcional | Opcional | Opcional | `form.common.optional` |
| E / sin avatar | Agregar foto de perfil | Agregar foto de perfil | Adicionar foto de perfil | `form.images.addAvatar` |
| E / sin foto | Agregar fotografía | Agregar fotografía | Adicionar foto | `form.images.addCapture` |
| E / placeholder con diálogo abierto; C / confirmación en curso | Recortando… | Recortando… | Recortando… | `form.images.cropping` |
| E / aria-label de quitar avatar | Quitar foto | Quitar foto de perfil | Remover foto de perfil | `form.images.removeAvatar` |
| E / aria-label de quitar foto | Quitar foto testimonial | Quitar foto de tu experiencia | Remover foto da sua experiência | `form.images.removeCapture` |
| E / onInvalid; I / errores internos de Canvas | No pudimos recortar la foto. | No se pudo recortar la foto. | Não foi possível recortar a foto. | `form.errors.image.cropFailed` |
| C / título para ambos recortes | Recortá la foto | Recorta la foto | Recorte a foto | `form.crop.title` |
| C / explicación de foto testimonial | Mové la foto o hacé zoom hasta que quede como te guste. Así se va a ver en tu testimonio. | Mueve la foto o ajusta el zoom hasta obtener el encuadre que prefieras. Así se verá en tu testimonio. | Mova a foto ou ajuste o zoom até obter o enquadramento que preferir. É assim que ela aparecerá no seu depoimento. | `form.crop.captureDescription` |
| C / explicación de avatar | Mové la foto o hacé zoom hasta que tu cara quede centrada. Así se va a ver junto a tu nombre. | Mueve la foto o ajusta el zoom hasta centrar tu rostro. Así se verá junto a tu nombre. | Mova a foto ou ajuste o zoom até centralizar seu rosto. É assim que ela aparecerá ao lado do seu nome. | `form.crop.avatarDescription` |
| C / alt del medio | Foto para recortar | Foto para recortar | Foto para recortar | `form.crop.imageAlt` |
| C / aria-label del grupo | Área de recorte | Área de recorte | Área de recorte | `form.crop.areaLabel` |
| C / instrucción sr-only | Usá las flechas para mover la foto. Mantené Shift para ajustar con más precisión. | Usa las flechas para mover la foto. Mantén Shift para ajustar con más precisión. | Use as setas para mover a foto. Mantenha Shift pressionado para ajustar com mais precisão. | `form.crop.keyboardHint` |
| C / control | Zoom | Zoom | Zoom | `form.crop.zoomLabel` |
| C / botón | Cancelar | Cancelar | Cancelar | `form.crop.cancel` |
| C / botón | Usar recorte | Usar recorte | Usar recorte | `form.crop.confirm` |

El `alt=""` del preview de `FileField` es decorativo y debe seguir vacío; no falta una traducción. El SVG de introducción e iconos son decorativos. `aria-busy`, `inert`, `aria-invalid` y las relaciones de IDs no son textos a traducir. La instrucción de Shift se verificó en `react-easy-crop`: el paso se multiplica por `0.2`, de modo que **sí** aumenta la precisión. Nombres de archivos generados y nombres del participante no se traducen.

## 6. Validación y respuestas del servidor

Se muestran todos los mensajes alcanzables, agrupando repeticiones cliente/servidor. `{max}` corresponde a 120 para nombre/campos/país o 4000 para historia; `{min}` corresponde a 20. El error de imagen tiene dos labels posibles y dos máximos, que se explicitan para evitar concatenar fragmentos con problemas gramaticales.

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| V + R / categoría | Elegí qué querés contar. | Elige el tipo de experiencia que quieres compartir. | Escolha o tipo de experiência que deseja compartilhar. | `form.errors.type.required` |
| V + R / nombre | El nombre es obligatorio. | El nombre es obligatorio. | O nome é obrigatório. | `form.errors.full_name.required` |
| V + R / máximos | Máximo {max} caracteres. | Máximo {max} caracteres. | Máximo de {max} caracteres. | `form.errors.text.maxLength` |
| R / país, reutilizado por V | El país es obligatorio. | El país es obligatorio. | O país é obrigatório. | `form.errors.country.required` |
| R / país, reutilizado por V | Ingresá un nombre de país válido, sin números. | Ingresa un nombre de país válido, sin números. | Informe um nome de país válido, sem números. | `form.errors.country.invalid` |
| V + R / correo | El email es obligatorio. No se muestra en público. | El correo electrónico es obligatorio y no se publica. | O e-mail é obrigatório e não é publicado. | `form.errors.email.required` |
| V + R / correo | Ingresá un email válido. | Ingresa un correo electrónico válido. | Informe um e-mail válido. | `form.errors.email.invalid` |
| V + R / historia vacía | Contanos tu historia. | Comparte tu historia. | Compartilhe sua história. | `form.errors.story.required` |
| V + R / historia breve | Escribí al menos {min} caracteres. | Escribe al menos {min} caracteres. | Escreva pelo menos {min} caracteres. | `form.errors.story.minLength` |
| V + R / empresa | La empresa es obligatoria. | El nombre de la empresa es obligatorio. | O nome da empresa é obrigatório. | `form.errors.company.required` |
| V + R / puesto | El puesto es obligatorio. | El puesto es obligatorio. | O cargo é obrigatório. | `form.errors.role_achieved.required` |
| V + R / ocupación anterior | El oficio anterior es obligatorio. | La ocupación anterior es obligatoria. | A ocupação anterior é obrigatória. | `form.errors.previous_profession.required` |
| V + R / nuevo rol | El rol nuevo es obligatorio. | El nuevo rol es obligatorio. | A nova função é obrigatória. | `form.errors.new_role.required` |
| V + R / avatar ausente | Seleccioná una foto de perfil. | Selecciona una foto de perfil. | Selecione uma foto de perfil. | `form.errors.avatar.required` |
| R / formato de avatar, reutilizado por V | La foto de perfil: usá jpg, png o webp. | La foto de perfil debe estar en formato JPG, PNG o WebP. | A foto de perfil deve estar em formato JPG, PNG ou WebP. | `form.errors.avatar.format` |
| R / formato de foto, reutilizado por V | La foto testimonial: usá jpg, png o webp. | La foto de tu experiencia debe estar en formato JPG, PNG o WebP. | A foto da sua experiência deve estar em formato JPG, PNG ou WebP. | `form.errors.capture.format` |
| R / tamaño de avatar, reutilizado por V | La foto de perfil: máximo {maxMb} MB. | La foto de perfil no puede superar {maxMb} MB. | A foto de perfil não pode ultrapassar {maxMb} MB. | `form.errors.avatar.maxSize` |
| R / tamaño de foto, reutilizado por V | La foto testimonial: máximo {maxMb} MB. | La foto de tu experiencia no puede superar {maxMb} MB. | A foto da sua experiência não pode ultrapassar {maxMb} MB. | `form.errors.capture.maxSize` |
| V + R / YouTube | Pegá un link de YouTube (youtube.com o youtu.be). | Ingresa un enlace completo de YouTube (youtube.com o youtu.be). | Insira um link completo do YouTube (youtube.com ou youtu.be). | `form.errors.video_url.invalid` |
| V + R / Instagram | Usá tu usuario (@nombre) o el link de Instagram. | Ingresa tu usuario (@nombre) o el enlace de Instagram. | Informe seu usuário (@nome) ou o link do Instagram. | `form.errors.instagram.invalid` |
| V + R / LinkedIn | Pegá tu perfil (linkedin.com/in/…) o tu usuario. | Ingresa tu perfil (linkedin.com/in/…) o tu nombre de usuario. | Informe seu perfil (linkedin.com/in/…) ou seu nome de usuário. | `form.errors.linkedin.invalid` |
| V + R / consentimiento | Tenés que aceptar para enviar. | Debes aceptar la autorización para enviar tu testimonio. | Você precisa aceitar a autorização para enviar seu depoimento. | `form.errors.consent.required` |
| R / resumen de errores; V / comparación literal | Revisá los campos marcados. | Revisa los campos marcados. | Revise os campos indicados. | `form.errors.validation.summary` |
| A / extracción ausente | No pudimos armar el recorte del testimonio. Revisá el texto. | No se pudo preparar el extracto del testimonio. Revisa el texto. | Não foi possível preparar o trecho do depoimento. Revise o texto. | `form.errors.submit.excerptFailed` |
| S / configuración no disponible | Falta SUPABASE_SERVICE_ROLE_KEY. El envío no se puede guardar todavía. | No se puede guardar el testimonio en este momento. Inténtalo más tarde. | Não é possível salvar o depoimento neste momento. Tente novamente mais tarde. | `form.errors.submit.unavailable` |
| S / fallback de guardado | No pudimos guardar el testimonio. Probá de nuevo. | No se pudo guardar el testimonio. Inténtalo de nuevo. | Não foi possível salvar o depoimento. Tente novamente. | `form.errors.submit.saveFailed` |
| S / subida | No pudimos subir la imagen. Probá con jpg, png o webp. | No se pudo subir la imagen. Inténtalo de nuevo con un archivo JPG, PNG o WebP. | Não foi possível enviar a imagem. Tente novamente com um arquivo JPG, PNG ou WebP. | `form.errors.submit.uploadFailed` |
| S / error arbitrario | `lastError` con `error.message` de Supabase | No se pudo guardar el testimonio. Inténtalo de nuevo. | Não foi possível salvar o depoimento. Tente novamente. | `form.errors.submit.saveFailed` |

La fila de configuración contiene solo el **nombre** de una variable presente en el código, no su valor. No se inspeccionaron credenciales. Los detalles técnicos de persistencia no son mensajes localizables por comparación de texto: se recomienda un código acotado y un mensaje público del catálogo, manteniendo el diagnóstico técnico en servidor.

Existe además el fallback genérico de `validateImageFile`: `{label} es obligatorio.`. No se alcanza con las llamadas actuales del formulario: avatar proporciona `requiredMessage` y la foto es opcional. Si se mantiene esa API, debe producir una incidencia de «imagen obligatoria» tipada; no construir una frase traducida mediante un label con género gramatical.

## 7. Confirmación e invitación

| Archivo/componente | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| F / eyebrow de éxito | Listo | Listo | Pronto | `form.success.eyebrow` |
| F / H1 | Gracias por tu testimonio | Gracias por tu testimonio | Obrigado por compartilhar seu depoimento | `form.success.title` |
| F / confirmación | Recibimos tu testimonio. El equipo de No Country lo revisará antes de publicarlo. | Recibimos tu testimonio. El equipo de No Country lo revisará antes de publicarlo. | Recebemos seu depoimento. A equipe da No Country fará uma revisão antes da publicação. | `form.success.description` |
| F / invitación | Ahora ayudá a que otra persona se anime | Invita a otra persona a compartir su experiencia | Convide outra pessoa para compartilhar sua experiência | `form.success.inviteTitle` |
| F / ayuda de invitación | Si conocés a alguien con una experiencia para compartir, pasale este enlace. Su historia también puede ayudar a otras personas. | Si conoces a alguien que quiera compartir su experiencia, envíale este enlace. Su historia también puede ayudar a otras personas. | Se você conhece alguém que queira compartilhar sua experiência, envie este link. A história dessa pessoa também pode ajudar outras pessoas. | `form.success.inviteDescription` |
| F / botón de copia | Copiar enlace | Copiar enlace | Copiar link | `form.success.copy` |
| F / copia confirmada | Enlace copiado | Enlace copiado | Link copiado | `form.success.copied` |
| F / retorno | Volver al inicio | Volver al inicio | Voltar ao início | `form.navigation.home` |
| F / URL visible y href dinámicos | `{origin}/enviar` | `{origin}/enviar?lang=es` | `{origin}/enviar?lang=pt-BR` | Sin traducción de la URL: constructor validado por locale |

«Obrigado» es la voz institucional de agradecimiento, no una inferencia del género del participante. Si el equipo prefiere una fórmula sin esa flexión: «Agradecemos por compartilhar seu depoimento». La URL de invitación debe derivarse del idioma actual también si se cambia en la pantalla de éxito; no traducir su dominio ni valores introducidos por el usuario.

## 8. Países: labels traducibles, valores estables

Archivo: `lib/testimonials/countries.ts`, usado en F. La lista está marcada como **provisional** en el código. Propuesta: mantener cada string actual como `value` y traducir solo la etiqueta de la opción y su presentación en el resumen. Una futura migración a códigos ISO requiere otra decisión; no es parte de esta issue.

| Archivo/componente | Texto actual / value a conservar | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| countries / opción | Argentina | Argentina | Argentina | `form.countries.argentina` |
| countries / opción | Bolivia | Bolivia | Bolívia | `form.countries.bolivia` |
| countries / opción | Brasil | Brasil | Brasil | `form.countries.brasil` |
| countries / opción | Chile | Chile | Chile | `form.countries.chile` |
| countries / opción | Colombia | Colombia | Colômbia | `form.countries.colombia` |
| countries / opción | Costa Rica | Costa Rica | Costa Rica | `form.countries.costa_rica` |
| countries / opción | Ecuador | Ecuador | Equador | `form.countries.ecuador` |
| countries / opción | El Salvador | El Salvador | El Salvador | `form.countries.el_salvador` |
| countries / opción | España | España | Espanha | `form.countries.espana` |
| countries / opción | Guatemala | Guatemala | Guatemala | `form.countries.guatemala` |
| countries / opción | Honduras | Honduras | Honduras | `form.countries.honduras` |
| countries / opción | México | México | México | `form.countries.mexico` |
| countries / opción | Nicaragua | Nicaragua | Nicarágua | `form.countries.nicaragua` |
| countries / opción | Panamá | Panamá | Panamá | `form.countries.panama` |
| countries / opción | Paraguay | Paraguay | Paraguai | `form.countries.paraguay` |
| countries / opción | Perú | Perú | Peru | `form.countries.peru` |
| countries / opción | República Dominicana | República Dominicana | República Dominicana | `form.countries.republica_dominicana` |
| countries / opción | Uruguay | Uruguay | Uruguai | `form.countries.uruguay` |
| countries / opción | Venezuela | Venezuela | Venezuela | `form.countries.venezuela` |

No se modifica `__other_country__` ni se envía como país. El texto libre de «Otro país» no se traduce ni se sustituye por cambiar idioma; se mantienen el trim y las reglas existentes de validación/envío. Un país ya enviado no se modifica por cambiar la etiqueta visible del selector.

## 9. Textos nuevos necesarios para el selector propuesto

Estas filas **no existen actualmente**; no forman parte de los hechos del inventario anterior. Son propuestas para la futura implementación.

| Archivo/componente propuesto | Texto actual | Propuesta en español neutro | Propuesta inicial pt-BR | Clave sugerida |
| --- | --- | --- | --- | --- |
| `FormHeader` / selector | No existe | Idioma del formulario | Idioma do formulário | `form.language.label` |
| `FormHeader` / opción `es` | No existe | Español | Español | `form.language.es` |
| `FormHeader` / opción `pt-BR` | No existe | Português (Brasil) | Português (Brasil) | `form.language.ptBR` |
| `FormHeader` / label del enlace del logo | No existe; el header actual dice «Ir al inicio de No Country» | Ir al inicio de No Country | Ir para o início da No Country | `form.header.logoLinkLabel` |
| Errores inesperados sin respuesta estructurada | No existe un mensaje propio en el formulario para toda excepción | No se pudo completar el envío. Inténtalo de nuevo. | Não foi possível concluir o envio. Tente novamente. | `form.errors.submit.unexpected` |

Mostrar los nombres de los idiomas en su propio idioma, sin banderas, con `lang="es"` / `lang="pt-BR"` donde corresponda. No añadir una región live o cambio de foco automático solo por cambiar de idioma sin necesidad validada.

## 10. Límites del inventario

- No se traducen relato, nombre, empresa, puestos, ocupación, país libre, correo, handles, URLs ni archivos elegidos por el usuario. No se detecta ni transforma automáticamente el idioma del relato.
- No se localizan los enums `simulation`, `first_job`, `career_change`, los nombres de campos de `FormData`, `__other_country__`, el valor de consentimiento `1`, MIME types, ratios, nombres de archivos generados, IDs ni timestamps ISO.
- `No Country`, `Instagram`, `LinkedIn`, `YouTube`, `JPG`, `PNG`, `WebP`, `MB` y `Shift` conservan su identidad técnica; aparecen en el catálogo solo cuando forman parte de un mensaje completo.
- `Button` de `@repo/ui` recibe sus textos como children; no requiere cambios. El cropper recibe su alt y nombre de grupo desde la app; se revisó la implementación instalada y no se añade otra dependencia.
- `TestimonialCapture`, `YoutubeEmbed`, `TestimonialDetail`, la galería y el carrusel no son hijos del formulario. Sus textos y badges quedan fuera; no confundir el diálogo de ampliación de la ficha con `CaptureCropDialog`.
- Navbar/footer institucionales son chrome compartido, no copy propio del formulario. El nuevo header tendrá su catálogo acotado. El footer y sus textos legales/destinos pendientes requieren decisión separada; no se traducen íntegramente por esta auditoría.
- `quote.ts` produce extracto y captions persistidos, no mensajes de UI. Su introducción y hashtags se registran como dependencia fuera de alcance; no se traducen ni regeneran por el locale del formulario. Los mensajes/logs internos de Discord tampoco son respuestas de UI.
- Estados nativos del selector de archivos y mensajes excepcionales del framework/navegador no son cadenas del catálogo actual. La matriz futura debe distinguirlos de los mensajes propios controlados por la app.

## 11. Criterio editorial

Voseo localizado: «Contanos», «Compartí», «querés», «Elegí», «Seleccioná», «Especificá», «Revisá», «Comprobá», «Recortá», «Mové», «hacé», «Usá», «Mantené», «Ingresá», «Escribí», «Pegá», «Tenés», «Probá», «ayudá», «conocés» y «pasale». Sus equivalentes neutros se aplican al copy propio, no al contenido escrito por participantes.

También se sustituyen anglicismos innecesarios: «Links» → «Enlaces», «caption» → «descripción de Instagram», «post» → «publicación» y «Email» → «Correo electrónico». Portugués utiliza sus usos naturales («links», «legenda», «e-mail», «depoimento», «cargo», «equipe»), no calcos palabra por palabra. «Revisa», «Comparte» o «Ingresa» ya son tuteo neutro; «Conseguiste Empleo» se conserva tal como fue confirmado.
