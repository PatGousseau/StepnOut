const MISSING_RELATION_CODE = "42P01";

type SupabaseErrorShape = {
  code?: string;
  message?: string;
};

function isMissingRelationError(error: SupabaseErrorShape | null | undefined) {
  return error?.code === MISSING_RELATION_CODE ||
    error?.message?.includes('relation "post_media" does not exist') ||
    error?.message?.includes('relation "comment_media" does not exist') ||
    error?.message?.includes('relation "post_media_items" does not exist') ||
    error?.message?.includes('relation "comment_media_items" does not exist');
}

export function shouldFallbackToLegacyMedia(error: SupabaseErrorShape | null | undefined, mediaCount: number) {
  return mediaCount === 1 && isMissingRelationError(error);
}
