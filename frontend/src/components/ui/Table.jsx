import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

function MobileCard({ columns, row, onRowClick }) {
  return (
    <div
      onClick={() => onRowClick?.(row)}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 ${
        onRowClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700' : ''
      }`}
    >
      {columns.filter(col => col.key !== 'actions').map((col) => {
        const value = col.render ? col.render(row[col.key], row) : row[col.key];
        return (
          <div key={col.key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400 font-medium uppercase flex-shrink-0">{col.label}</span>
            <div className="text-sm text-right min-w-0 max-w-[60%]">
              {typeof value === 'object' ? value : (
                <span className="truncate block">{value ?? '-'}</span>
              )}
            </div>
          </div>
        );
      })}
      {columns.find(col => col.key === 'actions') && (
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
          {columns.find(col => col.key === 'actions').render(null, row)}
        </div>
      )}
    </div>
  );
}

const MobileCardMemo = memo(MobileCard);

function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const TableInner = memo(function TableInner({ columns, data, onRowClick, searchable, searchPlaceholder }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const debouncedSearch = useDebounce(search, 200);
  const searchRef = useRef(null);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter(row =>
      columns.some(col =>
        String(row[col.key]).toLowerCase().includes(q)
      )
    );
  }, [data, debouncedSearch, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {searchable && (
        <input
          ref={searchRef}
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full sm:max-w-xs"
        />
      )}

      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    col.sortable !== false ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && <ChevronUpDownIcon className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sorted.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No data found</p>
        ) : (
          sorted.map((row, i) => (
            <MobileCardMemo key={row.id || i} columns={columns} row={row} onRowClick={onRowClick} />
          ))
        )}
      </div>
    </div>
  );
});

export default function Table(props) {
  return <TableInner {...props} />;
}