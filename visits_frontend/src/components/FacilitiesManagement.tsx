import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Building2, Plus, Edit2, Trash2, Search, MapPin, X, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Facility } from '../App';

export function FacilitiesManagement() {
  const { facilities, addFacility, updateFacility, deleteFacility } = useData();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  const [formData, setFormData] = useState<Omit<Facility, 'id'>>({
    name: '',
    type: 'government',
    location: 'inside-taif',
    email: ''
  });

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('required_fields'));
      return;
    }

    if (editingFacility) {
      updateFacility(editingFacility.id, formData);
      toast.success(t('facility_updated'));
      setEditingFacility(null);
    } else {
      addFacility(formData);
      toast.success(t('facility_added'));
    }

    setFormData({
      name: '',
      type: 'government',
      location: 'inside-taif',
      email: ''
    });
    setShowAddModal(false);
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      email: facility.email || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`${t('delete_confirm')} ${name}?`)) {
      deleteFacility(id);
      toast.success(t('facility_deleted'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'government',
      location: 'inside-taif',
      email: ''
    });
    setEditingFacility(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative gradient-primary rounded-2xl p-6 lg:p-8 text-white shadow-medium overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold drop-shadow">{t('facilities_management')}</h2>
            </div>
            <p className="text-blue-50 drop-shadow">{t('facilities_subtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#1565C0] rounded-xl hover:bg-blue-50 transition-all shadow-soft font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>{t('add_facility')}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-2xl shadow-soft p-4 border border-gray-200/50">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('search_facility')}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.length > 0 ? filteredFacilities.map((facility: Facility) => (
          <div key={facility.id} className="glass-effect rounded-2xl shadow-soft border border-gray-200/50 p-6 hover-lift flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{facility.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                    {t(facility.type)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${facility.location === 'inside-taif'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  {facility.location === 'inside-taif' ? t('inside_taif') : t('outside_taif')}
                </span>
              </div>
              {facility.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 flex items-center justify-center">@</span>
                  <span className="truncate">{facility.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleEdit(facility)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium border border-transparent hover:border-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                <span>{t('edit')}</span>
              </button>
              <button
                onClick={() => handleDelete(facility.id, facility.name)}
                className="flex items-center justify-center px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title={t('delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full glass-effect rounded-2xl shadow-soft border border-gray-200/50 p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('no_facilities')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={resetForm}
        >
          <div
            className="glass-effect rounded-2xl shadow-medium border border-gray-200/50 max-w-md w-full p-6 relative z-50"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-lg">
                {editingFacility ? t('edit') : t('add_facility')}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">
                  {t('facility_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  placeholder={t('facility_name_placeholder')}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">
                  {t('type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'government' | 'private' }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="government">{t('government')}</option>
                  <option value="private">{t('private')}</option>
                  <option value="military">{t('military')}</option>
                  <option value="non_profit">{t('non_profit')}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">
                  {t('location')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as 'inside-taif' | 'outside-taif' }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="inside-taif">{t('inside_taif')}</option>
                  <option value="outside-taif">{t('outside_taif')}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  placeholder={t('email_placeholder') || 'facility@example.com'}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl shadow-soft hover:opacity-90 transition-opacity font-medium"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
