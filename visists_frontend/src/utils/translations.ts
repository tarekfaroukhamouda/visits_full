import { useLanguage } from '../contexts/LanguageContext';

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

// Format date based on language
export function useFormatDate() {
  const { language } = useLanguage();
  
  return (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };
}
