import type { FormMessages } from "../types";

/** Brazilian editorial draft; consent remains pending editorial/legal review before release. */
export const ptBR = {
  form: {
    metadata: {
      title: "Compartilhe seu depoimento",
      description: "Compartilhe sua experiência com a No Country. Preencha cinco etapas para enviar seu depoimento para análise."
    },
    navigation: {
      home: "Voltar ao início",
      back: "Voltar",
      next: "Próximo",
      correct: "Corrigir os dados"
    },
    intro: {
      title: "Compartilhe sua experiência",
      description: "Sua experiência pode ajudar outras pessoas a dar o próximo passo. Compartilhe o que aprendeu, como começou ou o que mudou na sua trajetória.",
      requiredHint: "Os campos marcados com * são obrigatórios."
    },
    common: {
      asterisk: "asterisco",
      required: "(obrigatório)",
      optional: "Opcional"
    },
    steps: {
      type: {
        title: "O que você quer compartilhar",
        short: "Experiência"
      },
      identity: {
        title: "Nome, país, e-mail e foto",
        short: "Dados"
      },
      story: {
        title: "Sua história",
        short: "História"
      },
      media: {
        title: "Foto da sua experiência e links",
        short: "Links"
      },
      consent: {
        title: "Consentimento",
        short: "Consentimento"
      }
    },
    progress: "Etapa {step} de {total} · {title}",
    categories: {
      legend: "Escolha o tipo de experiência",
      simulation: {
        label: "Sua experiência na No Country",
        description: "Compartilhe o que aprendeu e como foi sua experiência na No Country.",
        storyLabel: "Conte como foi sua experiência na No Country",
        storyHint: "O que você aprendeu? Como foi trabalhar em equipe e o que essa experiência trouxe para você?"
      },
      career_change: {
        label: "Transição de carreira",
        description: "Compartilhe por que mudou de profissão e como a No Country está ajudando você.",
        storyLabel: "Conte por que mudou de profissão e como a No Country está ajudando você",
        storyHint: "Qual era sua ocupação anterior? O que motivou a mudança e como está sendo essa nova etapa?"
      },
      first_job: {
        label: "Conseguiu um emprego",
        description: "Compartilhe como sua experiência na No Country ajudou você a conseguir um emprego.",
        storyLabel: "Conte como a experiência na No Country ajudou você",
        storyHint: "Como foi conseguir esse emprego? Qual foi a contribuição da sua experiência anterior?"
      }
    },
    submit: {
      label: "Enviar depoimento",
      pending: "Enviando…"
    },
    fields: {
      avatar: {
        label: "Foto de perfil",
        requirements: "JPG, PNG ou WebP · Máximo de {maxMb} MB."
      },
      full_name: {
        label: "Nome completo",
        placeholder: "Seu nome completo"
      },
      country: {
        label: "País",
        placeholder: "Selecione um país",
        other: "Outro país",
        customLabel: "Informe seu país"
      },
      email: {
        label: "E-mail",
        placeholder: "nome@example.com"
      },
      primary_role: {
        label: "Função principal",
        hint: "A função que você desempenhou na simulação."
      },
      company: {
        label: "Empresa"
      },
      role_achieved: {
        label: "Cargo"
      },
      previous_profession: {
        label: "Ocupação anterior"
      },
      new_role: {
        label: "Nova função"
      },
      capture: {
        label: "Foto da sua experiência",
        hint: "Uma foto da sua experiência: trabalhando, com sua equipe ou em uma reunião.",
        requirements: "JPG, PNG ou WebP · Máximo de {maxMb} MB."
      },
      video_url: {
        label: "Vídeo do YouTube",
        hint: "Apenas um link do YouTube. Não é feito o upload de um arquivo de vídeo.",
        placeholder: "https://www.youtube.com/watch?v=",
        summaryLabel: "YouTube"
      },
      instagram: {
        label: "Instagram",
        hint: "Para mencionar você na legenda do Instagram, caso seu depoimento seja publicado.",
        placeholder: "@seu.usuario"
      },
      linkedin: {
        label: "LinkedIn",
        hint: "Para mencionar você na publicação do LinkedIn, caso seu depoimento seja publicado.",
        placeholder: "https://www.linkedin.com/in/seu-usuario"
      }
    },
    story: {
      reviewNotice: "Você mudou o tipo de experiência. Confira se sua história responde à nova pergunta.",
      defaultHint: "Com suas próprias palavras.",
      hintWithLimits: "{hint} Entre {min} e {max} caracteres.",
      counter: "{current}/{max}"
    },
    media: {
      optionalStep: "Esta etapa é inteiramente opcional."
    },
    review: {
      title: "Revise seu depoimento",
      description: "Confira se os dados estão corretos antes de enviar.",
      summaryTitle: "Resumo",
      testimonialTitle: "Dados do seu depoimento",
      typeLabel: "Tipo de experiência",
      nameLabel: "Nome",
      notSelected: "Não selecionado",
      missing: "Preenchimento pendente",
      contactTitle: "Dados de contato",
      emailPrivacy: "O e-mail é privado: é usado como dado de contato e não é publicado.",
      mediaTitle: "Fotos e links",
      avatarReady: "Pronta",
      avatarMissing: "Pendente (obrigatória)",
      captureAttached: "Anexada",
      captureMissing: "Não anexada (opcional)",
      moderationHint: "A equipe da No Country revisará seu depoimento antes da publicação."
    },
    consent: {
      title: "Consentimento",
      body: "Concordo que a No Country publique meu depoimento (nome, foto e texto) na galeria e no Discord. O e-mail não é exibido publicamente. A equipe revisa o depoimento antes da publicação."
    },
    images: {
      addAvatar: "Adicionar foto de perfil",
      addCapture: "Adicionar foto",
      cropping: "Recortando…",
      removeAvatar: "Remover foto de perfil",
      removeCapture: "Remover foto da sua experiência"
    },
    errors: {
      image: {
        cropFailed: "Não foi possível recortar a foto."
      },
      type: {
        required: "Escolha o tipo de experiência que deseja compartilhar."
      },
      full_name: {
        required: "O nome é obrigatório."
      },
      text: {
        maxLength: "Máximo de {max} caracteres."
      },
      country: {
        required: "O país é obrigatório.",
        invalid: "Informe um nome de país válido, sem números."
      },
      email: {
        required: "O e-mail é obrigatório e não é publicado.",
        invalid: "Informe um e-mail válido."
      },
      story: {
        required: "Compartilhe sua história.",
        minLength: "Escreva pelo menos {min} caracteres."
      },
      company: {
        required: "O nome da empresa é obrigatório."
      },
      role_achieved: {
        required: "O cargo é obrigatório."
      },
      previous_profession: {
        required: "A ocupação anterior é obrigatória."
      },
      new_role: {
        required: "A nova função é obrigatória."
      },
      avatar: {
        required: "Selecione uma foto de perfil.",
        format: "A foto de perfil deve estar em formato JPG, PNG ou WebP.",
        maxSize: "A foto de perfil não pode ultrapassar {maxMb} MB."
      },
      capture: {
        format: "A foto da sua experiência deve estar em formato JPG, PNG ou WebP.",
        maxSize: "A foto da sua experiência não pode ultrapassar {maxMb} MB."
      },
      video_url: {
        invalid: "Insira um link completo do YouTube (youtube.com ou youtu.be)."
      },
      instagram: {
        invalid: "Informe seu usuário (@nome) ou o link do Instagram."
      },
      linkedin: {
        invalid: "Informe seu perfil (linkedin.com/in/…) ou seu nome de usuário."
      },
      consent: {
        required: "Você precisa aceitar a autorização para enviar seu depoimento."
      },
      validation: {
        summary: "Revise os campos indicados."
      },
      submit: {
        excerptFailed: "Não foi possível preparar o trecho do depoimento. Revise o texto.",
        unavailable: "Não é possível salvar o depoimento neste momento. Tente novamente mais tarde.",
        saveFailed: "Não foi possível salvar o depoimento. Tente novamente.",
        uploadFailed: "Não foi possível enviar a imagem. Tente novamente com um arquivo JPG, PNG ou WebP.",
        unexpected: "Não foi possível concluir o envio. Tente novamente."
      }
    },
    crop: {
      title: "Recorte a foto",
      captureDescription: "Mova a foto ou ajuste o zoom até obter o enquadramento que preferir. É assim que ela aparecerá no seu depoimento.",
      avatarDescription: "Mova a foto ou ajuste o zoom até centralizar seu rosto. É assim que ela aparecerá ao lado do seu nome.",
      imageAlt: "Foto para recortar",
      areaLabel: "Área de recorte",
      keyboardHint: "Use as setas para mover a foto. Mantenha Shift pressionado para ajustar com mais precisão.",
      zoomLabel: "Zoom",
      cancel: "Cancelar",
      confirm: "Usar recorte"
    },
    success: {
      eyebrow: "Pronto",
      title: "Obrigado por compartilhar seu depoimento",
      description: "Recebemos seu depoimento. A equipe da No Country fará uma revisão antes da publicação.",
      inviteTitle: "Convide outra pessoa para compartilhar sua experiência",
      inviteDescription: "Se você conhece alguém que queira compartilhar sua experiência, envie este link. A história dessa pessoa também pode ajudar outras pessoas.",
      copy: "Copiar link",
      copied: "Link copiado"
    },
    countries: {
      argentina: "Argentina",
      bolivia: "Bolívia",
      brasil: "Brasil",
      chile: "Chile",
      colombia: "Colômbia",
      costa_rica: "Costa Rica",
      ecuador: "Equador",
      el_salvador: "El Salvador",
      espana: "Espanha",
      guatemala: "Guatemala",
      honduras: "Honduras",
      mexico: "México",
      nicaragua: "Nicarágua",
      panama: "Panamá",
      paraguay: "Paraguai",
      peru: "Peru",
      republica_dominicana: "República Dominicana",
      uruguay: "Uruguai",
      venezuela: "Venezuela"
    },
    language: {
      label: "Idioma do formulário",
      es: "Español",
      ptBR: "Português (Brasil)"
    },
    header: {
      logoLinkLabel: "Ir para o início da No Country"
    }
  }
} satisfies FormMessages;
