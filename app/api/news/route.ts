import { NextRequest, NextResponse } from 'next/server';
import { fetchFeed, FeedConfig } from '@/lib/rss';

export const dynamic = 'force-dynamic';

// curl-verified working feeds (tested 2026-05-24)
// Reuters: dead (DNS timeout). FT: 403 even with UA.
// Replacements: NYT Business (49 items), MarketWatch (10 items).
const FEEDS: FeedConfig[] = [
  {
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    source: 'wsj',
    label: 'WSJ',
  },
  {
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    source: 'ft',          // keep key 'ft' so UI tab still works
    label: 'MarketWatch',
  },
  {
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    source: 'reuters',     // keep key 'reuters' so UI tab still works
    label: 'NYT Business',
  },
  {
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147',
    source: 'cnbc',
    label: 'CNBC',
  },
  {
    url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
      'https://feeds.bloomberg.com/markets/news.rss'
    )}`,
    source: 'bloomberg',
    label: 'Bloomberg',
    type: 'rss2json',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') ?? 'all';

  const targets = source === 'all' ? FEEDS : FEEDS.filter((f) => f.source === source);
  if (targets.length === 0) {
    return NextResponse.json({ items: [], updatedAt: new Date().toISOString() });
  }

  const results = await Promise.allSettled(targets.map(fetchFeed));

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[news] "${targets[i].source}" failed:`, r.reason);
    }
  });

  const items = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchFeed>>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => {
      const ta = new Date(a.pubDate).getTime();
      const tb = new Date(b.pubDate).getTime();
      return isNaN(ta) || isNaN(tb) ? 0 : tb - ta;
    });

  return NextResponse.json(
    { items, updatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60' } }
  );
}
