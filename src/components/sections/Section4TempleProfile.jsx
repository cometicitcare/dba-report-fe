import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building,
  MapPin,
  Users,
  Phone,
  Mail,
  Calendar,
  TreeDeciduous,
  Info,
  ArrowLeft,
  User,
  Home,
  Hash,
} from 'lucide-react';
import { templeApi } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';
import { Card, CardHeader, CardContent, LoadingSection, Error } from '../common';

// Profile Field Component
function ProfileField({ label, value, icon: Icon }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

// Temple Basic Info — reads from nested BE response (general_info + location)
function TempleBasicInfo({ temple }) {
  const g = temple.general_info || {};
  const l = temple.location || {};
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title={g.name || 'Temple Profile'}
        subtitle={`Grade: ${temple.grade || 'N/A'} · Status: ${temple.workflow_status || 'N/A'}`}
        icon={Building}
      />
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField label="Registration No"      value={g.registration_no || g.temple_trn} icon={Hash} />
          <ProfileField label="Nikaya"               value={g.nikaya}                           icon={TreeDeciduous} />
          <ProfileField label="Parshawa"             value={g.parshawa}                         icon={Building} />
          <ProfileField label="Province"             value={l.province_name}                    icon={MapPin} />
          <ProfileField label="District"             value={l.district_name}                    icon={MapPin} />
          <ProfileField label="Divisional Sec."      value={l.divisional_secretariat}           icon={MapPin} />
          <ProfileField label="GN Division"          value={l.gn_division}                      icon={Home} />
          <ProfileField label="Phone"                value={g.mobile}                           icon={Phone} />
          <ProfileField label="Email"                value={g.email}                            icon={Mail} />
          <ProfileField label="Established"          value={g.period_established}               icon={Calendar} />
          <ProfileField label="Address"              value={g.address}                          icon={MapPin} />
          <ProfileField label="Dayaka Sabah"         value={temple.viharanga?.dayaka_sabha}      icon={Users} />
        </div>
      </CardContent>
    </Card>
  );
}

// Viharanga (Buildings & Associations)
function TempleViharanga({ viharanga }) {
  const v = viharanga || {};
  const hasData = Object.values(v).some(Boolean);
  return (
    <Card>
      <CardHeader title="Viharanga / Buildings" subtitle="ගොඩනැගිලි හා සංවිධාන" icon={Building} />
      <CardContent>
        {hasData ? (
          <div className="space-y-1">
            <ProfileField label="Buildings"              value={v.buildings_description} />
            <ProfileField label="Dayaka Families"        value={v.dayaka_families_count} />
            <ProfileField label="Kulangana Committee"    value={v.kulangana_committee} />
            <ProfileField label="Dayaka Sabha"           value={v.dayaka_sabha} />
            <ProfileField label="Temple Working Cmte"    value={v.temple_working_committee} />
            <ProfileField label="Other Associations"     value={v.other_associations} />
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No building information recorded</p>
        )}
      </CardContent>
    </Card>
  );
}

// Temple Statistics — uses /statistics endpoint (bikku count, SSBM flag)
function TempleStats({ templeId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['temple-stats', templeId],
    queryFn: () => templeApi.getStatistics(templeId),
    enabled: !!templeId,
  });

  const stats = data || {};

  return (
    <Card>
      <CardHeader title="Temple Statistics" subtitle="ශ්‍රී ලංකා" icon={Users} />
      <CardContent>
        {isLoading ? (
          <LoadingSection height="100px" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Resident Bhikku', value: stats.bikku_count ?? 0 },
              { label: 'Silmatha',         value: stats.silmatha_count ?? 0 },
              { label: 'SSBM',             value: stats.has_ssbm ? 'Yes' : 'No' },
              { label: 'Dahampasal',       value: stats.dahampasal_teachers_count > 0 ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-800 tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dahampasal Info — reads from profile response (no separate API call needed)
function DahampasalInfo({ dahampasal }) {
  const d = dahampasal || {};
  return (
    <Card>
      <CardHeader title="Dahampasal" subtitle="ධර්ම පාසල" icon={TreeDeciduous} />
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Teachers', value: d.teachers_count ?? 0 },
            { label: 'Students', value: d.students_count ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        {d.dahampasal_name && (
          <p className="mt-3 text-sm text-gray-600">{d.dahampasal_name}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Chief Incumbent Info — reads from general_info.viharadhipathi_name
function ChiefIncumbent({ generalInfo }) {
  const name = generalInfo?.viharadhipathi_name;
  const regn = generalInfo?.viharadhipathi_regn;
  if (!name) return null;

  return (
    <Card>
      <CardHeader title="Chief Incumbent" subtitle="විහාරාධිපති" icon={User} />
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-saffron-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-saffron-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{name}</p>
            {regn && <p className="text-sm text-gray-500">Reg. No: {regn}</p>}
            <p className="text-xs text-gray-400 mt-0.5">Viharadhipathi</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Section 4 Component
export function Section4TempleProfile() {
  const { section4, resetFlow, setActiveSection } = useDashboard();
  const { templeId } = section4;

  const { data: temple, isLoading, error, refetch } = useQuery({
    queryKey: ['temple-profile', templeId],
    queryFn: () => templeApi.getProfile(templeId),
    enabled: !!templeId,
  });

  const handleBack = () => {
    setActiveSection(3);
  };

  if (!templeId) {
    return (
      <div className="space-y-4">
        <div className="section-header">
          <span className="section-number">4</span>
          <span>TEMPLE PROFILE</span>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a temple from Section 3 to view its profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="section-header">
          <span className="section-number">4</span>
          <span>TEMPLE PROFILE</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingSection height="250px" />
          <LoadingSection height="250px" />
          <div className="lg:col-span-2">
            <LoadingSection height="300px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="section-header">
          <span className="section-number">4</span>
          <span>TEMPLE PROFILE</span>
        </div>
        <Error message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="section-header mb-0">
          <span className="section-number">4</span>
          <span>TEMPLE PROFILE</span>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Selection
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Basic Info - spans 2 cols */}
        <TempleBasicInfo temple={temple || {}} />

        {/* Chief Incumbent */}
        <ChiefIncumbent generalInfo={temple?.general_info} />

        {/* Temple Statistics (bikku count, SSBM, etc.) */}
        <TempleStats templeId={templeId} />

        {/* Dahampasal */}
        <DahampasalInfo dahampasal={temple?.dahampasal} />

        {/* Viharanga — buildings & associations, spans 2 cols */}
        <div className="lg:col-span-2">
          <TempleViharanga viharanga={temple?.viharanga} />
        </div>
      </div>
    </div>
  );
}

export default Section4TempleProfile;
