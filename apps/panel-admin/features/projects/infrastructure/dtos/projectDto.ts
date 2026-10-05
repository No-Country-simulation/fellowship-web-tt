/**
 * Forma EXACTA en la que contesta el back (snake_case). El DTO no sale de
 * `infrastructure/`: el mapper lo traduce al tipo de dominio.
 */
export interface ProjectDto {
  id: string;
  name: string;
  one_liner: string | null;
  description: string | null;
  status: string;
  created_at: string;
  company_name: string | null;
  verticals: { id: number; name: string }[];
  expected_roles: { id: number; name: string }[];
}
