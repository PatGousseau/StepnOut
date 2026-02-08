export const formatRelativeTime = (dateString: string, t: (key: string, params?: Record<string, unknown>) => string) => {

  if (!dateString) return t('just now');

  const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateString);
  const date = new Date(hasTimezone ? dateString : dateString + 'Z');

  if (isNaN(date.getTime())) return t('just now');

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t("just now");
  if (diffInSeconds < 3600) return t("(count)m", { count: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400) return t("(count)h", { count: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 604800) return t("(count)d", { count: Math.floor(diffInSeconds / 86400) });

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}; 