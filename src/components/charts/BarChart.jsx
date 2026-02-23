import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Buddhist-themed color palette
const COLORS = [
  '#F59E0B', // Saffron/Amber
  '#7C2D12', // Maroon
  '#EA580C', // Orange
  '#92400E', // Brown
  '#D97706', // Amber dark
];

export function BarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  color = '#F59E0B',
  colors,
  showGrid = true,
  showLegend = false,
  height = 300,
  layout = 'horizontal',
  onClick,
  activeIndex,
  barSize = 30,
}) {
  const isVertical = layout === 'vertical';

  const handleClick = (entry, index) => {
    if (onClick) {
      onClick(entry, index);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 30, left: isVertical ? 80 : 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        )}
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey={nameKey}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={75}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={nameKey}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
          </>
        )}
        <Tooltip
          formatter={(value, name) => [value.toLocaleString(), name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
        />
        {showLegend && <Legend />}
        <Bar
          dataKey={dataKey}
          barSize={barSize}
          onClick={handleClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors ? colors[index % colors.length] : color}
              opacity={activeIndex !== undefined && activeIndex !== index ? 0.5 : 1}
              stroke={activeIndex === index ? '#1F2937' : 'none'}
              strokeWidth={activeIndex === index ? 2 : 0}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  color = '#F59E0B',
  height = 300,
  onClick,
  activeIndex,
}) {
  return (
    <BarChart
      data={data}
      dataKey={dataKey}
      nameKey={nameKey}
      color={color}
      height={height}
      layout="vertical"
      onClick={onClick}
      activeIndex={activeIndex}
    />
  );
}

export function StackedBarChart({
  data,
  dataKeys = [],
  nameKey = 'name',
  colors = COLORS,
  height = 300,
  showLegend = true,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey={nameKey} tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [value.toLocaleString(), name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={colors[index % colors.length]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default BarChart;
