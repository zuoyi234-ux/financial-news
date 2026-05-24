import { NextResponse } from 'next/server';
import type { MarketQuote } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Finnhub free-tier symbols
// Indices use Finnhub's symbol format; ETFs used where index not available.
const SYMBOLS: { symbol: string; finnhub: string; label: string }[] = [
  { symbol: '^GSPC',    finnhub: 'SPY',  label: 'S&P 500 (SPY)' },
  { symbol: '^NDX',     finnhub: 'QQQ',  label: 'Nasdaq 100 (QQQ)' },
  { symbol: '^TNX',     finnhub: 'TLT',  label: '20Y UST (TLT)' },
  { symbol: 'DX-Y.NYB', finnhub: 'UUP',  label: 'USD Index (UUP)' },
  { symbol: 'BZ=F',    finnhub: 'BNO',  label: 'Brent Oil (BNO)' },
  { symbol: 'GC=F',    finnhub: 'GLD',  label: 'Gold (GLD)' },
];

async function fetchQuote(
  finnhubSymbol: string,
  apiKey: string
): Promise<{ c: number; d: number; dp: number }> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Finnhub ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.error('[market] FINNHUB_API_KEY not set');
    return NextResponse.json({ market: [], updatedAt: new Date().toISOString() });
  }

  const results = await Promise.allSettled(
    SYMBOLS.map(({ finnhub }) => fetchQuote(finnhub, apiKey))
  );

  const market: MarketQuote[] = SYMBOLS.map(({ symbol, label }, i) => {
    const r = results[i];
    if (r.status === 'rejected') {
      console.error(`[market] ${symbol} failed:`, r.reason);
      return { symbol, label, price: 0, change: 0, changePercent: 0 };
    }
    const q = r.value;
    return {
      symbol,
      label,
      price: q.c ?? 0,
      change: q.d ?? 0,
      changePercent: q.dp ?? 0,
    };
  });

  return NextResponse.json(
    { market, updatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
  );
}
