import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.pdf,.csv',
  maxSize = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFile = (file: File) => {
    setError('');

    // Validate file type
    const validTypes = accept.split(',').map((type) => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType =
      validTypes.includes(file.type) || validTypes.includes(fileExtension);

    if (!isValidType) {
      setError(`Invalid file type. Please upload ${accept} files only.`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <Upload 
            className={`h-12 w-12 mb-4 ${
              isDragging ? 'text-primary-500' : 'text-gray-400'
            }`}
          />
          <p className="text-base font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop file here' : 'Drag & drop file here'}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: {accept} (Max: {maxSize}MB)
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-2 p-3 bg-error-50 border border-error-200 rounded-md text-error-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
