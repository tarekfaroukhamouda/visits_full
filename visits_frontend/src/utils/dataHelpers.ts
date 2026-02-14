import { Visit, Employee } from '../App';

// Helper function to get employee names by IDs
export function getEmployeeNames(employeeIds: string[], employees: Employee[]): string {
  return employeeIds
    .map(id => employees.find(emp => emp.id === id)?.name || '')
    .filter(name => name)
    .join(', ');
}

// Helper function to get visit statistics
export function getVisitStats(visits: Visit[]) {
  // Completed visits: progress === 2 (correction plan submitted)
  const completed = visits.filter(v => (v as any).progress === 2).length;
  const postponed = visits.filter(v => v.status === 'postponed').length;
  const scheduled = visits.filter(v => v.status === 'scheduled').length;
  const total = visits.length;

  return {
    total,
    completed,
    postponed,
    scheduled,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}


