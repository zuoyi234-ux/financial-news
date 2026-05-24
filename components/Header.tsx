'use client';

interface Props {
  updatedAt: Date | null;
  onRefresh: () => void;
}

export default function Header({ updatedAt, onRefresh }: Props) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tight">FN</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg hidden sm:block">Financial News</span>
        </div>

        {/* Date */}
        <span className="hidden md:block text-xs text-gray-400 ml-2">{today}</span>

        <div className="ml-auto flex items-center gap-3">
          {/* Last updated */}
          {updatedAt && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              &nbsp;·&nbsp;auto-refresh 15 min
            </span>
          )}

          {/* Manual refresh button */}
          <button
            onClick={onRefresh}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-md px-3 py-1.5 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
