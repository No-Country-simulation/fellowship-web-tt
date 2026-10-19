type HeroStory = {
  id: string;
  quote: string;
  displayName: string;
  category: string;
};

// TODO: reemplazar estos ejemplos por historias reales autorizadas antes de producción.
export const HERO_STORIES = [
  {
    id: "example-simulation",
    quote: "Trabajar en equipo me ayudó a llevar lo aprendido a un proyecto compartido.",
    displayName: "Participante 01",
    category: "Simulación",
  },
  {
    id: "example-first-job",
    quote: "Practicar con otros me dio más confianza para buscar mi primer empleo en tecnología.",
    displayName: "Participante 02",
    category: "Primer empleo",
  },
  {
    id: "example-career-change",
    quote: "Cambiar de rumbo fue más fácil al compartir el camino con una comunidad.",
    displayName: "Participante 03",
    category: "Reconversión",
  },
] as const satisfies readonly HeroStory[];
