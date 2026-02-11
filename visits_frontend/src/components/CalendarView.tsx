import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Building2, Users, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Visit } from '../App';
import { VisitDetailsModal } from './VisitDetailsModal';
import { EditVisitModal } from './EditVisitModal';
import { toHijri, formatHijri, getHijriMonthName, fromHijri, getDaysInHijriMonth } from '../utils/hijriUtils';

interface CalendarViewProps {
  userRole: number; // 0 = admin, 1 = manager
}

export function CalendarView({ userRole }: CalendarViewProps) {
  const { t, language, dir } = useLanguage();
  const { visits, programs, facilities, employees, deleteVisit } = useData();

  try {
    // Start with today's Hijri date
    const today = new Date();
    const todayHijri = toHijri(today);
    
    const [currentHijriYear, setCurrentHijriYear] = useState(todayHijri.year);
    const [currentHijriMonth, setCurrentHijriMonth] = useState(todayHijri.month);

  // Get first day of Hijri month (as Gregorian date)
  const firstDayGregorian = fromHijri(currentHijriYear, currentHijriMonth, 1);
  const startingDayOfWeek = firstDayGregorian.getDay();
  const daysInMonth = Math.max(29, Math.min(30, getDaysInHijriMonth(currentHijriYear, currentHijriMonth)));

  // Hijri month names
  const monthNames = language === 'ar'
    ? [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
      ]
    : [
        'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani", 'Jumada al-ula', 'Jumada al-akhira',
        'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ];

  const dayNames = language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Navigate Hijri months
  const previousMonth = () => {
    if (currentHijriMonth === 1) {
      setCurrentHijriMonth(12);
      setCurrentHijriYear(currentHijriYear - 1);
    } else {
      setCurrentHijriMonth(currentHijriMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentHijriMonth === 12) {
      setCurrentHijriMonth(1);
      setCurrentHijriYear(currentHijriYear + 1);
    } else {
      setCurrentHijriMonth(currentHijriMonth + 1);
    }
  };

  const goToToday = () => {
    const todayHijri = toHijri(new Date());
    setCurrentHijriYear(todayHijri.year);
    setCurrentHijriMonth(todayHijri.month);
  };

  // Get visits for a specific Hijri date
  const getVisitsForHijriDay = (day: number) => {
    try {
      const gregorianDate = fromHijri(currentHijriYear, currentHijriMonth, day);
      const year = gregorianDate.getFullYear();
      const month = gregorianDate.getMonth() + 1;
      const dayNum = gregorianDate.getDate();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      return visits.filter(visit => visit.scheduledDate === dateStr);
    } catch (e) {
      console.error(`Error getting visits for day ${day}:`, e);
      return [];
    }
  };

  // Check if a day is today
  const isToday = (day: number) => {
    try {
      const dateForDay = fromHijri(currentHijriYear, currentHijriMonth, day);
      return dateForDay.toDateString() === new Date().toDateString();
    } catch (e) {
      return false;
    }
  };

  // Get program color
  const getProgramColor = (programId?: string) => {
    if (!programId) return 'bg-gray-500';
    const index = programs.findIndex(p => p.id === programId);
    const colors = [
      'bg-[#1565C0]', // Primary Blue
      'bg-[#00C853]', // Secondary Green
      'bg-[#C5A572]', // Accent Gold
      'bg-[#42A5F5]', // Light Blue
      'bg-[#66BB6A]', // Light Green
      'bg-[#9C27B0]', // Purple
      'bg-[#FF6F00]', // Orange
    ];
    return colors[index % colors.length];
  };

  // Get status color
  const getStatusColor = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return 'border-[#00C853]';
      case 'scheduled':
        return 'border-[#1565C0]';
      case 'postponed':
        return 'border-[#FF9800]';
      case 'cancelled':
        return 'border-[#d32f2f]';
      default:
        return 'border-gray-400';
    }
  };

  // Handle visit click
  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDetailsOpen(true);
  };

  const handleDelete = async (visit: Visit) => {
    if (window.confirm(`${t('delete_confirm')} ${visit.facilityName || visit.name}?`)) {
      try {
        await deleteVisit(visit.id);
      } catch (err) {
        // Error handled in DataContext
      }
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 dark:bg-gray-900/50" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayVisits = getVisitsForHijriDay(day);
      const isTodayFlag = isToday(day);

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isTodayFlag ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-white dark:bg-gray-900'
            }`}
        >
          <div className={`text-sm font-medium mb-2 ${isTodayFlag ? 'text-[#1565C0]' : 'text-gray-700 dark:text-gray-300'}`}>
            {day}
          </div>

          <div className="space-y-1.5">
            {dayVisits.slice(0, 3).map((visit) => {
              const program = programs.find(p => p.id === visit.programId);
              const facility = facilities.find(f => f.id === visit.facilityId);
              const programColor = getProgramColor(visit.programId);
              const statusColor = getStatusColor(visit.status);

              return (
                <div
                  key={visit.id}
                  onClick={() => handleVisitClick(visit)}
                  className={`p-2 rounded-md cursor-pointer hover:shadow-md transition-all border-l-4 ${statusColor} bg-white dark:bg-gray-800 shadow-sm`}
                >
                  {/* Program Badge */}
                  <div className={`inline-block px-2 py-0.5 rounded text-xs text-white mb-1 ${programColor}`}>
                    {program ? (language === 'ar' ? program.name : program.nameEn) : t('unscheduled_visits')}
                  </div>

                  {/* Facility Name */}
                  <div className="flex items-start gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {facility?.name || visit.facilityName}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {visit.location === 'inside-taif' ? t('inside_taif') : t('outside_taif')}
                    </span>
                  </div>

                  {/* Assigned Employees */}
                  {visit.assignedEmployees.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Users className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {visit.assignedEmployees.map(empId => {
                          const emp = employees.find(e => e.id.toString() === empId.toString());
                          return (
                            <span key={empId} className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded truncate max-w-[80px]">
                              {emp ? emp.name : empId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Delete button - Only for Admin (0) and Manager (2) */}
                  {userRole !== 1 && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(visit);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('delete')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show more indicator */}
            {dayVisits.length > 3 && (
              <button
                onClick={() => {
                  // Show all visits for this day in a modal or expand
                }}
                className="w-full text-xs text-[#1565C0] hover:text-[#0D47A1] text-center py-1"
              >
                +{dayVisits.length - 3} {t('more')}
              </button>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('visits_management')}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'التقويم الهجري' : 'Hijri Calendar'}</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button onClick={goToToday} variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {t('today')}
          </Button>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border p-1">
            <Button onClick={previousMonth} variant="ghost" size="sm">
              {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>

            <div className="px-4 text-center min-w-[200px]">
              <p className="font-semibold">
                {monthNames[currentHijriMonth - 1]} {currentHijriYear} هـ
              </p>
            </div>

            <Button onClick={nextMonth} variant="ghost" size="sm">
              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-[#00C853] bg-white"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('completed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-[#1565C0] bg-white"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('scheduled')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-[#FF9800] bg-white"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('postponed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-[#d32f2f] bg-white"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('cancelled')}</span>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day names header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-[#1565C0] to-[#42A5F5] text-white">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="p-3 text-center text-sm font-medium border-r border-white/20 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </Card>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <>
          <VisitDetailsModal
            visit={selectedVisit}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedVisit(null);
            }}
            onEdit={() => {
              setIsDetailsOpen(false);
              setIsEditOpen(true);
            }}
            userRole={userRole}
          />

          <EditVisitModal
            visit={selectedVisit}
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedVisit(null);
            }}
          />
        </>
      )}
    </div>
  );
  } catch (error) {
    console.error('CalendarView Error:', error);
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Calendar</h2>
          <p className="text-gray-600 mb-4">An error occurred while rendering the calendar. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </Card>
    );
  }
}
