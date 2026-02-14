import { useLanguage } from '../contexts/LanguageContext';
import { toHijri, formatHijriDate, getHijriMonthName } from './hijriUtils';

// Hook to get translated visit status
export function useVisitStatus() {
  const { t } = useLanguage();

  return {
    getStatusLabel: (status: string) => {
      switch (status) {
        case 'completed': return t('status_completed');
        case 'scheduled': return t('status_scheduled');
        case 'postponed': return t('status_postponed');
        case 'unscheduled': return t('status_unscheduled');
        default: return status;
      }
    },

    getTypeLabel: (type: string) => {
      return type === 'government' ? t('government') : t('private');
    }
  };
}

// Format date based on language - now using Hijri calendar
export function useFormatDate() {
  const { language } = useLanguage();

  return (dateString: string) => {
    try {
      // dateString is already a Hijri date in format YYYY-MM-DD
      // Parse it and format it nicely
      const [year, month, day] = dateString.split('-').map(Number);

      if (!year || !month || !day) {
        return dateString;
      }

      // Get the month name in the appropriate language
      const monthName = getHijriMonthName(month, language === 'ar' ? 'ar' : 'en');

      // Format: "15 شعبان 1446" (Arabic) or "15 Sha'ban 1446" (English)
      if (language === 'ar') {
        return `${day} ${monthName} ${year} هـ`;
      } else {
        return `${day} ${monthName} ${year}`;
      }
    } catch (e) {
      console.error('Error formatting Hijri date:', dateString, e);
      return dateString;
    }
  };
}

