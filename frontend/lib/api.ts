import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

const buildUrl = (path: string) => `${API_URL}${path}`;

export interface Source {
  id: number;
  content: string;
  metadata: {
    source?: string;
    page?: number;
    [key: string]: any;
  };
  relevance_score: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  success: boolean;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  chunks: number;
}

export interface StatsResponse {
  total_documents: number;
  collection_name: string;
  embedding_model?: string;
}

export const api = {
  async query(question: string, k: number = 4): Promise<QueryResponse> {
  const response = await axios.post(buildUrl('/query'), {
      question,
      k,
    });
    return response.data;
  },

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

  const response = await axios.post(buildUrl('/upload'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getStats(): Promise<StatsResponse> {
  const response = await axios.get(buildUrl('/stats'));
    return response.data;
  },

  async clearCollection(): Promise<{ success: boolean; message: string }> {
  const response = await axios.delete(buildUrl('/clear'));
    return response.data;
  },

  async healthCheck(): Promise<{ status: string; service: string }> {
  const response = await axios.get(buildUrl('/health'));
    return response.data;
  },
};
