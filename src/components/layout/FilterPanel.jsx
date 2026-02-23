import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building, Filter } from 'lucide-react';
import { lookupApi } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';

export function FilterPanel() {
  const { filters, setFilter, clearFilters } = useDashboard();

  // Fetch provinces
  const { data: provinces } = useQuery({
    queryKey: ['lookup-provinces'],
    queryFn: lookupApi.getProvinces,
  });

  // Fetch districts based on selected province
  const { data: districts } = useQuery({
    queryKey: ['lookup-districts', filters.province_code],
    queryFn: () => lookupApi.getDistricts(filters.province_code),
    enabled: !!filters.province_code,
  });

  // Fetch nikaya
  const { data: nikaya } = useQuery({
    queryKey: ['lookup-nikaya'],
    queryFn: lookupApi.getNikaya,
  });

  const handleProvinceChange = (e) => {
    const value = e.target.value ? e.target.value : null;
    setFilter({
      province_code: value,
      district_code: null, // Reset district when province changes
    });
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value ? e.target.value : null;
    setFilter({ district_code: value });
  };

  const handleNikayaChange = (e) => {
    const value = e.target.value ? e.target.value : null;
    setFilter({ nikaya_code: value });
  };

  const hasFilters = filters.province_code || filters.district_code || filters.nikaya_code;

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Icon */}
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Global Filters:</span>
          </div>

          {/* Province Select */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <select
              value={filters.province_code || ''}
              onChange={handleProvinceChange}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            >
              <option value="">All Provinces</option>
              {provinces?.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" />
            <select
              value={filters.district_code || ''}
              onChange={handleDistrictChange}
              disabled={!filters.province_code}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Districts</option>
              {districts?.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nikaya Select */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" />
            <select
              value={filters.nikaya_code || ''}
              onChange={handleNikayaChange}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            >
              <option value="">All Nikaya</option>
              {nikaya?.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-saffron-600 hover:text-saffron-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
