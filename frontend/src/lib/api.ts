import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Job {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_count: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  created_at: string;
  error_message: string | null;
}

export interface Record {
  id: string;
  job_id: string;
  row_number: number;
  raw_data: any;
  is_valid: boolean;
  is_duplicate: boolean;
  validation_reasons: string[];
}

export interface PaginatedRecords {
  total: number;
  page: number;
  limit: number;
  records: Record[];
}

export const uploadFile = async (file: File): Promise<Job> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<Job>('/imports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getJobs = async (): Promise<Job[]> => {
  const response = await api.get<Job[]>('/imports');
  return response.data;
};

export const getJob = async (id: string): Promise<Job> => {
  const response = await api.get<Job>(`/imports/${id}`);
  return response.data;
};

export const getRecords = async (
  jobId: string, 
  page: number = 1, 
  limit: number = 50, 
  filter: string = 'all', 
  search: string = ''
): Promise<PaginatedRecords> => {
  const response = await api.get<PaginatedRecords>(`/imports/${jobId}/records`, {
    params: { page, limit, filter, search },
  });
  return response.data;
};

export const getDownloadUrl = (jobId: string): string => {
  return `${API_BASE_URL}/imports/${jobId}/download`;
};

