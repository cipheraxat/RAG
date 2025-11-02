'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { api, QueryResponse } from '@/lib/api';
import MessageBubble from './MessageBubble';
import SourceCard from './SourceCard';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: QueryResponse['sources'];
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<QueryResponse['sources']>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.query(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, there was an error processing your request. Please make sure the backend is running and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error querying:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSources = (sources: QueryResponse['sources']) => {
    setSelectedSources(sources);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-lg mb-2">Welcome to RAG Chatbot!</p>
                <p className="text-sm">Upload documents and start asking questions.</p>
              </div>
            )}
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                onViewSources={handleViewSources}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={20} />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send size={18} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sources Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Sources</h2>
          {selectedSources.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Sources will appear here when you ask a question.
            </p>
          ) : (
            <div className="space-y-4">
              {selectedSources.map(source => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
