import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { AddVisitForm } from './components/AddVisitFormEnhanced';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { EmployeesManagement } from './components/EmployeesManagement';
import { FacilitiesManagement } from './components/FacilitiesManagement';
import { EmployeePerformance } from './components/EmployeePerformance';
import { ProgramsManagement } from './components/ProgramsManagement';
import { VacationsManagement } from './components/VacationsManagement';
import { SwapRequestsManagement } from './components/SwapRequestsManagement';
import { EmployeeHistory } from './components/EmployeeHistory';
import { ExcelUploadVisits } from './components/ExcelUploadVisits';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { Users, Calendar, FileText, Home, Building2, BarChart3, Layers, Palmtree, RefreshCw, History, FileUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doctorApi } from './services/api';

// Helper function to decode JWT payload
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export interface User {
  id: string;
  name: string;
  role: number; // 0 = admin, 1 = manager
  email: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  course?: string[];
  isActive?: boolean;
  vacations?: Vacation[];
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SwapRequest {
  id: string;
  visitId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
}

export interface CorrectivePlan {
  status: 'approved' | 'under_review' | 'pending';
  documents?: string[];
  images?: string[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'government' | 'private';
  location: 'inside-taif' | 'outside-taif';
  email?: string;
}

export interface Program {
  id: string;
  name: string;
  nameEn: string;
  targetVisits: number;
  completedVisits?: number;
  correctivePlans?: {
    approved: number;
    pending: number;
  };
  trainingSessions?: number;
}

export interface Visit {
  id: string;
  facilityId: string;
  facilityName?: string;
  type: 'government' | 'private';
  location?: 'inside-taif' | 'outside-taif';
  scheduledDate: string;
  actualDate?: string;
  status: 'completed' | 'postponed' | 'scheduled' | 'unscheduled' | 'cancelled';
  assignedEmployees: string[];
  postponeReason?: string;
  programId?: string;
  tasks?: string[];
  correctivePlan?: CorrectivePlan;
  infectionControl?: {
    checklistItems: string[];
    complianceLevel: number;
    notes: string;
  };
  correctivePlanApproved?: boolean;
}

type ViewType = 'dashboard' | 'visits' | 'add-visit' | 'employees' | 'facilities' | 'performance' | 'programs' | 'vacations' | 'swap-requests' | 'employee-history' | 'excel-upload';

function AppContent() {
  console.log('AppContent component rendering');
  const { t, dir } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get token from cookie
        const cookies = document.cookie.split(';');
        let token = null;
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'auth_token') {
            try {
              token = decodeURIComponent(value);
            } catch (error) {
              console.error('Error decoding cookie value:', error);
              // Clear malformed cookie
              document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
            break;
          }
        }

        // Get user info from localStorage
        const userInfo = localStorage.getItem('user_info');
        let user = null;
        if (userInfo) {
          try {
            user = JSON.parse(userInfo);
          } catch (error) {
            console.error('Error parsing user info:', error);
            localStorage.removeItem('user_info');
          }
        }

        if (token && user && !isTokenExpired(token)) {
          setCurrentUser(user);
        } else {
          // Clean up invalid data
          if (token) {
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
          if (user) {
            localStorage.removeItem('user_info');
          }
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        // Clean up on error
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('user_info');
      }
    };
    checkAuth();
  }, []);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Toaster position="top-center" />
      <Header user={currentUser} onLogout={() => {
        // Clear token cookie
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Clear user info
        localStorage.removeItem('user_info');
        setCurrentUser(null);
      }} />
      
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-50
          w-64 bg-white ${dir === 'rtl' ? 'border-l' : 'border-r'} border-gray-200 
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto pt-4 lg:pt-0">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-[#1565C0] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>{t('home')}</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentView('visits');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'visits'
                    ? 'bg-[#1565C0] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>{t('visits_table')}</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentView('add-visit');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'add-visit'
                    ? 'bg-[#1565C0] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>{t('add_visit')}</span>
              </button>
              
              {currentUser.role === 0 && (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('employees');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'employees'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>{t('employees')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('facilities');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'facilities'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>{t('facilities')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('programs');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'programs'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>{t('programs')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('performance');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'performance'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>{t('performance')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('vacations');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'vacations'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Palmtree className="w-5 h-5" />
                    <span>{t('vacations')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('swap-requests');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'swap-requests'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>{t('swap_requests')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('employee-history');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'employee-history'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <History className="w-5 h-5" />
                    <span>{t('employee_history')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('excel-upload');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === 'excel-upload'
                        ? 'bg-[#1565C0] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileUp className="w-5 h-5" />
                    <span>{t('excel_upload')}</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`lg:hidden fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-30 bg-[#1565C0] text-white p-4 rounded-full shadow-lg hover:bg-[#0d47a1] transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {currentView === 'dashboard' && <Dashboard userRole={currentUser.role} />}
          {currentView === 'visits' && <CalendarView userRole={currentUser.role} />}
          {currentView === 'add-visit' && <AddVisitForm />}
          {currentView === 'employees' && currentUser.role === 0 && <EmployeesManagement />}
          {currentView === 'facilities' && currentUser.role === 0 && <FacilitiesManagement />}
          {currentView === 'programs' && currentUser.role === 0 && <ProgramsManagement />}
          {currentView === 'performance' && currentUser.role === 0 && <EmployeePerformance />}
          {currentView === 'vacations' && currentUser.role === 0 && <VacationsManagement />}
          {currentView === 'swap-requests' && currentUser.role === 0 && <SwapRequestsManagement />}
          {currentView === 'employee-history' && currentUser.role === 0 && <EmployeeHistory />}
          {currentView === 'excel-upload' && currentUser.role === 0 && <ExcelUploadVisits />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  console.log('App component rendering');
  return (
    <DataProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </DataProvider>
  );
}