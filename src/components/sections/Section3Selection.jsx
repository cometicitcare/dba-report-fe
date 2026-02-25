import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, MapPin, Home, TreeDeciduous, ChevronRight } from 'lucide-react';
import { section3Api } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';
import { Card, CardHeader, CardContent, Table, LoadingSection, Error } from '../common';

const num = (v) => (v ?? 0).toLocaleString();

// Parshawa List — only shown when province/district/nikaya is selected
function ParshawaList({ onSelect, selectedParshawa, appliedFilters }) {
  const nikayaCode = appliedFilters?.nikaya_code;
  const hasGeo = !!(appliedFilters?.province_code || appliedFilters?.district_code || nikayaCode);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'section3-parshawa',
      appliedFilters?.province_code,
      appliedFilters?.district_code,
      appliedFilters?.nikaya_code,
    ],
    queryFn: () => section3Api.getParshawa({
      nikaya_code: nikayaCode,
      province_code: appliedFilters?.province_code,
      district_code: appliedFilters?.district_code,
    }),
    enabled: hasGeo,
  });

  const columns = [
    { key: 'parshawa_name',  header: 'Parshawa / පාර්ශවය' },
    { key: 'vihara_count',  header: 'Vihara',   render: num },
    { key: 'bhikku_count',  header: 'Bhikku',   render: num },
    { key: 'silmatha_count',header: 'Silmatha', render: num },
    { key: 'arama_count',   header: 'Arama',    render: num },
  ];

  if (!hasGeo) {
    return (
      <Card>
        <CardHeader title="Parshawa" icon={Building} />
        <CardContent>
          <p className="text-gray-500 text-center py-8 text-sm">Select Province, District or Nikaya first</p>
        </CardContent>
      </Card>
    );
  }

  return (
/*     <Card>
      <CardHeader title="Parshawa" subtitle="ස්ථානය අනුව" icon={Building} />
      <CardContent className="p-0 max-h-64 overflow-y-auto">
        <Table
          columns={columns}
          data={data || []}
          onRowClick={(row) => onSelect('selectedParshawa', row.parshawa_code)}
          activeRowId={selectedParshawa}
          idField="parshawa_code"
          loading={isLoading}
          emptyMessage="No parshawa data"
        />
      </CardContent>
    </Card> */
    ''
  );
}

// SSBM List — shows SSBM orgs with vihara/bhikku/silmatha/arama counts
function SsbmList({ onSelect, selectedSsbm, appliedFilters }) {
  const districtCode  = appliedFilters?.district_code;
  const dsCode        = appliedFilters?.ds_code;
  const provinceCode  = appliedFilters?.province_code;
  const isEnabled = !!(districtCode || dsCode);

  const { data, isLoading } = useQuery({
    queryKey: ['section3-ssbm-org', provinceCode, districtCode, dsCode],
    queryFn: () => section3Api.getSsbmOrgList({ provinceCode, districtCode, dsCode }),
    enabled: isEnabled,
  });

  const columns = [
    { key: 'ssbm_name',      header: 'SSBM / ශාසනරක්ෂක සභා' },
    { key: 'vihara_count',   header: 'Vihara',   render: num },
    { key: 'bhikku_count',   header: 'Bhikku',   render: num },
    { key: 'silmatha_count', header: 'Silmatha', render: num },
    { key: 'arama_count',    header: 'Arama',    render: num },
  ];

  if (!isEnabled) {
    return (
/*       <Card>
        <CardHeader title="SSBM" subtitle="ශාසනරක්ෂක සභා" icon={TreeDeciduous} />
        <CardContent>
          <p className="text-gray-500 text-center py-8 text-sm">Select a District or Div. Secretariat first</p>
        </CardContent>
      </Card> */
      ''
    );
  }

  return (
   /*  <Card>
      <CardHeader title="SSBM" subtitle="ශාසනරක්ෂක සභා" icon={TreeDeciduous} />
      <CardContent className="p-0 max-h-64 overflow-y-auto">
        <Table
          columns={columns}
          data={data || []}
          onRowClick={(row) => onSelect('selectedSsbm', row.ssbm_code)}
          activeRowId={selectedSsbm}
          idField="ssbm_code"
          loading={isLoading}
          emptyMessage="No SSBM data for selected area"
        />
      </CardContent>
    </Card> */
    ''
  );
}

// Divisional Secretariat List — based on selected district
function DvsecList({ onSelect, selectedDvsec, appliedFilters }) {
  const districtCode = appliedFilters?.district_code;

  const { data, isLoading } = useQuery({
    queryKey: ['section3-dvsec', districtCode],
    queryFn: () => section3Api.getDivisionalSecretariat(districtCode),
    enabled: !!districtCode,
  });

  const columns = [
    { key: 'ds_name',       header: 'Div. Secretariat / ප්‍රා.ලේ.' },
    { key: 'vihara_count',  header: 'Vihara',   render: num },
    { key: 'bhikku_count',  header: 'Bhikku',   render: num },
    { key: 'silmatha_count',header: 'Silmatha', render: num },
    { key: 'arama_count',   header: 'Arama',    render: num },
  ];

  if (!districtCode) {
    return (
      <Card>
        <CardHeader title="Divisional Secretariat" icon={MapPin} />
        <CardContent>
          <p className="text-gray-500 text-center py-8 text-sm">Select a District first</p>
        </CardContent>
      </Card>
    );
  }

  return (
   /*  <Card>
      <CardHeader title="Divisional Secretariat" subtitle="ප්‍රාදේශීය ලේකම් කොට්ඨාස" icon={MapPin} />
      <CardContent className="p-0 max-h-64 overflow-y-auto">
        <Table
          columns={columns}
          data={data || []}
          onRowClick={(row) => onSelect('selectedDvsec', row.ds_code)}
          activeRowId={selectedDvsec}
          idField="ds_code"
          loading={isLoading}
          emptyMessage="No data"
        />
      </CardContent>
    </Card> */
    ''
  );
}

// GN Division List — activates from global filter ds_code OR from a DS row click
function GnList({ onSelect, selectedGn, dvsecId, appliedFilters }) {
  // Prefer: row-click selection, fallback to global filter ds_code
  const effectiveDsCode = dvsecId || appliedFilters?.ds_code || null;

  const { data, isLoading } = useQuery({
    queryKey: ['section3-gn', effectiveDsCode],
    queryFn: () => section3Api.getGnDivisions(effectiveDsCode),
    enabled: !!effectiveDsCode,
  });

  const columns = [
    { key: 'gn_name',       header: 'GN Division / ග්‍රා.නි.' },
    { key: 'vihara_count',  header: 'Vihara',   render: num },
    { key: 'bhikku_count',  header: 'Bhikku',   render: num },
    { key: 'silmatha_count',header: 'Silmatha', render: num },
    { key: 'arama_count',   header: 'Arama',    render: num },
  ];

/*   if (!effectiveDsCode) {
    return (
      <Card>
        <CardHeader title="GN Division" subtitle="ග්‍රාම නිලධාරි වසම" icon={Home} />
        <CardContent>
          <p className="text-gray-500 text-center py-8 text-sm">Select a Div. Secretariat first</p>
        </CardContent>
      </Card>
    );
  } */

  return (
/*     <Card>
      <CardHeader title="GN Division" subtitle="ග්‍රාම නිලධාරි වසම" icon={Home} />
      <CardContent className="p-0 max-h-64 overflow-y-auto">
        <Table
          columns={columns}
          data={data || []}
          onRowClick={(row) => onSelect('selectedGn', row.gn_code)}
          activeRowId={selectedGn}
          idField="gn_code"
          loading={isLoading}
          emptyMessage="No GN divisions for selected area"
        />
      </CardContent>
    </Card> */
    ''
  );
}

// Main Section 3 Component
export function Section3Selection({ appliedFilters = {} }) {
  const { section3, selectSection3 } = useDashboard();

  const handleSelect = (key, value) => {
    const currentValue = section3[key];
    const newValue = currentValue === value ? null : value;

    const updates = { [key]: newValue };
    if (key === 'selectedParshawa') updates.selectedSsbm = null;
    if (key === 'selectedDvsec')    updates.selectedGn   = null;

    selectSection3(updates);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Parshawa — needs Province/District/Nikaya */}
        <ParshawaList
          onSelect={handleSelect}
          selectedParshawa={section3.selectedParshawa}
          appliedFilters={appliedFilters}
        />

        {/* SSBM — needs District */}
        <SsbmList
          onSelect={handleSelect}
          selectedSsbm={section3.selectedSsbm}
          appliedFilters={appliedFilters}
        />

        {/* Divisional Secretariat — needs District */}
        <DvsecList
          onSelect={handleSelect}
          selectedDvsec={section3.selectedDvsec}
          appliedFilters={appliedFilters}
        />

        {/* GN Division — needs selectedDvsec (row click) OR appliedFilters.ds_code (global) */}
        <GnList
          onSelect={handleSelect}
          selectedGn={section3.selectedGn}
          dvsecId={section3.selectedDvsec}
          appliedFilters={appliedFilters}
        />
      </div>
    </div>
  );
}

export default Section3Selection;
