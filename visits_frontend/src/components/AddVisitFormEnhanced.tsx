import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, Plus, X, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { checkMultipleEmployeesAvailability, getAvailableEmployees } from '../utils/conflictChecker';
import { FileUpload } from './FileUpload';

export function AddVisitForm() {
  const { addVisit, employees, visits, facilities, programs } = useData();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    facilityId: '',
    type: 'government' as 'government' | 'private',
    location: 'inside-taif' as 'inside-taif' | 'outside-taif',
    scheduledDate: '',
    endDate: '',
    dateType: 'gregorian' as 'gregorian' | 'hijri',
    hijriDate: '',
    status: 'scheduled' as 'scheduled' | 'unscheduled',
    assignedEmployees: [] as string[],
    programId: '',
    tasks: [''] as string[],
    infectionControl: {
      enabled: false,
      checklistItems: [''],
      complianceLevel: 0,
      notes: ''
    },
    correctivePlan: {
      enabled: false,
      status: 'pending' as 'pending' | 'under_review' | 'approved',
      notes: '',
      documents: [] as string[],
      images: [] as string[]
    }
  });

  const [employeeConflicts, setEmployeeConflicts] = useState<Map<string, any>>(new Map());

  // Check for conflicts whenever date or employees change
  useEffect(() => {
    if (formData.scheduledDate && formData.assignedEmployees.length > 0) {
      const conflicts = checkMultipleEmployeesAvailability(
        formData.assignedEmployees,
        formData.scheduledDate,
        visits,
        employees
      );
      setEmployeeConflicts(conflicts);
    } else {
      setEmployeeConflicts(new Map());
    }
  }, [formData.scheduledDate, formData.assignedEmployees, visits, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.facilityId || formData.assignedEmployees.length === 0) {
      toast.error(t('required_fields'));
      return;
    }

    if (formData.dateType === 'gregorian' && !formData.scheduledDate) {
      toast.error(t('required_fields'));
      return;
    }

    if (formData.endDate && formData.scheduledDate && new Date(formData.endDate) < new Date(formData.scheduledDate)) {
      toast.error(t('end_date_error'));
      return;
    }

    if (formData.dateType === 'hijri' && !formData.hijriDate) {
      toast.error(t('required_fields'));
      return;
    }

    // Check for conflicts
    const hasConflicts = Array.from(employeeConflicts.values()).some((check: any) => check.hasConflict);
    if (hasConflicts) {
      toast.error(t('employee_unavailable'));
      return;
    }

    if (formData.infectionControl.enabled &&
      formData.infectionControl.checklistItems.filter(item => item.trim()).length === 0) {
      toast.error(t('checklist_required'));
      return;
    }

    const facility = facilities.find((f: any) => f.id === formData.facilityId);
    const doctorIds = formData.assignedEmployees.map((id: string) => parseInt(id));

    // Create visit object
    const newVisit = {
      facilityId: formData.facilityId,
      facilityName: facility?.name,
      type: formData.type,
      location: formData.location,
      scheduledDate: formData.scheduledDate || undefined,
      endDate: formData.endDate || undefined,
      hijriDate: formData.hijriDate || undefined,
      status: formData.status,
      assignedEmployees: formData.assignedEmployees,
      programId: formData.programId || undefined,
      tasks: formData.tasks.filter((task: string) => task.trim()),
      ...(formData.infectionControl.enabled && {
        infectionControl: {
          checklistItems: formData.infectionControl.checklistItems.filter((item: string) => item.trim()),
          complianceLevel: formData.infectionControl.complianceLevel,
          notes: formData.infectionControl.notes
        }
      }),
      ...(formData.correctivePlan.enabled && {
        correctivePlan: {
          status: formData.correctivePlan.status,
          notes: formData.correctivePlan.notes,
          documents: formData.correctivePlan.documents,
          images: formData.correctivePlan.images
        }
      })
    };

    try {
      await addVisit(newVisit, doctorIds);
      toast.success(t('visit_added'), {
        description: `${t('visit_added_description')} ${facility?.name} ${t('visit_added_description_end')}`,
        duration: 3000
      });
      // Reset form
      resetForm();
    } catch (err) {
      // Error is already handled in DataContext
    }
  };

  const resetForm = () => {
    setFormData({
      facilityId: '',
      type: 'government',
      location: 'inside-taif',
      scheduledDate: '',
      endDate: '',
      status: 'scheduled',
      assignedEmployees: [],
      programId: '',
      tasks: [''],
      infectionControl: {
        enabled: false,
        checklistItems: [''],
        complianceLevel: 0,
        notes: ''
      },
      correctivePlan: {
        enabled: false,
        status: 'pending',
        notes: '',
        documents: [],
        images: []
      }
    });
  };

  const addTask = () => {
    setFormData(prev => ({ ...prev, tasks: [...prev.tasks, ''] }));
  };

  const updateTask = (index: number, value: string) => {
    setFormData(prev => {
      const newTasks = [...prev.tasks];
      newTasks[index] = value;
      return { ...prev, tasks: newTasks };
    });
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));
  };

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      infectionControl: {
        ...prev.infectionControl,
        checklistItems: [...prev.infectionControl.checklistItems, '']
      }
    }));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.infectionControl.checklistItems];
      newItems[index] = value;
      return {
        ...prev,
        infectionControl: {
          ...prev.infectionControl,
          checklistItems: newItems
        }
      };
    });
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      infectionControl: {
        ...prev.infectionControl,
        checklistItems: prev.infectionControl.checklistItems.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="glass-effect rounded-2xl p-6 shadow-soft border border-gray-200/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('add_visit_title')}</h2>
            <p className="text-sm text-gray-600">{t('visits_subtitle')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-effect rounded-2xl shadow-soft border border-gray-200/50 p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-gray-900 font-semibold pb-2 border-b border-gray-200">{t('basic_info')}</h3>

          <div>
            <label className="block text-gray-700 mb-2">
              {t('facility_name')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.facilityId}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === e.target.value);
                setFormData({
                  ...formData,
                  facilityId: e.target.value,
                  type: facility?.type || 'government',
                  location: facility?.location || 'inside-taif'
                });
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              required
            >
              <option value="">{t('facility_name_placeholder')}</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} ({facility.location === 'inside-taif' ? t('inside_taif') : t('outside_taif')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                {t('type')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'government' | 'private' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                disabled
              >
                <option value="government">{t('government')}</option>
                <option value="private">{t('private')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('location')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as 'inside-taif' | 'outside-taif' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                disabled
              >
                <option value="inside-taif">{t('inside_taif')}</option>
                <option value="outside-taif">{t('outside_taif')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('status')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'scheduled' | 'unscheduled' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                required
              >
                <option value="scheduled">{t('status_scheduled')}</option>
                <option value="unscheduled">{t('status_unscheduled')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                {t('scheduled_date')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-center mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateType"
                    checked={formData.dateType === 'gregorian'}
                    onChange={() => setFormData(prev => ({ ...prev, dateType: 'gregorian' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Gregorian</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateType"
                    checked={formData.dateType === 'hijri'}
                    onChange={() => setFormData(prev => ({ ...prev, dateType: 'hijri', scheduledDate: '' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Hijri</span>
                </label>
              </div>

              {formData.dateType === 'gregorian' ? (
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                />
              ) : (
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={formData.hijriDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hijriDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              )}
            </div>



            <div>
              <label className="block text-gray-700 mb-2">
                {t('end_date')}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.scheduledDate}
                disabled={!formData.scheduledDate}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                {t('program_name')}
              </label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData(prev => ({ ...prev, programId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="">{t('all_types')}</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {language === 'ar' ? program.name : program.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assigned Employees with Conflict Checking */}
        <div className="space-y-4">
          <h3 className="text-gray-900 font-semibold pb-2 border-b border-gray-200">{t('assigned_employees')}</h3>

          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-white/50">
            {(employees && employees.length > 0 ? getAvailableEmployees(formData.scheduledDate, visits, employees) : []).map(employee => {
              const isSelected = formData.assignedEmployees.includes(employee.id);

              return (
                <label
                  key={employee.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-soft'
                    : 'hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
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
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                </label>
              );
            })}
            {(!employees || employees.length === 0) && (
              <p className="text-gray-500 text-center py-4">Loading employees...</p>
            )}
          </div>
          {formData.assignedEmployees.length > 0 && (
            <p className="text-sm text-gray-600">
              {t('showing')} {formData.assignedEmployees.length} {t('employee')}
            </p>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <h3 className="text-gray-900 font-semibold pb-2 border-b border-gray-200">{t('tasks')}</h3>
          <div className="space-y-2">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  placeholder={t('task_placeholder')}
                />
                {formData.tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTask}
              className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t('add_task')}</span>
            </button>
          </div>
        </div>

        {/* Corrective Plan */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <h3 className="text-gray-900 font-semibold">{t('corrective_plan')}</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formData.correctivePlan.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  correctivePlan: { ...prev.correctivePlan, enabled: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span>({t('enable')})</span>
            </label>
          </div>

          {formData.correctivePlan.enabled && (
            <div className="space-y-4 bg-gray-50/80 rounded-xl p-4">
              <div>
                <label className="block text-gray-700 mb-2">{t('plan_status')}</label>
                <select
                  value={formData.correctivePlan.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    correctivePlan: {
                      ...prev.correctivePlan,
                      status: e.target.value as 'pending' | 'under_review' | 'approved'
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="pending">{t('plan_pending')}</option>
                  <option value="under_review">{t('plan_under_review')}</option>
                  <option value="approved">{t('plan_approved')}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">{t('plan_notes')}</label>
                <textarea
                  value={formData.correctivePlan.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    correctivePlan: { ...prev.correctivePlan, notes: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  rows={3}
                  placeholder={t('notes_placeholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FileUpload
                    type="documents"
                    onFilesChange={(files) => setFormData(prev => ({
                      ...prev,
                      correctivePlan: { ...prev.correctivePlan, documents: files }
                    }))}
                    currentFiles={formData.correctivePlan.documents}
                  />
                </div>

                <div>
                  <FileUpload
                    type="images"
                    onFilesChange={(files) => setFormData(prev => ({
                      ...prev,
                      correctivePlan: { ...prev.correctivePlan, images: files }
                    }))}
                    currentFiles={formData.correctivePlan.images}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Infection Control (Optional) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <h3 className="text-gray-900 font-semibold">{t('infection_control')}</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formData.infectionControl.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  infectionControl: {
                    ...prev.infectionControl,
                    enabled: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span>({t('enable')})</span>
            </label>
          </div>

          {formData.infectionControl.enabled && (
            <div className="space-y-4 bg-gray-50/80 rounded-xl p-4">
              <div>
                <label className="block text-gray-700 mb-2">{t('checklist_items')}</label>
                <div className="space-y-2">
                  {formData.infectionControl.checklistItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        placeholder={t('checklist_placeholder')}
                      />
                      {formData.infectionControl.checklistItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(index)}
                          className="px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t('add_item')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">{t('compliance_level')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.infectionControl.complianceLevel}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      infectionControl: {
                        ...prev.infectionControl,
                        complianceLevel: parseInt(e.target.value)
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="text-gray-900 min-w-[3rem] text-center">
                    {formData.infectionControl.complianceLevel}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">{t('notes')}</label>
                <textarea
                  value={formData.infectionControl.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    infectionControl: {
                      ...prev.infectionControl,
                      notes: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  rows={4}
                  placeholder={t('notes_placeholder')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {t('cancel')}
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl shadow-soft hover:opacity-90 transition-opacity"
          >
            <Save className="w-5 h-5" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form >
    </div >
  );
}