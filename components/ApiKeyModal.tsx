'use client';

import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function ApiKeyModal({ onClose }: Props) {
  const [key, setKey] = useState('');

  useEffect(() => {
    setKey(localStorage.getItem('claude_api_key') ?? '');
  }, []);

  function save() {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem('claude_api_key', trimmed);
    } else {
      localStorage.removeItem('claude_api_key');
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Claude API Key</h2>
        <p className="text-sm text-gray-500 mb-4">
          Stored only in your browser. Used to generate AI summaries for each article.
          Get a free key at{' '}
          <span className="text-blue-600">console.anthropic.com</span>.
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="sk-ant-..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
