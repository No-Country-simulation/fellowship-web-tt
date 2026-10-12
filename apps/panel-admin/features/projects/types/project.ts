export type ProjectStatus = "ASSIGNED" | "NOT_ASSIGNED" | "IN_REVISION" | "ACCEPTED" | "REJECTED";

export interface Project {
  id: string;
  name: string;
  oneLiner: string | null;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  companyName: string | null;
  verticals: string[];
  expectedRoles: string[];
}
