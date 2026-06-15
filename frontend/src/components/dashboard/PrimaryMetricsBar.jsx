import { formatCurrency } from '../../lib/utils';

const COLOR_MAP = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-violet-500',
  yellow: 'bg-amber-500', red: 'bg-rose-500', indigo: 'bg-indigo-500', teal: 'bg-teal-500',
};

const TREND_UP = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
const TREND_DOWN = 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
const TREND_FLAT = 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';

export default function PrimaryMetricsBar({ metrics = [] }) {
  if (!metrics.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-none">
      {metrics.map((m, i) => {
        const barColor = COLOR_MAP[m.color] || COLOR_MAP.blue;
        let trendIcon, trendClass;
        if (m.trend > 0) { trendIcon = '▲'; trendClass = TREND_UP; }
        else if (m.trend < 0) { trendIcon = '▼'; trendClass = TREND_DOWN; }
        else { trendIcon = '–'; trendClass = TREND_FLAT; }

        return (
          <div key={i} className="flex-shrink-0 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-0.5 ${barColor}`} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{m.label}</span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${trendClass}`}>
                  {trendIcon} {Math.abs(m.trend)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {m.currency ? formatCurrency(m.value) : (m.value ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
