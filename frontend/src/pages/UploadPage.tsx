import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../lib/api';
import UploadArea from '../components/UploadArea';

export default function UploadPage() {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const job = await uploadFile(file);
      navigate(`/jobs/${job.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-col items-center justify-center" style={{ maxWidth: '800px', margin: '0 auto', height: '100%', flex: 1, display: 'flex' }}>
      <UploadArea onUpload={handleUpload} uploading={uploading} error={error} />
    </div>
  );
}

