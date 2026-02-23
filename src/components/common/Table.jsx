import React from 'react';
import { ChevronRight } from 'lucide-react';

export function Table({
  columns,
  data,
  onRowClick,
  activeRowId,
  idField = 'id',
  emptyMessage = 'No data available',
  loading = false,
  className = '',
}) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {onRowClick && <th className="px-4 py-3 w-10"></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const rowId = row[idField] || index;
            const isActive = activeRowId === rowId;

            return (
              <tr
                key={rowId}
                className={`
                  border-b border-gray-100 transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  ${isActive ? 'bg-saffron-50' : ''}
                `}
                onClick={() => onRowClick?.(row, index)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
