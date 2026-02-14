import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Visit, Employee, Facility, Program, Vacation, SwapRequest } from '../App';
import {
  visitApi,
  doctorApi,
  locationApi,
  programApi,
  vacationApi,
  swapRequestApi,
  transformVisit,
  transformEmployee,
  transformFacility,
  transformProgram,
  transformVacation,
  transformSwapRequest,
} from '../services/api';
import { toast } from 'sonner@2.0.3';

interface DataContextType {
  visits: Visit[];
  employees: Employee[];
  facilities: Facility[];
  programs: Program[];
  vacations: Vacation[];
  swapRequests: SwapRequest[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addVisit: (visit: Omit<Visit, 'id'>, doctorIds: number[]) => Promise<void>;
  updateVisit: (id: string, visit: Partial<Visit>, doctorIds?: number[]) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addFacility: (facility: Omit<Facility, 'id'>) => Promise<void>;
  updateFacility: (id: string, facility: Partial<Facility>) => Promise<void>;
  deleteFacility: (id: string) => Promise<void>;
  addProgram: (program: Omit<Program, 'id'>) => Promise<void>;
  updateProgram: (id: string, program: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  addVacation: (vacation: Omit<Vacation, 'id'>) => Promise<void>;
  updateVacation: (id: string, vacation: Partial<Vacation>) => Promise<void>;
  deleteVacation: (id: string) => Promise<void>;
  addSwapRequest: (swapRequest: Omit<SwapRequest, 'id'>) => Promise<void>;
  updateSwapRequest: (id: string, swapRequest: Partial<SwapRequest>) => Promise<void>;
  deleteSwapRequest: (id: string) => Promise<void>;
  closeVisit: (id: string) => Promise<void>;
  submitCorrectionPlan: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  console.log('DataProvider rendering');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If doctor/employee (role === 1 or 2) fetch their visits via token-based my-visits API
      let visitsPromise: Promise<any[]> = visitApi.getAll().catch(() => []);
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          if (parsed && (parsed.role === 1 || parsed.role === 2)) {
            visitsPromise = visitApi.getMyVisits().catch(() => []);
          }
        }
      } catch (err) {
        console.error('Error parsing user_info in DataContext:', err);
      }

      const [visitsData, employeesData, facilitiesData, programsData, vacationsData, swapRequestsData] = await Promise.all([
        visitsPromise,
        doctorApi.getAll().catch((err) => {
          console.error('❌ Failed to load employees:', err.message || err);
          return [];
        }),
        locationApi.getAll().catch((err) => {
          console.error('❌ Failed to load facilities:', err.message || err);
          return [];
        }),
        programApi.getAll().catch((err) => {
          console.error('❌ Failed to load programs:', err.message || err);
          return [];
        }),
        vacationApi.getAll().catch((err) => {
          console.error('❌ Failed to load vacations:', err.message || err);
          return [];
        }),
        swapRequestApi.getAll().catch((err) => {
          console.error('❌ Failed to load swap requests:', err.message || err);
          return [];
        }),
      ]);

      setVisits(visitsData.map(transformVisit));
      setEmployees(employeesData.map(transformEmployee));
      setFacilities(facilitiesData.map(transformFacility));
      setPrograms(programsData.map(transformProgram));
      setVacations(vacationsData.map(transformVacation));
      setSwapRequests(swapRequestsData.map(transformSwapRequest));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Visit operations
  const addVisit = useCallback(async (visit: Omit<Visit, 'id'>, doctorIds: number[]) => {
    try {
      const backendData = {
        location_id: parseInt(visit.facilityId),
        program_id: visit.programId ? parseInt(visit.programId) : null,
        hijri_date: visit.scheduledDate, // scheduledDate now contains Hijri date
        hijri_end_date: visit.endDate || null,
        duties: visit.tasks?.join(', ') || null,
        status: visit.status || 'scheduled',
        notes: visit.postponeReason || visit.infectionControl?.notes || null,
        review_points: visit.infectionControl?.complianceLevel || null,
        files: visit.infectionControl?.checklistItems || null,
      };

      const newVisit = await visitApi.create(backendData, doctorIds);
      const transformed = transformVisit(newVisit);
      setVisits(prev => [transformed, ...prev]);
      toast.success('Visit added successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add visit');
      throw err;
    }
  }, []);

  const updateVisit = useCallback(async (id: string, updatedVisit: Partial<Visit>, doctorIds?: number[]) => {
    try {
      const backendData: any = {};
      if (updatedVisit.facilityId) backendData.location_id = parseInt(updatedVisit.facilityId);
      if (updatedVisit.programId !== undefined) backendData.program_id = updatedVisit.programId ? parseInt(updatedVisit.programId) : null;
      if (updatedVisit.scheduledDate) backendData.hijri_date = updatedVisit.scheduledDate; // scheduledDate now contains Hijri date
      if (updatedVisit.endDate !== undefined) backendData.hijri_end_date = updatedVisit.endDate || null;
      if (updatedVisit.tasks) backendData.duties = updatedVisit.tasks.join(', ');
      if (updatedVisit.status) backendData.status = updatedVisit.status;
      if (updatedVisit.postponeReason) backendData.notes = updatedVisit.postponeReason;
      if (updatedVisit.report !== undefined) backendData.report = updatedVisit.report;
      if (updatedVisit.infectionControl?.complianceLevel) backendData.review_points = updatedVisit.infectionControl.complianceLevel;
      if (updatedVisit.infectionControl?.notes) backendData.notes = updatedVisit.infectionControl.notes;
      if (updatedVisit.infectionControl?.checklistItems) backendData.files = updatedVisit.infectionControl.checklistItems;

      const updated = await visitApi.update(parseInt(id), backendData, doctorIds);
      const transformed = transformVisit(updated);
      setVisits(prev => prev.map(v => v.id === id ? transformed : v));
      toast.success('Visit updated successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update visit');
      throw err;
    }
  }, []);

  const deleteVisit = useCallback(async (id: string) => {
    try {
      await visitApi.delete(parseInt(id));
      setVisits(prev => prev.filter(v => v.id !== id));
      toast.success('Visit deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete visit');
      throw err;
    }
  }, []);

  const closeVisit = useCallback(async (id: string) => {
    try {
      await visitApi.closeVisit(parseInt(id));
      await loadData(); // Refresh to get updated progress
      toast.success('Visit closed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to close visit');
      throw err;
    }
  }, [loadData]);

  const submitCorrectionPlan = useCallback(async (id: string) => {
    try {
      await visitApi.submitCorrectionPlan(parseInt(id));
      await loadData(); // Refresh to get updated progress
      toast.success('Correction plan submitted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit correction plan');
      throw err;
    }
  }, [loadData]);

  // Employee operations
  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
    try {
      const backendData = {
        name: employee.name,
        email: employee.email,
        phone_number: employee.phone,
        position: employee.role,
        role: 1, // Default role
        course: employee.course ? (Array.isArray(employee.course) ? employee.course.join(',') : employee.course) : '',
      };

      const newEmployee = await doctorApi.create(backendData);
      const transformed = transformEmployee(newEmployee);
      setEmployees(prev => [...prev, transformed]);
      toast.success('Employee added successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
      throw err;
    }
  }, []);

  const updateEmployee = useCallback(async (id: string, updatedEmployee: Partial<Employee>) => {
    try {
      const backendData: any = {};
      if (updatedEmployee.name) backendData.name = updatedEmployee.name;
      if (updatedEmployee.email) backendData.email = updatedEmployee.email;
      if (updatedEmployee.phone) backendData.phone_number = updatedEmployee.phone;
      if (updatedEmployee.role) backendData.position = updatedEmployee.role;
      if (updatedEmployee.course !== undefined) backendData.course = Array.isArray(updatedEmployee.course) ? updatedEmployee.course.join(',') : updatedEmployee.course;

      const updated = await doctorApi.update(parseInt(id), backendData);
      const transformed = transformEmployee(updated);
      setEmployees(prev => prev.map(e => e.id === id ? transformed : e));
      toast.success('Employee updated successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update employee');
      throw err;
    }
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await doctorApi.delete(parseInt(id));
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success('Employee deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete employee');
      throw err;
    }
  }, []);

  // Facility operations
  const addFacility = useCallback(async (facility: Omit<Facility, 'id'>) => {
    try {
      const backendData = {
        name: facility.name,
        type: facility.type,
        inside: facility.location === 'inside-taif',
        email: facility.email || null,
      };

      const newFacility = await locationApi.create(backendData);
      const transformed = transformFacility(newFacility);
      setFacilities(prev => [...prev, transformed]);
      toast.success('Facility added successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add facility');
      throw err;
    }
  }, []);

  const updateFacility = useCallback(async (id: string, updatedFacility: Partial<Facility>) => {
    try {
      const backendData: any = {};
      if (updatedFacility.name) backendData.name = updatedFacility.name;
      if (updatedFacility.type) backendData.type = updatedFacility.type;
      if (updatedFacility.location) backendData.inside = updatedFacility.location === 'inside-taif';
      if (updatedFacility.email !== undefined) backendData.email = updatedFacility.email;

      const updated = await locationApi.update(parseInt(id), backendData);
      const transformed = transformFacility(updated);
      setFacilities(prev => prev.map(f => f.id === id ? transformed : f));
      toast.success('Facility updated successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update facility');
      throw err;
    }
  }, []);

  const deleteFacility = useCallback(async (id: string) => {
    try {
      await locationApi.delete(parseInt(id));
      setFacilities(prev => prev.filter(f => f.id !== id));
      toast.success('Facility deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete facility');
      throw err;
    }
  }, []);

  // Program operations
  const addProgram = useCallback(async (program: Omit<Program, 'id'>) => {
    try {
      const backendData = {
        name_ar: program.name,
        name_en: program.nameEn,
        target: program.targetVisits?.toString() || '0',
      };

      const newProgram = await programApi.create(backendData);
      const transformed = transformProgram(newProgram);
      setPrograms(prev => [...prev, transformed]);
      toast.success('Program added successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add program');
      throw err;
    }
  }, []);

  const updateProgram = useCallback(async (id: string, updatedProgram: Partial<Program>) => {
    try {
      const backendData: any = {};
      if (updatedProgram.name) backendData.name_ar = updatedProgram.name;
      if (updatedProgram.nameEn) backendData.name_en = updatedProgram.nameEn;
      if (updatedProgram.targetVisits !== undefined) backendData.target = updatedProgram.targetVisits.toString();

      const updated = await programApi.update(parseInt(id), backendData);
      const transformed = transformProgram(updated);
      setPrograms(prev => prev.map(p => p.id === id ? transformed : p));
      toast.success('Program updated successfully');
      return transformed;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update program');
      throw err;
    }
  }, []);

  const deleteProgram = useCallback(async (id: string) => {
    try {
      await programApi.delete(parseInt(id));
      setPrograms(prev => prev.filter(p => p.id !== id));
      toast.success('Program deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete program');
      throw err;
    }
  }, []);

  // Vacation operations
  const addVacation = useCallback(async (vacation: Omit<Vacation, 'id'>) => {
    try {
      const backendData = {
        doctor_id: parseInt(vacation.employeeId),
        hijri_start_date: vacation.startDate, // startDate now contains Hijri date
        hijri_end_date: vacation.endDate, // endDate now contains Hijri date
        reason: vacation.reason || null,
      };

      const newVacation = await vacationApi.create(backendData);
      const transformed = transformVacation(newVacation);
      setVacations(prev => [...prev, transformed]);
      toast.success('Vacation added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vacation');
      throw err;
    }
  }, []);

  const updateVacation = useCallback(async (id: string, updatedVacation: Partial<Vacation>) => {
    try {
      const backendData: any = {};
      if (updatedVacation.employeeId) backendData.doctor_id = parseInt(updatedVacation.employeeId);
      if (updatedVacation.startDate) backendData.hijri_start_date = updatedVacation.startDate; // startDate now contains Hijri date
      if (updatedVacation.endDate) backendData.hijri_end_date = updatedVacation.endDate; // endDate now contains Hijri date
      if (updatedVacation.reason !== undefined) backendData.reason = updatedVacation.reason;
      if (updatedVacation.status !== undefined) backendData.status = updatedVacation.status;

      const updated = await vacationApi.update(parseInt(id), backendData);
      const transformed = transformVacation(updated);
      setVacations(prev => prev.map(v => v.id === id ? transformed : v));
      toast.success('Vacation updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vacation');
      throw err;
    }
  }, []);

  const deleteVacation = useCallback(async (id: string) => {
    try {
      await vacationApi.delete(parseInt(id));
      setVacations(prev => prev.filter(v => v.id !== id));
      toast.success('Vacation deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete vacation');
      throw err;
    }
  }, []);

  // Swap Request operations
  const addSwapRequest = useCallback(async (swapRequest: Omit<SwapRequest, 'id'>) => {
    try {
      const backendData = {
        visit_id: parseInt(swapRequest.visitId),
        from_doctor_id: parseInt(swapRequest.fromEmployeeId),
        to_doctor_id: parseInt(swapRequest.toEmployeeId),
        reason: swapRequest.reason || null,
        status: swapRequest.status || 'pending',
      };

      const newSwapRequest = await swapRequestApi.create(backendData);
      const transformed = transformSwapRequest(newSwapRequest);
      setSwapRequests(prev => [...prev, transformed]);
      toast.success('Swap request added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add swap request');
      throw err;
    }
  }, []);

  const updateSwapRequest = useCallback(async (id: string, updatedSwapRequest: Partial<SwapRequest>) => {
    try {
      const backendData: any = {};
      if (updatedSwapRequest.visitId) backendData.visit_id = parseInt(updatedSwapRequest.visitId);
      if (updatedSwapRequest.fromEmployeeId) backendData.from_doctor_id = parseInt(updatedSwapRequest.fromEmployeeId);
      if (updatedSwapRequest.toEmployeeId) backendData.to_doctor_id = parseInt(updatedSwapRequest.toEmployeeId);
      if (updatedSwapRequest.reason !== undefined) backendData.reason = updatedSwapRequest.reason;
      if (updatedSwapRequest.status) backendData.status = updatedSwapRequest.status;

      const updated = await swapRequestApi.update(parseInt(id), backendData);
      const transformed = transformSwapRequest(updated);
      setSwapRequests(prev => prev.map(sr => sr.id === id ? transformed : sr));

      // If the swap request was approved, refresh visits data to reflect the assignment change
      if (updatedSwapRequest.status === 'approved') {
        await loadData();
      }

      toast.success('Swap request updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update swap request');
      throw err;
    }
  }, [loadData]);

  const deleteSwapRequest = useCallback(async (id: string) => {
    try {
      await swapRequestApi.delete(parseInt(id));
      setSwapRequests(prev => prev.filter(sr => sr.id !== id));
      toast.success('Swap request deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete swap request');
      throw err;
    }
  }, []);

  const contextValue = useMemo(() => ({
    visits,
    employees,
    facilities,
    programs,
    vacations,
    swapRequests,
    loading,
    error,
    refreshData,
    addVisit,
    updateVisit,
    deleteVisit,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addFacility,
    updateFacility,
    deleteFacility,
    addProgram,
    updateProgram,
    deleteProgram,
    addVacation,
    updateVacation,
    deleteVacation,
    addSwapRequest,
    updateSwapRequest,
    deleteSwapRequest,
    closeVisit,
    submitCorrectionPlan,
  }), [
    visits,
    employees,
    facilities,
    programs,
    vacations,
    swapRequests,
    loading,
    error,
    refreshData,
    addVisit,
    updateVisit,
    deleteVisit,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addFacility,
    updateFacility,
    deleteFacility,
    addProgram,
    updateProgram,
    deleteProgram,
    addVacation,
    updateVacation,
    deleteVacation,
    addSwapRequest,
    updateSwapRequest,
    deleteSwapRequest,
    closeVisit,
    submitCorrectionPlan,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
