import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import type { MarketQuote } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: '^GSPC',    label: 'S&P 500'     },
  { symbol: '^NDX',     label: 'Nasdaq 100'  },
  { symbol: '^TNX',     label: '10Y UST'     },
  { symbol: 'DX-Y.NYB', label: 'DXY'        },
  { symbol: 'BZ=F',    label: 'Brent Crude' },
  { symbol: 'GC=F',    label: 'Gold'        },
];

export async function GET() {
  try {
    const tickers = SYMBOLS.map((s) => s.symbol);

    // yahoo-finance2 handles crumb/cookie auth automatically
    const results = await Promise.allSettled(
      tickers.map((sym) =>
        yahooFinance.quote(sym, {
          fields: ['regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent'],
        })
      )
    );

    const market: MarketQuote[] = SYMBOLS.map(({ symbol, label }, i) => {
      const r = results[i];
      if (r.status === 'rejected') {
        return { symbol, label, price: 0, change: 0, changePercent: 0 };
      }
      const q = r.value;
      return {
        symbol,
        label,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
      };
    });

    return NextResponse.json(
      { market, updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    );
  } catch (err) {
    console.error('[market/route]', err);
    return NextResponse.json({ market: [], updatedAt: new Date().toISOString() });
  }
}
