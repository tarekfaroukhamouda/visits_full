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

export function EmployeesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
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
    setFormData({ name: '', role: '', email: '', phone: '' });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone
    });
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      toast.success('✅ تم تحديث الموظف بنجاح');
      setEditingEmployee(null);
      setFormData({ name: '', role: '', email: '', phone: '' });
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
    setFormData({ name: '', role: '', email: '', phone: '' });
  }, [editingEmployee]);

  const EmployeeModalContent = ({ isEdit, formData, onNameChange, onRoleChange, onEmailChange, onPhoneChange, onSubmit, onClose }: {
    isEdit: boolean;
    formData: { name: string; role: string; email: string; phone: string };
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRoleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
  }) => (
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative z-50" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">{isEdit ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={onNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="مثال: د. محمد العتيبي"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            الوظيفة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={onRoleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="مثال: أخصائي مكافحة العدوى"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.email}
            onChange={onEmailChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="example@health.gov.sa"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={onPhoneChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="05xxxxxxxx"
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1565C0] text-white rounded-lg hover:bg-[#0d47a1] transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </button>
        </div>
      </form>
    </div>
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">إدارة الموظفين</h2>
          <p className="text-gray-600">إدارة ومتابعة الموظفين المكلفين بالزيارات الميدانية</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1565C0] text-white rounded-lg hover:bg-[#0d47a1] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة موظف</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <label className="block text-gray-700 mb-2">
          <Search className="w-4 h-4 inline ml-2" />
          البحث
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن موظف..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => {
          const stats = getEmployeeStats(employee.id);
          return (
            <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* إحصائيات الموظف */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">الزيارات المنجزة</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.completedVisits}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">الزيارات الغير منجزة</span>
                  </div>
                  <span className="font-bold text-red-600">{stats.incompleteVisits}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد نتائج مطابقة للبحث</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        عرض {filteredEmployees.length} من {employees.length} موظف
      </div>

      {/* Modals */}
      {(showAddModal || editingEmployee) && (
        <div 
          key={editingEmployee ? `edit-${editingEmployee.id}` : 'add-modal'}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <EmployeeModalContent
            isEdit={!!editingEmployee}
            formData={formData}
            onNameChange={handleNameChange}
            onRoleChange={handleRoleChange}
            onEmailChange={handleEmailChange}
            onPhoneChange={handlePhoneChange}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
}

export default memo(EmployeesManagement);