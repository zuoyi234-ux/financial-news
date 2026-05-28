'use client';

import { useState } from 'react';
import type { NewsItem } from '@/lib/types';

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const SOURCE_BADGE: Record<string, string> = {
  wsj:       'bg-red-100 text-red-700 ring-red-200',
  ft:        'bg-teal-100 text-teal-700 ring-teal-200',
  reuters:   'bg-orange-100 text-orange-700 ring-orange-200',
  cnbc:      'bg-blue-100 text-blue-700 ring-blue-200',
  bloomberg: 'bg-purple-100 text-purple-700 ring-purple-200',
};

function relativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type SummaryState = 'idle' | 'loading' | 'done' | 'error';

export default function NewsCard({ item, highlight = '' }: { item: NewsItem; highlight?: string }) {
  const badge = SOURCE_BADGE[item.source] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  const [summaryState, setSummaryState] = useState<SummaryState>('idle');
  const [summary, setSummary] = useState('');

  async function fetchSummary() {
    const apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('claude_api_key')
      : null;

    if (!apiKey) {
      setSummaryState('error');
      setSummary('No Claude API key set. Click the key icon in the header.');
      return;
    }

    setSummaryState('loading');
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, description: item.description, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setSummary(data.summary ?? '');
      setSummaryState('done');
    } catch (e) {
      setSummary(e instanceof Error ? e.message : 'Failed to generate summary.');
      setSummaryState('error');
    }
  }

  function toggle() {
    if (summaryState === 'idle') {
      fetchSummary();
    } else {
      setSummaryState('idle');
      setSummary('');
    }
  }

  return (
    <article className="group bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-150">
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${badge}`}>
          {item.sourceLabel}
        </span>
        <time className="text-xs text-gray-400 tabular-nums">{relativeTime(item.pubDate)}</time>
      </div>

      {/* Headline */}
      <h2 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
        <Highlight text={item.title} query={highlight} />
      </h2>

      {/* Summary */}
      {item.description && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-3">
          <Highlight text={item.description} query={highlight} />
        </p>
      )}

      {/* AI summary panel */}
      {summaryState !== 'idle' && (
        <div className={`mb-3 rounded-lg px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
          summaryState === 'loading'
            ? 'bg-slate-50 text-gray-400 animate-pulse'
            : summaryState === 'error'
            ? 'bg-red-50 text-red-600'
            : 'bg-blue-50 text-blue-900'
        }`}>
          {summaryState === 'loading'
            ? 'Generating AI summary…'
            : summary}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Read full article
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : <span />}

        {/* AI summary toggle */}
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
            summaryState === 'done'
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : summaryState === 'loading'
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-wait'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
          disabled={summaryState === 'loading'}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {summaryState === 'done' ? 'Hide AI' : 'AI Summary'}
        </button>
      </div>
    </article>
  );
}
