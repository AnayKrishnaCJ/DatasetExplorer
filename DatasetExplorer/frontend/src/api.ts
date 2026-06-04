import axios from 'axios';
import type { Dataset, DatasetStats } from './types';

// Create an Axios instance pointing to our FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Fetch all datasets with optional search query.
   */
  getDatasets: async (search?: string): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/datasets', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  /**
   * Fetch a single dataset by its ID.
   */
  getDatasetById: async (id: number): Promise<Dataset> => {
    const response = await client.get<Dataset>(`/datasets/${id}`);
    return response.data;
  },

  /**
   * Create a new dataset.
   */
  createDataset: async (dataset: Omit<Dataset, 'id'>): Promise<Dataset> => {
    const response = await client.post<Dataset>('/datasets', dataset);
    return response.data;
  },

  /**
   * Update an existing dataset.
   */
  updateDataset: async (id: number, dataset: Omit<Dataset, 'id' | 'name'>): Promise<Dataset> => {
    const response = await client.put<Dataset>(`/datasets/${id}`, dataset);
    return response.data;
  },

  /**
   * Delete a dataset by its ID.
   */
  deleteDataset: async (id: number): Promise<void> => {
    await client.delete(`/datasets/${id}`);
  },

  /**
   * Fetch dataset statistics.
   */
  getStats: async (): Promise<DatasetStats> => {
    const response = await client.get<DatasetStats>('/datasets/stats');
    return response.data;
  },

  /**
   * Upload a CSV dataset file.
   */
  uploadCSV: async (file: File, description?: string): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await client.post<Dataset>('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
export default api;
