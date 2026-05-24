import { NextResponse } from 'next/server';
import type { MarketQuote } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SYMBOLS = [
  { symbol: '^GSPC',    label: 'S&P 500'      },
  { symbol: '^NDX',     label: 'Nasdaq 100'   },
  { symbol: '^TNX',     label: '10Y UST'      },
  { symbol: 'DX-Y.NYB', label: 'DXY'         },
  { symbol: 'BZ=F',    label: 'Brent Crude'  },
  { symbol: 'GC=F',    label: 'Gold'         },
];

export async function GET() {
  try {
    const symbolList = SYMBOLS.map((s) => s.symbol).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,currency`;

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);

    const json = await res.json();
    const results: Record<string, unknown>[] = json?.quoteResponse?.result ?? [];

    const market: MarketQuote[] = SYMBOLS.map(({ symbol, label }) => {
      const q = results.find((r) => r['symbol'] === symbol) as Record<string, number> | undefined;
      return {
        symbol,
        label,
        price: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChange ?? 0,
        changePercent: q?.regularMarketChangePercent ?? 0,
      };
    });

    return NextResponse.json(
      { market, updatedAt: new Date().toISOString() },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      }
    );
  } catch (err) {
    console.error('[market/route] fetch failed:', err);
    // Return empty array so the UI shows "Market data unavailable" gracefully
    return NextResponse.json({ market: [], updatedAt: new Date().toISOString() });
  }
}
