import type { TestimonialType } from "../testimonials/types";

/** Shared string contract, independent of any language's literal values. */
type CategoryMessages = Readonly<Record<
  "label" | "description" | "storyLabel" | "storyHint",
  string
>>;

export type FormMessages = {
  readonly form: {
    readonly metadata: {
      readonly title: string;
      readonly description: string;
    };
    readonly navigation: {
      readonly home: string;
      readonly back: string;
      readonly next: string;
      readonly correct: string;
    };
    readonly intro: {
      readonly title: string;
      readonly description: string;
      readonly requiredHint: string;
    };
    readonly common: {
      readonly asterisk: string;
      readonly required: string;
      readonly optional: string;
    };
    readonly steps: {
      readonly type: {
        readonly title: string;
        readonly short: string;
      };
      readonly identity: {
        readonly title: string;
        readonly short: string;
      };
      readonly story: {
        readonly title: string;
        readonly short: string;
      };
      readonly media: {
        readonly title: string;
        readonly short: string;
      };
      readonly consent: {
        readonly title: string;
        readonly short: string;
      };
    };
    readonly progress: string;
    readonly categories: { readonly legend: string } & Readonly<Record<TestimonialType, CategoryMessages>>;
    readonly submit: {
      readonly label: string;
      readonly pending: string;
    };
    readonly fields: {
      readonly avatar: {
        readonly label: string;
        readonly requirements: string;
      };
      readonly full_name: {
        readonly label: string;
        readonly placeholder: string;
      };
      readonly country: {
        readonly label: string;
        readonly placeholder: string;
        readonly other: string;
        readonly customLabel: string;
      };
      readonly email: {
        readonly label: string;
        readonly placeholder: string;
      };
      readonly primary_role: {
        readonly label: string;
        readonly hint: string;
      };
      readonly company: {
        readonly label: string;
      };
      readonly role_achieved: {
        readonly label: string;
      };
      readonly previous_profession: {
        readonly label: string;
      };
      readonly new_role: {
        readonly label: string;
      };
      readonly capture: {
        readonly label: string;
        readonly hint: string;
        readonly requirements: string;
      };
      readonly video_url: {
        readonly label: string;
        readonly hint: string;
        readonly placeholder: string;
        readonly summaryLabel: string;
      };
      readonly instagram: {
        readonly label: string;
        readonly hint: string;
        readonly placeholder: string;
      };
      readonly linkedin: {
        readonly label: string;
        readonly hint: string;
        readonly placeholder: string;
      };
    };
    readonly story: {
      readonly reviewNotice: string;
      readonly defaultHint: string;
      readonly hintWithLimits: string;
      readonly counter: string;
    };
    readonly media: {
      readonly optionalStep: string;
    };
    readonly review: {
      readonly title: string;
      readonly description: string;
      readonly summaryTitle: string;
      readonly testimonialTitle: string;
      readonly typeLabel: string;
      readonly nameLabel: string;
      readonly notSelected: string;
      readonly missing: string;
      readonly contactTitle: string;
      readonly emailPrivacy: string;
      readonly mediaTitle: string;
      readonly avatarReady: string;
      readonly avatarMissing: string;
      readonly captureAttached: string;
      readonly captureMissing: string;
      readonly moderationHint: string;
    };
    readonly consent: {
      readonly title: string;
      readonly body: string;
    };
    readonly images: {
      readonly addAvatar: string;
      readonly addCapture: string;
      readonly cropping: string;
      readonly removeAvatar: string;
      readonly removeCapture: string;
    };
    readonly errors: {
      readonly image: {
        readonly cropFailed: string;
      };
      readonly type: {
        readonly required: string;
      };
      readonly full_name: {
        readonly required: string;
      };
      readonly text: {
        readonly maxLength: string;
      };
      readonly country: {
        readonly required: string;
        readonly invalid: string;
      };
      readonly email: {
        readonly required: string;
        readonly invalid: string;
      };
      readonly story: {
        readonly required: string;
        readonly minLength: string;
      };
      readonly company: {
        readonly required: string;
      };
      readonly role_achieved: {
        readonly required: string;
      };
      readonly previous_profession: {
        readonly required: string;
      };
      readonly new_role: {
        readonly required: string;
      };
      readonly avatar: {
        readonly required: string;
        readonly format: string;
        readonly maxSize: string;
      };
      readonly capture: {
        readonly format: string;
        readonly maxSize: string;
      };
      readonly video_url: {
        readonly invalid: string;
      };
      readonly instagram: {
        readonly invalid: string;
      };
      readonly linkedin: {
        readonly invalid: string;
      };
      readonly consent: {
        readonly required: string;
      };
      readonly validation: {
        readonly summary: string;
      };
      readonly submit: {
        readonly excerptFailed: string;
        readonly unavailable: string;
        readonly saveFailed: string;
        readonly uploadFailed: string;
        readonly unexpected: string;
      };
    };
    readonly crop: {
      readonly title: string;
      readonly captureDescription: string;
      readonly avatarDescription: string;
      readonly imageAlt: string;
      readonly areaLabel: string;
      readonly keyboardHint: string;
      readonly zoomLabel: string;
      readonly cancel: string;
      readonly confirm: string;
    };
    readonly success: {
      readonly eyebrow: string;
      readonly title: string;
      readonly description: string;
      readonly inviteTitle: string;
      readonly inviteDescription: string;
      readonly copy: string;
      readonly copied: string;
    };
    readonly countries: {
      readonly argentina: string;
      readonly bolivia: string;
      readonly brasil: string;
      readonly chile: string;
      readonly colombia: string;
      readonly costa_rica: string;
      readonly ecuador: string;
      readonly el_salvador: string;
      readonly espana: string;
      readonly guatemala: string;
      readonly honduras: string;
      readonly mexico: string;
      readonly nicaragua: string;
      readonly panama: string;
      readonly paraguay: string;
      readonly peru: string;
      readonly republica_dominicana: string;
      readonly uruguay: string;
      readonly venezuela: string;
    };
    readonly language: {
      readonly label: string;
      readonly es: string;
      readonly ptBR: string;
    };
    readonly header: {
      readonly logoLinkLabel: string;
    };
  };
};

type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : `${K}.${LeafPaths<T[K]>}`;
}[keyof T & string];

export type FormMessageKey = LeafPaths<FormMessages>;
export type FormCountryKey = keyof FormMessages["form"]["countries"];
