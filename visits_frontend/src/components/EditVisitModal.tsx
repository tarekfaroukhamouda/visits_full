import { useState, useEffect } from 'react';
import { Visit } from '../App';
import { useData } from '../contexts/DataContext';
import { X, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { checkEmployeeAvailability } from '../utils/conflictChecker';

interface EditVisitModalProps {
  visit: Visit;
  onClose: () => void;
}

export function EditVisitModal({ visit, onClose }: EditVisitModalProps) {
  const { updateVisit, employees, visits } = useData();

  const [formData, setFormData] = useState({
    name: visit.name,
    type: visit.type,
    scheduledDate: visit.scheduledDate,
    endDate: visit.endDate || '',
    actualDate: visit.actualDate || '',
    status: visit.status,
    assignedEmployees: visit.assignedEmployees,
    postponeReason: visit.postponeReason || '',
    infectionControl: visit.infectionControl ? {
      enabled: true,
      checklistItems: visit.infectionControl.checklistItems,
      complianceLevel: visit.infectionControl.complianceLevel,
      notes: visit.infectionControl.notes
    } : {
      enabled: false,
      checklistItems: [''],
      complianceLevel: 0,
      notes: ''
    }
  });

  const [employeeConflicts, setEmployeeConflicts] = useState<Map<string, any>>(new Map());

  // Check for conflicts whenever date changes
  useEffect(() => {
    if (formData.scheduledDate) {
      const conflicts = new Map<string, any>();

      employees.forEach(employee => {
        const conflict = checkEmployeeAvailability(
          employee.id,
          formData.scheduledDate,
          visits,
          employees,
          visit.id // Exclude current visit
        );
        conflicts.set(employee.id, conflict);
      });

      setEmployeeConflicts(conflicts);
    } else {
      setEmployeeConflicts(new Map());
    }
  }, [formData.scheduledDate, visits, employees, visit.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.scheduledDate || formData.assignedEmployees.length === 0) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const updatedVisit: Partial<Visit> = {
      name: formData.name,
      type: formData.type,
      scheduledDate: formData.scheduledDate,
      endDate: formData.endDate || undefined,
      actualDate: formData.actualDate || undefined,
      status: formData.status,
      assignedEmployees: formData.assignedEmployees,
      postponeReason: formData.postponeReason || undefined,
      ...(formData.infectionControl.enabled && {
        infectionControl: {
          checklistItems: formData.infectionControl.checklistItems.filter(item => item.trim()),
          complianceLevel: formData.infectionControl.complianceLevel,
          notes: formData.infectionControl.notes
        }
      })
    };

    const doctorIds = formData.assignedEmployees.map(id => parseInt(id));
    updateVisit(visit.id, updatedVisit, doctorIds)
      .then(() => {
        toast.success('✅ تم تحديث الزيارة بنجاح');
        onClose();
      })
      .catch(() => {
        // Error is already handled in DataContext
      });
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      infectionControl: {
        ...formData.infectionControl,
        checklistItems: [...formData.infectionControl.checklistItems, '']
      }
    });
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...formData.infectionControl.checklistItems];
    newItems[index] = value;
    setFormData({
      ...formData,
      infectionControl: {
        ...formData.infectionControl,
        checklistItems: newItems
      }
    });
  };

  const removeChecklistItem = (index: number) => {
    const newItems = formData.infectionControl.checklistItems.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      infectionControl: {
        ...formData.infectionControl,
        checklistItems: newItems
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-900">تعديل الزيارة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-gray-900 pb-2 border-b border-gray-200">المعلومات الأساسية</h3>

            <div>
              <label className="block text-gray-700 mb-2">
                اسم المنشأة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  نوع المنشأة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'government' | 'private' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="government">حكومي</option>
                  <option value="private">خاص</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  حالة الزيارة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Visit['status'] }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="postponed">مؤجلة</option>
                  <option value="unscheduled">غير مجدولة</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  التاريخ المجدول <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.scheduledDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  التاريخ الفعلي
                </label>
                <input
                  type="date"
                  value={formData.actualDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.status === 'postponed' && (
              <div>
                <label className="block text-gray-700 mb-2">
                  سبب التأجيل
                </label>
                <textarea
                  value={formData.postponeReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, postponeReason: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="اكتب سبب التأجيل..."
                />
              </div>
            )}
          </div>

          {/* Assigned Employees */}
          <div className="space-y-4">
            <h3 className="text-gray-900 pb-2 border-b border-gray-200">الموظفين المكلفين</h3>

            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {employees && employees.length > 0 ? employees.map(employee => {
                const conflict = employeeConflicts.get(employee.id);
                const hasConflict = conflict?.hasConflict;
                const isCurrentlyAssigned = formData.assignedEmployees.includes(employee.id);
                const isDisabled = hasConflict && !isCurrentlyAssigned;

                return (
                  <label
                    key={employee.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${hasConflict && !isCurrentlyAssigned
                      ? 'bg-red-50 border-2 border-red-200 opacity-60'
                      : isCurrentlyAssigned
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isCurrentlyAssigned}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assignedEmployees: [...formData.assignedEmployees, employee.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assignedEmployees: formData.assignedEmployees.filter(id => id !== employee.id)
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                      {hasConflict && !isCurrentlyAssigned && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>
                            {conflict.conflictType === 'vacation'
                              ? 'الموظف في إجازة'
                              : 'الموظف لديه زيارة أخرى'}
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              }) : (
                <p className="text-gray-500 text-center py-4">Loading employees...</p>
              )}
            </div>
          </div>

          {/* Infection Control */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <h3 className="text-gray-900">تقييم مكافحة العدوى</h3>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.infectionControl.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    infectionControl: {
                      ...formData.infectionControl,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span>تفعيل</span>
              </label>
            </div>

            {formData.infectionControl.enabled && (
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="block text-gray-700 mb-2">بنود المراجعة</label>
                  <div className="space-y-2">
                    {formData.infectionControl.checklistItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="مثال: التحقق من بروتوكولات التعقيم"
                        />
                        {formData.infectionControl.checklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>إضافة بند</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    نسبة الالتزام (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.infectionControl.complianceLevel}
                      onChange={(e) => setFormData({
                        ...formData,
                        infectionControl: {
                          ...formData.infectionControl,
                          complianceLevel: parseInt(e.target.value)
                        }
                      })}
                      className="flex-1"
                    />
                    <span className="text-gray-900 min-w-[3rem] text-center">
                      {formData.infectionControl.complianceLevel}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">ملاحظات</label>
                  <textarea
                    value={formData.infectionControl.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      infectionControl: {
                        ...formData.infectionControl,
                        notes: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="ملاحظات عامة حول الزيارة والالتزام..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
