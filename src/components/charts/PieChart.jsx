import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Buddhist-themed color palette
const COLORS = [
  '#F59E0B', // Saffron/Amber
  '#7C2D12', // Maroon
  '#EA580C', // Orange
  '#92400E', // Brown
  '#D97706', // Amber dark
  '#B45309', // Amber darker
  '#78350F', // Brown dark
  '#C2410C', // Orange dark
];

export function DonutChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors = COLORS,
  showLegend = true,
  showTooltip = true,
  innerRadius = 50,
  outerRadius = 80,
  height = 250,
  onClick,
  activeIndex,
}) {
  const handleClick = (entry, index) => {
    if (onClick) {
      onClick(entry, index);
    }
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          label={renderCustomLabel}
          labelLine={false}
          onClick={handleClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke={activeIndex === index ? '#1F2937' : 'none'}
              strokeWidth={activeIndex === index ? 2 : 0}
              opacity={activeIndex !== undefined && activeIndex !== index ? 0.6 : 1}
            />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            formatter={(value, name) => [value.toLocaleString(), name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
        )}
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors = COLORS,
  height = 200,
  onClick,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={70}
          onClick={(entry, index) => onClick?.(entry, index)}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value.toLocaleString(), name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export default DonutChart;
