import { Visit, Employee } from '../App';
import { formatHijri } from './hijriUtils';

// Helper function to get employee names by IDs
export function getEmployeeNames(employeeIds: string[], employees: Employee[]): string {
  return employeeIds
    .map(id => employees.find(emp => emp.id === id)?.name || '')
    .filter(name => name)
    .join(', ');
}

// Helper function to get visit statistics
export function getVisitStats(visits: Visit[]) {
  const todayHijri = formatHijri(new Date());

  // Corrected progress levels:
  // Progress 0: Upcoming/Not started
  // Progress 1: Completed
  // Progress 2: Correction Plan Submitted
  const completed = visits.filter(v => (v as any).progress === 1).length;
  const submittedPlan = visits.filter(v => (v as any).progress === 2).length;
  const postponed = visits.filter(v => v.status === 'postponed').length;
  const scheduled = visits.filter(v => v.status === 'scheduled').length;
  const total = visits.length;

  // Delayed visits: status is scheduled or postponed, progress 0, and date has passed
  const delayed = visits.filter(v =>
    (v.status === 'scheduled' || v.status === 'postponed') &&
    ((v as any).progress ?? 0) === 0 &&
    v.scheduledDate < todayHijri
  ).length;

  return {
    total,
    completed,
    submittedPlan,
    postponed,
    scheduled,
    delayed,
    completionRate: total > 0 ? Math.round(((completed + submittedPlan) / total) * 100) : 0
  };
}
