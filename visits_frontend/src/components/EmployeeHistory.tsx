import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  User,
  TrendingUp
} from 'lucide-react';
import { Visit } from '../App';

export function EmployeeHistory() {
  const { t, dir } = useLanguage();
  const { visits, employees, facilities, programs } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  /* ===============================
     Helpers
  =============================== */

  const getEmployeeVisits = (employeeId: string) =>
    visits.filter(v => v.assignedEmployees?.includes(employeeId));

  const getPreviousVisits = (employeeId: string): Visit[] =>
    getEmployeeVisits(employeeId)
      .filter(v =>
        v.status === 'completed' ||
        new Date(v.scheduledDate) < new Date()
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledDate).getTime() -
          new Date(a.scheduledDate).getTime()
      );

  const getUpcomingVisits = (employeeId: string): Visit[] =>
    getEmployeeVisits(employeeId)
      .filter(
        v =>
          v.status !== 'completed' &&
          new Date(v.scheduledDate) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );

  const getEmployeeStats = (employeeId: string) => {
    const employeeVisits = getEmployeeVisits(employeeId);

    const completed = employeeVisits.filter(v => v.status === 'completed').length;
    const scheduled = employeeVisits.filter(v => v.status === 'scheduled').length;
    const postponed = employeeVisits.filter(v => v.status === 'postponed').length;
    const cancelled = employeeVisits.filter(v => v.status === 'cancelled').length;

    const visitsByProgram: Record<string, number> = {};
    employeeVisits.forEach(v => {
      if (v.programId) {
        visitsByProgram[v.programId] =
          (visitsByProgram[v.programId] || 0) + 1;
      }
    });

    const insideTaif = employeeVisits.filter(v => v.location === 'inside-taif').length;
    const outsideTaif = employeeVisits.filter(v => v.location === 'outside-taif').length;

    const visitsWithTasks = employeeVisits.filter(v => v.tasks?.length);
    const completedWithTasks = visitsWithTasks.filter(v => v.status === 'completed').length;

    const taskCompletionRate =
      visitsWithTasks.length > 0
        ? Math.round((completedWithTasks / visitsWithTasks.length) * 100)
        : 0;

    return {
      total: employeeVisits.length,
      completed,
      scheduled,
      postponed,
      cancelled,
      visitsByProgram,
      insideTaif,
      outsideTaif,
      taskCompletionRate
    };
  };

  /* ===============================
     SAFE Status Badge (FIX)
  =============================== */

  const getStatusBadge = (status?: Visit['status']) => {
    const variants = {
      completed: { variant: 'default', icon: CheckCircle },
      scheduled: { variant: 'secondary', icon: Clock },
      postponed: { variant: 'secondary', icon: XCircle },
      unscheduled: { variant: 'outline', icon: Calendar },
      cancelled: { variant: 'destructive', icon: XCircle }
    } as const;

    const config = status ? variants[status] : undefined;

    if (!config) {
      return (
        <Badge variant="outline">
          {status ?? 'unknown'}
        </Badge>
      );
    }

    const { variant, icon: Icon } = config;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {t(`status_${status}`)}
      </Badge>
    );
  };

  const getFacilityName = (visit: Visit) => {
    const facility = facilities.find(f => f.id === visit.facilityId);
    return facility?.name || visit.facilityName || 'غير معروف / Unknown';
  };

  const getProgramName = (programId?: string) => {
    if (!programId) return '-';
    const program = programs.find(p => p.id === programId);
    return program ? (dir === 'rtl' ? program.name : program.nameEn) : '-';
  };

  const renderVisitCard = (visit: Visit) => (
    <Card key={visit.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-semibold">{getFacilityName(visit)}</h3>
          {getStatusBadge(visit.status)}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(visit.scheduledDate).toLocaleDateString(
              dir === 'rtl' ? 'ar-SA' : 'en-US'
            )}
          </div>

          {visit.programId && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {getProgramName(visit.programId)}
            </div>
          )}

          {visit.location && (
            <Badge variant="outline">{t(visit.location)}</Badge>
          )}
        </div>
      </div>
    </Card>
  );

  /* ===============================
     Data
  =============================== */

  const selectedEmployeeData = employees.find(e => e.id === selectedEmployee);
  const stats = selectedEmployee ? getEmployeeStats(selectedEmployee) : null;
  const previousVisits = selectedEmployee ? getPreviousVisits(selectedEmployee) : [];
  const upcomingVisits = selectedEmployee ? getUpcomingVisits(selectedEmployee) : [];

  /* ===============================
     UI
  =============================== */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl">{t('employee_history')}</h1>

      <Card className="p-4">
        <Label>{t('employee')}</Label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder={t('employee')} />
          </SelectTrigger>
          <SelectContent>
            {employees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} — {emp.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {!selectedEmployee && (
        <Card className="p-12 text-center text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          اختر موظف لعرض سجله
        </Card>
      )}

      {selectedEmployee && selectedEmployeeData && stats && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm">{t('total_visits_assigned')}</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm">{t('completed_visits')}</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm">{t('scheduled')}</div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.scheduled}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm">{t('task_completion')}</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.taskCompletionRate}%
              </div>
            </Card>
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              {t('upcoming_visits_emp')} ({upcomingVisits.length})
            </h2>
            {upcomingVisits.slice(0, 5).map(renderVisitCard)}
          </div>

          {/* Previous */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              {t('previous_visits')} ({previousVisits.length})
            </h2>
            {previousVisits.slice(0, 10).map(renderVisitCard)}
          </div>
        </>
      )}
    </div>
  );
}
