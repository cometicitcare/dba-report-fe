import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Search, Eye, X, MapPin, Phone, BookOpen,
  Calendar, ChevronDown, Hash, Home, Printer,
} from 'lucide-react';
import { personsApi } from '../../services/api';
import { FilterPanelWithApply } from '../layout/FilterPanelWithApply';
import { Card, CardHeader, CardContent, Table, LoadingSection, Error, Pagination } from '../common';

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────────────────────
// Avatar — gradient circle with lotus watermark + initials
// ─────────────────────────────────────────────
function PersonAvatar({ person, size = 'lg' }) {
  const isBhikku = person?.person_type === 'BHIKKU';
  const displayName = person?.ordained_name || person?.lay_name || person?.name || '?';
  const initials = displayName.trim().split(/\s+/).filter(w => w.length > 0)
    .slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');

  const color = isBhikku
    ? { g1: '#fef3c7', g2: '#f59e0b', text: '#92400e', border: '#fcd34d' }
    : { g1: '#ede9fe', g2: '#8b5cf6', text: '#5b21b6', border: '#c4b5fd' };

  const dim = size === 'lg' ? 96 : 40;
  const fontSize = size === 'lg' ? 28 : 14;

  return (
    <div
      className="rounded-full flex-shrink-0 shadow-md overflow-hidden"
      style={{
        width: dim, height: dim,
        border: `3px solid ${color.border}`,
        background: `linear-gradient(135deg, ${color.g1} 0%, ${color.g2} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Lotus watermark SVG */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
        fill={color.text}
      >
        <ellipse cx="50" cy="65" rx="18" ry="28" />
        <ellipse cx="50" cy="65" rx="18" ry="28" transform="rotate(-35 50 65)" />
        <ellipse cx="50" cy="65" rx="18" ry="28" transform="rotate(35 50 65)" />
        <ellipse cx="50" cy="65" rx="17" ry="24" transform="rotate(-65 50 65)" />
        <ellipse cx="50" cy="65" rx="17" ry="24" transform="rotate(65 50 65)" />
        <circle cx="50" cy="52" r="7" />
      </svg>
      {/* Initials */}
      <span style={{
        position: 'relative', zIndex: 1,
        fontSize, fontWeight: 800, color: color.text,
        letterSpacing: '0.04em', userSelect: 'none',
      }}>
        {initials}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Person Profile Modal
// ─────────────────────────────────────────────────────────────
function PersonProfileModal({ person, onClose }) {
  if (!person) return null;
  const isBhikku = person.person_type === 'BHIKKU';
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
  const typeBadgeCls = isBhikku
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-purple-100 text-purple-700 border-purple-200';
  const headerBg = isBhikku ? 'bg-amber-50 border-amber-100' : 'bg-purple-50 border-purple-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`${headerBg} px-5 py-4 flex items-start justify-between border-b`}>
          <div className="flex items-center gap-4">
            <PersonAvatar person={person} size="lg" />
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {person.ordained_name || person.lay_name || person.name || '—'}
              </h2>
              {person.lay_name && person.lay_name !== person.ordained_name && (
                <p className="text-xs text-gray-500 mt-0.5">ගිහිනාමය: {person.lay_name}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {person.reg_no && (
                  <span className="inline-block px-2 py-0.5 bg-white/80 text-gray-600 text-xs rounded font-mono border border-gray-200">
                    {person.reg_no}
                  </span>
                )}
                <span className={`inline-block px-2 py-0.5 text-xs rounded border font-semibold ${typeBadgeCls}`}>
                  {isBhikku ? 'භික්ෂු' : 'සිල්මෑනිය'}
                </span>
                {person.category && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded border border-gray-200 bg-white/80 text-gray-600">
                    {person.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Field label="Date of Birth / උපන් දිනය"  value={person.dob}          icon={Calendar} />
              <Field label="Mobile / දුරකථනය"            value={person.mobile}        icon={Phone} />
              <Field label="Status / තත්ත්වය"            value={person.status}        icon={Hash} />
            </div>
            <div>
              <Field label="Nikaya / නිකාය"             value={person.nikaya_name}   icon={BookOpen} />
              <Field label="Parshawa / පාර්ශවය"         value={person.parshawa_name} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-0">
            <Field label="Residing Vihara / වෙසෙන විහාරය"  value={person.vihara_name}   icon={Home} />
            <Field label="Province / පළාත"                   value={person.province_name} icon={MapPin} />
            <Field label="District / දිස්ත්‍රික්කය"         value={person.district_name} />
            <Field label="Last Updated / අවසන් යාවත්කාලීනය" value={person.updated_at}    icon={Calendar} />
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
// Persons grid
// ─────────────────────────────────────────────────────────────
function PersonsTable({ appliedFilters, debouncedSearch, personType, dateFrom, dateTo, onView }) {
  const searchActive = debouncedSearch.trim().length >= 2;
  const dateActive   = !!(dateFrom || dateTo);
  const isActive     = appliedFilters !== null || searchActive || dateActive || !!personType;
  const ef = appliedFilters || {};

  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tab4-persons', ef, debouncedSearch.trim(), personType, dateFrom, dateTo],
    queryFn: () => personsApi.getList({
      personType:   personType   || null,
      provinceCode: ef.province_code || null,
      districtCode: ef.district_code || null,
      nikayaCode:   ef.nikaya_code   || null,
      parshawaCode: ef.parshawa_code || null,
      search:       debouncedSearch.trim() || null,
      dateFrom:     dateFrom || null,
      dateTo:       dateTo   || null,
      limit: 300,
    }),
    enabled: isActive,
    keepPreviousData: true,
  });

  const persons = Array.isArray(data) ? data : [];
  // Reset to p.1 when results change
  useEffect(() => { setPage(1); }, [persons.length, debouncedSearch]);
  const pageData = persons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'reg_no', header: 'Reg. No.', render: v => v || '—' },
    {
      key: 'person_type',
      header: 'Type',
      render: v => {
        if (!v) return '—';
        const isBhikku = v === 'BHIKKU';
        return (
          <span className={`inline-block px-1.5 py-0.5 text-xs rounded border font-semibold ${
            isBhikku ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            {isBhikku ? 'භික්ෂු' : 'සිල්මෑ'}
          </span>
        );
      },
    },
    { key: 'name',          header: 'Name / නම',   render: v => v || '—' },
    { key: 'nikaya_name',   header: 'Nikaya',       render: v => v || '—' },
    { key: 'parshawa_name', header: 'Parshawa',     render: v => v || '—' },
    { key: 'vihara_name',   header: 'Vihara',       render: v => v || '—' },
    { key: 'district_name', header: 'District',     render: v => v || '—' },
    {
      key: 'updated_at',
      header: 'Updated',
      render: v => v
        ? <span className="text-xs text-gray-500">{v.slice(0, 10)}</span>
        : <span className="text-xs text-gray-300">—</span>,
    },
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

  const bhikkuCount   = persons.filter(p => p.person_type === 'BHIKKU').length;
  const silmathaCount = persons.filter(p => p.person_type === 'SILMATHA').length;

  return (
    <Card>
      <CardHeader
        title={`පුද්ගලයන් / Persons (${persons.length.toLocaleString()})`}
        subtitle={persons.length > PAGE_SIZE
          ? `භික්ෂු: ${bhikkuCount}  •  සිල්මෑනිය: ${silmathaCount}  |  Page ${page} of ${Math.ceil(persons.length / PAGE_SIZE)}`
          : `භික්ෂු: ${bhikkuCount}  •  සිල්මෑනිය: ${silmathaCount}`}
        icon={Users}
        action={
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        }
      />
      <CardContent className="p-0">
        <Table
          columns={columns}
          data={pageData}
          onRowClick={onView}
          idField="person_id"
          emptyMessage={
            debouncedSearch
              ? `No persons match "${debouncedSearch}"`
              : 'No persons found for selected filters'
          }
        />
        <Pagination current={page} total={persons.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Tab 4 component
// ─────────────────────────────────────────────────────────────
export function Tab4Persons() {
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchText, setSearchText]         = useState('');
  const [personType, setPersonType]         = useState('');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo,   setDateTo]               = useState('');
  const [profilePerson, setProfilePerson]   = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const showPrompt =
    appliedFilters === null &&
    debouncedSearch.trim().length < 2 &&
    !personType && !dateFrom && !dateTo;

  return (
    <div className="space-y-4">
      {/* Main filter panel */}
      <div className="no-print">
        <FilterPanelWithApply
          appliedFilters={appliedFilters || {}}
          onApply={setAppliedFilters}
          hideProvince
        />
      </div>

      {/* ── Extra filter row: person type + date range ── */}
      <div className="no-print flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[190px]">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            Person Type / වර්ගය
          </label>
          <select
            value={personType}
            onChange={e => setPersonType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          >
            <option value="">All / සියල්ල</option>
            <option value="BHIKKU">භික්ෂු (Bhikku)</option>
            <option value="SILMATHA">සිල්මෑනිය (Silmatha)</option>
          </select>
        </div>

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

        {(personType || dateFrom || dateTo) && (
          <button
            onClick={() => { setPersonType(''); setDateFrom(''); setDateTo(''); }}
            className="self-end mb-0.5 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="no-print relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search by name or reg. no… (min 2 chars)"
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
            <Users className="w-7 h-7 text-saffron-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Use filters or search to load records
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Select District / Nikaya and click{' '}
            <span className="text-saffron-600 font-medium">Display</span>,
            choose a person type, set a date range, or type at least 2 characters above.
          </p>
        </div>
      )}

      {/* Grid */}
      <PersonsTable
        appliedFilters={appliedFilters}
        debouncedSearch={debouncedSearch}
        personType={personType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onView={setProfilePerson}
      />

      {/* Profile modal */}
      {profilePerson && (
        <PersonProfileModal
          person={profilePerson}
          onClose={() => setProfilePerson(null)}
        />
      )}
    </div>
  );
}

export default Tab4Persons;
