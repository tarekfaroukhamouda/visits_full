import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layers, Plus, Edit2, Trash2, CheckCircle, Clock, FileText, GraduationCap, Upload } from 'lucide-react';
import { programApi } from '../services/api';
import { toast } from 'sonner@2.0.3';
import { Program } from '../App';

export function ProgramsManagement() {
  const { programs, addProgram, updateProgram, deleteProgram, visits, refreshData } = useData();
  const { t, language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Omit<Program, 'id'>>({
    name: '',
    nameEn: '',
    targetVisits: 0,
    completedVisits: 0,
    correctivePlans: {
      approved: 0,
      pending: 0
    },
    trainingSessions: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.nameEn.trim()) {
      toast.error(t('required_fields'));
      return;
    }

    try {
      setIsUploading(true);
      let programId = '';

      if (editingProgram) {
        await updateProgram(editingProgram.id, formData);
        programId = editingProgram.id;
      } else {
        const newProgram = await addProgram(formData);
        programId = newProgram.id;
      }

      if (iconFile && programId) {
        await programApi.uploadIcon(parseInt(programId), iconFile);
        toast.success(t('icon_uploaded'));
        await refreshData();
      }
      resetForm();
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error(t('error_saving_program'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      nameEn: program.nameEn,
      targetVisits: program.targetVisits,
      completedVisits: program.completedVisits || 0,
      correctivePlans: program.correctivePlans || { approved: 0, pending: 0 },
      trainingSessions: program.trainingSessions || 0
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`${t('delete_confirm')} ${name}?`)) {
      deleteProgram(id);
      toast.success(t('program_deleted'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      targetVisits: 0,
      completedVisits: 0,
      correctivePlans: { approved: 0, pending: 0 },
      trainingSessions: 0
    });
    setEditingProgram(null);
    setIconFile(null);
    setShowAddModal(false);
  };

  const getProgramStats = (programId: string) => {
    const programVisits = visits.filter(v => v.programId === programId);
    const completed = programVisits.filter(v => v.status === 'completed').length;
    const program = programs.find(p => p.id === programId);
    const target = program?.targetVisits || 0;
    const remaining = Math.max(0, target - completed);
    const percentage = target > 0 ? Math.round((completed / target) * 100) : 0;

    return { completed, remaining, percentage };
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">{t('programs_management')}</h2>
          <p className="text-gray-600">{t('programs_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('add_program')}</span>
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.length > 0 ? programs.map((program) => {
          const stats = getProgramStats(program.id);
          return (
            <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {program.icon ? (
                      <img
                        src={`${API_BASE_URL}${program.icon}`}
                        alt={program.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900">{language === 'ar' ? program.name : program.nameEn}</h3>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? program.nameEn : program.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(program)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(program.id, program.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{t('completion_rate')}</span>
                  <span className="text-sm text-gray-900">{stats.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">{t('completed_visits_count')}</p>
                    <p className="text-gray-900">{stats.completed}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">{t('remaining_visits')}</p>
                    <p className="text-gray-900">{stats.remaining}</p>
                  </div>
                </div>
              </div>

              {/* Corrective Plans */}
              <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{t('corrective_plans')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {t('approved_plans')}: {program.correctivePlans?.approved || 0}
                  </span>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    {t('pending_plans')}: {program.correctivePlans?.pending || 0}
                  </span>
                </div>
              </div>

              {/* Training Sessions */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{t('training_sessions')}</span>
                </div>
                <span className="text-gray-900">{program.trainingSessions || 0}</span>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('no_data')}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-gray-900 mb-4">
              {editingProgram ? t('edit') : t('add_program')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('program_name')} (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: مكافحة العدوى"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('program_name_en')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Infection Control Assessment"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('target_visits')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetVisits}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetVisits: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('training_sessions')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.trainingSessions}
                    onChange={(e) => setFormData(prev => ({ ...prev, trainingSessions: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-3">{t('corrective_plans')}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">{t('approved_plans')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.correctivePlans?.approved || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        correctivePlans: {
                          ...formData.correctivePlans!,
                          approved: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">{t('pending_plans')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.correctivePlans?.pending || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        correctivePlans: {
                          ...formData.correctivePlans!,
                          pending: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  {t('program_icon')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-dashed border-gray-300">
                    {iconFile ? (
                      <img src={URL.createObjectURL(iconFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : editingProgram?.icon ? (
                      <img src={`${API_BASE_URL}${editingProgram.icon}`} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
