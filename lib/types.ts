export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLabel: string;
}

export interface MarketQuote {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
}

export type SourceKey = 'all' | 'wsj' | 'ft' | 'reuters' | 'cnbc' | 'bloomberg';
