import type { MarketQuote } from '@/lib/types';

function formatPrice(price: number, symbol: string): string {
  if (price === 0) return '—';
  if (symbol === '^TNX') return `${price.toFixed(3)}%`;  // yield
  if (symbol === 'DX-Y.NYB') return price.toFixed(2);
  if (price >= 10_000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 100)  return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function MarketRow({ q }: { q: MarketQuote }) {
  const up = q.change >= 0;
  const pct = q.changePercent.toFixed(2);
  const chg = q.change.toFixed(q.symbol === '^TNX' ? 3 : 2);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 leading-tight">{q.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{q.symbol}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 tabular-nums">
          {formatPrice(q.price, q.symbol)}
        </p>
        <p className={`text-xs tabular-nums font-medium mt-0.5 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
          {up ? '+' : ''}{chg}&ensp;({up ? '+' : ''}{pct}%)
        </p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-3 w-14 rounded bg-gray-100" />
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-4 w-16 rounded bg-gray-200 ml-auto" />
        <div className="h-3 w-20 rounded bg-gray-100 ml-auto" />
      </div>
    </div>
  );
}

interface Props {
  quotes: MarketQuote[];
  loading: boolean;
}

export default function MarketSidebar({ quotes, loading }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-20">
      {/* Title */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Market Snapshot
        </h2>
        <span className="text-xs text-gray-300">Live</span>
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
      ) : quotes.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Market data unavailable</p>
      ) : (
        quotes.map((q) => <MarketRow key={q.symbol} q={q} />)
      )}

      <p className="text-xs text-gray-300 mt-3 text-center">
        Via Yahoo Finance · ~15 min delay
      </p>
    </div>
  );
}
