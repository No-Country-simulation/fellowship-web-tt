import type { ProjectDto } from "../dtos/projectDto";
import type { Project, ProjectStatus } from "../../types/project";

const KNOWN_STATUSES: ProjectStatus[] = ["ASSIGNED", "NOT_ASSIGNED", "IN_REVISION", "ACCEPTED", "REJECTED"];

function toStatus(raw: string): ProjectStatus {
  return KNOWN_STATUSES.find((status) => status === raw) ?? "NOT_ASSIGNED";
}

export const ProjectMapper = {
  fromDto(dto: ProjectDto): Project {
    return {
      id: dto.id,
      name: dto.name,
      oneLiner: dto.one_liner,
      description: dto.description,
      status: toStatus(dto.status),
      createdAt: dto.created_at,
      companyName: dto.company_name,
      verticals: dto.verticals.map((vertical) => vertical.name),
      expectedRoles: dto.expected_roles.map((role) => role.name),
    };
  },
};
