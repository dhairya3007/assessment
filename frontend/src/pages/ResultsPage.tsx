import { useParams, useNavigate } from 'react-router-dom';
import { getDownloadUrl } from '../lib/api';
import { useJobPolling, useRecordsPagination } from '../lib/hooks';
import StatsCards from '../components/StatsCards';
import RecordsTable from '../components/RecordsTable';
import { AlertCircle, Download, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { job, loading, error } = useJobPolling(id, 2000);
  const isCompleted = job?.status === 'completed';
  
  const { 
    records, setPage, filter, setFilter, search, setSearch 
  } = useRecordsPagination(id, isCompleted);

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} size={32} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'var(--color-error)' }}>
        <AlertCircle /> {error}
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="btn btn-outline" onClick={() => navigate('/history')} style={{ padding: '8px' }}>
            <ArrowLeft size={16} />
          </button>
          <h2 style={{ margin: 0 }}>{job.filename}</h2>
          {job.status === 'completed' && <span className="badge badge-success">Completed</span>}
          {job.status === 'processing' && <span className="badge badge-warning">Processing</span>}
          {job.status === 'pending' && <span className="badge badge-neutral">Pending</span>}
          {job.status === 'failed' && <span className="badge badge-error">Failed</span>}
        </div>
        {job.status === 'completed' && job.valid_count > 0 && (
          <a href={getDownloadUrl(job.id)} className="btn btn-primary" download>
            <Download size={16} /> Download Valid
          </a>
        )}
      </div>

      <StatsCards job={job} />
      
      {job.status === 'failed' && (
        <div className="card" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}>
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <strong>Processing Failed:</strong> {job.error_message}
          </div>
        </div>
      )}

      {job.status === 'processing' && (
        <div className="card flex items-center justify-center py-6" style={{ flexDirection: 'column', gap: '16px' }}>
          <RefreshCw style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-primary)' }} size={36} />
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Processing records...</span>
        </div>
      )}

      {job.status === 'completed' && records && (
        <RecordsTable 
          records={records}
          setPage={setPage}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />
      )}
    </div>
  );
}

