'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NewsItem, MarketQuote, SourceKey } from '@/lib/types';
import Header from '@/components/Header';
import SourceTabs from '@/components/SourceTabs';
import NewsFeed from '@/components/NewsFeed';
import MarketSidebar from '@/components/MarketSidebar';

const REFRESH_MS = 15 * 60 * 1000; // 15 minutes

export default function HomePage() {
  const [activeSource, setActiveSource] = useState<SourceKey>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [market, setMarket] = useState<MarketQuote[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (source: SourceKey) => {
    setNewsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?source=${source}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setNews(data.items ?? []);
      setUpdatedAt(new Date());
    } catch (e) {
      setError('Failed to load news. Will retry on next refresh.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchMarket = useCallback(async () => {
    setMarketLoading(true);
    try {
      const res = await fetch('/api/market');
      const data = await res.json();
      setMarket(data.market ?? []);
    } catch {
      // silently fail — sidebar shows "unavailable"
    } finally {
      setMarketLoading(false);
    }
  }, []);

  // Refetch news whenever source tab changes
  useEffect(() => {
    fetchNews(activeSource);
    const id = setInterval(() => fetchNews(activeSource), REFRESH_MS);
    return () => clearInterval(id);
  }, [activeSource, fetchNews]);

  // Market refreshes independently
  useEffect(() => {
    fetchMarket();
    const id = setInterval(fetchMarket, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchMarket]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header updatedAt={updatedAt} onRefresh={() => { fetchNews(activeSource); fetchMarket(); }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <SourceTabs activeSource={activeSource} onSelect={setActiveSource} />

        <div className="mt-4 flex gap-6 items-start">
          {/* Main feed */}
          <main className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <NewsFeed items={news} loading={newsLoading} />
          </main>

          {/* Market sidebar — hidden on mobile */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <MarketSidebar quotes={market} loading={marketLoading} />
          </aside>
        </div>
      </div>
    </div>
  );
}
