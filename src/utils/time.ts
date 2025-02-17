import { useLanguage } from "../contexts/LanguageContext";

export const formatRelativeTime = (dateString: string) => {

  const { t } = useLanguage();
  
  if (!dateString) {
    console.warn('Empty date string');
    return t('just now');
  }

  // Handle ISO 8601 dates with timezone offset
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateString);
    return t('just now');
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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