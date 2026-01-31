import { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormatDate } from '../utils/translations';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileText, Download, Search, Calendar, MapPin } from 'lucide-react';
import { exportVisitToPdf } from '../utils/pdfReport';
import type { Visit } from '../App';

interface MyReportProps {
  userId: string;
}

export function MyReport({ userId }: MyReportProps) {
  const { t, language } = useLanguage();
  const formatDate = useFormatDate();
  const { visits, employees, facilities } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const myVisits = useMemo(() => {
    return visits.filter((visit) => visit.assignedEmployees.includes(userId));
  }, [visits, userId]);

  const filteredVisits = useMemo(() => {
    return myVisits.filter((visit) => {
      const facility = facilities.find((f) => f.id === visit.facilityId);
      const facilityName = facility?.name || visit.facilityName || '';
      const matchesSearch = facilityName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myVisits, searchTerm, statusFilter, facilities]);

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

  const handleExport = (visit: Visit) => {
    exportVisitToPdf(visit, employees);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-effect p-6 rounded-2xl border border-gray-200/50 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('my_report')}
            </h1>
            <p className="text-sm text-gray-600">
              {language === 'ar'
                ? 'تصدير تقارير الزيارات المكلف بها'
                : 'Export reports for your assigned visits'}
            </p>
          </div>
        </div>
      </div>

      <Card className="glass-effect border-gray-200/50 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ar' ? 'البحث والتصفية' : 'Search & Filter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="completed">{t('status_completed')}</option>
              <option value="scheduled">{t('status_scheduled')}</option>
              <option value="postponed">{t('status_postponed')}</option>
              <option value="cancelled">{t('status_cancelled')}</option>
            </select>
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
            const name = facility?.name || visit.facilityName;

            return (
              <Card
                key={visit.id}
                className="glass-effect border-gray-200/50 shadow-soft hover-lift transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-soft flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {getStatusBadge(visit.status)}
                            <Badge variant="outline">
                              {visit.type === 'government' ? t('government') : t('private')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(visit.scheduledDate)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleExport(visit)}
                        className="gradient-primary text-white shadow-soft hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        {t('export_pdf')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
