import { useState, useEffect, useRef } from 'react';
import { getJob, getRecords } from './api';
import type { Job, PaginatedRecords } from './api';

export function useJobPolling(jobId: string | undefined, intervalMs: number = 2000) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<number | null>(null);

  const fetchJob = async () => {
    if (!jobId) return;
    try {
      const data = await getJob(jobId);
      setJob(data);
      if (data.status === 'completed' || data.status === 'failed') {
        if (pollInterval.current) {
          window.clearInterval(pollInterval.current);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load job details.');
      if (pollInterval.current) window.clearInterval(pollInterval.current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      setLoading(true);
      fetchJob();
      pollInterval.current = window.setInterval(fetchJob, intervalMs);
    }
    return () => {
      if (pollInterval.current) window.clearInterval(pollInterval.current);
    };
  }, [jobId, intervalMs]);

  return { job, loading, error, refetch: fetchJob };
}

export function useRecordsPagination(jobId: string | undefined, isJobCompleted: boolean) {
  const [records, setRecords] = useState<PaginatedRecords | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    if (!jobId) return;
    try {
      const data = await getRecords(jobId, page, 50, filter, search);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records', err);
    }
  };

  useEffect(() => {
    if (isJobCompleted) {
      fetchRecords();
    }
  }, [isJobCompleted, page, filter, search]);

  useEffect(() => {
    setPage(1); // Reset page on filter or search change
  }, [filter, search]);

  return { records, page, setPage, filter, setFilter, search, setSearch, refetch: fetchRecords };
}
