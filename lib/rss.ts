import { XMLParser } from 'fast-xml-parser';
import type { NewsItem } from './types';

export interface FeedConfig {
  url: string;
  source: string;
  label: string;
  type?: 'xml' | 'rss2json';
}

const FETCH_TIMEOUT_MS = 8_000;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '_attr_',
  textNodeName: '_text',
  cdataPropName: '_cdata',
  isArray: (name) => name === 'item' || name === 'entry',
  parseTagValue: false,
});

function stripHtml(raw: unknown): string {
  const str = coerceStr(raw);
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function coerceStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const o = val as Record<string, unknown>;
    return String(o['_text'] ?? o['_cdata'] ?? o['_attr_href'] ?? '');
  }
  return '';
}

function resolveLink(item: Record<string, unknown>): string {
  const link = item['link'];
  if (typeof link === 'string') return link;
  if (typeof link === 'object' && link !== null) {
    const l = link as Record<string, unknown>;
    return coerceStr(l['_attr_href'] ?? l['_text'] ?? '');
  }
  return '';
}

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function fetchFeed(config: FeedConfig): Promise<NewsItem[]> {
  if (config.type === 'rss2json') return fetchRss2Json(config);
  return fetchXmlFeed(config);
}

async function fetchXmlFeed(config: FeedConfig): Promise<NewsItem[]> {
  const res = await fetchWithTimeout(config.url, {
    next: { revalidate: 900 },
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FinNewsAggregator/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  } as RequestInit);

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${config.source}`);

  const xml = await res.text();
  const parsed = xmlParser.parse(xml);

  const channel = parsed?.rss?.channel ?? parsed?.feed ?? {};
  const rawItems: unknown[] = Array.isArray(channel.item)
    ? channel.item
    : Array.isArray(channel.entry)
    ? channel.entry
    : [];

  return rawItems.slice(0, 25).map((raw, idx) => {
    const item = raw as Record<string, unknown>;
    const guid = coerceStr(item['guid'] ?? item['id'] ?? item['link'] ?? String(idx));
    return {
      id: `${config.source}-${guid}`.slice(0, 120),
      title: stripHtml(item['title']),
      description: stripHtml(
        item['description'] ?? item['summary'] ?? item['content'] ?? item['media:description'] ?? ''
      ).slice(0, 280),
      link: resolveLink(item),
      pubDate: coerceStr(item['pubDate'] ?? item['published'] ?? item['updated'] ?? ''),
      source: config.source,
      sourceLabel: config.label,
    };
  });
}

async function fetchRss2Json(config: FeedConfig): Promise<NewsItem[]> {
  const res = await fetchWithTimeout(config.url, {
    next: { revalidate: 900 },
  } as RequestInit);
  if (!res.ok) throw new Error(`rss2json HTTP ${res.status}`);

  const data = await res.json();
  if (data.status !== 'ok') throw new Error(`rss2json: ${data.message ?? 'error'}`);

  return (data.items as Record<string, unknown>[]).slice(0, 25).map((item, idx) => ({
    id: `${config.source}-${coerceStr(item['guid'] ?? item['link'] ?? String(idx))}`.slice(0, 120),
    title: stripHtml(item['title']),
    description: stripHtml(item['description'] ?? item['content'] ?? '').slice(0, 280),
    link: coerceStr(item['link']),
    pubDate: coerceStr(item['pubDate']),
    source: config.source,
    sourceLabel: config.label,
  }));
}
