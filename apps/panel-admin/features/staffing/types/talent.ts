export interface Talent {
  id: string;
  fullName: string;
  role: string;
  country: string;
  seniority: "Trainee" | "Junior" | "Semi Senior";
  simulationsCompleted: number;
}
