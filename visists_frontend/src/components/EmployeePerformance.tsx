import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, Calendar, FileDown, MapPin, Layers } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function EmployeePerformance() {
  const { employees, visits, programs } = useData();
  const { t, language } = useLanguage();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const performanceData = useMemo(() => {
    return employees.map(employee => {
      let employeeVisits = visits.filter(v => v.assignedEmployees.includes(employee.id));

      // Filter by date range if provided
      if (fromDate && toDate) {
        employeeVisits = employeeVisits.filter(v => {
          const visitDate = new Date(v.scheduledDate);
          return visitDate >= new Date(fromDate) && visitDate <= new Date(toDate);
        });
      }

      const totalVisits = employeeVisits.length;
      const completedVisits = employeeVisits.filter(v => v.status === 'completed').length;
      const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

      // By Program
      const byProgram = programs.map(program => ({
        programId: program.id,
        programName: language === 'ar' ? program.name : program.nameEn,
        count: employeeVisits.filter(v => v.programId === program.id && v.status === 'completed').length
      })).filter(p => p.count > 0);

      // By Location
      const insideTaif = employeeVisits.filter(v => v.location === 'inside-taif' && v.status === 'completed').length;
      const outsideTaif = employeeVisits.filter(v => v.location === 'outside-taif' && v.status === 'completed').length;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalVisits,
        completedVisits,
        completionRate,
        byProgram,
        byLocation: {
          insideTaif,
          outsideTaif
        }
      };
    }).filter(data => data.totalVisits > 0);
  }, [employees, visits, programs, fromDate, toDate, language]);

  const handleExport = () => {
    if (performanceData.length === 0) {
      toast.error(t('no_data_export'));
      return;
    }
    // Prepare data for Excel
    const exportRows = performanceData.map((row) => ({
      [t('employee_name')]: row.employeeName,
      [t('total_visits')]: row.totalVisits,
      [t('completed_visits')]: row.completedVisits,
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
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">{t('to_date')}</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl text-blue-600">{data.completedVisits}</p>
                  <p className="text-xs text-gray-600">{t('completed_visits')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-gray-900">{data.totalVisits}</p>
                  <p className="text-xs text-gray-600">{t('total_visits_assigned')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-green-600">{data.completionRate}%</p>
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
                  className={`h-3 rounded-full transition-all ${
                    data.completionRate >= 80 ? 'bg-green-500' :
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
