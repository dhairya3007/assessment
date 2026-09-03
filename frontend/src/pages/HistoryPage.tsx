import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../lib/api';
import type { Job } from '../lib/api';
import { FileText, AlertCircle, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobs();
      setJobs(data);
    } catch (err: any) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} size={32} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="flex items-center justify-between mb-4">
        <h2>Import History</h2>
        <button className="btn btn-outline" onClick={fetchJobs}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-error)', display: 'flex', gap: '8px' }}>
          <AlertCircle /> {error}
        </div>
      )}

      {jobs.length === 0 && !loading && !error ? (
        <div className="card flex-col items-center justify-center py-6" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <FileText size={48} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-3)', opacity: 0.8 }} />
          <h3>No imports yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>You haven't uploaded any CSV files yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Import data</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Status</th>
                <th>Total Records</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Duplicates</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600 }}>{job.filename}</td>
                  <td>
                    {job.status === 'completed' && <span className="badge badge-success">Completed</span>}
                    {job.status === 'processing' && <span className="badge badge-warning">Processing</span>}
                    {job.status === 'pending' && <span className="badge badge-neutral">Pending</span>}
                    {job.status === 'failed' && <span className="badge badge-error">Failed</span>}
                  </td>
                  <td>{job.total_count}</td>
                  <td>{job.valid_count}</td>
                  <td>{job.invalid_count}</td>
                  <td>{job.duplicate_count}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(job.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

