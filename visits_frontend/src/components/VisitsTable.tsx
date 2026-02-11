import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVisitStatus, useFormatDate } from '../utils/translations';
import { getEmployeeNames } from '../utils/dataHelpers';
import { Visit } from '../App';
import { formatHijriDate } from '../utils/hijriUtils';
import { 
  Search, 
  Filter, 
  Download, 
  FileText,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { VisitDetailsModal } from './VisitDetailsModal';
import { EditVisitModal } from './EditVisitModal';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

interface VisitsTableProps {
  userRole: number; // 0 = admin, 1 = manager, 2 = employee
}

export function VisitsTable({ userRole }: VisitsTableProps) {
  const { visits, deleteVisit, employees } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      const matchesSearch = visit.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
      const matchesType = typeFilter === 'all' || visit.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [visits, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: Visit['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      scheduled: 'bg-orange-100 text-orange-700',
      postponed: 'bg-red-100 text-red-700',
      unscheduled: 'bg-gray-100 text-gray-700'
    };

    const labels = {
      completed: 'مكتملة',
      scheduled: 'مجدولة',
      postponed: 'مؤجلة',
      unscheduled: 'غير مجدولة'
    };

    const icons = {
      completed: <CheckCircle className="w-4 h-4" />,
      scheduled: <Clock className="w-4 h-4" />,
      postponed: <AlertCircle className="w-4 h-4" />,
      unscheduled: <Calendar className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const exportToExcel = () => {
    const data = filteredVisits.map(visit => ({
      'اسم المنشأة': visit.name,
      'النوع': visit.type === 'government' ? 'حكومي' : 'خاص',
      'التاريخ المجدول': formatHijriDate(new Date(visit.scheduledDate), 'ar', 'long'),
      'التاريخ الفعلي': visit.actualDate ? formatHijriDate(new Date(visit.actualDate), 'ar', 'long') : '-',
      'الحالة': visit.status === 'completed' ? 'مكتملة' : 
                visit.status === 'scheduled' ? 'مجدولة' : 
                visit.status === 'postponed' ? 'مؤجلة' : 'غير مجدولة',
      'الموظفين المكلفين': getEmployeeNames(visit.assignedEmployees, employees),
      'سبب التأجيل': visit.postponeReason || '-',
      'نسبة الالتزام': visit.infectionControl?.complianceLevel ? `${visit.infectionControl.complianceLevel}%` : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الزيارات الميدانية');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // اسم المنشأة
      { wch: 10 }, // النوع
      { wch: 15 }, // التاريخ المجدول
      { wch: 15 }, // التاريخ الفعلي
      { wch: 12 }, // الحالة
      { wch: 30 }, // الموظفين
      { wch: 40 }, // سبب التأجيل
      { wch: 12 }  // نسبة الالتزام
    ];

    const fileName = `الزيارات_الميدانية_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('✅ تم تصدير الملف بنجاح', {
      description: `تم حفظ ${filteredVisits.length} زيارة في ملف Excel`,
      duration: 3000
    });
  };

  const handleDelete = async (visit: Visit) => {
    if (window.confirm(`هل أنت متأكد من حذف زيارة ${visit.name}؟`)) {
      try {
        await deleteVisit(visit.id);
        // Success message is handled in DataContext
      } catch (err) {
        // Error is already handled in DataContext
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">جدول الزيارات الميدانية</h2>
          <p className="text-gray-600">إدارة ومتابعة جميع الزيارات</p>
        </div>
        
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>تصدير Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">
              <Search className="w-4 h-4 inline ml-2" />
              البحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن منشأة..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline ml-2" />
              حالة الزيارة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتملة</option>
              <option value="scheduled">مجدولة</option>
              <option value="postponed">مؤجلة</option>
              <option value="unscheduled">غير مجدولة</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline ml-2" />
              نوع المنشأة
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="government">حكومي</option>
              <option value="private">خاص</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-gray-700">المنشأة</th>
                <th className="px-6 py-4 text-right text-gray-700">النوع</th>
                <th className="px-6 py-4 text-right text-gray-700">التاريخ المجدول</th>
                <th className="px-6 py-4 text-right text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-gray-700">الموظفين</th>
                <th className="px-6 py-4 text-right text-gray-700">حالة الإنجاز</th>
                <th className="px-6 py-4 text-right text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVisits.map(visit => (
                <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{visit.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      visit.type === 'government' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {visit.type === 'government' ? 'حكومي' : 'خاص'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatHijriDate(new Date(visit.scheduledDate), language === 'ar' ? 'ar' : 'en', 'long')}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(visit.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-sm">{getEmployeeNames(visit.assignedEmployees, employees)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {visit.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        مكتملة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        غير مكتملة
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingVisit(visit)}
                        className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(visit)}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVisits.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد زيارات مطابقة للبحث</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>عرض {filteredVisits.length} من {visits.length} زيارة</span>
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <VisitDetailsModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
        />
      )}

      {/* Edit Visit Modal */}
      {editingVisit && (
        <EditVisitModal
          visit={editingVisit}
          onClose={() => setEditingVisit(null)}
        />
      )}
    </div>
  );
}