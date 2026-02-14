import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, Calendar, FileDown, MapPin, Layers } from 'lucide-react';
import { doctorApi } from '../services/api';
import { HijriDateInput } from './HijriDateInput';
import { toast } from 'sonner@2.0.3';

export function EmployeePerformance() {
  const { t, language } = useLanguage();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch performance data from backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Pass Hijri dates directly to backend
        const data = await doctorApi.getPerformanceStats(fromDate || undefined, toDate || undefined);

        // Transform data to match language preferences for program names
        const formattedData = data.map((item: any) => ({
          ...item,
          byProgram: item.byProgram.map((p: any) => ({
            ...p,
            programName: language === 'ar' ? p.programName : p.programNameEn
          }))
        }));

        setPerformanceData(formattedData);
      } catch (error) {
        console.error('Error fetching performance stats:', error);
        toast.error(t('error_loading_data') || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fromDate, toDate, language, t]);


  const handleExport = () => {
    if (performanceData.length === 0) {
      toast.error(t('no_data_export'));
      return;
    }
    // Prepare data for Excel
    const exportRows = performanceData.map((row) => ({
      [t('employee_name')]: row.employeeName,
      [t('total_visits')]: row.totalVisits,
      [t('completed_visits')]: row.totalCompleted,
      [t('waiting_for_plan')]: row.waitingForPlan,
      [t('plan_submitted')]: row.completedWithPlan,
      [t('completion_rate')]: row.completionRate + '%',
      [t('inside_taif')]: row.byLocation.insideTaif,
      [t('outside_taif')]: row.byLocation.outsideTaif,
      [t('by_program')]: row.byProgram.map(p => `${p.programName}: ${p.count}`).join('; ')
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance');
    XLSX.writeFile(wb, `employee_performance_report.xlsx`);
    toast.success(t('export_success'), {
      description: t('export_description') + ' ' + performanceData.length + ' ' + t('employee')
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">{t('employee_performance')}</h2>
          <p className="text-gray-600">{t('performance_subtitle')}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileDown className="w-5 h-5" />
          <span>{t('export_report')}</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">{t('select_period')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">{t('from_date')}</label>
            <HijriDateInput
              value={fromDate}
              onChange={setFromDate}
              className="w-full"
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">{t('to_date')}</label>
            <HijriDateInput
              value={toDate}
              onChange={setToDate}
              className="w-full"
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="space-y-4">
        {performanceData.length > 0 ? performanceData.map((data) => (
          <div key={data.employeeId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {/* Employee Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">{data.employeeName}</h3>
                  <p className="text-sm text-gray-600">{t('employee_name')}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="text-center">
                  <p className="text-2xl text-gray-900">{data.totalVisits}</p>
                  <p className="text-xs text-gray-600">{t('total_visits_assigned')}</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-blue-600">{data.totalCompleted}</p>
                  <p className="text-xs text-gray-600">{t('completed_visits')}</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-amber-500">{data.waitingForPlan}</p>
                  <p className="text-xs text-gray-600">{t('waiting_for_plan')}</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-green-600">{data.completedWithPlan}</p>
                  <p className="text-xs text-gray-600">{t('plan_submitted')}</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-indigo-600">{data.completionRate}%</p>
                  <p className="text-xs text-gray-600">{t('task_completion')}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('task_completion')}</span>
                <span className="text-sm text-gray-900">{data.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${data.completionRate >= 80 ? 'bg-green-500' :
                    data.completionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  style={{ width: `${data.completionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Program */}
              {data.byProgram.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <h4 className="text-gray-900">{t('by_program')}</h4>
                  </div>
                  <div className="space-y-2">
                    {data.byProgram.map((program, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-700">{program.programName}</span>
                        <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {program.count} {t('visits')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Location */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <h4 className="text-gray-900">{t('by_location')}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">{t('inside_taif')}</span>
                    <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {data.byLocation.insideTaif} {t('visits')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm text-gray-700">{t('outside_taif')}</span>
                    <span className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                      {data.byLocation.outsideTaif} {t('visits')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            {t('no_data')}
          </div>
        )}
      </div>
    </div>
  );
}
