import React, { useState } from 'react';
import { Visit } from '../App';
import { getEmployeeNames } from '../utils/dataHelpers';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Calendar, MapPin, Users, FileText, Download, CheckCircle, AlertTriangle, CheckSquare, Building2, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatDate } from '../utils/dateUtils';
import { exportVisitToPdf } from '../utils/pdfReport';
import { formatHijriDate } from '../utils/hijriUtils';


interface VisitDetailsModalProps {
  visit: Visit & { name?: string };
  onClose: () => void;
  isOpen?: boolean;
  onEdit?: () => void;
  userRole?: number;
}

export function VisitDetailsModal({ visit, onClose, isOpen = true, onEdit, userRole }: VisitDetailsModalProps) {
  const { employees, updateVisit, closeVisit, submitCorrectionPlan } = useData();
  const { t, language, dir } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [report, setReport] = useState(visit.report || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState((visit as any).progress ?? 0);

  if (!isOpen) return null;

  const displayName = visit.facilityName ?? visit.name ?? '';

  const handleCloseVisit = async () => {
    try {
      setIsSubmitting(true);
      await closeVisit(visit.id);
      setProgress(1);
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCorrectionPlan = async () => {
    try {
      setIsSubmitting(true);
      await submitCorrectionPlan(visit.id);
      setProgress(2);
      onClose();
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToPDF = () => {
    exportVisitToPdf(visit, employees);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass-effect rounded-2xl shadow-medium border border-gray-200/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative bg-white/80"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 gradient-primary px-6 py-4 flex items-center justify-between text-white shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold drop-shadow">تفاصيل الزيارة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
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
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${visit.type === 'government'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
                  }`}>
                  {visit.type === 'government' ? 'حكومي' : 'خاص'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">حالة الزيارة</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                  visit.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                    visit.status === 'postponed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
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
                      {formatHijriDate(new Date(visit.scheduledDate), language === 'ar' ? 'ar' : 'en', 'long')}
                    </p>
                    {visit.endDate && (
                      <p className="text-gray-900 flex items-center gap-2">
                        <span className="text-xs text-gray-500">إلى:</span>
                        {formatHijriDate(new Date(visit.endDate), language === 'ar' ? 'ar' : 'en', 'long')}
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
                      {formatHijriDate(new Date(visit.actualDate), language === 'ar' ? 'ar' : 'en', 'long')}
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
                      className={`h-3 rounded-full ${visit.infectionControl.complianceLevel >= 90 ? 'bg-green-500' :
                        visit.infectionControl.complianceLevel >= 75 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      style={{ width: `${visit.infectionControl.complianceLevel}%` }}
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
          {/* Report Display for Completed Visits */}
          {visit.status === 'completed' && visit.report && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-emerald-900 font-semibold mb-1">{t('visit_report') || 'تقرير الزيارة'}</p>
                  <p className="text-emerald-700 whitespace-pre-wrap">{visit.report}</p>
                </div>
              </div>
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
              <>
                {progress === 0 && (
                  <button
                    onClick={() => setIsClosing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span>{t('close_visit')}</span>
                  </button>
                )}
                {progress === 1 && (
                  <button
                    onClick={handleSubmitCorrectionPlan}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span>{language === 'ar' ? 'تقديم خطة التصحيح' : 'Submit Correction Plan'}</span>
                  </button>
                )}
              </>
            )}

            {onEdit && userRole !== 1 && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>{t('edit') || 'تعديل'}</span>
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
        {/* Close Visit Confirmation/Form Overlay */}
        {isClosing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setIsClosing(false)}>
            <div
              className="glass-effect rounded-2xl shadow-medium border border-gray-200/50 max-w-md w-full p-6 relative z-50 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-bold text-lg">{t('close_visit_confirm')}</h3>
                <button
                  onClick={() => setIsClosing(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-lg">
                  {language === 'ar' ? 'هل أنت متأكد من إغلاق هذه الزيارة؟' : 'Are you sure you want to close this visit?'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {language === 'ar' ? 'سيتم تحويل حالة الزيارة إلى مكتملة وسيطلب منك تقديم خطة تصحيحية.' : 'The visit status will be changed to completed and you will be asked to submit a correction plan.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsClosing(false)}
                  className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={async () => {
                    await handleCloseVisit();
                    setIsClosing(false);
                    onClose();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl shadow-soft hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span>{language === 'ar' ? 'تأكيد الإغلاق' : 'Confirm Close'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}