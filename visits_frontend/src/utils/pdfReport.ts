import jsPDF from 'jspdf';
import { getEmployeeNames } from './dataHelpers';
import type { Visit } from '../App';
import type { Employee } from '../App';
import { toast } from 'sonner@2.0.3';

export function exportVisitToPdf(visit: Visit, employees: Employee[]) {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  const name = visit.facilityName || (visit as any).name || 'Visit';
  let yPos = 20;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, 15, 190, 15);

  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text('Field Visit Report', 105, yPos, { align: 'center' });
  yPos += 8;
  doc.text('Infection Control Assessment', 105, yPos, { align: 'center' });
  yPos += 15;

  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPos - 5, 190, yPos - 5);
  yPos += 5;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Visit Information', 20, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Facility:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(name, 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Type:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(visit.type === 'government' ? 'Government' : 'Private', 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const statusText = visit.status === 'completed' ? 'Completed' :
    visit.status === 'scheduled' ? 'Scheduled' :
    visit.status === 'postponed' ? 'Postponed' : 'Unscheduled';
  doc.text(statusText, 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Scheduled Date:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(visit.scheduledDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 50, yPos);
  yPos += 7;

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

  doc.setFont('helvetica', 'bold');
  doc.text('Assigned Staff:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const employeeNames = getEmployeeNames(visit.assignedEmployees, employees);
  const employeeLines = doc.splitTextToSize(employeeNames, 140);
  doc.text(employeeLines, 50, yPos);
  yPos += 7 * employeeLines.length + 3;

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
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Level:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${visit.infectionControl.complianceLevel}%`, 60, yPos);

    const barWidth = 80;
    const barHeight = 4;
    const fillWidth = (visit.infectionControl.complianceLevel / 100) * barWidth;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(220, 220, 220);
    doc.rect(100, yPos - 3, barWidth, barHeight, 'FD');
    if (visit.infectionControl.complianceLevel >= 90) {
      doc.setFillColor(34, 197, 94);
    } else if (visit.infectionControl.complianceLevel >= 75) {
      doc.setFillColor(234, 179, 8);
    } else {
      doc.setFillColor(239, 68, 68);
    }
    doc.rect(100, yPos - 3, fillWidth, barHeight, 'F');
    yPos += 10;

    if (visit.infectionControl.checklistItems?.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Checklist Items:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      visit.infectionControl.checklistItems.forEach((item, index) => {
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
    }

    if (visit.infectionControl.notes) {
      yPos += 5;
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

  if (visit.postponeReason) {
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('Postpone Reason:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const reasonLines = doc.splitTextToSize(visit.postponeReason, 170);
    doc.text(reasonLines, 20, yPos);
  }

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

  const safeName = name.replace(/\s+/g, '-');
  doc.save(`visit-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`);

  toast.success('✅ تم تصدير التقرير بنجاح', {
    description: 'تم حفظ تقرير الزيارة بصيغة PDF',
    duration: 3000
  });
}
