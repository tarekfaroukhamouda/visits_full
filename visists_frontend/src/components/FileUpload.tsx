import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploadProps {
  type: 'documents' | 'images';
  onFilesChange: (files: string[]) => void;
  currentFiles?: string[];
  maxFiles?: number;
}

export function FileUpload({ type, onFilesChange, currentFiles = [], maxFiles = 5 }: FileUploadProps) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<string[]>(currentFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`الحد الأقصى ${maxFiles} ملفات / Maximum ${maxFiles} files`);
      return;
    }

    // Convert files to base64 strings for storage
    const filePromises = selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(base64Files => {
      const newFiles = [...files, ...base64Files];
      setFiles(newFiles);
      onFilesChange(newFiles);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const accept = type === 'images' 
    ? 'image/jpeg,image/png,image/jpg' 
    : 'application/pdf,.doc,.docx,.xls,.xlsx';

  const Icon = type === 'images' ? ImageIcon : FileText;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${type}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
        >
          <Upload className="w-4 h-4 mr-2" />
          {type === 'images' ? t('upload_images') : t('upload_documents')}
        </Button>
        <span className="text-sm text-gray-500">
          ({files.length}/{maxFiles})
        </span>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm flex-1 truncate">
                {type === 'images' ? `صورة ${index + 1} / Image ${index + 1}` : `مستند ${index + 1} / Document ${index + 1}`}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {type === 'images' && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
