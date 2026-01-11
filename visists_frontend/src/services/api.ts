// Excel Upload API
export const excelUploadApi = {
  uploadVisitsExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/visits/upload-excel/`, {
      method: 'POST',
      headers: token ? { 'x-access-tokens': token } : undefined,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://138.68.225.253:8000';

// Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to get auth token from cookie
const getAuthToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Helper function to get headers
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['x-access-tokens'] = token;
  }
  
  return headers;
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}

// Visit API
export const visitApi = {
  getAll: () => apiRequest<any[]>('/visits/'),
  getById: (id: number) => apiRequest<any>(`/visits/${id}`),
  create: (data: any, doctorIds: number[]) => {
    return apiRequest<any>('/visits/', {
      method: 'POST',
      body: JSON.stringify({ data, doctor_ids: doctorIds }),
    });
  },
  update: (id: number, data: any, doctorIds?: number[]) => {
    const body: any = { data };
    if (doctorIds) {
      body.doctor_ids = doctorIds;
    }
    return apiRequest<any>(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  delete: (id: number) => apiRequest<{ success: boolean }>(`/visits/${id}`, { method: 'DELETE' }),
  getByDoctor: (doctorId: number) => apiRequest<any[]>(`/visits/visits-by-doctor/?doctor_id=${doctorId}`),
};

// Doctor API
export const doctorApi = {
  getAll: () => apiRequest<any[]>('/doctors/'),
  getById: (id: number) => apiRequest<any>(`/doctors/${id}`),
  create: (data: any) => apiRequest<any>('/doctors/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest<any>(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ success: boolean }>(`/doctors/${id}`, { method: 'DELETE' }),
  login: (identifier: string, password: string) => apiRequest<any>('/doctors/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  }),
};

// Location API
export const locationApi = {
  getAll: () => apiRequest<any[]>('/locations/'),
  getById: (id: number) => apiRequest<any>(`/locations/${id}`),
  create: (data: any) => apiRequest<any>('/locations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest<any>(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ success: boolean }>(`/locations/${id}`, { method: 'DELETE' }),
};

// Program API
export const programApi = {
  getAll: () => apiRequest<any[]>('/programs/'),
  getById: (id: number) => apiRequest<any>(`/programs/${id}`),
  create: (data: any) => apiRequest<any>('/programs/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest<any>(`/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ success: boolean }>(`/programs/${id}`, { method: 'DELETE' }),
};

// Vacation API
export const vacationApi = {
  getAll: () => apiRequest<any[]>('/vacations/'),
  getById: (id: number) => apiRequest<any>(`/vacations/${id}`),
  getByDoctor: (doctorId: number) => apiRequest<any[]>(`/vacations/doctor/${doctorId}`),
  create: (data: any) => apiRequest<any>('/vacations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest<any>(`/vacations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ success: boolean }>(`/vacations/${id}`, { method: 'DELETE' }),
};

// Swap Request API
export const swapRequestApi = {
  getAll: () => apiRequest<any[]>('/swap-requests/'),
  getById: (id: number) => apiRequest<any>(`/swap-requests/${id}`),
  create: (data: any) => apiRequest<any>('/swap-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest<any>(`/swap-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ success: boolean }>(`/swap-requests/${id}`, { method: 'DELETE' }),
};

// Helper function to transform backend data to frontend format
export const transformVisit = (backendVisit: any): any => {
  return {
    id: backendVisit.id?.toString() || '',
    facilityId: backendVisit.location_id?.toString() || '',
    facilityName: backendVisit.location?.name || '',
    type: backendVisit.location?.type || 'government',
    location: backendVisit.location?.inside ? 'inside-taif' : 'outside-taif',
    scheduledDate: backendVisit.date || '',
    actualDate: backendVisit.date || '',
    status: backendVisit.status || 'scheduled',
    assignedEmployees: backendVisit.doctors?.map((vd: any) => vd.doctor?.id?.toString() || '') || [],
    postponeReason: backendVisit.notes || undefined,
    programId: backendVisit.program_id?.toString() || undefined,
    tasks: backendVisit.duties ? [backendVisit.duties] : undefined,
    infectionControl: backendVisit.review_points ? {
      checklistItems: [],
      complianceLevel: backendVisit.review_points,
      notes: backendVisit.notes || '',
    } : undefined,
  };
};

export const transformEmployee = (backendDoctor: any): any => {
  return {
    id: backendDoctor.id?.toString() || '',
    name: backendDoctor.name || '',
    role: backendDoctor.position || '',
    email: backendDoctor.email || '',
    phone: backendDoctor.phone_number || '',
    course: backendDoctor.course ? (Array.isArray(backendDoctor.course) ? backendDoctor.course : backendDoctor.course.split(',')) : [],
    isActive: true, // Assuming all doctors are active
  };
};

export const transformFacility = (backendLocation: any): any => {
  return {
    id: backendLocation.id?.toString() || '',
    name: backendLocation.name || '',
    type: backendLocation.type || 'government',
    location: backendLocation.inside ? 'inside-taif' : 'outside-taif',
    email: backendLocation.email || undefined,
  };
};

export const transformProgram = (backendProgram: any): any => {
  return {
    id: backendProgram.id?.toString() || '',
    name: backendProgram.name_ar || '',
    nameEn: backendProgram.name_en || '',
    targetVisits: parseInt(backendProgram.target || '0'),
    completedVisits: 0, // Will be calculated from visits
    correctivePlans: {
      approved: 0,
      pending: 0,
    },
    trainingSessions: 0,
  };
};

export const transformVacation = (backendVacation: any): any => {
  return {
    id: backendVacation.id?.toString() || '',
    employeeId: backendVacation.doctor_id?.toString() || '',
    startDate: backendVacation.start_date || '',
    endDate: backendVacation.end_date || '',
    reason: backendVacation.reason || '',
    status: backendVacation.status || 'pending',
    requestedAt: backendVacation.requested_at || new Date().toISOString(),
  };
};

export const transformSwapRequest = (backendSwapRequest: any): any => {
  return {
    id: backendSwapRequest.id?.toString() || '',
    visitId: backendSwapRequest.visit_id?.toString() || '',
    fromEmployeeId: backendSwapRequest.from_doctor_id?.toString() || '',
    toEmployeeId: backendSwapRequest.to_doctor_id?.toString() || '',
    reason: backendSwapRequest.reason || '',
    status: backendSwapRequest.status || 'pending',
    requestedAt: backendSwapRequest.requested_at || new Date().toISOString(),
    respondedAt: backendSwapRequest.responded_at || undefined,
  };
};

