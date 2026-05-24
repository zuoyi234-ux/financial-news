import type { SourceKey } from '@/lib/types';

const TABS: { key: SourceKey; label: string }[] = [
  { key: 'all',       label: 'All Sources'  },
  { key: 'wsj',       label: 'WSJ'          },
  { key: 'ft',        label: 'MarketWatch'  },
  { key: 'reuters',   label: 'NYT Business' },
  { key: 'cnbc',      label: 'CNBC'         },
  { key: 'bloomberg', label: 'Bloomberg'    },
];

interface Props {
  activeSource: SourceKey;
  onSelect: (s: SourceKey) => void;
}

export default function SourceTabs({ activeSource, onSelect }: Props) {
  return (
    <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm overflow-x-auto scrollbar-none">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`
            flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
            ${activeSource === key
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
