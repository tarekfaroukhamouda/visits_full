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
import { MyVisits } from './components/MyVisits';
import { MyReport } from './components/MyReport';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { Users, Calendar, FileText, Home, Building2, BarChart3, Layers, Palmtree, RefreshCw, History, FileUp, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doctorApi } from './services/api';

export interface User {
  id: string;
  name: string;
  role: number; // 0 = admin, 1 = doctor/employee (my visits + report only), 2 = manager
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
  hijriDate?: string;
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

type ViewType = 'dashboard' | 'visits' | 'add-visit' | 'employees' | 'facilities' | 'performance' | 'programs' | 'vacations' | 'swap-requests' | 'employee-history' | 'excel-upload' | 'my-visits' | 'my-report';

function AppContent() {
  console.log('AppContent component rendering');
  const { t, dir } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const clearAuth = () => {
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('user_info');
      if (!cancelled) setCurrentUser(null);
    };

    async function checkAuth() {
      try {
        const cookies = document.cookie.split(';');
        let token: string | null = null;
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'auth_token') {
            try {
              token = decodeURIComponent(value);
            } catch {
              clearAuth();
              return;
            }
            break;
          }
        }

        if (!token) {
          localStorage.removeItem('user_info');
          if (!cancelled) setCurrentUser(null);
          return;
        }

        try {
          const me = await doctorApi.getMe();
          if (cancelled) return;
          const user: User = {
            id: String(me.id),
            name: me.name ?? '',
            role: me.role ?? 1,
            email: me.email ?? '',
          };
          localStorage.setItem('user_info', JSON.stringify(user));
          setCurrentUser(user);
        } catch {
          if (cancelled) return;
          clearAuth();
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        clearAuth();
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  // Default to my-visits for role 1 (doctor/employee) on first load
  useEffect(() => {
    if (currentUser?.role === 1 && currentView === 'dashboard') {
      setCurrentView('my-visits');
    }
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const isDoctor = currentUser.role === 1;

  return (
    <div className="min-h-screen soft-background bg-pattern animate-fade-in" dir={dir}>
      <Toaster position="top-center" />
      <Header user={currentUser} onLogout={() => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('user_info');
        setCurrentUser(null);
      }} />

      <div className="flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`fixed lg:static inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-50 w-64 glass-effect ${dir === 'rtl' ? 'border-l' : 'border-r'} border-gray-200/50 transform transition-all duration-300 ease-out lg:transform-none shadow-soft ${isSidebarOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto pt-4 lg:pt-0">
            {!isDoctor && (
              <div className="px-4 py-6 border-b border-gray-200/50 hidden lg:block">
                <div className="flex items-center gap-3 animate-slide-in-right">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t('main_menu')}</p>
                    <p className="text-xs text-gray-500">{currentUser.role === 0 ? t('admin') : t('manager')}</p>
                  </div>
                </div>
              </div>
            )}
            <nav className="p-4 space-y-1.5">
              {isDoctor ? (
                <>
                  <button
                    onClick={() => { setCurrentView('my-visits'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'my-visits' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'my-visits' ? 'bg-white/20' : 'bg-green-50 group-hover:bg-green-100'}`}>
                      <ClipboardList className={`w-5 h-5 ${currentView === 'my-visits' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('my_visits')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('visits'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'visits' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'visits' ? 'bg-white/20' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                      <Calendar className={`w-5 h-5 ${currentView === 'visits' ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('calendar')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('my-report'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'my-report' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'my-report' ? 'bg-white/20' : 'bg-purple-50 group-hover:bg-purple-100'}`}>
                      <FileText className={`w-5 h-5 ${currentView === 'my-report' ? 'text-white' : 'text-purple-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('my_report')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('vacations'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'vacations' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'vacations' ? 'bg-white/20' : 'bg-teal-50 group-hover:bg-teal-100'}`}>
                      <Palmtree className={`w-5 h-5 ${currentView === 'vacations' ? 'text-white' : 'text-teal-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('vacations')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('swap-requests'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'swap-requests' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'swap-requests' ? 'bg-white/20' : 'bg-orange-50 group-hover:bg-orange-100'}`}>
                      <RefreshCw className={`w-5 h-5 ${currentView === 'swap-requests' ? 'text-white' : 'text-orange-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('swap_requests')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'dashboard' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'dashboard' ? 'bg-white/20' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                      <Home className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('home')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('visits'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'visits' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'visits' ? 'bg-white/20' : 'bg-green-50 group-hover:bg-green-100'}`}>
                      <Calendar className={`w-5 h-5 ${currentView === 'visits' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('visits_table')}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('add-visit'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'add-visit' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'add-visit' ? 'bg-white/20' : 'bg-purple-50 group-hover:bg-purple-100'}`}>
                      <FileText className={`w-5 h-5 ${currentView === 'add-visit' ? 'text-white' : 'text-purple-600'}`} />
                    </div>
                    <span className="font-medium text-sm">{t('add_visit')}</span>
                  </button>
                  {currentUser.role === 0 && (
                    <>
                      <div className="py-2 border-t border-gray-200/50 mt-2" />
                      <p className="text-xs font-semibold text-gray-500 mt-3 mb-1 px-2">{dir === 'rtl' ? 'الإدارة' : 'Management'}</p>
                      <button onClick={() => { setCurrentView('employees'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'employees' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'employees' ? 'bg-white/20' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}><Users className={`w-5 h-5 ${currentView === 'employees' ? 'text-white' : 'text-indigo-600'}`} /></div>
                        <span className="font-medium text-sm">{t('employees')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('facilities'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'facilities' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'facilities' ? 'bg-white/20' : 'bg-amber-50 group-hover:bg-amber-100'}`}><Building2 className={`w-5 h-5 ${currentView === 'facilities' ? 'text-white' : 'text-amber-600'}`} /></div>
                        <span className="font-medium text-sm">{t('facilities')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('programs'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'programs' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'programs' ? 'bg-white/20' : 'bg-pink-50 group-hover:bg-pink-100'}`}><Layers className={`w-5 h-5 ${currentView === 'programs' ? 'text-white' : 'text-pink-600'}`} /></div>
                        <span className="font-medium text-sm">{t('programs')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('performance'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'performance' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'performance' ? 'bg-white/20' : 'bg-cyan-50 group-hover:bg-cyan-100'}`}><BarChart3 className={`w-5 h-5 ${currentView === 'performance' ? 'text-white' : 'text-cyan-600'}`} /></div>
                        <span className="font-medium text-sm">{t('performance')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('vacations'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'vacations' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'vacations' ? 'bg-white/20' : 'bg-teal-50 group-hover:bg-teal-100'}`}><Palmtree className={`w-5 h-5 ${currentView === 'vacations' ? 'text-white' : 'text-teal-600'}`} /></div>
                        <span className="font-medium text-sm">{t('vacations')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('swap-requests'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'swap-requests' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'swap-requests' ? 'bg-white/20' : 'bg-orange-50 group-hover:bg-orange-100'}`}><RefreshCw className={`w-5 h-5 ${currentView === 'swap-requests' ? 'text-white' : 'text-orange-600'}`} /></div>
                        <span className="font-medium text-sm">{t('swap_requests')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('employee-history'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'employee-history' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'employee-history' ? 'bg-white/20' : 'bg-violet-50 group-hover:bg-violet-100'}`}><History className={`w-5 h-5 ${currentView === 'employee-history' ? 'text-white' : 'text-violet-600'}`} /></div>
                        <span className="font-medium text-sm">{t('employee_history')}</span>
                      </button>
                      <button onClick={() => { setCurrentView('excel-upload'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'excel-upload' ? 'gradient-primary text-white shadow-soft' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentView === 'excel-upload' ? 'bg-white/20' : 'bg-emerald-50 group-hover:bg-emerald-100'}`}><FileUp className={`w-5 h-5 ${currentView === 'excel-upload' ? 'text-white' : 'text-emerald-600'}`} /></div>
                        <span className="font-medium text-sm">{t('excel_upload')}</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`lg:hidden fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-30 gradient-primary text-white p-4 rounded-full shadow-medium hover:opacity-90 transition-opacity`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="animate-fade-in">
            {currentView === 'dashboard' && !isDoctor && <Dashboard userRole={currentUser.role} />}
            {(currentView === 'my-visits' || (isDoctor && currentView === 'dashboard')) && <MyVisits userId={currentUser.id} />}
            {currentView === 'visits' && <CalendarView userRole={currentUser.role} userId={isDoctor ? currentUser.id : undefined} />}
            {currentView === 'add-visit' && <AddVisitForm />}
            {currentView === 'my-report' && <MyReport userId={currentUser.id} />}
            {currentView === 'employees' && currentUser.role === 0 && <EmployeesManagement />}
            {currentView === 'facilities' && currentUser.role === 0 && <FacilitiesManagement />}
            {currentView === 'programs' && currentUser.role === 0 && <ProgramsManagement />}
            {currentView === 'performance' && currentUser.role === 0 && <EmployeePerformance />}
            {currentView === 'vacations' && <VacationsManagement user={currentUser} />}
            {currentView === 'swap-requests' && <SwapRequestsManagement user={currentUser} />}
            {currentView === 'employee-history' && currentUser.role === 0 && <EmployeeHistory />}
            {currentView === 'excel-upload' && currentUser.role === 0 && <ExcelUploadVisits />}
          </div>
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