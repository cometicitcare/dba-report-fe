import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination — client-side page controls
 * Props: current (1-based), total (item count), pageSize, onChange(page)
 */
export function Pagination({ current, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (current - 1) * pageSize + 1;
  const end   = Math.min(current * pageSize, total);

  // Build page number window: always show first, last, current±1
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= current - 1 && i <= current + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const btn = (label, onClick, disabled, active = false) => (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center w-8 h-8 text-xs rounded-lg transition-colors font-medium',
        active
          ? 'bg-saffron-500 text-white shadow-sm'
          : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="no-print flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      <span className="text-xs text-gray-500 select-none">
        Showing <span className="font-semibold text-gray-700">{start.toLocaleString()}–{end.toLocaleString()}</span>{' '}
        of <span className="font-semibold text-gray-700">{total.toLocaleString()}</span>
      </span>

      <div className="flex items-center gap-0.5">
        {btn(<ChevronsLeft className="w-3.5 h-3.5" />, () => onChange(1),           current === 1)}
        {btn(<ChevronLeft  className="w-3.5 h-3.5" />, () => onChange(current - 1), current === 1)}

        {pages.map((p, i) =>
          p === '…'
            ? <span key={`sep-${i}`} className="w-8 text-center text-xs text-gray-400 select-none">…</span>
            : btn(p, () => onChange(p), false, p === current)
        )}

        {btn(<ChevronRight  className="w-3.5 h-3.5" />, () => onChange(current + 1), current === totalPages)}
        {btn(<ChevronsRight className="w-3.5 h-3.5" />, () => onChange(totalPages),   current === totalPages)}
      </div>
    </div>
  );
}

export default Pagination;
