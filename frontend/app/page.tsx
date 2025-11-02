'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import DocumentUpload from '@/components/DocumentUpload';
import StatsPanel from '@/components/StatsPanel';
import { FileText, MessageSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload' | 'stats'>('chat');
  const [refreshStats, setRefreshStats] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshStats(prev => prev + 1);
    setActiveTab('chat');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            RAG Chatbot
          </h1>
          <p className="text-gray-600">
            Ask questions and get answers with source attribution
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === 'chat'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={18} />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === 'stats'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={18} />
              Stats
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'upload' && <DocumentUpload onUploadSuccess={handleUploadSuccess} />}
          {activeTab === 'stats' && <StatsPanel refresh={refreshStats} />}
        </div>
      </div>
    </main>
  );
}
