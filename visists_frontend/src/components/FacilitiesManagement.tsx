import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Building2, Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';
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
    location: 'inside-taif'
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
      location: 'inside-taif'
    });
    setShowAddModal(false);
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location
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
      location: 'inside-taif'
    });
    setEditingFacility(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">{t('facilities_management')}</h2>
          <p className="text-gray-600">{t('facilities_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('add_facility')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={t('search_placeholder')}
          />
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.length > 0 ? filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              facility.location === 'inside-taif'
                ? 'border-green-200 bg-green-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  facility.location === 'inside-taif'
                    ? 'bg-green-100'
                    : 'bg-amber-100'
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    facility.location === 'inside-taif'
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-gray-900">{facility.name}</h3>
                  <p className="text-sm text-gray-600">
                    {facility.type === 'government' ? t('government') : t('private')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className={`text-sm px-3 py-1 rounded-full ${
                facility.location === 'inside-taif'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {facility.location === 'inside-taif' ? t('inside_taif') : t('outside_taif')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(facility)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>{t('edit')}</span>
              </button>
              <button
                onClick={() => handleDelete(facility.id, facility.name)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete')}</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('no_facilities')}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-gray-900 mb-4">
              {editingFacility ? t('edit') : t('add_facility')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('facility_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('facility_name_placeholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  {t('type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'government' | 'private' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="inside-taif">{t('inside_taif')}</option>
                  <option value="outside-taif">{t('outside_taif')}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
