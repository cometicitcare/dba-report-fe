import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, Search, Eye, X, MapPin, Phone, User, BookOpen, Award, Calendar, ChevronDown, Printer } from 'lucide-react';
import { section3Api, lookupApi } from '../../services/api';
import { FilterPanelWithApply } from '../layout/FilterPanelWithApply';
import { Card, CardHeader, CardContent, Table, LoadingSection, Error, Pagination } from '../common';

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────────────────────
// Temple Profile Modal
// ─────────────────────────────────────────────────────────────
function TempleProfileModal({ temple, onClose }) {
  if (!temple) return null;

  const Field = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
        {Icon && <Icon className="w-3.5 h-3.5 mt-0.5 text-saffron-400 flex-shrink-0" />}
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-sm text-gray-800">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-saffron-50 px-5 py-4 flex items-start justify-between border-b border-saffron-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {temple.vihara_name || temple.temple_name || '—'}
            </h2>
            {temple.vihara_name_en && (
              <p className="text-sm text-gray-500 mt-0.5">{temple.vihara_name_en}</p>
            )}
            {temple.reg_no && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-saffron-100 text-saffron-700 text-xs rounded font-mono">
                {temple.reg_no}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Field label="Grade / ශ්‍රේණිය"        value={temple.grade}         icon={Award} />
              <Field label="Nikaya / නිකාය"          value={temple.nikaya_name}   icon={BookOpen} />
              <Field label="Parshawa / පාර්ශවය"      value={temple.parshawa_name} />
            </div>
            <div>
              <Field label="Province / පළාත"          value={temple.province_name} icon={MapPin} />
              <Field label="District / දිස්ත්‍රික්කය" value={temple.district_name} />
              <Field label="Div. Sec. / ප්‍රා.ලේ."   value={temple.ds_name} />
              <Field label="GN Division / ග්‍රා.නි."  value={temple.gn_name} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-0">
            <Field label="Address / ලිපිනය"           value={temple.address}        icon={MapPin} />
            <Field label="Viharadhipathi / විහාරාධිපති" value={temple.chief_of_temple} icon={User} />
            <Field label="Mobile / දුරකථනය"           value={temple.mobile}         icon={Phone} />
            <Field label="Last Updated / අවසන් යාවත්කාලීන" value={temple.updated_at}  icon={Calendar} />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Temple list grid
// ─────────────────────────────────────────────────────────────
function TempleTable({ appliedFilters, debouncedSearch, typeCode, dateFrom, dateTo, onView }) {
  const searchActive = debouncedSearch.trim().length >= 2;
  const dateActive   = !!(dateFrom || dateTo);
  const isActive     = appliedFilters !== null || searchActive || dateActive || !!typeCode;
  const effectiveFilters = appliedFilters || {};

  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tab3-temples', effectiveFilters, debouncedSearch.trim(), typeCode, dateFrom, dateTo],
    queryFn: () => section3Api.getAllTemples(
      effectiveFilters,
      debouncedSearch.trim() || null,
      typeCode || null,
      dateFrom || null,
      dateTo   || null,
    ),
    enabled: isActive,
    keepPreviousData: true,
  });

  const temples = data || [];
  // Reset to p.1 when results change
  useEffect(() => { setPage(1); }, [temples.length, debouncedSearch]);
  const pageData = temples.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'reg_no',        header: 'Reg. No.',        render: v => v || '—' },
    { key: 'vihara_name',   header: 'Vihara / විහාරය', render: v => v || '—' },
    { key: 'grade',         header: 'Type',             render: v => v
        ? <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-700 text-xs rounded font-mono border border-amber-200">{v}</span>
        : '—' },
    { key: 'nikaya_name',   header: 'Nikaya',           render: v => v || '—' },
    { key: 'parshawa_name', header: 'Parshawa / පාර්ශවය', render: v => v || '—' },
    { key: 'district_name', header: 'District',         render: v => v || '—' },
    { key: 'ds_name',       header: 'Div. Sec.',        render: v => v || '—' },
    { key: 'updated_at',    header: 'Updated',          render: v => v
        ? <span className="text-xs text-gray-500">{v.slice(0,10)}</span>
        : <span className="text-xs text-gray-300">—</span> },
    {
      key: '_view',
      header: '',
      render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); onView(row); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-saffron-50 hover:bg-saffron-100 text-saffron-700 text-xs font-semibold rounded-lg transition-colors border border-saffron-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ];

  if (!isActive) return null;
  if (isLoading) return <LoadingSection height="300px" />;
  if (error)     return <Error message={error.message} onRetry={refetch} />;

  return (
    <Card>
      <CardHeader
        title={`Temples / විහාරස්ථාන (${temples.length.toLocaleString()})`}
        subtitle="Click View to see the full temple profile"
        icon={Building}
      />
      <CardContent className="p-0">
        <Table
          columns={columns}
          data={temples}
          onRowClick={onView}
          idField="vihara_id"
          emptyMessage={
            debouncedSearch
              ? `No temples match "${debouncedSearch}"`
              : 'No temples found for selected filters'
          }
        />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Tab 3 component
// ─────────────────────────────────────────────────────────────
export function Tab3Temples() {
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchText, setSearchText]         = useState('');
  const [profileTemple, setProfileTemple]   = useState(null);
  const [typeCode, setTypeCode]             = useState('');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo,   setDateTo]               = useState('');

  // 400 ms debounce → only query after user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  // Fetch vihara types for dropdown
  const { data: viharaTypes = [] } = useQuery({
    queryKey: ['lookup-vihara-types'],
    queryFn:  () => lookupApi.getViharaTypes(),
    staleTime: 5 * 60 * 1000,
  });

  const showPrompt =
    appliedFilters === null &&
    debouncedSearch.trim().length < 2 &&
    !typeCode && !dateFrom && !dateTo;

  return (
    <div className="space-y-4">
      {/* Filter Panel — Province hidden, all Districts pre-loaded */}
      <div className="no-print">
        <FilterPanelWithApply
          appliedFilters={appliedFilters || {}}
          onApply={setAppliedFilters}
          hideProvince
        />
      </div>

      {/* ── Extra filter row: Type dropdown + Date range ── */}
      <div className="no-print flex flex-wrap items-end gap-3">

        {/* Type Dropdown */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            Type / ආකාරය
          </label>
          <select
            value={typeCode}
            onChange={e => setTypeCode(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {viharaTypes.map(t => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Updated From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Updated To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          />
        </div>

        {/* Clear extra filters */}
        {(typeCode || dateFrom || dateTo) && (
          <button
            onClick={() => { setTypeCode(''); setDateFrom(''); setDateTo(''); }}
            className="self-end mb-0.5 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search bar — always visible */}
      <div className="no-print relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Type temple name to search… (min 2 chars)"
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Prompt */}
      {showPrompt && (
        <div className="no-print flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-saffron-50 flex items-center justify-center mb-4">
            <Building className="w-7 h-7 text-saffron-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Use filters or type a temple name
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Select District / Nikaya and click{' '}
            <span className="text-saffron-600 font-medium">Display</span>,
            choose a Type, set a date range, or type at least 2 characters above.
          </p>
        </div>
      )}

      {/* Temple grid */}
      <TempleTable
        appliedFilters={appliedFilters}
        debouncedSearch={debouncedSearch}
        typeCode={typeCode}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onView={setProfileTemple}
      />

      {/* Profile modal */}
      {profileTemple && (
        <TempleProfileModal
          temple={profileTemple}
          onClose={() => setProfileTemple(null)}
        />
      )}
    </div>
  );
}

export default Tab3Temples;
