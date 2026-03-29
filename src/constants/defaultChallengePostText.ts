export const DEFAULT_CHALLENGE_POST_BODY_EN = "Just completed this week's challenge!";
export const DEFAULT_CHALLENGE_POST_BODY_IT = "Ho appena completato la sfida settimanale!";

export function isDefaultChallengePostBody(body: string | null | undefined) {
  if (!body) return false;
  const trimmed = body.trim();
  if (!trimmed) return false;
  return trimmed === DEFAULT_CHALLENGE_POST_BODY_EN || trimmed === DEFAULT_CHALLENGE_POST_BODY_IT;
}
