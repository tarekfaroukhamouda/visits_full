import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Plus, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Vacation, User } from '../App';

interface VacationsManagementProps {
  user?: User;
}

export function VacationsManagement({ user }: VacationsManagementProps) {
  const { t, dir } = useLanguage();
  const { vacations, employees, addVacation, updateVacation, deleteVacation } = useData();
  const isRole1 = user?.role === 1;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employeeId = isRole1 && user ? user.id : formData.employeeId;
    if (!employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error(t('required_fields'));
      return;
    }

    const newVacation: Omit<Vacation, 'id'> = {
      employeeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    addVacation(newVacation);
    toast.success('✅ تم إضافة طلب الإجازة بنجاح / Vacation request added successfully');
    setIsAddDialogOpen(false);
    setFormData({
      employeeId: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handleApprove = (vacation: Vacation, currentUser: string = 'admin') => {
    updateVacation(vacation.id, {
      status: 'approved',
      reviewedBy: currentUser,
      reviewedAt: new Date().toISOString()
    });
    toast.success(t('vacation_approved'));
  };

  const handleReject = (vacation: Vacation, currentUser: string = 'admin') => {
    updateVacation(vacation.id, {
      status: 'rejected',
      reviewedBy: currentUser,
      reviewedAt: new Date().toISOString()
    });
    toast.error(t('vacation_rejected'));
  };

  const getStatusBadge = (status: Vacation['status']) => {
    const variants: Record<Vacation['status'], { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: Check },
      rejected: { variant: 'destructive', icon: X }
    };

    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {t(`vacation_status_${status}`)}
      </Badge>
    );
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || employeeId;
  };

  const filteredVacations = vacations.filter(vacation => {
    if (isRole1 && user && vacation.employeeId !== user.id) return false;
    if (filterEmployee !== 'all' && vacation.employeeId !== filterEmployee) return false;
    if (filterStatus !== 'all' && vacation.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl mb-2">{t('vacation_management')}</h1>
        <p className="text-gray-600">{t('employees_subtitle')}</p>
      </div>

      {/* Actions & Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            {!isRole1 && (
              <div className="flex-1">
                <Label>{t('employee')}</Label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('employees')}</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1">
              <Label>{t('status')}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  <SelectItem value="pending">{t('vacation_status_pending')}</SelectItem>
                  <SelectItem value="approved">{t('vacation_status_approved')}</SelectItem>
                  <SelectItem value="rejected">{t('vacation_status_rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_vacation')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add_vacation')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isRole1 ? (
                    <div>
                      <Label>{t('employee')}</Label>
                      <Select
                        value={formData.employeeId}
                        onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('employee')} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : user && (
                    <div>
                      <Label>{t('employee')}</Label>
                      <Input value={user.name} readOnly disabled className="bg-gray-50" />
                    </div>
                  )}

                  <div>
                    <Label>{t('vacation_start')}</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>{t('vacation_end')}</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>{t('vacation_reason')}</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={t('vacation_reason')}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit">{t('save')}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Vacations List */}
      <div className="space-y-4">
        {filteredVacations.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>{t('no_data')}</p>
          </Card>
        ) : (
          filteredVacations.map((vacation) => (
            <Card key={vacation.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{getEmployeeName(vacation.employeeId)}</h3>
                    {getStatusBadge(vacation.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(vacation.startDate).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')} - {new Date(vacation.endDate).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">{vacation.reason}</p>

                  {vacation.reviewedBy && (
                    <p className="text-xs text-gray-500">
                      {t('reviewed_by')}: {vacation.reviewedBy} - {new Date(vacation.reviewedAt!).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                    </p>
                  )}
                </div>

                {vacation.status === 'pending' && !isRole1 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(vacation)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {t('approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(vacation)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('reject')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_pending')}</div>
          <div className="text-2xl font-bold text-yellow-600">
            {(isRole1 ? filteredVacations : vacations).filter(v => v.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_approved')}</div>
          <div className="text-2xl font-bold text-green-600">
            {(isRole1 ? filteredVacations : vacations).filter(v => v.status === 'approved').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_rejected')}</div>
          <div className="text-2xl font-bold text-red-600">
            {(isRole1 ? filteredVacations : vacations).filter(v => v.status === 'rejected').length}
          </div>
        </Card>
      </div>
    </div>
  );
}
