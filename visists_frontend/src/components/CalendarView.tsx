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

interface CalendarViewProps {
  userRole: number; // 0 = admin, 1 = manager
}

export function CalendarView({ userRole }: CalendarViewProps) {
  const { t, language, dir } = useLanguage();
  const { visits, programs, facilities, deleteVisit } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Get month and year
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Month names
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Get visits for a specific date
  const getVisitsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return visits.filter(visit => visit.scheduledDate === dateStr);
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
      const dayVisits = getVisitsForDate(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
            isToday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-white dark:bg-gray-900'
          }`}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-[#1565C0]' : 'text-gray-700 dark:text-gray-300'}`}>
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

                  {/* Employees count */}
                  {visit.assignedEmployees.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {visit.assignedEmployees.length}
                      </span>
                    </div>
                  )}

                  {/* Delete button */}
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
          <p className="text-muted-foreground">{t('calendar_view_subtitle')}</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button onClick={today} variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {t('today')}
          </Button>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border p-1">
            <Button onClick={previousMonth} variant="ghost" size="sm">
              {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            
            <div className="px-4 text-center min-w-[180px]">
              <p className="font-semibold">
                {monthNames[month]} {year}
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
}
