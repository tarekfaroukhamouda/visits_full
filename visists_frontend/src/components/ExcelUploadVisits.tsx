import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Visit } from '../App';
import { excelUploadApi } from '../services/api';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

interface ExcelRow {
  facilityName: string;
  type: string;
  location: string;
  scheduledDate: string;
  assignedEmployees: string;
  program?: string;
  status?: string;
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function ExcelUploadVisits() {
  const { t, language } = useLanguage();
  const { addVisit, facilities, employees, programs } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error(t('invalid_file_type'));
      return;
    }

    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Map Excel columns to our format
        const mappedData: ExcelRow[] = jsonData.map((row) => ({
          facilityName: row['اسم المنشأة'] || row['Facility Name'] || row['facilityName'] || '',
          type: row['نوع المنشأة'] || row['Type'] || row['type'] || '',
          location: row['الموقع'] || row['Location'] || row['location'] || '',
          scheduledDate: row['التاريخ'] || row['Date'] || row['scheduledDate'] || '',
          assignedEmployees: row['الموظفين'] || row['Employees'] || row['assignedEmployees'] || '',
          program: row['البرنامج'] || row['Program'] || row['program'] || '',
          status: row['الحالة'] || row['Status'] || row['status'] || 'scheduled',
          notes: row['ملاحظات'] || row['Notes'] || row['notes'] || ''
        }));

        setPreviewData(mappedData);
        validateData(mappedData);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error(t('excel_parse_error'));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const validateData = (data: ExcelRow[]) => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because Excel rows start at 1 and we have header

      // Validate facility name
      if (!row.facilityName || row.facilityName.trim() === '') {
        errors.push({
          row: rowNum,
          field: t('facility_name'),
          message: t('field_required')
        });
      }

      // Validate type
      const typeValue = row.type.toLowerCase();
      if (!['government', 'private', 'حكومي', 'خاص'].includes(typeValue)) {
        errors.push({
          row: rowNum,
          field: t('type'),
          message: t('invalid_facility_type')
        });
      }

      // Validate location
      const locationValue = row.location.toLowerCase();
      if (!['inside-taif', 'outside-taif', 'داخل الطائف', 'خارج الطائف', 'inside taif', 'outside taif'].includes(locationValue)) {
        errors.push({
          row: rowNum,
          field: t('location'),
          message: t('invalid_location')
        });
      }

      // Validate date
      if (!row.scheduledDate || row.scheduledDate.trim() === '') {
        errors.push({
          row: rowNum,
          field: t('scheduled_date'),
          message: t('field_required')
        });
      } else {
        const date = new Date(row.scheduledDate);
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowNum,
            field: t('scheduled_date'),
            message: t('invalid_date_format')
          });
        }
      }

      // Validate employees
      if (!row.assignedEmployees || row.assignedEmployees.trim() === '') {
        errors.push({
          row: rowNum,
          field: t('assigned_employees'),
          message: t('field_required')
        });
      }
    });

    setValidationErrors(errors);
  };

  const normalizeType = (type: string): 'government' | 'private' => {
    const normalized = type.toLowerCase().trim();
    if (normalized === 'حكومي' || normalized === 'government') return 'government';
    return 'private';
  };

  const normalizeLocation = (location: string): 'inside-taif' | 'outside-taif' => {
    const normalized = location.toLowerCase().trim();
    if (normalized === 'داخل الطائف' || normalized === 'inside-taif' || normalized === 'inside taif') {
      return 'inside-taif';
    }
    return 'outside-taif';
  };

  const normalizeStatus = (status: string): Visit['status'] => {
    const normalized = status.toLowerCase().trim();
    if (normalized === 'مكتملة' || normalized === 'completed') return 'completed';
    if (normalized === 'مؤجلة' || normalized === 'postponed') return 'postponed';
    if (normalized === 'ملغاة' || normalized === 'cancelled') return 'cancelled';
    if (normalized === 'غير مجدولة' || normalized === 'unscheduled') return 'unscheduled';
    return 'scheduled';
  };

  const formatDate = (dateStr: string): string => {
    try {
      // Handle Excel serial date
      if (!isNaN(Number(dateStr))) {
        const date = XLSX.SSF.parse_date_code(Number(dateStr));
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // Handle regular date string
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return dateStr;
    } catch (error) {
      return dateStr;
    }
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error(t('fix_validation_errors'));
      return;
    }
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await excelUploadApi.uploadVisitsExcel(file);
      if (result.visits_added > 0) {
        toast.success(`${t('visits_imported_success')}: ${result.visits_added}`);
      }
      if (result.errors && result.errors.length > 0) {
        toast.error(`${t('visits_import_failed')}: ${result.errors.length}`);
      }
      // Optionally: refresh visits data here
    } catch (error: any) {
      toast.error(error.message || t('excel_upload_failed'));
    } finally {
      setIsProcessing(false);
      setFile(null);
      setPreviewData([]);
      setValidationErrors([]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'اسم المنشأة': 'مستشفى الملك فيصل',
        'Facility Name': 'King Faisal Hospital',
        'نوع المنشأة': 'حكومي',
        'Type': 'government',
        'الموقع': 'داخل الطائف',
        'Location': 'inside-taif',
        'التاريخ': '2024-01-15',
        'Date': '2024-01-15',
        'الموظفين': 'محمد العتيبي، أحمد السالم',
        'Employees': 'Mohammed Al-Otaibi, Ahmed Al-Salem',
        'البرنامج': 'مكافحة العدوى',
        'Program': 'Infection Control',
        'الحالة': 'مجدولة',
        'Status': 'scheduled',
        'ملاحظات': 'زيارة دورية',
        'Notes': 'Routine visit'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `visits_template_${language}.xlsx`);
    
    toast.success(t('template_downloaded'));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('excel_upload_visits')}</h2>
          <p className="text-muted-foreground">{t('excel_upload_subtitle')}</p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('download_template')}
        </Button>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('drag_drop_excel')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('or')}</p>
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('browse_files')}
                </span>
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-4">
              {t('supported_formats')}: Excel (.xlsx, .xls), CSV (.csv)
            </p>
          </div>
        </Card>
      )}

      {/* File Selected */}
      {file && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {previewData.length} {t('rows')}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                {t('validation_errors_found')}: {validationErrors.length}
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-800 dark:text-red-200">
                    {t('row')} {error.row}: {error.field} - {error.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {previewData.length > 0 && validationErrors.length === 0 && (
        <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
            <p className="font-medium text-green-900 dark:text-green-100">
              {t('validation_passed')}: {previewData.length} {t('visits_ready_import')}
            </p>
          </div>
        </Card>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold">{t('preview_data')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium">#</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('facility_name')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('type')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('location')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('scheduled_date')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('assigned_employees')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">{row.facilityName}</td>
                    <td className="px-4 py-3 text-sm">{row.type}</td>
                    <td className="px-4 py-3 text-sm">{row.location}</td>
                    <td className="px-4 py-3 text-sm">{row.scheduledDate}</td>
                    <td className="px-4 py-3 text-sm">{row.assignedEmployees}</td>
                    <td className="px-4 py-3 text-sm">{row.status || 'scheduled'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                {t('showing_first')} 10 {t('of')} {previewData.length} {t('rows')}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Import Button */}
      {previewData.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={clearFile}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={validationErrors.length > 0 || isProcessing}
            className="bg-[#1565C0] hover:bg-[#0D47A1]"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('import_visits')}: {previewData.length}
          </Button>
        </div>
      )}
    </div>
  );
}