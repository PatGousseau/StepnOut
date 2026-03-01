export async function getAppConfigValue(
  supabase: { from: (table: string) => any },
  key: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error('app_config fetch error:', error.message);
    return null;
  }

  return data?.value ?? null;
}

export function applyTemplate(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}
