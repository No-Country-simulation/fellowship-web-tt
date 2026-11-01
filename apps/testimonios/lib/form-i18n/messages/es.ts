import type { FormMessages } from "../types";

/** Editorial draft; consent remains pending editorial/legal review. Not wired to the UI. */
export const es = {
  form: {
    metadata: {
      title: "Comparte tu testimonio",
      description: "Comparte tu experiencia con No Country. Completa cinco pasos para enviar tu testimonio a revisión."
    },
    navigation: {
      home: "Volver al inicio",
      back: "Atrás",
      next: "Siguiente",
      correct: "Corregir los datos"
    },
    intro: {
      title: "Comparte tu experiencia",
      description: "Tu experiencia puede ayudar a otras personas a dar el siguiente paso. Comparte lo que aprendiste, cómo comenzaste o qué cambió en tu trayectoria.",
      requiredHint: "Los campos marcados con * son obligatorios."
    },
    common: {
      asterisk: "asterisco",
      required: "(obligatorio)",
      optional: "Opcional"
    },
    steps: {
      type: {
        title: "Qué quieres compartir",
        short: "Experiencia"
      },
      identity: {
        title: "Nombre, país, correo electrónico y foto",
        short: "Datos"
      },
      story: {
        title: "Tu historia",
        short: "Historia"
      },
      media: {
        title: "Foto de tu experiencia y enlaces",
        short: "Enlaces"
      },
      consent: {
        title: "Consentimiento",
        short: "Consentimiento"
      }
    },
    progress: "Paso {step} de {total} · {title}",
    categories: {
      legend: "Elige el tipo de experiencia",
      simulation: {
        label: "Tu experiencia en No Country",
        description: "Comparte lo que aprendiste y cómo fue tu experiencia en No Country.",
        storyLabel: "Cuéntanos tu experiencia en No Country",
        storyHint: "¿Qué aprendiste? ¿Cómo fue trabajar en equipo y qué te aportó la experiencia?"
      },
      career_change: {
        label: "Reconversión Profesional",
        description: "Comparte por qué cambiaste de profesión y cómo te está ayudando No Country.",
        storyLabel: "Cuéntanos por qué cambiaste de profesión y cómo te está ayudando No Country",
        storyHint: "¿Cuál era tu ocupación anterior? ¿Qué motivó el cambio y cómo estás viviendo esta nueva etapa?"
      },
      first_job: {
        label: "Conseguiste Empleo",
        description: "Comparte cómo tu experiencia en No Country te ayudó a conseguir empleo.",
        storyLabel: "Cuéntanos cómo te ayudó la experiencia en No Country",
        storyHint: "¿Cómo fue conseguir ese empleo? ¿Qué aportó tu experiencia previa?"
      }
    },
    submit: {
      label: "Enviar testimonio",
      pending: "Enviando…"
    },
    fields: {
      avatar: {
        label: "Foto de perfil",
        requirements: "JPG, PNG o WebP · Máximo {maxMb} MB."
      },
      full_name: {
        label: "Nombre completo",
        placeholder: "Tu nombre completo"
      },
      country: {
        label: "País",
        placeholder: "Selecciona un país",
        other: "Otro país",
        customLabel: "Especifica tu país"
      },
      email: {
        label: "Correo electrónico",
        placeholder: "nombre@example.com"
      },
      primary_role: {
        label: "Puesto principal",
        hint: "El rol que desempeñaste en la simulación."
      },
      company: {
        label: "Empresa"
      },
      role_achieved: {
        label: "Puesto"
      },
      previous_profession: {
        label: "Ocupación anterior"
      },
      new_role: {
        label: "Nuevo rol"
      },
      capture: {
        label: "Foto de tu experiencia",
        hint: "Una foto de tu experiencia: trabajando, con tu equipo o en una reunión.",
        requirements: "JPG, PNG o WebP · Máximo {maxMb} MB."
      },
      video_url: {
        label: "Video de YouTube",
        hint: "Solo un enlace de YouTube. No se sube un archivo de video.",
        placeholder: "https://www.youtube.com/watch?v=",
        summaryLabel: "YouTube"
      },
      instagram: {
        label: "Instagram",
        hint: "Para mencionarte en la descripción de Instagram si publicamos tu testimonio.",
        placeholder: "@tu.usuario"
      },
      linkedin: {
        label: "LinkedIn",
        hint: "Para mencionarte en la publicación de LinkedIn si publicamos tu testimonio.",
        placeholder: "https://www.linkedin.com/in/tu-usuario"
      }
    },
    story: {
      reviewNotice: "Cambiaste el tipo de experiencia. Revisa que tu historia responda a la nueva pregunta.",
      defaultHint: "Con tus propias palabras.",
      hintWithLimits: "{hint} Entre {min} y {max} caracteres.",
      counter: "{current}/{max}"
    },
    media: {
      optionalStep: "Todo este paso es opcional."
    },
    review: {
      title: "Revisa tu testimonio",
      description: "Comprueba que los datos sean correctos antes de enviarlo.",
      summaryTitle: "Resumen",
      testimonialTitle: "Datos de tu testimonio",
      typeLabel: "Tipo de experiencia",
      nameLabel: "Nombre",
      notSelected: "Sin seleccionar",
      missing: "Pendiente de completar",
      contactTitle: "Datos de contacto",
      emailPrivacy: "El correo electrónico es privado: se usa como dato de contacto y no se publica.",
      mediaTitle: "Fotografías y enlaces",
      avatarReady: "Lista",
      avatarMissing: "Pendiente (obligatoria)",
      captureAttached: "Adjunta",
      captureMissing: "Sin adjuntar (opcional)",
      moderationHint: "El equipo de No Country revisará tu testimonio antes de publicarlo."
    },
    consent: {
      title: "Consentimiento",
      body: "Acepto que No Country publique mi testimonio (nombre, foto y texto) en la galería y en Discord. El email no se muestra en público. El equipo lo revisa antes de publicarlo."
    },
    images: {
      addAvatar: "Agregar foto de perfil",
      addCapture: "Agregar fotografía",
      cropping: "Recortando…",
      removeAvatar: "Quitar foto de perfil",
      removeCapture: "Quitar foto de tu experiencia"
    },
    errors: {
      image: {
        cropFailed: "No se pudo recortar la foto."
      },
      type: {
        required: "Elige el tipo de experiencia que quieres compartir."
      },
      full_name: {
        required: "El nombre es obligatorio."
      },
      text: {
        maxLength: "Máximo {max} caracteres."
      },
      country: {
        required: "El país es obligatorio.",
        invalid: "Ingresa un nombre de país válido, sin números."
      },
      email: {
        required: "El correo electrónico es obligatorio y no se publica.",
        invalid: "Ingresa un correo electrónico válido."
      },
      story: {
        required: "Comparte tu historia.",
        minLength: "Escribe al menos {min} caracteres."
      },
      company: {
        required: "El nombre de la empresa es obligatorio."
      },
      role_achieved: {
        required: "El puesto es obligatorio."
      },
      previous_profession: {
        required: "La ocupación anterior es obligatoria."
      },
      new_role: {
        required: "El nuevo rol es obligatorio."
      },
      avatar: {
        required: "Selecciona una foto de perfil.",
        format: "La foto de perfil debe estar en formato JPG, PNG o WebP.",
        maxSize: "La foto de perfil no puede superar {maxMb} MB."
      },
      capture: {
        format: "La foto de tu experiencia debe estar en formato JPG, PNG o WebP.",
        maxSize: "La foto de tu experiencia no puede superar {maxMb} MB."
      },
      video_url: {
        invalid: "Ingresa un enlace completo de YouTube (youtube.com o youtu.be)."
      },
      instagram: {
        invalid: "Ingresa tu usuario (@nombre) o el enlace de Instagram."
      },
      linkedin: {
        invalid: "Ingresa tu perfil (linkedin.com/in/…) o tu nombre de usuario."
      },
      consent: {
        required: "Debes aceptar la autorización para enviar tu testimonio."
      },
      validation: {
        summary: "Revisa los campos marcados."
      },
      submit: {
        excerptFailed: "No se pudo preparar el extracto del testimonio. Revisa el texto.",
        unavailable: "No se puede guardar el testimonio en este momento. Inténtalo más tarde.",
        saveFailed: "No se pudo guardar el testimonio. Inténtalo de nuevo.",
        uploadFailed: "No se pudo subir la imagen. Inténtalo de nuevo con un archivo JPG, PNG o WebP.",
        unexpected: "No se pudo completar el envío. Inténtalo de nuevo."
      }
    },
    crop: {
      title: "Recorta la foto",
      captureDescription: "Mueve la foto o ajusta el zoom hasta obtener el encuadre que prefieras. Así se verá en tu testimonio.",
      avatarDescription: "Mueve la foto o ajusta el zoom hasta centrar tu rostro. Así se verá junto a tu nombre.",
      imageAlt: "Foto para recortar",
      areaLabel: "Área de recorte",
      keyboardHint: "Usa las flechas para mover la foto. Mantén Shift para ajustar con más precisión.",
      zoomLabel: "Zoom",
      cancel: "Cancelar",
      confirm: "Usar recorte"
    },
    success: {
      eyebrow: "Listo",
      title: "Gracias por tu testimonio",
      description: "Recibimos tu testimonio. El equipo de No Country lo revisará antes de publicarlo.",
      inviteTitle: "Invita a otra persona a compartir su experiencia",
      inviteDescription: "Si conoces a alguien que quiera compartir su experiencia, envíale este enlace. Su historia también puede ayudar a otras personas.",
      copy: "Copiar enlace",
      copied: "Enlace copiado"
    },
    countries: {
      argentina: "Argentina",
      bolivia: "Bolivia",
      brasil: "Brasil",
      chile: "Chile",
      colombia: "Colombia",
      costa_rica: "Costa Rica",
      ecuador: "Ecuador",
      el_salvador: "El Salvador",
      espana: "España",
      guatemala: "Guatemala",
      honduras: "Honduras",
      mexico: "México",
      nicaragua: "Nicaragua",
      panama: "Panamá",
      paraguay: "Paraguay",
      peru: "Perú",
      republica_dominicana: "República Dominicana",
      uruguay: "Uruguay",
      venezuela: "Venezuela"
    },
    language: {
      label: "Idioma del formulario",
      es: "Español",
      ptBR: "Português (Brasil)"
    },
    header: {
      logoLinkLabel: "Ir al inicio de No Country"
    }
  }
} satisfies FormMessages;
