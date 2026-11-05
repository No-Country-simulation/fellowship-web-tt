import type { FormMessages } from "../types";

/** English copy; consent remains pending editorial/legal review before release. */
export const en = {
  form: {
    metadata: {
      title: "Share your testimonial",
      description: "Share your experience with No Country. Complete five steps to submit your testimonial for review."
    },
    navigation: {
      home: "Back to home",
      back: "Back",
      backToStep: "Back to step {step}: {title}",
      previousStepsHint: "Tap an earlier step to go back",
      next: "Next",
      correct: "Correct the information"
    },
    intro: {
      title: "Share your experience",
      description: "Your experience can help others take the next step. Share what you learned, how you got started, or what changed in your career journey.",
      requiredHint: "Fields marked with * are required."
    },
    common: {
      asterisk: "asterisk",
      required: "(required)",
      optional: "Optional"
    },
    steps: {
      type: {
        title: "What would you like to share?",
        short: "Experience"
      },
      identity: {
        title: "Name, country, email, and photo",
        short: "Details"
      },
      story: {
        title: "Your story",
        short: "Story"
      },
      media: {
        title: "Photo of your experience and links",
        short: "Links"
      },
      consent: {
        title: "Consent",
        short: "Consent"
      }
    },
    progress: "Step {step} of {total} · {title}",
    categories: {
      legend: "Choose the type of experience",
      simulation: {
        label: "Your experience at No Country",
        description: "Share what you learned and what your experience at No Country was like.",
        storyLabel: "Tell us about your experience at No Country",
        storyHint: "What did you learn? What was working in a team like, and what did you gain from the experience?"
      },
      career_change: {
        label: "Career Change",
        description: "Share why you changed careers and how No Country is helping you.",
        storyLabel: "Tell us why you changed careers and how No Country is helping you",
        storyHint: "What was your previous occupation? What inspired the change, and what has this new stage been like?"
      },
      first_job: {
        label: "Got a Job",
        description: "Share how your experience at No Country helped you find a job.",
        storyLabel: "Tell us how your experience at No Country helped you",
        storyHint: "What was it like to land that job? How did your previous experience contribute?"
      }
    },
    submit: {
      label: "Submit testimonial",
      pending: "Submitting…"
    },
    fields: {
      avatar: {
        label: "Profile photo",
        requirements: "JPG, PNG, or WebP · Maximum {maxMb} MB."
      },
      full_name: {
        label: "Full name",
        placeholder: "Your full name"
      },
      country: {
        label: "Country",
        placeholder: "Select a country",
        other: "Other country",
        customLabel: "Specify your country"
      },
      email: {
        label: "Email address",
        placeholder: "name@example.com"
      },
      primary_role: {
        label: "Primary role",
        hint: "The role you held during the simulation."
      },
      company: {
        label: "Company"
      },
      role_achieved: {
        label: "Job title"
      },
      previous_profession: {
        label: "Previous occupation"
      },
      new_role: {
        label: "New role"
      },
      capture: {
        label: "Photo of your experience",
        hint: "A photo from your experience: working, with your team, or in a meeting.",
        requirements: "JPG, PNG, or WebP · Maximum {maxMb} MB."
      },
      video_url: {
        label: "YouTube video",
        hint: "Only a YouTube link. No video file is uploaded.",
        placeholder: "https://www.youtube.com/watch?v=",
        summaryLabel: "YouTube"
      },
      instagram: {
        label: "Instagram",
        hint: "So we can mention you in the Instagram caption if we publish your testimonial.",
        placeholder: "@your.username"
      },
      linkedin: {
        label: "LinkedIn",
        hint: "So we can mention you in the LinkedIn post if we publish your testimonial.",
        placeholder: "https://www.linkedin.com/in/your-username"
      }
    },
    story: {
      reviewNotice: "You changed the type of experience. Check that your story answers the new question.",
      defaultHint: "In your own words.",
      hintWithLimits: "{hint} Between {min} and {max} characters.",
      counter: "{current}/{max}"
    },
    media: {
      optionalStep: "This entire step is optional."
    },
    review: {
      title: "Review your testimonial",
      description: "Make sure the information is correct before submitting.",
      summaryTitle: "Summary",
      personalTitle: "Personal details",
      experienceTitle: "Your experience",
      testimonialTitle: "Your testimonial details",
      typeLabel: "Type of experience",
      nameLabel: "Name",
      notSelected: "Not selected",
      missing: "Not yet completed",
      contactTitle: "Contact details",
      emailPrivacy: "Your email address is private: it is used for contact and is not published.",
      mediaTitle: "Photos and links",
      avatarReady: "Ready",
      avatarMissing: "Missing (required)",
      captureAttached: "Attached",
      captureMissing: "No experience photo attached (optional)",
      moderationHint: "The No Country team will review your testimonial before publishing it."
    },
    consent: {
      title: "Consent",
      body: "I agree that No Country may publish my testimonial (name, photo, and text) in the gallery and on Discord. My email address will not be displayed publicly. The team will review it before publishing."
    },
    images: {
      addAvatar: "Add profile photo",
      addCapture: "Add photo",
      cropping: "Cropping…",
      removeAvatar: "Remove profile photo",
      removeCapture: "Remove photo of your experience"
    },
    errors: {
      image: {
        cropFailed: "The photo could not be cropped."
      },
      type: {
        required: "Choose the type of experience you want to share."
      },
      full_name: {
        required: "Name is required."
      },
      text: {
        maxLength: "Maximum {max} characters."
      },
      country: {
        required: "Country is required.",
        invalid: "Enter a valid country name without numbers."
      },
      email: {
        required: "An email address is required and will not be published.",
        invalid: "Enter a valid email address."
      },
      story: {
        required: "Share your story.",
        minLength: "Write at least {min} characters."
      },
      company: {
        required: "Company name is required."
      },
      role_achieved: {
        required: "Job title is required."
      },
      previous_profession: {
        required: "Previous occupation is required."
      },
      new_role: {
        required: "New role is required."
      },
      avatar: {
        required: "Choose a profile photo.",
        format: "The profile photo must be a JPG, PNG, or WebP file.",
        maxSize: "The profile photo must not exceed {maxMb} MB."
      },
      capture: {
        format: "The photo of your experience must be a JPG, PNG, or WebP file.",
        maxSize: "The photo of your experience must not exceed {maxMb} MB."
      },
      video_url: {
        invalid: "Enter a complete YouTube link (youtube.com or youtu.be)."
      },
      instagram: {
        invalid: "Enter your username (@name) or Instagram link."
      },
      linkedin: {
        invalid: "Enter your profile (linkedin.com/in/…) or username."
      },
      consent: {
        required: "You must accept the authorization to submit your testimonial."
      },
      validation: {
        summary: "Review the highlighted fields."
      },
      submit: {
        excerptFailed: "The testimonial excerpt could not be prepared. Review your text.",
        unavailable: "Your testimonial cannot be saved right now. Try again later.",
        saveFailed: "Your testimonial could not be saved. Try again.",
        uploadFailed: "The image could not be uploaded. Try again with a JPG, PNG, or WebP file.",
        unexpected: "Your testimonial could not be submitted. Try again."
      }
    },
    crop: {
      title: "Crop your photo",
      captureDescription: "Move the photo or adjust the zoom until you get the framing you prefer. This is how it will appear in your testimonial.",
      avatarDescription: "Move the photo or adjust the zoom to center your face. This is how it will appear next to your name.",
      imageAlt: "Photo to crop",
      areaLabel: "Crop area",
      keyboardHint: "Use the arrow keys to move the photo. Hold Shift for finer adjustments.",
      zoomLabel: "Zoom",
      cancel: "Cancel",
      confirm: "Use crop"
    },
    success: {
      eyebrow: "Done",
      title: "Thank you for your testimonial",
      description: "We received your testimonial. The No Country team will review it before publishing.",
      inviteTitle: "Invite someone else to share their experience",
      inviteDescription: "If you know someone who would like to share their experience, send them this link. Their story could help others, too.",
      copy: "Copy link",
      copied: "Link copied"
    },
    countries: {
      argentina: "Argentina",
      bolivia: "Bolivia",
      brasil: "Brazil",
      chile: "Chile",
      colombia: "Colombia",
      costa_rica: "Costa Rica",
      ecuador: "Ecuador",
      el_salvador: "El Salvador",
      espana: "Spain",
      guatemala: "Guatemala",
      honduras: "Honduras",
      mexico: "Mexico",
      nicaragua: "Nicaragua",
      panama: "Panama",
      paraguay: "Paraguay",
      peru: "Peru",
      republica_dominicana: "Dominican Republic",
      uruguay: "Uruguay",
      venezuela: "Venezuela"
    },
    language: {
      label: "Form language",
      en: "English",
      es: "Español",
      ptBR: "Português (Brasil)"
    },
    header: {
      logoLinkLabel: "Go to No Country home"
    }
  }
} satisfies FormMessages;
