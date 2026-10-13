import { mockResponse } from "@core/api/mockClient";
import { ProjectMapper } from "../mappers/projectMapper";
import { PROJECTS_MOCK } from "../mocks/projects.mock";
import type { Project } from "../../types/project";

/**
 * Ejemplo completo del flujo de lectura: repository → (DTO) → mapper → dominio.
 *
 * Con back real esto queda:
 *   const client = await createServerApiClient();
 *   const res = await client.get<ProjectDto[]>(`/admin/projects?s=${s}`);
 *   return res.data.map(ProjectMapper.fromDto);
 */
export async function listProjects(query: { s?: string } = {}): Promise<Project[]> {
  const term = query.s?.trim().toLowerCase();
  const dtos = term ? PROJECTS_MOCK.filter((dto) => dto.name.toLowerCase().includes(term)) : PROJECTS_MOCK;
  const response = await mockResponse(dtos);
  return response.map(ProjectMapper.fromDto);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const dto = await mockResponse(PROJECTS_MOCK.find((project) => project.id === id) ?? null);
  return dto ? ProjectMapper.fromDto(dto) : null;
}
