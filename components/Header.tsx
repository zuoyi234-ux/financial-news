'use client';

import { useState, useEffect } from 'react';
import ApiKeyModal from './ApiKeyModal';

interface Props {
  updatedAt: Date | null;
  onRefresh: () => void;
}

export default function Header({ updatedAt, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(!!localStorage.getItem('claude_api_key'));
  }, [showModal]); // recheck after modal closes

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">FN</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:block">Financial News</span>
          </div>

          <span className="hidden md:block text-xs text-gray-400 ml-2">{today}</span>

          <div className="ml-auto flex items-center gap-2">
            {updatedAt && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                &nbsp;·&nbsp;auto-refresh 15 min
              </span>
            )}

            {/* Claude API key button */}
            <button
              onClick={() => setShowModal(true)}
              title="Set Claude API key for AI summaries"
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                hasKey
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {/* Sparkle icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="hidden sm:inline">{hasKey ? 'AI Ready' : 'Set Claude Key'}</span>
            </button>

            {/* Manual refresh */}
            <button
              onClick={onRefresh}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {showModal && <ApiKeyModal onClose={() => setShowModal(false)} />}
    </>
  );
}
