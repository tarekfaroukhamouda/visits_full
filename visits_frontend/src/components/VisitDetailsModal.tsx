
import React, { useState } from 'react';
import { Visit } from '../App';
import { getEmployeeNames } from '../utils/dataHelpers';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Calendar, MapPin, Users, FileText, Download, CheckCircle, AlertTriangle, CheckSquare, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatDate } from '../utils/dateUtils';
import { exportVisitToPdf } from '../utils/pdfReport';


interface VisitDetailsModalProps {
  visit: Visit & { name?: string };
  onClose: () => void;
}

export function VisitDetailsModal({ visit, onClose }: VisitDetailsModalProps) {
  const { employees, updateVisit } = useData();
  const { t, language, dir } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [report, setReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = visit.facilityName ?? visit.name ?? '';

  const handleCloseVisit = async () => {
    if (!report.trim()) {
      toast.error(t('field_required'));
      return;
    }

    try {
      setIsSubmitting(true);
      await updateVisit(visit.id, {
        status: 'completed',
        report: report
      });

      toast.success(t('visit_closed_success'));
      onClose();
    } catch (error) {
      toast.error(t('error_occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToPDF = () => {
    exportVisitToPdf(visit, employees);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-900">تفاصيل الزيارة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم المنشأة</p>
                <p className="text-gray-900">{displayName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">نوع المنشأة</p>
                <span className={`inline - block px - 3 py - 1 rounded - full text - sm ${visit.type === 'government'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
                  } `}>
                  {visit.type === 'government' ? 'حكومي' : 'خاص'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">حالة الزيارة</p>
                <span className={`inline - flex items - center gap - 1 px - 3 py - 1 rounded - full text - sm ${visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                  visit.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                    visit.status === 'postponed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                  } `}>
                  {visit.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {visit.status === 'postponed' && <AlertCircle className="w-4 h-4" />}
                  {visit.status === 'completed' ? 'مكتملة' :
                    visit.status === 'scheduled' ? 'مجدولة' :
                      visit.status === 'postponed' ? 'مؤجلة' : 'غير مجدولة'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">تياريخ الزيارة</p>
                  <div className="space-y-1">
                    <p className="text-gray-900 flex items-center gap-2">
                      <span className="text-xs text-gray-500">من:</span>
                      {new Date(visit.scheduledDate).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {visit.endDate && (
                      <p className="text-gray-900 flex items-center gap-2">
                        <span className="text-xs text-gray-500">إلى:</span>
                        {new Date(visit.endDate).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {visit.actualDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التاريخ الفعلي</p>
                    <p className="text-gray-900">
                      {new Date(visit.actualDate).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">الموظفين المكلفين</p>
                <p className="text-gray-900">{getEmployeeNames(visit.assignedEmployees, employees)}</p>
              </div>
            </div>
          </div>

          {/* Postpone Reason */}
          {visit.postponeReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-900 mb-1">سبب التأجيل</p>
                  <p className="text-red-700">{visit.postponeReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Infection Control */}
          {visit.infectionControl && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">تقييم مكافحة العدوى</h3>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h - 3 rounded - full ${visit.infectionControl.complianceLevel >= 90 ? 'bg-green-500' :
                        visit.infectionControl.complianceLevel >= 75 ? 'bg-yellow-500' :
                          'bg-red-500'
                        } `}
                      style={{ width: `${visit.infectionControl.complianceLevel}% ` }}
                    />
                  </div>
                  <span className="text-gray-900">
                    {visit.infectionControl.complianceLevel}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-2">بنود المراجعة:</p>
                <ul className="space-y-2">
                  {visit.infectionControl.checklistItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {visit.infectionControl.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                  <p className="text-gray-900">{visit.infectionControl.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{t('export_pdf') || 'تصدير PDF'}</span>
            </button>

            {visit.status !== 'completed' && !isClosing && (
              <button
                onClick={() => setIsClosing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
                <span>{t('close_visit')}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('close') || 'إغلاق'}
          </button>
        </div>

        {/* Close Visit Confirmation/Form Overlay */}
        {isClosing && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('close_visit_confirm')}</h3>
              <button onClick={() => setIsClosing(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-gray-600 mb-4">{t('write_report_placeholder')}</p>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={t('write_report_placeholder')}
                dir={dir}
              ></textarea>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsClosing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCloseVisit}
                disabled={isSubmitting || !report.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>{t('submit_report')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}