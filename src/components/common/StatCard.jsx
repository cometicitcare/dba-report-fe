import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeType = 'neutral',
  onClick,
  active = false,
  className = '',
}) {
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString('en-US');
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border p-4 transition-all duration-200
        ${active ? 'border-saffron-500 bg-saffron-50 shadow-md' : 'border-gray-100'}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-saffron-300 hover:bg-saffron-50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' && (
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              )}
              {changeType === 'decrease' && (
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase'
                    ? 'text-green-600'
                    : changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-saffron-50 rounded-lg">
            <Icon className="w-6 h-6 text-saffron-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardGrid({ children, columns = 3 }) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : columns === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : columns === 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {children}
    </div>
  );
}

export default StatCard;
