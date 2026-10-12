import type { ProjectDto } from "../dtos/projectDto";

/** Mock con la forma del back (DTO), así el mapper se ejercita igual que en producción. */
export const PROJECTS_MOCK: ProjectDto[] = [
  {
    id: "p-1",
    name: "Turnos médicos",
    one_liner: "Agenda online para consultorios chicos.",
    description: "Reserva de turnos, recordatorios por WhatsApp y panel para el profesional.",
    status: "ASSIGNED",
    created_at: "2026-08-12T00:00:00.000Z",
    company_name: "Salud Simple",
    verticals: [{ id: 1, name: "Web App" }],
    expected_roles: [
      { id: 1, name: "Frontend" },
      { id: 2, name: "Backend" },
      { id: 3, name: "UX/UI" },
    ],
  },
  {
    id: "p-2",
    name: "Churn de e-commerce",
    one_liner: "Predecir qué clientes dejan de comprar.",
    description: "Modelo de churn sobre datos anonimizados de una tienda online, con dashboard.",
    status: "ASSIGNED",
    created_at: "2026-08-20T00:00:00.000Z",
    company_name: "Tienda Sur",
    verticals: [{ id: 2, name: "Data" }],
    expected_roles: [
      { id: 4, name: "Data Analyst" },
      { id: 5, name: "Data Scientist" },
    ],
  },
  {
    id: "p-3",
    name: "Asistente de soporte",
    one_liner: "Bot que responde tickets de primer nivel.",
    description: null,
    status: "IN_REVISION",
    created_at: "2026-09-02T00:00:00.000Z",
    company_name: "HelpDeskCo",
    verticals: [{ id: 3, name: "IA" }],
    expected_roles: [
      { id: 2, name: "Backend" },
      { id: 6, name: "ML Engineer" },
    ],
  },
  {
    id: "p-4",
    name: "CRM para ONGs",
    one_liner: "Gestión de donantes y voluntarios.",
    description: "Construido sobre herramientas no-code para que la ONG lo mantenga sola.",
    status: "ACCEPTED",
    created_at: "2026-06-30T00:00:00.000Z",
    company_name: null,
    verticals: [{ id: 4, name: "No-Code" }],
    expected_roles: [{ id: 7, name: "No-Code Builder" }],
  },
  {
    id: "p-5",
    name: "App de delivery barrial",
    one_liner: null,
    description: null,
    status: "NOT_ASSIGNED",
    created_at: "2026-09-25T00:00:00.000Z",
    company_name: "Barrio App",
    verticals: [{ id: 5, name: "Mobile" }],
    expected_roles: [
      { id: 8, name: "Mobile" },
      { id: 2, name: "Backend" },
    ],
  },
];
