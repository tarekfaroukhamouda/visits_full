import { Visit } from '../App';
import { getEmployeeNames } from '../utils/dataHelpers';
import { useData } from '../contexts/DataContext';
import { 
  X, 
  Calendar, 
  Building2, 
  Users, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';

interface VisitDetailsModalProps {
  visit: Visit;
  onClose: () => void;
}

export function VisitDetailsModal({ visit, onClose }: VisitDetailsModalProps) {
  const { employees } = useData();
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Use default font (helvetica supports basic characters)
    doc.setFont('helvetica');
    
    let yPos = 20;
    
    // Header with border
    doc.setDrawColor(59, 130, 246); // blue-600
    doc.setLineWidth(0.5);
    doc.line(20, 15, 190, 15);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('Field Visit Report', 105, yPos, { align: 'center' });
    yPos += 8;
    doc.text('Infection Control Assessment', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setDrawColor(59, 130, 246);
    doc.line(20, yPos - 5, 190, yPos - 5);
    yPos += 5;
    
    // Visit Details Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Visit Information', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    // Facility Name
    doc.setFont('helvetica', 'bold');
    doc.text('Facility:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(visit.name, 50, yPos);
    yPos += 7;
    
    // Type
    doc.setFont('helvetica', 'bold');
    doc.text('Type:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(visit.type === 'government' ? 'Government' : 'Private', 50, yPos);
    yPos += 7;
    
    // Status
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const statusText = visit.status === 'completed' ? 'Completed' :
                      visit.status === 'scheduled' ? 'Scheduled' :
                      visit.status === 'postponed' ? 'Postponed' : 'Unscheduled';
    doc.text(statusText, 50, yPos);
    yPos += 7;
    
    // Scheduled Date
    doc.setFont('helvetica', 'bold');
    doc.text('Scheduled Date:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(visit.scheduledDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 50, yPos);
    yPos += 7;
    
    // Actual Date
    if (visit.actualDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Actual Date:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(visit.actualDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 50, yPos);
      yPos += 7;
    }
    
    // Assigned Employees
    doc.setFont('helvetica', 'bold');
    doc.text('Assigned Staff:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const employeeNames = getEmployeeNames(visit.assignedEmployees, employees);
    const employeeLines = doc.splitTextToSize(employeeNames, 140);
    doc.text(employeeLines, 50, yPos);
    yPos += 7 * employeeLines.length + 3;
    
    // Infection Control Section
    if (visit.infectionControl) {
      yPos += 5;
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Infection Control Assessment', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      
      // Compliance Level with visual indicator
      doc.setFont('helvetica', 'bold');
      doc.text('Compliance Level:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${visit.infectionControl.complianceLevel}%`, 60, yPos);
      
      // Draw compliance bar
      const barWidth = 80;
      const barHeight = 4;
      const fillWidth = (visit.infectionControl.complianceLevel / 100) * barWidth;
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(220, 220, 220);
      doc.rect(100, yPos - 3, barWidth, barHeight, 'FD');
      
      // Color based on compliance level
      if (visit.infectionControl.complianceLevel >= 90) {
        doc.setFillColor(34, 197, 94); // green
      } else if (visit.infectionControl.complianceLevel >= 75) {
        doc.setFillColor(234, 179, 8); // yellow
      } else {
        doc.setFillColor(239, 68, 68); // red
      }
      doc.rect(100, yPos - 3, fillWidth, barHeight, 'F');
      
      yPos += 10;
      
      // Checklist Items
      doc.setFont('helvetica', 'bold');
      doc.text('Checklist Items:', 20, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      visit.infectionControl.checklistItems.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(34, 197, 94);
        doc.circle(23, yPos - 1.5, 1.5, 'F');
        
        const lines = doc.splitTextToSize(`${index + 1}. ${item}`, 165);
        doc.text(lines, 28, yPos);
        yPos += 6 * lines.length;
      });
      
      // Notes
      if (visit.infectionControl.notes) {
        yPos += 5;
        
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 20, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(visit.infectionControl.notes, 170);
        doc.text(noteLines, 20, yPos);
        yPos += 6 * noteLines.length;
      }
    }
    
    // Postpone Reason
    if (visit.postponeReason) {
      yPos += 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28); // red-700
      doc.text('Postpone Reason:', 20, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const reasonLines = doc.splitTextToSize(visit.postponeReason, 170);
      doc.text(reasonLines, 20, yPos);
    }
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString('en-US')}`,
        105,
        287,
        { align: 'center' }
      );
    }
    
    doc.save(`visit-report-${visit.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('✅ تم تصدير التقرير بنجاح', {
      description: `تم حفظ تقرير الزيارة بصيغة PDF`,
      duration: 3000
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-900">تفاصيل الزيارة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم المنشأة</p>
                <p className="text-gray-900">{visit.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">نوع المنشأة</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  visit.type === 'government' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {visit.type === 'government' ? 'حكومي' : 'خاص'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">حالة الزيارة</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                  visit.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                  visit.status === 'postponed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {visit.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {visit.status === 'postponed' && <AlertCircle className="w-4 h-4" />}
                  {visit.status === 'completed' ? 'مكتملة' :
                   visit.status === 'scheduled' ? 'مجدولة' :
                   visit.status === 'postponed' ? 'مؤجلة' : 'غير مجدولة'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">التاريخ المجدول</p>
                  <p className="text-gray-900">
                    {new Date(visit.scheduledDate).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {visit.actualDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التاريخ الفعلي</p>
                    <p className="text-gray-900">
                      {new Date(visit.actualDate).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">الموظفين المكلفين</p>
                <p className="text-gray-900">{getEmployeeNames(visit.assignedEmployees, employees)}</p>
              </div>
            </div>
          </div>

          {/* Postpone Reason */}
          {visit.postponeReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-900 mb-1">سبب التأجيل</p>
                  <p className="text-red-700">{visit.postponeReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Infection Control */}
          {visit.infectionControl && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">تقييم مكافحة العدوى</h3>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        visit.infectionControl.complianceLevel >= 90 ? 'bg-green-500' :
                        visit.infectionControl.complianceLevel >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${visit.infectionControl.complianceLevel}%` }}
                    />
                  </div>
                  <span className="text-gray-900">
                    {visit.infectionControl.complianceLevel}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-2">بنود المراجعة:</p>
                <ul className="space-y-2">
                  {visit.infectionControl.checklistItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {visit.infectionControl.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                  <p className="text-gray-900">{visit.infectionControl.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>تصدير PDF</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}