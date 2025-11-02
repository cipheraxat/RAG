'use client';

import { User, Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onViewSources: (sources: any[]) => void;
}

export default function MessageBubble({ message, onViewSources }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-500' : 'bg-gray-700'
      }`}>
        {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources Button */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <button
            onClick={() => onViewSources(message.sources || [])}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <FileText size={14} />
            View {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
          </button>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
