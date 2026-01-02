# 📦 نظام مكافحة العدوى - ICP System
# Infection Control Program - Field Visits Management System

---

## 🌟 نظرة عامة | Overview

**نظام مكافحة العدوى** هو نظام متكامل لإدارة الزيارات الميدانية ومتابعة برامج مكافحة العدوى في المنشآت الصحية.

**ICP System** is a comprehensive system for managing field visits and tracking infection control programs in healthcare facilities.

---

## ✨ المميزات الرئيسية | Key Features

### 📊 Dashboard & Analytics
- **لوحة معلومات تفاعلية** مع إحصائيات شاملة
- **رسوم بيانية متقدمة**: Pie Charts, Bar Charts, Area Charts, Radial Charts
- **مؤشرات الأداء** في الوقت الفعلي
- **تقارير مرئية** احترافية

### 📅 Calendar View
- **عرض تقويمي شهري** للزيارات
- **مربعات زيارات** تفاعلية مع جميع التفاصيل
- **تصفية حسب الحالة** والبرنامج
- **إضافة وتعديل** الزيارات مباشرة

### 👥 إدارة الموظفين
- **سجل كامل** لكل موظف
- **تتبع الزيارات** السابقة والقادمة
- **نظام الإجازات** مع الموافقة/الرفض
- **تقارير الأداء** الشخصية

### 🏥 إدارة الزيارات
- **جدولة الزيارات** المنظمة
- **تقييم مكافحة العدوى** المتكامل
- **رفع المستندات** والصور
- **الخطط التصحيحية** مع المتابعة
- **تصدير Excel/PDF**

### 📝 Excel Upload
- **استيراد جماعي** للزيارات من Excel
- **التحقق التلقائي** من البيانات
- **معاينة قبل الاستيراد**
- **تنزيل قالب Excel** جاهز

### 🔄 نظام تبديل الزيارات
- **طلبات التبديل** بين الموظفين
- **نظام الموافقة** والرفض
- **كشف التعارضات** التلقائي
- **تنبيهات الإجازات**

### 🎨 التصميم
- **ثيم احترافي** مستوحى من IP Taif
- **ألوان**: أزرق داكن (#1565C0) + أخضر نعناعي (#00C853) + ذهبي (#C5A572)
- **Responsive Design** كامل (Desktop + Mobile)
- **دعم RTL/LTR** للعربية والإنجليزية

### 🔐 نظام الصلاحيات
- **Admin**: صلاحيات كاملة
- **Manager**: صلاحيات محدودة
- **تسجيل دخول آمن**

---

## 🚀 التثبيت والتشغيل | Installation & Setup

### المتطلبات | Requirements
```
- Node.js 18+ 
- npm or yarn
```

### خطوات التثبيت | Installation Steps

#### 1️⃣ استخراج الملفات | Extract Files
```bash
# Extract the project ZIP file
unzip icp-system.zip
cd icp-system
```

#### 2️⃣ تثبيت المكتبات | Install Dependencies
```bash
npm install
# OR
yarn install
```

#### 3️⃣ تشغيل المشروع | Run the Project
```bash
npm run dev
# OR
yarn dev
```

#### 4️⃣ فتح المتصفح | Open Browser
```
افتح المتصفح على: http://localhost:5173
Open browser at: http://localhost:5173
```

---

## 🔑 معلومات تسجيل الدخول | Login Credentials

### مدير النظام | Administrator
```
Username: admin
Password: admin123
```

### مشرف | Manager
```
Username: manager
Password: manager123
```

---

## 📁 هيكل المشروع | Project Structure

```
icp-system/
├── 📄 index.html                      # الصفحة الرئيسية
├── 📄 index-standalone.html           # نسخة HTML قائمة بذاتها
├── 📄 package.json                    # معلومات المشروع
├── 📄 vite.config.ts                  # إعدادات Vite
├── 📄 tsconfig.json                   # إعدادات TypeScript
├── 
├── 📂 components/                     # مكونات React
│   ├── 📄 Dashboard.tsx              # لوحة المعلومات + الانفوجرافيك
│   ├── 📄 CalendarView.tsx           # عرض التقويم
│   ├── 📄 VisitsTable.tsx            # جدول الزيارات
│   ├── 📄 AddVisitFormEnhanced.tsx   # نموذج إضافة زيارة
│   ├── 📄 EmployeesManagement.tsx    # إدارة الموظفين
│   ├── 📄 EmployeeHistory.tsx        # سجل الموظف
│   ├── 📄 EmployeePerformance.tsx    # تقارير الأداء
│   ├── 📄 VacationsManagement.tsx    # إدارة الإجازات
│   ├── 📄 SwapRequestsManagement.tsx # طلبات التبديل
│   ├── 📄 ExcelUploadVisits.tsx      # رفع Excel
│   ├── 📄 FacilitiesManagement.tsx   # إدارة المنشآت
│   ├── 📄 ProgramsManagement.tsx     # إدارة البرامج
│   └── 📂 ui/                        # مكونات واجهة المستخدم
│
├── 📂 contexts/                       # React Contexts
│   ├── 📄 DataContext.tsx            # بيانات التطبيق
│   └── 📄 LanguageContext.tsx        # اللغات والترجمة
│
├── 📂 data/                          # البيانات
│   └── 📄 mockData.ts                # بيانات تجريبية
│
├── 📂 utils/                         # أدوات مساعدة
│   ├── 📄 translations.ts            # الترجمات
│   └── 📄 conflictChecker.ts         # كشف التعارضات
│
├── 📂 styles/                        # ملفات CSS
│   └── 📄 globals.css                # Tailwind + Custom Styles
│
└── 📂 guidelines/                    # التوثيق
    └── 📄 Guidelines.md              # دليل الاستخدام
```

---

## 🎯 الميزات التقنية | Technical Features

### Frontend Stack
- ⚛️ **React 18** - مكتبة واجهة المستخدم
- 📘 **TypeScript** - لغة البرمجة
- ⚡ **Vite** - أداة البناء السريعة
- 🎨 **Tailwind CSS** - إطار التصميم
- 📊 **Recharts** - الرسوم البيانية
- 📋 **React Hook Form** - إدارة النماذج
- 🎭 **Lucide React** - الأيقونات
- 📅 **Date-fns** - التعامل مع التواريخ
- 📊 **XLSX** - قراءة/كتابة Excel
- 🎉 **Sonner** - الإشعارات

### Architecture
- 🏗️ **Context API** لإدارة الحالة
- 🌐 **i18n** دعم متعدد اللغات
- 📱 **Responsive Design** كامل
- ♿ **Accessibility** معايير الوصول
- 🎨 **Component-based** معمارية مكونات

---

## 📚 دليل الاستخدام السريع | Quick Usage Guide

### 1. لوحة المعلومات | Dashboard
- عرض إحصائيات شاملة
- رسوم بيانية تفاعلية
- مؤشرات الأداء الرئيسية

### 2. عرض التقويم | Calendar View
- التقويم الشهري للزيارات
- إضافة زيارة جديدة
- تعديل/حذف الزيارات

### 3. جدول الزيارات | Visits Table
- عرض جميع الزيارات
- البحث والتصفية
- تصدير Excel/PDF

### 4. إضافة زيارة | Add Visit
- المعلومات الأساسية
- تقييم مكافحة العدوى
- رفع المستندات
- الخطط التصحيحية

### 5. إدارة الموظفين | Employees
- إضافة/تعديل موظفين
- عرض سجل الزيارات
- إدارة الإجازات

### 6. استيراد Excel | Excel Upload
- تنزيل القالب
- رفع الملف
- معاينة البيانات
- استيراد الزيارات

---

## 🔧 البناء للإنتاج | Build for Production

```bash
# إنشاء نسخة الإنتاج | Build production
npm run build
# OR
yarn build

# معاينة نسخة الإنتاج | Preview production
npm run preview
# OR
yarn preview
```

سيتم إنشاء ملفات الإنتاج في مجلد `dist/`

---

## 🌐 دعم المتصفحات | Browser Support

- ✅ Chrome (آخر إصدارين)
- ✅ Firefox (آخر إصدارين)
- ✅ Safari (آخر إصدارين)
- ✅ Edge (آخر إصدارين)

---

## 📱 الأجهزة المدعومة | Supported Devices

- 💻 **Desktop**: 1920×1080 وأعلى
- 💻 **Laptop**: 1366×768 وأعلى
- 📱 **Tablet**: 768×1024 وأعلى
- 📱 **Mobile**: 375×667 وأعلى

---

## 🎨 الألوان الرئيسية | Color Palette

```css
Primary Blue:    #1565C0  /* أزرق داكن */
Secondary Green: #00C853  /* أخضر نعناعي */
Accent Gold:     #C5A572  /* ذهبي/بيج */
Warning Orange:  #FF9800  /* برتقالي */
Danger Red:      #d32f2f  /* أحمر */
```

---

## 📞 الدعم الفني | Technical Support

للمساعدة أو الاستفسارات، يرجى الاتصال بفريق التطوير.

For help or inquiries, please contact the development team.

---

## 📄 الترخيص | License

هذا المشروع مطور خصيصاً لنظام مكافحة العدوى - IP Taif

This project is developed specifically for Infection Control Program - IP Taif

---

## 🎉 شكراً | Thank You

شكراً لاستخدام نظام مكافحة العدوى!

Thank you for using the ICP System!

---

**تم التطوير بواسطة | Developed by:** فريق التطوير | Development Team  
**التاريخ | Date:** يناير 2025 | January 2025  
**الإصدار | Version:** 1.0.0
