import type { NewsItem } from '@/lib/types';

const SOURCE_BADGE: Record<string, string> = {
  wsj:       'bg-red-100 text-red-700 ring-red-200',
  ft:        'bg-rose-100 text-rose-700 ring-rose-200',
  reuters:   'bg-orange-100 text-orange-700 ring-orange-200',
  cnbc:      'bg-blue-100 text-blue-700 ring-blue-200',
  bloomberg: 'bg-purple-100 text-purple-700 ring-purple-200',
};

function relativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const badge = SOURCE_BADGE[item.source] ?? 'bg-gray-100 text-gray-600 ring-gray-200';

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
        {item.title}
      </h2>

      {/* Summary */}
      {item.description && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-3">
          {item.description}
        </p>
      )}

      {/* Link */}
      {item.link && (
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
      )}
    </article>
  );
}
