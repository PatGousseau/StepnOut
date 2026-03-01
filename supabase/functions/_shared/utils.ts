export function truncate(input: string, maxLen: number) {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1).trimEnd() + '...';
}

export function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
