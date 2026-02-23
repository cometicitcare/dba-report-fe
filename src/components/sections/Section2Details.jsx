import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building, MapPin, Book, UserCheck, GraduationCap, Heart } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { section2Api } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';
import {
  Card, CardHeader, CardContent,
  StatCard, StatCardGrid,
  Table, LoadingCard, LoadingSection, Error,
} from '../common';

// ─── Colour palettes ───────────────────────────────────────────
const PALETTE_TYPE  = ['#f59e0b','#8b5cf6','#3b82f6','#10b981','#ef4444','#f97316','#06b6d4','#ec4899'];
const PALETTE_DHAM  = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];
const PALETTE_TCH   = ['#8b5cf6','#f59e0b','#10b981','#3b82f6','#ef4444','#06b6d4'];
const PALETTE_STU   = ['#ec4899','#3b82f6','#10b981','#f59e0b','#8b5cf6'];
const PALETTE_PROV  = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899','#84cc16'];
const PALETTE_DIST  = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899',
                       '#84cc16','#a855f7','#14b8a6','#f43f5e'];

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

// ─── Compact Donut Pie (reused for summary cards) ─────────────
function CompactPie({ slices, palette, onSelect, selectedKey, height = 190 }) {
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
          innerRadius={46} outerRadius={74}
          paddingAngle={2}
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
          fill="#1f2937" fontSize={14} fontWeight={700}>
          {total.toLocaleString()}
        </text>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
          dy={16} fill="#9ca3af" fontSize={10}>
          Total
        </text>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={7}
          formatter={v => <span style={{ fontSize: 10, color: '#6b7280' }}>{v}</span>}
          wrapperStyle={{ paddingTop: 4, fontSize: 10 }} />
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

// ─── Beautiful compact summary card ───────────────────────────
function SummaryCard2({ title, subtitle, icon: Icon, accentColor = 'teal', slices, palette, onSelect, selectedKey }) {
  const total = slices.reduce((s, d) => s + d.value, 0);

  const accentMap = {
    teal:   { header: 'from-teal-500 to-emerald-400' },
    violet: { header: 'from-violet-500 to-purple-400' },
    pink:   { header: 'from-pink-500 to-rose-400' },
    indigo: { header: 'from-indigo-500 to-blue-400' },
    amber:  { header: 'from-amber-500 to-orange-400' },
    cyan:   { header: 'from-cyan-500 to-sky-400' },
  };
  const accent = accentMap[accentColor] || accentMap.teal;

  if (!slices || slices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`bg-gradient-to-r ${accent.header} px-4 py-3 flex items-center gap-3`}>
          {Icon && <div className="p-1.5 bg-white/20 rounded-lg"><Icon className="w-4 h-4 text-white" /></div>}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

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
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tabular-nums">
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

// ─── Shared donut pie (for province/district full-width) ───────
function SectionPie({ slices, palette, onSelect, selectedKey, height = 260 }) {
  if (!slices || slices.length === 0) return null;
  const total = slices.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="label"
          cx="50%" cy="46%"
          innerRadius={50} outerRadius={85}
          paddingAngle={2}
          onClick={d => onSelect && onSelect(d.key)}
          style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >
          {slices.map((entry, i) => (
            <Cell
              key={entry.key}
              fill={palette[i % palette.length]}
              opacity={selectedKey && selectedKey !== entry.key ? 0.35 : 1}
              stroke={selectedKey === entry.key ? '#1e293b' : 'none'}
              strokeWidth={selectedKey === entry.key ? 2 : 0}
            />
          ))}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          fill="#374151" fontSize={13} fontWeight={700}>
          {total.toLocaleString()}
        </text>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          dy={16} fill="#9ca3af" fontSize={10}>
          Total
        </text>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8}
          formatter={v => <span style={{ fontSize: 11, color: '#4b5563' }}>{v}</span>}
          wrapperStyle={{ paddingTop: 6 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Column chart (vertical) for Province / District ──────────
function SectionBar({ slices, palette, onSelect, selectedKey, height = 280, angleLabels = false }) {
  if (!slices || slices.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={slices}
        margin={{ top: 8, right: 12, left: 0, bottom: angleLabels ? 60 : 24 }}
        onClick={e => e?.activePayload && onSelect && onSelect(e.activePayload[0]?.payload?.key)}
        style={{ cursor: onSelect ? 'pointer' : 'default' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#6b7280', ...(angleLabels ? { angle: -40, textAnchor: 'end', dy: 4 } : {}) }}
          axisLine={false} tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          axisLine={false} tickLine={false}
          width={36}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { label, value } = payload[0].payload;
            return (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
                <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
                <p className="text-gray-500">{Number(value).toLocaleString()} Bhikku</p>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {slices.map((entry, i) => (
            <Cell
              key={entry.key}
              fill={palette[i % palette.length]}
              opacity={selectedKey && selectedKey !== entry.key ? 0.35 : 1}
              stroke={selectedKey === entry.key ? '#1e293b' : 'none'}
              strokeWidth={selectedKey === entry.key ? 1.5 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Province: table + bar chart ──────────────────────────────
function ProvinceSummary({ data, onSelect, selectedProvince }) {
  const columns = [
    { key: 'name',            header: 'Province / පළාත' },
    { key: 'vihara_count',    header: 'Vihara',    render: (v) => (v || 0).toLocaleString() },
    { key: 'bikku_count',     header: 'Bhikku',    render: (v) => (v || 0).toLocaleString() },
    { key: 'silmatha_count',  header: 'Silmatha',  render: (v) => (v || 0).toLocaleString() },
    { key: 'arama_count',     header: 'Arama',     render: (v) => (v || 0).toLocaleString() },
  ];

  const rows = data?.data || [];

  const slices = rows
    .filter(r => (r.bikku_count || 0) > 0)
    .map(r => ({ key: r.code, label: r.name, value: r.bikku_count || 0 }));

  return (
    <Card>
      <CardHeader title="By Province" subtitle="Bhikku distribution — click to filter" icon={MapPin} />
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="overflow-auto max-h-72">
            <Table
              columns={columns}
              data={rows}
              onRowClick={(row) => onSelect('selectedProvince', row.code)}
              activeRowId={selectedProvince}
              idField="code"
              emptyMessage="No province data available"
            />
          </div>
          <SectionBar
            slices={slices}
            palette={PALETTE_PROV}
            onSelect={key => onSelect('selectedProvince', key)}
            selectedKey={selectedProvince}
            height={260}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── District: table + bar chart (top 11 + others) ────────────
function DistrictSummary({ onSelect, selectedDistrict }) {
  const { data, isLoading } = useQuery({
    queryKey: ['section2-districts-all'],
    queryFn: () => section2Api.getDistricts(),
  });

  const columns = [
    { key: 'name',           header: 'District / දිස්ත්‍රික්කය' },
    { key: 'vihara_count',   header: 'Vihara',    render: (v) => (v || 0).toLocaleString() },
    { key: 'bikku_count',    header: 'Bhikku',    render: (v) => (v || 0).toLocaleString() },
    { key: 'silmatha_count', header: 'Silmatha',  render: (v) => (v || 0).toLocaleString() },
    { key: 'arama_count',    header: 'Arama',     render: (v) => (v || 0).toLocaleString() },
  ];

  const rows = data?.data || [];

  const sorted = [...rows].sort((a, b) => (b.bikku_count || 0) - (a.bikku_count || 0));
  const top = sorted.slice(0, 11);
  const rest = sorted.slice(11);
  const othersVal = rest.reduce((s, r) => s + (r.bikku_count || 0), 0);
  const slices = [
    ...top.filter(r => (r.bikku_count || 0) > 0).map(r => ({ key: r.code, label: r.name, value: r.bikku_count || 0 })),
    ...(othersVal > 0 ? [{ key: '__others__', label: 'Others', value: othersVal }] : []),
  ];

  return (
    <Card>
      <CardHeader title="By District" subtitle="All Districts — Bhikku distribution" icon={Building} />
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="overflow-auto max-h-80">
            <Table
              columns={columns}
              data={rows}
              onRowClick={(row) => onSelect('selectedDistrict', row.code)}
              activeRowId={selectedDistrict}
              idField="code"
              loading={isLoading}
              emptyMessage="No district data available"
            />
          </div>
          <SectionBar
            slices={slices}
            palette={PALETTE_DIST}
            onSelect={key => key !== '__others__' && onSelect('selectedDistrict', key)}
            selectedKey={selectedDistrict}
            height={320}
            angleLabels
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Helper: build slices from API items ───────────────────────
function buildSlices(items, keyField, labelField, valueField) {
  if (!items || !Array.isArray(items)) return [];
  return items
    .filter(it => (it[valueField] ?? 0) > 0)
    .map(it => ({ key: it[keyField], label: it[labelField], value: it[valueField] ?? 0 }));
}

// Main Section 2 Component
export function Section2Details() {
  const { section2, selectSection2 } = useDashboard();

  const queryParams = {};

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['section2', queryParams],
    queryFn: () => section2Api.getAll(queryParams),
  });

  const { data: provinceData } = useQuery({
    queryKey: ['section2-provinces', queryParams],
    queryFn: () => section2Api.getProvinces(queryParams),
  });

  const handleSelect = (key, value) => {
    const currentValue = section2[key];
    selectSection2({ [key]: currentValue === value ? null : value });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3,4].map(i => <LoadingCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <Error message={error.message} onRetry={refetch} />;
  }

  // Build slices for each section
  const bhikkuSlices  = buildSlices(data?.bikku_type,          'type_key',     'type_name',   'total');
  const dahampSlices  = buildSlices(data?.dahampasal,          'location_key', 'location',     'total');
  const teacherSlices = buildSlices(data?.dahampasal_teachers, 'teacher_key',  'teacher_type', 'total');
  const studentSlices = buildSlices(data?.dahampasal_students, 'gender_key',   'gender',       'total');

  return (
    <div className="space-y-4">
      {/* ── 3-column summary grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Bhikku Types */}
        <SummaryCard2
          title="Bhikku Types"
          subtitle="Click to filter by type"
          icon={Users}
          accentColor="amber"
          slices={bhikkuSlices}
          palette={PALETTE_TYPE}
          onSelect={val => handleSelect('selectedBhikkuType', val)}
          selectedKey={section2.selectedBhikkuType}
        />

        {/* Dahampasal */}
        <SummaryCard2
          title="Dahampasal / දහම් පාසල"
          subtitle="Sunday school locations"
          icon={Book}
          accentColor="teal"
          slices={dahampSlices}
          palette={PALETTE_DHAM}
        />

        {/* Dahampasal Teachers */}
        <SummaryCard2
          title="Dahampasal Teachers / ගුරුවරුන්"
          subtitle="Teacher category breakdown"
          icon={UserCheck}
          accentColor="violet"
          slices={teacherSlices}
          palette={PALETTE_TCH}
        />

        {/* Dahampasal Students */}
        <SummaryCard2
          title="Dahampasal Students / සිසුන්"
          subtitle="Student gender breakdown"
          icon={GraduationCap}
          accentColor="pink"
          slices={studentSlices}
          palette={PALETTE_STU}
        />
      </div>

      {/* ── Province — full width ──────────────────────────────── */}
      <ProvinceSummary
        data={provinceData}
        onSelect={handleSelect}
        selectedProvince={section2.selectedProvince}
      />

      {/* ── District — full width ──────────────────────────────── */}
      <DistrictSummary
        onSelect={handleSelect}
        selectedDistrict={section2.selectedDistrict}
      />
    </div>
  );
}

export default Section2Details;
