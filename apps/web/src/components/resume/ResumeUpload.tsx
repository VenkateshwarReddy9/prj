'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api-client';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResumeUpload({ onSuccess, onCancel }: Props) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdf = acceptedFiles[0];
    if (pdf) setFile(pdf);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded! Analyzing your resume...');
      onSuccess();
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Upload Resume</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume PDF'}
          </p>
          <p className="text-sm text-gray-500 mt-1">or click to browse · PDF only · Max 10MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {file && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
