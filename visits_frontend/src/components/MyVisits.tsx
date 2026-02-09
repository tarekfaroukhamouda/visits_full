import { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormatDate } from '../utils/translations';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, MapPin, Users, Clock, CheckCircle2, AlertCircle, Search, FileText } from 'lucide-react';
import { VisitDetailsModal } from './VisitDetailsModal';
import type { Visit } from '../App';

interface MyVisitsProps {
  userId: string;
  userRole?: number;
}

export function MyVisits({ userId, userRole }: MyVisitsProps) {
  const { t, language } = useLanguage();
  const formatDate = useFormatDate();
  const { visits, employees, facilities, programs } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const currentEmployee = employees.find((emp) => emp.id === userId);

  const myVisits = useMemo(() => {
    if (userRole === 0 || userRole === 2) return visits;
    return visits.filter((visit) => visit.assignedEmployees.includes(userId));
  }, [visits, userId, userRole]);

  const filteredVisits = useMemo(() => {
    return myVisits.filter((visit) => {
      const facility = facilities.find((f) => f.id === visit.facilityId);
      const facilityName = facility?.name || visit.facilityName || '';
      const matchesSearch = facilityName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
      let matchesDate = true;
      if (dateFilter === 'upcoming') {
        matchesDate = new Date(visit.scheduledDate) > new Date() && visit.status !== 'completed';
      } else if (dateFilter === 'past') {
        matchesDate = new Date(visit.scheduledDate) < new Date() || visit.status === 'completed';
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [myVisits, searchTerm, statusFilter, dateFilter, facilities]);

  const stats = useMemo(() => {
    const total = myVisits.length;
    const completed = myVisits.filter((v) => v.status === 'completed').length;
    const scheduled = myVisits.filter((v) => v.status === 'scheduled').length;
    const upcoming = myVisits.filter(
      (v) => new Date(v.scheduledDate) > new Date() && v.status !== 'completed'
    ).length;
    return { total, completed, scheduled, upcoming };
  }, [myVisits]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      scheduled: 'secondary',
      postponed: 'destructive',
      cancelled: 'outline',
      unscheduled: 'outline',
    };
    const labels: Record<string, string> = {
      completed: t('status_completed'),
      scheduled: t('status_scheduled'),
      postponed: t('status_postponed'),
      cancelled: t('status_cancelled'),
      unscheduled: t('status_unscheduled'),
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] ?? status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-effect p-6 rounded-2xl border border-gray-200/50 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('my_visits')}
            </h1>
            <p className="text-sm text-gray-600">
              {userRole === 0 || userRole === 2
                ? (language === 'ar' ? 'جميع الزيارات المسجلة' : 'All registered visits')
                : (language === 'ar'
                  ? `الزيارات المكلف بها - ${currentEmployee?.name ?? ''}`
                  : `Assigned Visits - ${currentEmployee?.name ?? ''}`)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all">
          <CardHeader className="pb-3">
            <CardDescription>{t('total_visits')}</CardDescription>
            <CardTitle className="text-3xl gradient-text">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all">
          <CardHeader className="pb-3">
            <CardDescription>{t('status_completed')}</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all">
          <CardHeader className="pb-3">
            <CardDescription>{t('status_scheduled')}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all">
          <CardHeader className="pb-3">
            <CardDescription>{t('upcoming_visits')}</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.upcoming}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass-effect border-gray-200/50 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ar' ? 'البحث والتصفية' : 'Search & Filter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('visit_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                <SelectItem value="completed">{t('status_completed')}</SelectItem>
                <SelectItem value="scheduled">{t('status_scheduled')}</SelectItem>
                <SelectItem value="postponed">{t('status_postponed')}</SelectItem>
                <SelectItem value="cancelled">{t('status_cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'الفترة الزمنية' : 'Time Period'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'ar' ? 'جميع الفترات' : 'All Periods'}
                </SelectItem>
                <SelectItem value="upcoming">{t('upcoming_visits')}</SelectItem>
                <SelectItem value="past">{language === 'ar' ? 'السابقة' : 'Past'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <Card className="glass-effect border-gray-200/50 shadow-soft">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{t('no_visits')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredVisits.map((visit) => {
            const facility = facilities.find((f) => f.id === visit.facilityId);
            const program = programs.find((p) => p.id === visit.programId);
            const otherEmployees = visit.assignedEmployees
              .filter((id) => id !== userId)
              .map((id) => employees.find((emp) => emp.id === id)?.name)
              .filter(Boolean);

            return (
              <Card
                key={visit.id}
                className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all cursor-pointer"
                onClick={() => setSelectedVisit(visit)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-soft flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">
                            {facility?.name || visit.facilityName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(visit.status)}
                            <Badge variant="outline">
                              {visit.type === 'government' ? t('government') : t('private')}
                            </Badge>
                            {visit.location && (
                              <Badge variant="outline">
                                {visit.location === 'inside-taif'
                                  ? t('inside_taif')
                                  : t('outside_taif')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(visit.scheduledDate)}</span>
                        </div>
                        {program && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{language === 'ar' ? program.name : program.nameEn}</span>
                          </div>
                        )}
                        {otherEmployees.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="truncate">
                              {language === 'ar' ? 'مع: ' : 'With: '}
                              {otherEmployees.join(', ')}
                            </span>
                          </div>
                        )}
                        {visit.status === 'completed' && visit.infectionControl && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {language === 'ar' ? 'نسبة الالتزام: ' : 'Compliance: '}
                              {visit.infectionControl.complianceLevel}%
                            </span>
                          </div>
                        )}
                      </div>

                      {visit.postponeReason && (
                        <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{visit.postponeReason}</span>
                        </div>
                      )}

                      {visit.tasks && visit.tasks.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-2">
                            {language === 'ar' ? 'المهام:' : 'Tasks:'}
                          </p>
                          <ul className="space-y-1">
                            {visit.tasks.map((task, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {selectedVisit && (
        <VisitDetailsModal
          visit={{ ...selectedVisit, name: selectedVisit.facilityName ?? (selectedVisit as any).name ?? '' } as Visit & { name: string }}
          onClose={() => setSelectedVisit(null)}
        />
      )}
    </div>
  );
}
