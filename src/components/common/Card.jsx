import React from 'react';

export function Card({ children, className = '', onClick, active = false }) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border transition-all duration-200
        ${active ? 'border-saffron-500 bg-saffron-50 shadow-md' : 'border-gray-100'}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-saffron-50 rounded-lg">
            <Icon className="w-5 h-5 text-saffron-600" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export default Card;
