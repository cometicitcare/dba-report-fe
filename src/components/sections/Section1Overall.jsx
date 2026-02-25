import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, Heart, Building2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { section1Api } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';
import { LoadingCard, Error } from '../common';

// ─── Colour palettes ───────────────────────────────────────────
const PALETTE_A = ['#f59e0b','#8b5cf6','#3b82f6','#10b981','#ef4444','#f97316','#06b6d4','#ec4899'];
const PALETTE_B = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899'];
const PALETTE_C = ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6'];

// ─── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-0.5">{name}</p>
      <p className="text-gray-500">{Number(value).toLocaleString()}</p>
    </div>
  );
};

// ─── Pie slice data label ─────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  if (!value) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 20;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#374151" textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central" fontSize={9} fontWeight={600}>
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};

// ─── Compact Donut Pie ─────────────────────────────────────────
function CompactPie({ slices, palette, onSelect, selectedKey, height = 200 }) {
  if (!slices || slices.length === 0) return null;
  const total = slices.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="label"
          cx="50%" cy="50%"
          innerRadius={48} outerRadius={78}
          paddingAngle={2}
          label={renderPieLabel}
          labelLine={false}
          onClick={d => onSelect && onSelect(d.key)}
          style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >
          {slices.map((entry, i) => (
            <Cell
              key={entry.key}
              fill={palette[i % palette.length]}
              opacity={selectedKey && selectedKey !== entry.key ? 0.3 : 1}
              stroke={selectedKey === entry.key ? '#1e293b' : 'transparent'}
              strokeWidth={selectedKey === entry.key ? 2 : 0}
            />
          ))}
        </Pie>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
          fill="#1f2937" fontSize={15} fontWeight={700}>
          {total.toLocaleString()}
        </text>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
          dy={17} fill="#9ca3af" fontSize={10}>
          Total
        </text>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle" iconSize={7}
          formatter={v => <span style={{ fontSize: 10, color: '#6b7280' }}>{v}</span>}
          wrapperStyle={{ paddingTop: 4, fontSize: 10 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Stat item card (large, highlighted) ─────────────────────
function StatPill({ label, value, color, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{ borderLeftColor: color }}
      className={`flex flex-col items-start w-full px-3 py-3 rounded-xl text-left transition-all duration-200 border-l-4 border border-gray-100
        ${active
          ? 'bg-amber-50 shadow-md border-gray-200'
          : 'bg-white hover:shadow-sm hover:bg-gray-50'
        }
        ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className="text-xs font-medium text-gray-500 leading-tight mb-1 truncate w-full">{label}</span>
      <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </button>
  );
}

// ─── Beautiful Summary Card (pie + stat pills) ─────────────────
function SummaryCard({ title, subtitle, icon: Icon, accentColor = 'amber', slices, palette, onSelect, selectedKey }) {
  const total = slices.reduce((s, d) => s + d.value, 0);

  const accentMap = {
    amber:  { header: 'from-amber-500 to-orange-400',  badge: 'bg-amber-100 text-amber-700' },
    violet: { header: 'from-violet-500 to-purple-400', badge: 'bg-violet-100 text-violet-700' },
    blue:   { header: 'from-blue-500 to-sky-400',      badge: 'bg-blue-100 text-blue-700' },
  };
  const accent = accentMap[accentColor] || accentMap.amber;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${accent.header} px-4 py-3 flex items-center gap-3`}>
        {Icon && (
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tabular-nums`}>
          {total.toLocaleString()}
        </span>
      </div>

      {/* Donut chart */}
      <div className="px-2 pt-1">
        <CompactPie
          slices={slices}
          palette={palette}
          onSelect={onSelect}
          selectedKey={selectedKey}
          height={190}
        />
      </div>

      {/* Stat cards grid */}
      <div className="px-3 pb-3 grid grid-cols-2 gap-2 flex-1">
        {slices.map((item, i) => (
          <StatPill
            key={item.key}
            label={item.label}
            value={item.value}
            color={palette[i % palette.length]}
            onClick={() => onSelect && onSelect(item.key)}
            active={selectedKey === item.key}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Section 1 Component
// ─────────────────────────────────────────────────────────────
export function Section1Overall() {
  const { section1, selectSection1 } = useDashboard();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['section1-overview'],
    queryFn: () => section1Api.getOverview({}),
  });

  const handleSelect = (key, value) => {
    const currentValue = section1[key];
    selectSection1({ [key]: currentValue === value ? null : value });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3].map(i => <LoadingCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <Error message={error.message} onRetry={refetch} />;
  }

  // ── Build slices for Summary A ─────────────────────────────
  const iconMap = {
    bikku: Users, silmatha: Heart, vihara: Building2,
    arama: Building2, ssbm: Users,
    dahampasal_teachers: GraduationCap, dahampasal_students: GraduationCap,
    dahampasal: Building2,
  };

  const summaryASlices = (data?.summary_a || [])
    .map(item => ({
      key: item.type_key,
      label: item.type_name,
      value: item.total || 0,
      icon: iconMap[item.type_key] || Users,
    }))
    .filter(d => d.value > 0);

  // ── Build slices for Summary B ─────────────────────────────
  const summaryBSlices = [...(data?.summary_b || [])]
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .filter(d => (d.total || 0) > 0)
    .map(d => ({
      key: d.nikaya_code,
      label: d.nikaya_name || d.nikaya_code,
      value: d.total || 0,
    }));

  // ── Build slices for Summary C ─────────────────────────────
  const summaryCSlices = (data?.summary_c || [])
    .filter(d => (d.total || 0) > 0)
    .map(d => ({
      key: d.grade,
      label: d.grade_name || `Grade ${d.grade}`,
      value: d.total || 0,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Summary A */}
      {summaryASlices.length > 0 && (
        <SummaryCard
          title="Summary A - Types"
          subtitle="Click to filter by type"
          icon={Users}
          accentColor="amber"
          slices={summaryASlices}
          palette={PALETTE_A}
          onSelect={key => handleSelect('selectedType', key)}
          selectedKey={section1.selectedType}
        />
      )}

      {/* Summary B */}
      {summaryBSlices.length > 0 && (
        <SummaryCard
          title="Summary B - By Nikaya"
          subtitle="Click to filter by nikaya"
          icon={Building2}
          accentColor="violet"
          slices={summaryBSlices}
          palette={PALETTE_B}
          onSelect={key => handleSelect('selectedNikaya', key)}
          selectedKey={section1.selectedNikaya}
        />
      )}

      {/* Summary C */}
      {summaryCSlices.length > 0 && (
        <SummaryCard
          title="Summary C - By Vihara Grade"
          subtitle="Click to filter by grade"
          icon={GraduationCap}
          accentColor="blue"
          slices={summaryCSlices}
          palette={PALETTE_C}
          onSelect={key => handleSelect('selectedGrade', key)}
          selectedKey={section1.selectedGrade}
        />
      )}
    </div>
  );
}

export default Section1Overall;
