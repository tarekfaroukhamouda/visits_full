import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RefreshCw, Plus, Check, X, Clock, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SwapRequest } from '../App';

export function SwapRequestsManagement() {
  const { t, dir } = useLanguage();
  const { swapRequests, employees, visits, facilities, addSwapRequest, updateSwapRequest } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    visitId: '',
    fromEmployeeId: '',
    toEmployeeId: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.visitId || !formData.fromEmployeeId || !formData.toEmployeeId || !formData.reason) {
      toast.error(t('required_fields'));
      return;
    }

    if (formData.fromEmployeeId === formData.toEmployeeId) {
      toast.error('لا يمكن التبديل مع نفس الموظف / Cannot swap with same employee');
      return;
    }

    const newSwapRequest: Omit<SwapRequest, 'id'> = {
      visitId: formData.visitId,
      fromEmployeeId: formData.fromEmployeeId,
      toEmployeeId: formData.toEmployeeId,
      reason: formData.reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    addSwapRequest(newSwapRequest);
    toast.success(t('swap_requested'));
    setIsAddDialogOpen(false);
    setFormData({
      visitId: '',
      fromEmployeeId: '',
      toEmployeeId: '',
      reason: ''
    });
  };

  const handleApprove = (swapRequest: SwapRequest) => {
    updateSwapRequest(swapRequest.id, {
      status: 'approved',
      respondedAt: new Date().toISOString()
    });
    toast.success(t('swap_approved'));
  };

  const handleReject = (swapRequest: SwapRequest) => {
    updateSwapRequest(swapRequest.id, {
      status: 'rejected',
      respondedAt: new Date().toISOString()
    });
    toast.error(t('swap_rejected'));
  };

  const getStatusBadge = (status: SwapRequest['status']) => {
    const variants: Record<SwapRequest['status'], { variant: any; icon: any }> = {
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

  const getVisitDetails = (visitId: string) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return { facility: 'غير معروف / Unknown', date: '' };

    const facility = facilities.find(f => f.id === visit.facilityId);
    return {
      facility: facility?.name || visit.facilityName || 'غير معروف / Unknown',
      date: visit.scheduledDate
    };
  };

  // Get visits that can be swapped (scheduled or upcoming)
  const availableVisits = visits.filter(v => 
    v.status === 'scheduled' || (v.status === 'unscheduled' && new Date(v.scheduledDate) > new Date())
  );

  const filteredRequests = swapRequests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl mb-2">{t('swap_requests')}</h1>
        <p className="text-gray-600">{t('visits_subtitle')}</p>
      </div>

      {/* Actions & Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1">
            <Label>{t('status')}</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="max-w-xs">
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

          <div className="flex items-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('swap_request')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('swap_request')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>{t('visit')}</Label>
                    <Select
                      value={formData.visitId}
                      onValueChange={(value) => {
                        const visit = visits.find(v => v.id === value);
                        setFormData({ 
                          ...formData, 
                          visitId: value,
                          fromEmployeeId: visit?.assignedEmployees[0] || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('visit')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVisits.map(visit => {
                          const facility = facilities.find(f => f.id === visit.facilityId);
                          return (
                            <SelectItem key={visit.id} value={visit.id}>
                              {facility?.name || visit.facilityName} - {new Date(visit.scheduledDate).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('employee')} (من / From)</Label>
                    <Select
                      value={formData.fromEmployeeId}
                      onValueChange={(value) => setFormData({ ...formData, fromEmployeeId: value })}
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

                  <div>
                    <Label>{t('swap_with')} (إلى / To)</Label>
                    <Select
                      value={formData.toEmployeeId}
                      onValueChange={(value) => setFormData({ ...formData, toEmployeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('employee')} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter(emp => emp.id !== formData.fromEmployeeId)
                          .map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('swap_reason')}</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={t('swap_reason')}
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

      {/* Swap Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>{t('no_data')}</p>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const visitDetails = getVisitDetails(request.visitId);
            return (
              <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">
                        {getEmployeeName(request.fromEmployeeId)}
                      </h3>
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold">
                        {getEmployeeName(request.toEmployeeId)}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{visitDetails.facility}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(visitDetails.date).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{request.reason}</p>

                    <p className="text-xs text-gray-500">
                      {t('date')}: {new Date(request.requestedAt).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t('approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {t('reject')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_pending')}</div>
          <div className="text-2xl font-bold text-yellow-600">
            {swapRequests.filter(r => r.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_approved')}</div>
          <div className="text-2xl font-bold text-green-600">
            {swapRequests.filter(r => r.status === 'approved').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('vacation_status_rejected')}</div>
          <div className="text-2xl font-bold text-red-600">
            {swapRequests.filter(r => r.status === 'rejected').length}
          </div>
        </Card>
      </div>
    </div>
  );
}
