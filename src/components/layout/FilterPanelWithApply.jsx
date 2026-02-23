import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Play, X } from 'lucide-react';
import { lookupApi } from '../../services/api';

// A labelled select dropdown
function FilterSelect({ label, value, onChange, options, disabled, placeholder }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[140px]">
      <label className="text-xs text-gray-500 font-medium px-0.5">{label}</label>
      <select
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        <option value="">{placeholder || `All ${label}`}</option>
        {(options || []).map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * FilterPanelWithApply — full bidirectional cascading filter.
 *
 * Cascade rules:
 *   Province  → District → DS → GN          (forward geographic chain)
 *   District  → SSBM                         (SSBM filtered by district)
 *   DS        → SSBM, GN                     (SSBM & GN filtered by DS)
 *   SSBM      → DS, GN                       (DS & GN filtered by SSBM when selected)
 *   Nikaya    → Parshawa                      (ecclesiastical chain)
 *
 * Selections are only applied to parent when Display is clicked.
 */
export function FilterPanelWithApply({ onApply, appliedFilters = {}, hideProvince = false }) {
  const [pending, setPending] = useState({
    province_code: appliedFilters.province_code || null,
    district_code: appliedFilters.district_code || null,
    nikaya_code:   appliedFilters.nikaya_code   || null,
    parshawa_code: appliedFilters.parshawa_code || null,
    grade:         appliedFilters.grade         || null,
    ds_code:       appliedFilters.ds_code       || null,
    gn_code:       appliedFilters.gn_code       || null,
    ssbm_code:     appliedFilters.ssbm_code     || null,
  });

  // Update one field + cascade-reset dependents
  const set = (field, value, reset = {}) =>
    setPending(p => ({ ...p, [field]: value || null, ...reset }));

  // ── Cascade-enable flags ──────────────────────────────────────
  // DS: enabled when district selected (forward) OR SSBM selected (reverse)
  const dsEnabled   = !!(pending.district_code || pending.ssbm_code);
  // GN: enabled when DS is selected (forward) OR SSBM is selected (reverse)
  const gnEnabled   = !!(pending.ds_code || pending.ssbm_code);
  // SSBM: enabled when district or DS is selected
  const ssbmEnabled = !!(pending.district_code || pending.ds_code);
  // District: always enabled when hideProvince=true; otherwise needs province
  const districtEnabled = hideProvince || !!pending.province_code;

  // ── Lookup queries ───────────────────────────────────────────
  const { data: provinces } = useQuery({
    queryKey: ['lk-prov'],
    queryFn: lookupApi.getProvinces,
    enabled: !hideProvince,
  });

  // When hideProvince: load ALL districts unconditionally
  const { data: districts } = useQuery({
    queryKey: hideProvince ? ['lk-dist-all'] : ['lk-dist', pending.province_code],
    queryFn: () => lookupApi.getDistricts(hideProvince ? null : pending.province_code),
    enabled: hideProvince ? true : !!pending.province_code,
  });

  const { data: nikayaList } = useQuery({
    queryKey: ['lk-nikaya'],
    queryFn: lookupApi.getNikaya,
  });

  const { data: parshawaList } = useQuery({
    queryKey: ['lk-parshawa', pending.nikaya_code],
    queryFn: () => lookupApi.getParshawa(pending.nikaya_code),
    enabled: !!pending.nikaya_code,
  });

  const { data: grades } = useQuery({
    queryKey: ['lk-grades'],
    queryFn: lookupApi.getGrades,
  });

  // DS list — filtered by SSBM (reverse) OR by district (forward).
  // When SSBM is selected it takes priority so the user sees only DS offices
  // that have temples belonging to that SSBM.
  const { data: dsList } = useQuery({
    queryKey: ['lk-ds', pending.district_code, pending.ssbm_code],
    queryFn: () => lookupApi.getDivisionalSecretariats({
      ssbmCode:     pending.ssbm_code    || null,
      districtCode: pending.district_code || null,
    }),
    enabled: dsEnabled,
  });

  // GN list — filtered by DS (preferred / more specific) OR by SSBM directly.
  const { data: gnList } = useQuery({
    queryKey: ['lk-gn', pending.ds_code, pending.ssbm_code],
    queryFn: () => lookupApi.getGnDivisions({
      dsCode:   pending.ds_code   || null,
      ssbmCode: !pending.ds_code ? (pending.ssbm_code || null) : null,
    }),
    enabled: gnEnabled,
  });

  // SSBM list — filtered by DS (most specific) OR by district.
  const { data: ssbmList } = useQuery({
    queryKey: ['lk-ssbm', pending.district_code, pending.ds_code],
    queryFn: () => lookupApi.getSsbmList({
      dsCode:       pending.ds_code       || null,
      districtCode: pending.district_code || null,
    }),
    enabled: ssbmEnabled,
  });

  // ── Map to <option> items ────────────────────────────────────
  const opt = (arr, vk, lk) =>
    (arr || []).map(o => ({ value: o[vk], label: o[lk] || o[vk] }));

  const isFiltered = Object.values(appliedFilters).some(Boolean);

  const handleClear = () => {
    const empty = {
      province_code: null, district_code: null, nikaya_code: null,
      parshawa_code: null, grade: null, ds_code: null, gn_code: null,
      ssbm_code: null,
    };
    setPending(empty);
    onApply(empty);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-100">
        <Filter className="w-4 h-4 text-saffron-500" />
        <span className="text-sm font-semibold text-gray-700">Global Filters</span>
        {isFiltered && (
          <span className="ml-1 px-2 py-0.5 bg-saffron-50 text-saffron-700 text-xs rounded-full font-medium">
            Active
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Row 1 — Geographic */}
        <div className="flex flex-wrap gap-3 items-end">
          {!hideProvince && (
            <FilterSelect
              label="Province / පළාත"
              value={pending.province_code}
              onChange={e =>
                set('province_code', e.target.value, {
                  district_code: null, ds_code: null, gn_code: null, ssbm_code: null,
                })
              }
              options={opt(provinces, 'code', 'name')}
              placeholder="All Provinces"
            />
          )}
          <FilterSelect
            label="District / දිස්ත්‍රික්කය"
            value={pending.district_code}
            onChange={e =>
              set('district_code', e.target.value, {
                ds_code: null, gn_code: null, ssbm_code: null,
              })
            }
            options={opt(districts, 'code', 'name')}
            disabled={!districtEnabled}
            placeholder="All Districts"
          />
          {/*
            DS: forward cascade from District, OR reverse cascade from SSBM.
            Options reload filtered by SSBM when SSBM is picked without District.
          */}
          <FilterSelect
            label="Div. Secretariat / ප්‍රා.ලේ."
            value={pending.ds_code}
            onChange={e =>
              set('ds_code', e.target.value, { gn_code: null })
            }
            options={opt(dsList, 'code', 'name')}
            disabled={!dsEnabled}
            placeholder="All DS"
          />
          {/*
            GN: forward cascade from DS, OR reverse cascade from SSBM.
            When DS is chosen, GN is filtered by DS (preferred).
            When only SSBM is chosen, GN is filtered by SSBM temples.
          */}
          <FilterSelect
            label="GN Division / ග්‍රා.නි."
            value={pending.gn_code}
            onChange={e => set('gn_code', e.target.value)}
            options={opt(gnList, 'code', 'name')}
            disabled={!gnEnabled}
            placeholder="All GN"
          />
        </div>

        {/* Row 2 — Ecclesiastical + SSBM + Grade */}
        <div className="flex flex-wrap gap-3 items-end">
          <FilterSelect
            label="Nikaya / නිකාය"
            value={pending.nikaya_code}
            onChange={e =>
              set('nikaya_code', e.target.value, { parshawa_code: null })
            }
            options={opt(nikayaList, 'code', 'name')}
            placeholder="All Nikaya"
          />
          <FilterSelect
            label="Parshawa / පාර්ශවය"
            value={pending.parshawa_code}
            onChange={e => set('parshawa_code', e.target.value)}
            options={opt(parshawaList, 'code', 'name')}
            disabled={!pending.nikaya_code}
            placeholder="All Parshawa"
          />
          {/*
            SSBM: enabled when District OR DS is selected.
            Options are filtered by DS (more specific) or by District.
            Selecting SSBM resets DS & GN so they reload filtered by SSBM's temples.
          */}
          <FilterSelect
            label="SSBM / ශාසනරක්ෂණ"
            value={pending.ssbm_code}
            onChange={e =>
              set('ssbm_code', e.target.value, { ds_code: null, gn_code: null })
            }
            options={opt(ssbmList, 'code', 'name')}
            disabled={!ssbmEnabled}
            placeholder="All SSBM"
          />
          <FilterSelect
            label="Grade / ශ්‍රේණිය"
            value={pending.grade}
            onChange={e => set('grade', e.target.value)}
            options={opt(grades, 'code', 'name')}
            placeholder="All Grades"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
          <button
            onClick={() => onApply({ ...pending })}
            className="inline-flex items-center gap-2 px-5 py-2 bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Display
          </button>
          {isFiltered && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterPanelWithApply;

