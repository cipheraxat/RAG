'use client';

import { FileText, Star } from 'lucide-react';
import { Source } from '@/lib/api';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const { content, metadata, relevance_score } = source;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-gray-900">
            {metadata.source || 'Document'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-medium">
            {(relevance_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Metadata */}
      {metadata.page && (
        <p className="text-xs text-gray-500 mb-2">Page {metadata.page}</p>
      )}

      {/* Content Preview */}
      <div className="text-sm text-gray-700 line-clamp-4 bg-white p-2 rounded border border-gray-200">
        {content}
      </div>
    </div>
  );
}
