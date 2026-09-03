import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

export default function UploadArea({ onUpload, uploading, error: externalError }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = localError || externalError;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setLocalError(null);
    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv' && selectedFile.type !== 'application/vnd.ms-excel') {
      setLocalError('Please upload a valid CSV file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setLocalError('File size must be less than 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="card" style={{ width: '100%', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Import Customer Data</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
        Upload a CSV file containing your customer records. Max file size is 10MB.
      </p>

      {!file ? (
        <div 
          style={{
            border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-6) var(--spacing-4)',
            backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: dragActive ? 'scale(1.02)' : 'scale(1)'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept=".csv,text/csv" 
            onChange={handleChange} 
            style={{ display: 'none' }} 
          />
          <UploadCloud size={48} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-3)', opacity: 0.8 }} />
          <h3 style={{ marginBottom: 'var(--spacing-1)' }}>Click to upload or drag and drop</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>CSV files only</p>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-4)',
          backgroundColor: 'var(--color-bg)'
        }}>
          <div className="flex items-center gap-3">
            <FileIcon size={24} style={{ color: 'var(--color-primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setFile(null); setLocalError(null); }} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: 'var(--spacing-4)', 
          padding: '12px 16px', 
          backgroundColor: 'var(--color-error-bg)', 
          color: 'var(--color-error)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          textAlign: 'left'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '14px' }}
          disabled={!file || uploading}
          onClick={() => file && onUpload(file)}
        >
          {uploading ? 'Uploading...' : 'Import data'}
        </button>
      </div>
    </div>
  );
}
