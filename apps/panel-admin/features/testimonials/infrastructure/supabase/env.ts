const missing = (name: string) => `Falta ${name} en el entorno.`;

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(missing("NEXT_PUBLIC_SUPABASE_URL"));
  }
  return url.replace(/\/$/, "");
}

export function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(missing("SUPABASE_SERVICE_ROLE_KEY"));
  }
  return key;
}

export function hasSupabaseServiceRoleEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}
