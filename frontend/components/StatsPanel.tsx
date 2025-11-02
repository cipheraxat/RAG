'use client';

import { useState, useEffect } from 'react';
import { Database, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { api, StatsResponse } from '@/lib/api';

interface StatsPanelProps {
  refresh?: number;
}

export default function StatsPanel({ refresh }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCollection = async () => {
    if (!confirm('Are you sure you want to clear all documents? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await api.clearCollection();
      await fetchStats();
      alert('Collection cleared successfully!');
    } catch (error) {
      console.error('Error clearing collection:', error);
      alert('Error clearing collection. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Collection Statistics</h2>
          <button
            onClick={fetchStats}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-primary-600" size={24} />
              <h3 className="font-semibold text-gray-900">Total Documents</h3>
            </div>
            <p className="text-3xl font-bold text-primary-700">
              {stats?.total_documents || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-purple-600" size={24} />
              <h3 className="font-semibold text-gray-900">Collection Name</h3>
            </div>
            <p className="text-lg font-medium text-purple-700">
              {stats?.collection_name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Embedding Model Info */}
        {stats?.embedding_model && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Embedding Model</h3>
            <p className="text-sm text-gray-600 font-mono">
              {stats.embedding_model}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
          <button
            onClick={handleClearCollection}
            disabled={isClearing || !stats || stats.total_documents === 0}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {isClearing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Clear All Documents
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This will permanently delete all indexed documents
          </p>
        </div>

        {/* Info Panel */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            This RAG (Retrieval-Augmented Generation) chatbot uses vector embeddings to 
            find relevant document chunks and generate accurate answers. Documents are 
            split into chunks and stored in a vector database for efficient retrieval.
          </p>
        </div>
      </div>
    </div>
  );
}
