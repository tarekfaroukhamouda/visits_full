import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVisitStatus, useFormatDate } from '../utils/translations';
import { getVisitStats, getEmployeeNames } from '../data/mockData';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Users,
  Building2,
  XCircle,
  FileX,
  Layers,
  Target,
  Award,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
// Navigation will use window.location for dashboard redirect
import logo from 'figma:asset/26fdc8a84af1bdd50de5261850b9d1bc61210158.png';

interface DashboardProps {
  userRole: number; // 0 = admin, 1 = manager
}

export function Dashboard({ userRole }: DashboardProps) {
  const { visits, programs, employees, facilities } = useData();
  const { t, language } = useLanguage();
  const { getStatusLabel, getTypeLabel } = useVisitStatus();
  const formatDate = useFormatDate();
  const stats = useMemo(() => getVisitStats(visits), [visits]);
  const navigateToDashboard = (path: string) => { window.location.href = path; };

  // Colors from theme
  const COLORS = {
    primary: '#1565C0',
    secondary: '#00C853',
    accent: '#C5A572',
    warning: '#FF9800',
    danger: '#d32f2f',
    purple: '#9C27B0',
    gray: '#757575'
  };

  // Status distribution data
  const statusData = useMemo(() => [
    { 
      name: language === 'ar' ? 'مكتملة' : 'Completed', 
      value: stats.completed, 
      color: COLORS.secondary 
    },
    { 
      name: language === 'ar' ? 'مجدولة' : 'Scheduled', 
      value: stats.scheduled, 
      color: COLORS.primary 
    },
    { 
      name: language === 'ar' ? 'مؤجلة' : 'Postponed', 
      value: stats.postponed, 
      color: COLORS.warning 
    },
    { 
      name: language === 'ar' ? 'ملغاة' : 'Cancelled', 
      value: visits.filter(v => v.status === 'cancelled').length, 
      color: COLORS.danger 
    }
  ], [stats, visits, language]);

  // Monthly visits trend
  const monthlyTrend = useMemo(() => {
    const months = language === 'ar' 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => ({
      month,
      completed: Math.floor(Math.random() * 20) + 10,
      scheduled: Math.floor(Math.random() * 15) + 5,
      postponed: Math.floor(Math.random() * 5) + 1
    }));
  }, [language]);

  // Programs performance data
  const programsData = useMemo(() => 
    programs.map(program => ({
      name: language === 'ar' ? program.name : program.nameEn,
      completed: program.completedVisits || 0,
      target: program.targetVisits,
      percentage: program.targetVisits > 0 
        ? Math.round(((program.completedVisits || 0) / program.targetVisits) * 100) 
        : 0
    }))
  , [programs, language]);

  // Facility type distribution
  const facilityTypeData = useMemo(() => {
    const government = facilities.filter(f => f.type === 'government').length;
    const privateCount = facilities.filter(f => f.type === 'private').length;
    
    return [
      { 
        name: language === 'ar' ? 'حكومي' : 'Government', 
        value: government, 
        color: COLORS.primary 
      },
      { 
        name: language === 'ar' ? 'خاص' : 'Private', 
        value: privateCount, 
        color: COLORS.accent 
      }
    ];
  }, [facilities, language]);

  // Completion rate radial data
  const completionRadialData = [{
    name: language === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate',
    value: stats.completionRate,
    fill: COLORS.secondary
  }];

  const recentVisits = useMemo(() => {
    return visits
      .filter(v => v.status === 'completed')
      .slice(0, 5);
  }, [visits]);

  const upcomingVisits = useMemo(() => {
    return visits
      .filter(v => v.status === 'scheduled')
      .slice(0, 5);
  }, [visits]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1565C0] to-[#42A5F5] rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-2">{language === 'ar' ? 'لوحة المعلومات' : 'Dashboard'}</h2>
            <p className="text-blue-100">
              {language === 'ar' 
                ? 'نظرة تحليلية شاملة على الزيارات ومكافحة العدوى' 
                : 'Comprehensive analytical overview of visits and infection control'}
            </p>
          </div>
          <button
            onClick={() => navigateToDashboard('/dashboard')}
            className="bg-white p-2 rounded-lg shadow-sm hover:scale-105 transition-transform"
            title={language === 'ar' ? 'الانتقال للوحة المعلومات' : 'Go to Dashboard'}
          >
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
          </button>
        </div>
      </div>

      {/* Main Statistics Cards with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="text-4xl font-bold">{stats.total}</span>
          </div>
          <h3 className="text-lg opacity-90 mb-1">{t('total_visits')}</h3>
          <div className="flex items-center gap-2 text-sm opacity-75">
            <BarChart3 className="w-4 h-4" />
            <span>{language === 'ar' ? 'إجمالي السنة' : 'Annual Total'}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <span className="text-4xl font-bold">{stats.completed}</span>
          </div>
          <h3 className="text-lg opacity-90 mb-1">{t('completed')}</h3>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">
              {stats.completionRate}% {language === 'ar' ? 'نسبة الإنجاز' : 'Success Rate'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <span className="text-4xl font-bold">{stats.scheduled}</span>
          </div>
          <h3 className="text-lg opacity-90 mb-1">{t('scheduled')}</h3>
          <p className="text-sm opacity-75">
            {language === 'ar' ? 'في انتظار التنفيذ' : 'Pending Execution'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <span className="text-4xl font-bold">{stats.postponed}</span>
          </div>
          <h3 className="text-lg opacity-90 mb-1">{t('postponed')}</h3>
          <p className="text-sm opacity-75">
            {language === 'ar' ? 'تحتاج متابعة عاجلة' : 'Requires Urgent Follow-up'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'توزيع حالات الزيارات' : 'Visit Status Distribution'}
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rate Radial Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'مؤشر الأداء العام' : 'Overall Performance Index'}
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="100%" 
              barSize={30} 
              data={completionRadialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
              />
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-4xl font-bold"
                fill={COLORS.secondary}
              >
                {stats.completionRate}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {language === 'ar' 
                ? `${stats.completed} من ${stats.total} زيارة مكتملة`
                : `${stats.completed} of ${stats.total} visits completed`}
            </p>
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'الاتجاه الشهري للزيارات' : 'Monthly Visits Trend'}
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke={COLORS.secondary} 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                name={language === 'ar' ? 'مكتملة' : 'Completed'}
              />
              <Area 
                type="monotone" 
                dataKey="scheduled" 
                stroke={COLORS.primary} 
                fillOpacity={1} 
                fill="url(#colorScheduled)"
                name={language === 'ar' ? 'مجدولة' : 'Scheduled'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Programs Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'أداء البرامج' : 'Programs Performance'}
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="completed" 
                fill={COLORS.secondary} 
                name={language === 'ar' ? 'منجز' : 'Completed'}
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="target" 
                fill={COLORS.accent} 
                name={language === 'ar' ? 'المستهدف' : 'Target'}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facility Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'توزيع المنشآت' : 'Facilities Distribution'}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={facilityTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {facilityTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-4">
            {facilityTypeData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">{language === 'ar' ? 'إجمالي الموظفين' : 'Total Employees'}</span>
                <span className="text-2xl font-bold text-purple-600">{employees.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">{language === 'ar' ? 'إجمالي المنشآت' : 'Total Facilities'}</span>
                <span className="text-2xl font-bold text-amber-600">{facilities.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">{language === 'ar' ? 'البرامج النشطة' : 'Active Programs'}</span>
                <span className="text-2xl font-bold text-blue-600">{programs.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">{language === 'ar' ? 'متوسط نسبة الإنجاز' : 'Avg. Completion'}</span>
                <span className="text-2xl font-bold text-green-600">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${stats.completionRate}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completed Visits */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recent_visits')}</h3>
          <div className="space-y-3">
            {recentVisits.map((visit) => {
              const facility = facilities.find(f => f.id === visit.facilityId);
              return (
                <div key={visit.id} className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{facility?.name || visit.facilityName}</h4>
                      <p className="text-sm text-gray-600">{formatDate(visit.actualDate || visit.scheduledDate)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  {visit.assignedEmployees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{getEmployeeNames(visit.assignedEmployees, employees)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Scheduled Visits */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('upcoming_visits')}</h3>
          <div className="space-y-3">
            {upcomingVisits.map((visit) => {
              const facility = facilities.find(f => f.id === visit.facilityId);
              return (
                <div key={visit.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{facility?.name || visit.facilityName}</h4>
                      <p className="text-sm text-gray-600">{formatDate(visit.scheduledDate)}</p>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  {visit.assignedEmployees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{getEmployeeNames(visit.assignedEmployees, employees)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
