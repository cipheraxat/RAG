'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const response = await api.uploadDocument(file);

      if (response.success) {
        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${response.filename}! Indexed ${response.chunks} chunks.`,
        });
        setFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: response.message || 'Upload failed',
        });
      }
    } catch (error: any) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Error uploading document. Please ensure the backend is running.',
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload Documents</h2>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-primary-600 hover:text-primary-700 font-semibold">
              Choose a file
            </span>
            <span className="text-gray-600"> or drag and drop</span>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          
          <p className="text-sm text-gray-500 mt-2">
            PDF or TXT files only
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-primary-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full mt-6 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Document
            </>
          )}
        </button>

        {/* Status Message */}
        {uploadStatus.type && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="flex-shrink-0" size={20} />
            )}
            <p className="text-sm">{uploadStatus.message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">1.</span>
              <span>Choose a PDF or TXT file to upload</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">2.</span>
              <span>Click "Upload Document" to index the content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">3.</span>
              <span>Go to the Chat tab to ask questions about your documents</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
