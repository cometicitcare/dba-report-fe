import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, GraduationCap, Building2,
  Building, MapPin, Book, UserCheck, BarChart2,
  TreeDeciduous, Home,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { section1Api, section2Api, section3Api } from '../../services/api';
import { Table, LoadingSection, Error } from '../common';

// ─── Colour palettes ─────────────────────────────────────────────
const PALETTE_A   = ['#f59e0b','#8b5cf6','#3b82f6','#10b981','#ef4444','#f97316','#06b6d4','#ec4899'];
const PALETTE_B   = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899'];
const PALETTE_C   = ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6'];
const PALETTE_GEO = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899','#84cc16'];
const PALETTE_SEC3 = ['#14b8a6','#f59e0b','#8b5cf6','#3b82f6','#10b981','#ef4444','#f97316','#ec4899'];

// ─── Colour accents (same palette as Tab 01) ──────────────
const accentMap = {
  amber:   { header: 'from-amber-500 to-orange-400'   },
  violet:  { header: 'from-violet-500 to-purple-400'  },
  blue:    { header: 'from-blue-500 to-sky-400'       },
  emerald: { header: 'from-emerald-500 to-teal-400'   },
  rose:    { header: 'from-rose-500 to-pink-400'      },
  teal:    { header: 'from-teal-500 to-cyan-400'      },
  indigo:  { header: 'from-indigo-500 to-blue-400'    },
};

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

// ─── Mini donut pie ───────────────────────────────────────────
function MiniDonut({ slices, palette, height = 168 }) {
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
          innerRadius={42} outerRadius={64}
          paddingAngle={2}
        >
          {slices.map((entry, i) => (
            <Cell key={entry.key ?? i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          fill="#1f2937" fontSize={13} fontWeight={700}>
          {total.toLocaleString()}
        </text>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          dy={15} fill="#9ca3af" fontSize={9}>
          Total
        </text>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={6}
          formatter={v => <span style={{ fontSize: 9, color: '#6b7280' }}>{v}</span>}
          wrapperStyle={{ paddingTop: 2 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Column bar chart for geo cards ──────────────────────────
function GeoBarChart({ slices, palette, angleLabels = false, height = 220 }) {
  if (!slices || slices.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={slices}
        margin={{ top: 8, right: 12, left: 0, bottom: angleLabels ? 64 : 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis
          dataKey="label"
          tick={{
            fontSize: 10, fill: '#6b7280',
            ...(angleLabels ? { angle: -40, textAnchor: 'end', dy: 4 } : {}),
          }}
          axisLine={false} tickLine={false} interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          axisLine={false} tickLine={false} width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
          {slices.map((entry, i) => (
            <Cell key={entry.key ?? i} fill={palette[i % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Stat pill for geo donut cards (Tab 01 style) ─────────────
function GeoStatPill({ label, value, color }) {
  return (
    <div
      style={{ borderLeftColor: color }}
      className="flex flex-col items-start w-full px-3 py-2.5 rounded-xl text-left border-l-4 border border-gray-100 bg-white"
    >
      <span className="text-xs font-medium text-gray-500 leading-tight mb-1 truncate w-full">{label}</span>
      <span className="text-xl font-bold text-gray-900 tabular-nums leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// ─── Geo donut card — Tab 01 SummaryCard style (donut + stat pills) ─
function GeoDonutCard({ title, subtitle, icon: Icon, accentColor = 'violet', slices, palette, isLoading, error, onRetry }) {
  const accent = accentMap[accentColor] || accentMap.violet;
  const total  = (slices || []).reduce((s, d) => s + d.value, 0);

  if (isLoading) return <LoadingSection height="320px" />;
  if (error)     return <Error message={error.message} onRetry={onRetry} />;

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

      {slices && slices.length > 0 ? (
        <>
          {/* Donut chart — identical to Tab 01 CompactPie */}
          <div className="px-2 pt-1">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={78}
                  paddingAngle={2}
                >
                  {slices.map((entry, i) => (
                    <Cell key={entry.key ?? i} fill={palette[i % palette.length]} />
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
          </div>

          {/* Stat pills grid — identical to Tab 01 StatPill grid */}
          <div className="px-3 pb-3 grid grid-cols-2 gap-2 flex-1">
            {slices.map((item, i) => (
              <GeoStatPill
                key={item.key}
                label={item.label}
                value={item.value}
                color={palette[i % palette.length]}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">No data available</div>
      )}
    </div>
  );
}

// ─── Geo summary card — gradient header + bar chart + table ──
// rows (optional): [{ key, label, vihara, bikku, silmatha, arama }] — renders 4-col table
function GeoSummaryCard({ title, subtitle, icon: Icon, accentColor = 'violet', slices, palette, rows, isLoading, error, onRetry, angleLabels = false }) {
  const accent = accentMap[accentColor] || accentMap.violet;
  const total  = (slices || []).reduce((s, d) => s + d.value, 0);

  if (isLoading) return <LoadingSection height="320px" />;
  if (error)     return <Error message={error.message} onRetry={onRetry} />;

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

      {slices.length > 0 ? (
        <>
          {/* Column bar chart */}
          <div className="px-3 pt-3">
            <GeoBarChart slices={slices} palette={palette} angleLabels={angleLabels}
              height={slices.length > 12 ? 260 : 200} />
          </div>

          {/* Data table */}
          <div className="overflow-y-auto max-h-56 border-t border-gray-100">
            {rows && rows.length > 0 ? (
              /* 4-column extended table: Name | Vihara | Bhikku | Silmatha | Arama */
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-500 font-semibold">Name / නම</th>
                    <th className="text-right px-2 py-2 text-gray-500 font-semibold">Vihara</th>
                    <th className="text-right px-2 py-2 text-gray-500 font-semibold">Bhikku</th>
                    <th className="text-right px-2 py-2 text-gray-500 font-semibold">Silmatha</th>
                    <th className="text-right px-2 py-2 text-gray-500 font-semibold">Arama</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, i) => (
                    <tr key={item.key} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: palette[i % palette.length] }}
                        />
                        <span className="text-gray-700 truncate">{item.label}</span>
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-gray-800 tabular-nums">{(item.vihara || 0).toLocaleString()}</td>
                      <td className="px-2 py-2 text-right text-gray-600 tabular-nums">{(item.bikku || 0).toLocaleString()}</td>
                      <td className="px-2 py-2 text-right text-gray-600 tabular-nums">{(item.silmatha || 0).toLocaleString()}</td>
                      <td className="px-2 py-2 text-right text-gray-600 tabular-nums">{(item.arama || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Default 2-column table: Name | Vihara */
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Name / නම</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-semibold">Vihara</th>
                  </tr>
                </thead>
                <tbody>
                  {slices.map((item, i) => (
                    <tr key={item.key} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: palette[i % palette.length] }}
                        />
                        <span className="text-gray-700 truncate">{item.label}</span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-800 tabular-nums">
                        {item.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">No data available</div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Generic table card — gradient header + optional mini donut + table
// ------------------------------------------------------------
function SummaryTable({
  title, subtitle, icon: Icon, columns, data, isLoading, error, onRetry,
  accentColor = 'amber',
  chartValueKey, chartLabelKey, chartPalette,
}) {
  if (isLoading) return <LoadingSection height="160px" />;
  if (error)     return <Error message={error.message} onRetry={onRetry} />;

  const accent = accentMap[accentColor] || accentMap.amber;

  // Build pie slices if chart keys provided
  const slices = (chartValueKey && chartLabelKey && data)
    ? data
        .map((r, i) => ({ key: r[chartLabelKey] ?? i, label: r[chartLabelKey], value: r[chartValueKey] || 0 }))
        .filter(s => s.value > 0)
    : [];
  const palette = chartPalette || PALETTE_A;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Gradient header — same style as Tab 01 SummaryCard */}
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
        {data && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tabular-nums">
            {data.length}
          </span>
        )}
      </div>

      {/* Mini donut chart */}
      {slices.length > 0 && (
        <div className="px-2 pt-1 border-b border-gray-50">
          <MiniDonut slices={slices} palette={palette} height={168} />
        </div>
      )}

      {/* Table grid — unchanged */}
      <div className={`p-0 overflow-y-auto ${slices.length > 0 ? 'max-h-52' : 'max-h-72'}`}>
        <Table
          columns={columns}
          data={data || []}
          emptyMessage="No data available"
        />
      </div>
    </div>
  );
}

// Render helper
const num = (v) => (v ?? 0).toLocaleString();

// ------------------------------------------------------------
// Section 1 tables — Types / Nikaya / Grades
// ------------------------------------------------------------
function Section1Tables({ appliedFilters }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tab2-s1-overview', appliedFilters],
    queryFn: () => section1Api.getOverview(appliedFilters),
  });

  const typeColumns = [
    { key: 'type_name',  header: 'Type / වර්ගය' },
    { key: 'total',      header: 'Total', render: num },
  ];

  const nikayaColumns = [
    { key: 'nikaya_name',    header: 'Nikaya / නිකාය' },
    { key: 'vihara_count',  header: 'Vihara',   render: num },
    { key: 'bhikku_count',  header: 'Bhikku',   render: num },
    { key: 'silmatha_count',header: 'Silmatha', render: num },
    { key: 'arama_count',   header: 'Arama',    render: num },
  ];

  const gradeColumns = [
    { key: 'grade_name', header: 'Grade / ශ්‍රේණිය' },
    { key: 'total',      header: 'Vihara', render: num },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SummaryTable
        title="Summary A — Types"
        subtitle="Entity types"
        icon={Users}
        accentColor="amber"
        columns={typeColumns}
        data={data?.summary_a}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="type_name"
        chartPalette={PALETTE_A}
      />
      <SummaryTable
        title="Summary B — By Nikaya"
        subtitle="Vihara · Bhikku · Arama by Nikaya"
        icon={Building2}
        accentColor="violet"
        columns={nikayaColumns}
        data={data?.summary_b}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="vihara_count"
        chartLabelKey="nikaya_name"
        chartPalette={PALETTE_B}
      />
      <SummaryTable
        title="Summary C — By Grade"
        subtitle="Vihara by Grade"
        icon={GraduationCap}
        accentColor="blue"
        columns={gradeColumns}
        data={data?.summary_c}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="grade_name"
        chartPalette={PALETTE_C}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Section 2 tables — Bhikku types / Dahampasal / Teachers / Students
// ------------------------------------------------------------
function Section2StatTables({ appliedFilters }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tab2-s2-all', appliedFilters],
    queryFn: () => section2Api.getAll(appliedFilters),
  });

  const bhikkuCols = [
    { key: 'type_name', header: 'Bhikku Type' },
    { key: 'total',     header: 'Count', render: num },
  ];

  const dahampasalCols = [
    { key: 'location', header: 'Location / ස්ථානය' },
    { key: 'total',    header: 'Dahampasal', render: num },
  ];

  const teacherCols = [
    { key: 'teacher_type', header: 'Teacher Category' },
    { key: 'total',        header: 'Teachers', render: num },
  ];

  const studentCols = [
    { key: 'gender', header: 'Gender / ස්ත්‍රී/පුරුෂ' },
    { key: 'total',  header: 'Students', render: num },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SummaryTable
        title="Bhikku Types / භික්ෂු වර්ග"
        icon={Users}
        accentColor="amber"
        columns={bhikkuCols}
        data={data?.bikku_type}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="type_name"
        chartPalette={PALETTE_A}
      />
      <SummaryTable
        title="Dahampasal / දහම් පාසල"
        icon={Book}
        accentColor="emerald"
        columns={dahampasalCols}
        data={data?.dahampasal}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="location"
        chartPalette={PALETTE_B}
      />
      <SummaryTable
        title="Dahampasal Teachers / ගුරුවරුන්"
        icon={UserCheck}
        accentColor="violet"
        columns={teacherCols}
        data={data?.dahampasal_teachers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="teacher_type"
        chartPalette={PALETTE_B}
      />
      <SummaryTable
        title="Dahampasal Students / සිසුන්"
        icon={GraduationCap}
        accentColor="blue"
        columns={studentCols}
        data={data?.dahampasal_students}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        chartValueKey="total"
        chartLabelKey="gender"
        chartPalette={PALETTE_C}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Province & District tables
// ------------------------------------------------------------
function Section2GeoTables({ appliedFilters }) {
  const { data: provData, isLoading: provLoading, error: provError, refetch: provRefetch } = useQuery({
    queryKey: ['tab2-s2-provinces', appliedFilters],
    queryFn: () => section2Api.getProvinces(appliedFilters),
  });

  const { data: distData, isLoading: distLoading, error: distError, refetch: distRefetch } = useQuery({
    queryKey: ['tab2-s2-districts', appliedFilters],
    queryFn: () => section2Api.getDistricts(appliedFilters?.province_code, appliedFilters),
  });

  // Filter to selected row when a specific code is applied
  const filteredProvData = appliedFilters?.province_code
    ? (provData?.data || []).filter(p => p.code === appliedFilters.province_code)
    : provData?.data;

  const filteredDistData = appliedFilters?.district_code
    ? (distData?.data || []).filter(d => d.code === appliedFilters.district_code)
    : distData?.data;

  // Build rows (full 4-field data) and slices (vihara only, for the bar chart)
  const provRows = (filteredProvData || [])
    .filter(r => (r.vihara_count || 0) > 0)
    .map(r => ({
      key:      r.code,
      label:    r.name,
      vihara:   r.vihara_count   || 0,
      bikku:    r.bikku_count    || 0,
      silmatha: r.silmatha_count || 0,
      arama:    r.arama_count    || 0,
    }));

  const distRows = (filteredDistData || [])
    .filter(r => (r.vihara_count || 0) > 0)
    .map(r => ({
      key:      r.code,
      label:    r.name,
      vihara:   r.vihara_count   || 0,
      bikku:    r.bikku_count    || 0,
      silmatha: r.silmatha_count || 0,
      arama:    r.arama_count    || 0,
    }));

  const provSlices = provRows.map(r => ({ key: r.key, label: r.label, value: r.vihara }));
  const distSlices = distRows.map(r => ({ key: r.key, label: r.label, value: r.vihara }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GeoSummaryCard
        title={appliedFilters?.province_code ? 'Province (Selected)' : 'By Province / පළාත් අනුව'}
        subtitle="Vihara distribution by province"
        icon={MapPin}
        accentColor="violet"
        slices={provSlices}
        rows={provRows}
        palette={PALETTE_GEO}
        isLoading={provLoading}
        error={provError}
        onRetry={provRefetch}
      />
      <GeoSummaryCard
        title={
          appliedFilters?.district_code ? 'District (Selected)'
          : appliedFilters?.province_code ? 'By District (Filtered)'
          : 'By District / දිස්ත්‍රික්ක 25'
        }
        subtitle={
          appliedFilters?.district_code ? 'Selected district'
          : appliedFilters?.province_code ? 'Districts in selected province'
          : 'All 25 Districts — Vihara distribution'
        }
        icon={Building}
        accentColor="blue"
        slices={distSlices}
        rows={distRows}
        palette={PALETTE_B}
        isLoading={distLoading}
        error={distError}
        onRetry={distRefetch}
        angleLabels
      />
    </div>
  );
}

// ------------------------------------------------------------
// Section 3 — SSBM / Divisional Secretariat / GN Division
// ------------------------------------------------------------
function Section3GeoTables({ appliedFilters }) {
  const hasDistrict = !!appliedFilters?.district_code;
  const hasDs       = !!appliedFilters?.ds_code;

  const { data: ssbmData, isLoading: ssbmLoading, error: ssbmError, refetch: ssbmRefetch } = useQuery({
    queryKey: ['tab2-ssbm', appliedFilters],
    queryFn: () => section3Api.getSsbmOrgList({
      provinceCode: appliedFilters?.province_code,
      districtCode: appliedFilters?.district_code,
      dsCode:       appliedFilters?.ds_code,
    }),
    enabled: hasDistrict,
  });

  const { data: dsData, isLoading: dsLoading, error: dsError, refetch: dsRefetch } = useQuery({
    queryKey: ['tab2-ds', appliedFilters?.district_code],
    queryFn: () => section3Api.getDivisionalSecretariat(appliedFilters?.district_code, appliedFilters),
    enabled: hasDistrict,
  });

  const { data: gnData, isLoading: gnLoading, error: gnError, refetch: gnRefetch } = useQuery({
    queryKey: ['tab2-gn', appliedFilters?.ds_code],
    queryFn: () => section3Api.getGnDivisions(appliedFilters?.ds_code, appliedFilters),
    enabled: hasDs,
  });

  // Build slices for each entity
  const ssbmSlices = (ssbmData || [])
    .filter(r => (r.vihara_count || 0) > 0)
    .map(r => ({ key: r.ssbm_code, label: r.ssbm_name, value: r.vihara_count || 0 }));

  const dsSlices = (dsData || [])
    .filter(r => (r.vihara_count || 0) > 0)
    .map(r => ({ key: r.ds_code, label: r.ds_name, value: r.vihara_count || 0 }));

  const gnSlices = (gnData || [])
    .filter(r => (r.vihara_count || 0) > 0)
    .map(r => ({ key: r.gn_code, label: r.gn_name, value: r.vihara_count || 0 }));

  if (!hasDistrict && !hasDs) return null;

  return (
    <div className="space-y-4">
      {/* SSBM */}
      {hasDistrict && (
        <div className="grid gap-4 lg:grid-cols-2">
          <GeoSummaryCard
              title="SSBM / ශාසනරක්ෂක සභා"
              subtitle="Sasanarakshaka Bala Mandala"
              icon={TreeDeciduous}
              accentColor="indigo"
              slices={ssbmSlices}
              palette={PALETTE_B}
              isLoading={ssbmLoading}
              error={ssbmError}
              onRetry={ssbmRefetch}
              angleLabels
            />
        </div>
      )}

      {/* Divisional Secretariat & GN Division */}
      {(hasDistrict || hasDs) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {hasDistrict && (
            <GeoSummaryCard
              title="Divisional Secretariat / ප්‍රා. ලේකම්"
              subtitle="By District"
              icon={MapPin}
              accentColor="rose"
              slices={dsSlices}
              palette={PALETTE_GEO}
              isLoading={dsLoading}
              error={dsError}
              onRetry={dsRefetch}
              angleLabels
            />
          )}
          {hasDs && (
            <GeoSummaryCard
              title="GN Division / ග්‍රාම නිලධාරී"
              subtitle="Grama Niladhari Divisions"
              icon={Home}
              accentColor="emerald"
              slices={gnSlices}
              palette={PALETTE_C}
              isLoading={gnLoading}
              error={gnError}
              onRetry={gnRefetch}
              angleLabels
            />
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Main Tab2Summary component
// appliedFilters = null → not yet applied, show prompt
// appliedFilters = {} or with values → fetch and display
// ------------------------------------------------------------
export function Tab2Summary({ appliedFilters }) {
  if (appliedFilters === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-saffron-50 flex items-center justify-center mb-4">
          <BarChart2 className="w-7 h-7 text-saffron-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">
          Select filters and click <span className="text-saffron-600">Display</span>
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Use the Global Filters panel above to select Province, District or Nikaya,
          then click the Display button to load the summary tables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1 summaries as tables */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Overall Summary — Types · Nikaya · Grades
        </h3>
        <Section1Tables appliedFilters={appliedFilters} />
      </div>

      {/* Section 2 stat tables */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Detail Summary — Bhikku · Dahampasal · Teachers · Students
        </h3>
        <Section2StatTables appliedFilters={appliedFilters} />
      </div>

      {/* Province & District */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Geographic Summary — Province &amp; District
        </h3>
        <Section2GeoTables appliedFilters={appliedFilters} />
      </div>

      {/* SSBM / Divisional Secretariat / GN Division */}
      {(appliedFilters?.nikaya_code || appliedFilters?.province_code || appliedFilters?.district_code || appliedFilters?.ds_code) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Administrative Summary — SSBM · Div. Secretariat · GN Division
          </h3>
          <Section3GeoTables appliedFilters={appliedFilters} />
        </div>
      )}
    </div>
  );
}

export default Tab2Summary;
