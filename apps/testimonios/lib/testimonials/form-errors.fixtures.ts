import type { FormValues } from "./form-validation";

export function validValues(updates: Partial<FormValues> = {}): FormValues {
  return {
    type: "simulation", full_name: "Participante de prueba", country: "Argentina",
    email: "persona@example.com", story: "Aprendí a colaborar y resolver desafíos con un equipo. ".repeat(6),
    company: "Empresa de prueba", primary_role: "Desarrollo", role_achieved: "Desarrollo web",
    previous_profession: "Docencia", new_role: "Desarrollo", video_url: "", instagram: "", linkedin: "",
    avatar: new File(["image fixture"], "avatar.png", { type: "image/png" }), capture: null,
    consent: true, ...updates,
  };
}

export function formDataFor(values: FormValues): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value instanceof File) data.set(key, value);
    else if (typeof value === "string") data.set(key, value);
  }
  if (values.consent) data.set("consent", "1");
  return data;
}
