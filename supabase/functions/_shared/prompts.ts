export type PromptClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{
            data: { content?: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export async function getPromptContent(
  supabase: PromptClient,
  key: string,
  locale = 'it',
): Promise<string | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select('content')
    .eq('key', key)
    .eq('locale', locale)
    .maybeSingle();

  if (error) {
    console.error('prompts fetch error:', error.message);
    return null;
  }

  return data?.content ?? null;
}

export function applyTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}
