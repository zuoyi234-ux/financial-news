import type { NewsItem } from '@/lib/types';
import NewsCard from './NewsCard';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-5 w-14 rounded-full bg-gray-200" />
        <div className="h-4 w-12 rounded bg-gray-200" />
      </div>
      <div className="space-y-2 mb-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <div className="h-3 w-24 rounded bg-gray-200" />
    </div>
  );
}

interface Props {
  items: NewsItem[];
  loading: boolean;
}

export default function NewsFeed({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm">No articles found for this source.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  );
}
