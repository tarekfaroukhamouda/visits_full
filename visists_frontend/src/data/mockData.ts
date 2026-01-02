import { Visit, Employee } from '../App';
import { Facility, Program } from '../App';

export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'د. محمد العتيبي',
    role: 'أخصائي مكافحة العدوى',
    email: 'mohammed.o@health.gov.sa',
    phone: '0501234567'
  },
  {
    id: 'emp2',
    name: 'أ. سارة القحطاني',
    role: 'مشرفة ميدانية',
    email: 'sarah.q@health.gov.sa',
    phone: '0507654321'
  },
  {
    id: 'emp3',
    name: 'د. عبدالله السالم',
    role: 'طبيب استشاري',
    email: 'abdullah.s@health.gov.sa',
    phone: '0509876543'
  },
  {
    id: 'emp4',
    name: 'أ. نورة الدوسري',
    role: 'مراقبة صحية',
    email: 'noura.d@health.gov.sa',
    phone: '0503456789'
  },
  {
    id: 'emp5',
    name: 'د. خالد المطيري',
    role: 'أخصائي الصحة العامة',
    email: 'khaled.m@health.gov.sa',
    phone: '0508765432'
  }
];

export const mockVisits: Visit[] = [
  {
    id: 'v1',
    name: 'مستشفى الملك فيصل التخصصي',
    type: 'government',
    scheduledDate: '2025-01-15',
    actualDate: '2025-01-15',
    status: 'completed',
    assignedEmployees: ['emp1', 'emp2'],
    infectionControl: {
      checklistItems: [
        'التحقق من بروتوكولات التعقيم',
        'فحص أدوات الوقاية الشخصية',
        'مراجعة سجلات العدوى',
        'تقييم نظام العزل'
      ],
      complianceLevel: 95,
      notes: 'مستوى الالتزام ممتاز، جميع البروتوكولات مطبقة بشكل صحيح'
    }
  },
  {
    id: 'v2',
    name: 'مركز الرعاية الصحية الأولية - الرياض',
    type: 'government',
    scheduledDate: '2025-01-20',
    actualDate: '2025-01-22',
    status: 'completed',
    assignedEmployees: ['emp3', 'emp4'],
    infectionControl: {
      checklistItems: [
        'فحص نظام التهوية',
        'مراجعة إجراءات التنظيف',
        'التحقق من تخزين المعقمات'
      ],
      complianceLevel: 88,
      notes: 'ملاحظات بسيطة على نظام التهوية، تم تقديم توصيات للتحسين'
    }
  },
  {
    id: 'v3',
    name: 'مستشفى سليمان الحبيب',
    type: 'private',
    scheduledDate: '2025-02-05',
    status: 'postponed',
    assignedEmployees: ['emp1', 'emp5'],
    postponeReason: 'طلب من إدارة المستشفى لتأجيل الزيارة بسبب أعمال صيانة طارئة'
  },
  {
    id: 'v4',
    name: 'مجمع عيادات النخبة الطبي',
    type: 'private',
    scheduledDate: '2025-02-10',
    status: 'scheduled',
    assignedEmployees: ['emp2', 'emp3']
  },
  {
    id: 'v5',
    name: 'مستشفى القوات المسلحة',
    type: 'government',
    scheduledDate: '2025-02-15',
    status: 'scheduled',
    assignedEmployees: ['emp1', 'emp4']
  },
  {
    id: 'v6',
    name: 'مستشفى الملك خالد الجامعي',
    type: 'government',
    scheduledDate: '2025-03-01',
    actualDate: '2025-03-01',
    status: 'completed',
    assignedEmployees: ['emp2', 'emp5'],
    infectionControl: {
      checklistItems: [
        'تقييم وحدة العناية المركزة',
        'فحص غرف العمليات',
        'مراجعة بروتوكولات التعقيم'
      ],
      complianceLevel: 92,
      notes: 'التزام جيد بالبروتوكولات، مع توصيات بتحديث بعض المعدات'
    }
  },
  {
    id: 'v7',
    name: 'مركز الدكتور سليمان الحبيب الطبي',
    type: 'private',
    scheduledDate: '2025-03-10',
    status: 'postponed',
    assignedEmployees: ['emp3'],
    postponeReason: 'عدم توفر المسؤولين في التاريخ المحدد'
  },
  {
    id: 'v8',
    name: 'مستشفى المواساة',
    type: 'private',
    scheduledDate: '2025-03-15',
    status: 'scheduled',
    assignedEmployees: ['emp1', 'emp2', 'emp4']
  },
  {
    id: 'v9',
    name: 'مركز صحي الملز',
    type: 'government',
    scheduledDate: '2025-04-01',
    actualDate: '2025-04-01',
    status: 'completed',
    assignedEmployees: ['emp4', 'emp5'],
    infectionControl: {
      checklistItems: [
        'فحص منطقة الاستقبال',
        'تقييم عيادات الأسنان',
        'مراجعة نظام التخلص من النفايات'
      ],
      complianceLevel: 85,
      notes: 'حاجة لتحسين نظام التخلص من النفايات الطبية'
    }
  },
  {
    id: 'v10',
    name: 'مستشفى الحرس الوطني',
    type: 'government',
    scheduledDate: '2025-04-20',
    status: 'scheduled',
    assignedEmployees: ['emp1', 'emp3']
  },
  {
    id: 'v11',
    name: 'مجمع البحر الأحمر الطبي',
    type: 'private',
    scheduledDate: '2025-05-05',
    status: 'scheduled',
    assignedEmployees: ['emp2', 'emp4']
  },
  {
    id: 'v12',
    name: 'مستشفى الأمير سلطان',
    type: 'government',
    scheduledDate: '2025-05-15',
    actualDate: '2025-05-16',
    status: 'completed',
    assignedEmployees: ['emp1', 'emp5'],
    infectionControl: {
      checklistItems: [
        'تقييم قسم الطوارئ',
        'فحص وحدة غسيل الكلى',
        'مراجعة إجراءات العزل'
      ],
      complianceLevel: 90,
      notes: 'مستوى التزام جيد جداً، توصيات بسيطة للتطوير'
    }
  }
];

// Helper function to get employee names by IDs
export function getEmployeeNames(employeeIds: string[]): string {
  return employeeIds
    .map(id => mockEmployees.find(emp => emp.id === id)?.name || '')
    .filter(name => name)
    .join(', ');
}

// Helper function to get visit statistics
export function getVisitStats(visits: Visit[]) {
  const completed = visits.filter(v => v.status === 'completed').length;
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

// Mock Facilities Data
export const mockFacilities: Facility[] = [
  {
    id: 'fac1',
    name: 'مستشفى الملك فيصل التخصصي',
    type: 'government',
    location: 'inside-taif'
  },
  {
    id: 'fac2',
    name: 'مركز الرعاية الصحية الأولية - الطائف',
    type: 'government',
    location: 'inside-taif'
  },
  {
    id: 'fac3',
    name: 'مستشفى سليمان الحبيب',
    type: 'private',
    location: 'inside-taif'
  },
  {
    id: 'fac4',
    name: 'مستشفى الملك عبدالعزيز التخصصي',
    type: 'government',
    location: 'outside-taif'
  },
  {
    id: 'fac5',
    name: 'عيادات النخبة الطبية',
    type: 'private',
    location: 'outside-taif'
  },
  {
    id: 'fac6',
    name: 'مستشفى القوات المسلحة',
    type: 'government',
    location: 'inside-taif'
  }
];

// Mock Programs Data
export const mockPrograms: Program[] = [
  {
    id: 'prg1',
    name: 'مكافحة العدوى',
    nameEn: 'Infection Control Assessment (ICA)',
    targetVisits: 50,
    completedVisits: 32,
    correctivePlans: {
      approved: 28,
      pending: 4
    },
    trainingSessions: 12
  },
  {
    id: 'prg2',
    name: 'التدريب الميداني',
    nameEn: 'Field Training',
    targetVisits: 30,
    completedVisits: 18,
    correctivePlans: {
      approved: 15,
      pending: 3
    },
    trainingSessions: 25
  },
  {
    id: 'prg3',
    name: 'تقييم الجودة',
    nameEn: 'Quality Assessment',
    targetVisits: 40,
    completedVisits: 25,
    correctivePlans: {
      approved: 20,
      pending: 5
    },
    trainingSessions: 8
  },
  {
    id: 'prg4',
    name: 'سلامة المرضى',
    nameEn: 'Patient Safety',
    targetVisits: 35,
    completedVisits: 22,
    correctivePlans: {
      approved: 18,
      pending: 4
    },
    trainingSessions: 15
  }
];