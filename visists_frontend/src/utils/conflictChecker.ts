import { Visit, Employee, Vacation } from '../App';

export interface ConflictCheck {
  hasConflict: boolean;
  conflictType?: 'visit' | 'vacation';
  conflictDetails?: string;
  conflictingVisit?: Visit;
  conflictingVacation?: Vacation;
}

/**
 * Check if an employee has conflicts for a given date
 */
export function checkEmployeeAvailability(
  employeeId: string,
  date: string,
  visits: Visit[],
  employees: Employee[],
  excludeVisitId?: string
): ConflictCheck {
  const employee = employees.find(emp => emp.id === employeeId);
  
  if (!employee) {
    return { hasConflict: false };
  }

  // Check for vacation conflicts
  if (employee.vacations) {
    const onVacation = employee.vacations.find(vacation => {
      if (vacation.status !== 'approved') return false;
      
      const visitDate = new Date(date);
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      
      return visitDate >= vacationStart && visitDate <= vacationEnd;
    });

    if (onVacation) {
      return {
        hasConflict: true,
        conflictType: 'vacation',
        conflictDetails: `Employee is on vacation from ${onVacation.startDate} to ${onVacation.endDate}`,
        conflictingVacation: onVacation
      };
    }
  }

  // Check for visit conflicts (same day)
  const conflictingVisit = visits.find(visit => {
    if (excludeVisitId && visit.id === excludeVisitId) return false;
    if (!visit.assignedEmployees.includes(employeeId)) return false;
    if (visit.status === 'cancelled') return false;
    
    return visit.scheduledDate === date;
  });

  if (conflictingVisit) {
    return {
      hasConflict: true,
      conflictType: 'visit',
      conflictDetails: `Employee has another visit on ${date}`,
      conflictingVisit
    };
  }

  return { hasConflict: false };
}

/**
 * Check multiple employees for conflicts
 */
export function checkMultipleEmployeesAvailability(
  employeeIds: string[],
  date: string,
  visits: Visit[],
  employees: Employee[],
  excludeVisitId?: string
): Map<string, ConflictCheck> {
  const conflicts = new Map<string, ConflictCheck>();

  employeeIds.forEach(employeeId => {
    const check = checkEmployeeAvailability(
      employeeId,
      date,
      visits,
      employees,
      excludeVisitId
    );
    conflicts.set(employeeId, check);
  });

  return conflicts;
}

/**
 * Get available employees for a specific date
 */
export function getAvailableEmployees(
  date: string,
  visits: Visit[],
  employees: Employee[],
  excludeVisitId?: string
): Employee[] {
  return employees.filter(employee => {
    const check = checkEmployeeAvailability(
      employee.id,
      date,
      visits,
      employees,
      excludeVisitId
    );
    return !check.hasConflict && employee.isActive !== false;
  });
}

/**
 * Check if employee can swap with another employee
 */
export function checkSwapAvailability(
  fromEmployeeId: string,
  toEmployeeId: string,
  visitDate: string,
  visits: Visit[],
  employees: Employee[],
  currentVisitId: string
): ConflictCheck {
  return checkEmployeeAvailability(
    toEmployeeId,
    visitDate,
    visits,
    employees,
    currentVisitId
  );
}
