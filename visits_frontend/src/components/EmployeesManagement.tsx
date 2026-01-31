import { useState, useMemo, useCallback, memo } from 'react';
import { useData } from '../contexts/DataContext';
import { Employee } from '../App';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  User,
  Edit,
  Trash2,
  UserCheck,
  X,
  Save,
  CheckCircle,
  XCircle,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

const EmployeeModalContent = ({ isEdit, formData, onChange, onSubmit, onClose }: {
  isEdit: boolean;
  formData: { name: string; role: string; email: string; phone: string; course: string };
  onChange: (field: keyof typeof formData, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) => (
  <div className="glass-effect rounded-2xl shadow-medium border border-gray-200/50 max-w-md w-full p-6 relative z-50" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-gray-900 font-bold text-lg">{isEdit ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>
    </div>
    
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2 font-medium text-sm">
          الاسم الكامل <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="مثال: د. محمد العتيبي"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium text-sm">
          الوظيفة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => onChange('role', e)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="مثال: أخصائي مكافحة العدوى"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium text-sm">
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.email}
          onChange={(e) => onChange('email', e)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="example@health.gov.sa"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium text-sm">
          رقم الهاتف <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => onChange('phone', e)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="05xxxxxxxx"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium text-sm">
          الدورات التدريبية (مفصولة بفاصلة)
        </label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => onChange('course', e)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="مثال: مكافحة العدوى, إدارة الجودة"
        />
      </div>
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl shadow-soft hover:opacity-90 transition-opacity font-medium"
        >
          <Save className="w-4 h-4" />
          <span>حفظ</span>
        </button>
      </div>
    </form>
  </div>
);

export function EmployeesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    course: ''
  });

  const { employees, addEmployee, updateEmployee, deleteEmployee, visits, programs } = useData();

  // حساب إحصائيات الموظف
  const getEmployeeStats = (employeeId: string) => {
    const employeeVisits = visits.filter(v => v.assignedEmployees.includes(employeeId));
    
    // الزيارات المنجزة (completed)
    const completedVisits = employeeVisits.filter(v => v.status === 'completed').length;
    
    // الزيارات الغير منجزة (scheduled, postponed, unscheduled, cancelled)
    const incompleteVisits = employeeVisits.filter(v => v.status !== 'completed').length;
    
    // عدد دورات التدريب المجزة (من البرامج التي شارك فيها الموظف)
    // نحسب الزيارات التي لها برنامج وهي مكتملة
    const trainingSessionsCompleted = employeeVisits.filter(v => 
      v.status === 'completed' && v.programId
    ).length;
    
    return {
      completedVisits,
      incompleteVisits,
      trainingSessionsCompleted
    };
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee(formData);
    toast.success('✅ تم إضافة الموظف بنجاح');
    setShowAddModal(false);
    setFormData({ name: '', role: '', email: '', phone: '', course: '' });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
      course: employee.course ? employee.course.join(', ') : ''
    });
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      toast.success('✅ تم تحديث الموظف بنجاح');
      setEditingEmployee(null);
      setFormData({ name: '', role: '', email: '', phone: '', course: '' });
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (window.confirm(`هل أنت متأكد من حذف ${employee.name}؟`)) {
      deleteEmployee(employee.id);
      toast.success('✅ تم حذف الموظف بنجاح');
    }
  };

  const handleCloseModal = useCallback(() => {
    if (editingEmployee) {
      setEditingEmployee(null);
    } else {
      setShowAddModal(false);
    }
    setFormData({ name: '', role: '', email: '', phone: '', course: '' });
  }, [editingEmployee]);

  const handleChange = (field: keyof typeof formData, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative gradient-primary rounded-2xl p-6 lg:p-8 text-white shadow-medium overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1653508311277-1ecf6ee52c5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold drop-shadow">إدارة الموظفين</h2>
            </div>
            <p className="text-blue-50 drop-shadow">إدارة ومتابعة الموظفين المكلفين بالزيارات الميدانية</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#1565C0] rounded-xl hover:bg-blue-50 transition-all shadow-soft font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة موظف</span>
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-2xl shadow-soft p-4 border border-gray-200/50">
        <label className="block text-gray-700 mb-2 font-medium">
          <Search className="w-4 h-4 inline ml-2" />
          البحث
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن موظف..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl input-enhanced focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => {
          const stats = getEmployeeStats(employee.id);
          return (
            <div key={employee.id} className="glass-effect rounded-2xl shadow-soft border border-gray-200/50 p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                </div>
                {employee.course && employee.course.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <GraduationCap className="w-4 h-4 text-yellow-600" />
                    <span>الدورات: {employee.course.join(', ')}</span>
                  </div>
                )}
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1 flex-shrink-0">
                  <UserCheck className="w-3 h-3" />
                  نشط
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">الزيارات المنجزة</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.completedVisits}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">الزيارات الغير منجزة</span>
                  </div>
                  <span className="font-bold text-red-600">{stats.incompleteVisits}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">دورات التدريب</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.trainingSessionsCompleted}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="glass-effect rounded-2xl shadow-soft border border-gray-200/50 p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد نتائج مطابقة للبحث</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        عرض {filteredEmployees.length} من {employees.length} موظف
      </div>

      {(showAddModal || editingEmployee) && (
        <div
          key={editingEmployee ? `edit-${editingEmployee.id}` : 'add-modal'}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={handleCloseModal}
        >
          <EmployeeModalContent
            isEdit={!!editingEmployee}
            formData={formData}
            onChange={handleChange}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
}

export default memo(EmployeesManagement);