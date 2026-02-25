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
} from 'lucide-react';
import { templeApi } from '../../services/api';
import { useDashboard } from '../../context/DashboardContext';
import { Card, CardHeader, CardContent, Table, LoadingSection, Error } from '../common';

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

// Temple Basic Info
function TempleBasicInfo({ temple }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title={temple.vihara_name || 'Temple Profile'}
        subtitle={temple.vihara_name_en || ''}
        icon={Building}
      />
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField
            label="Registration Number"
            value={temple.reg_no}
            icon={Info}
          />
          <ProfileField
            label="Nikaya"
            value={temple.nikaya_name}
            icon={TreeDeciduous}
          />
          <ProfileField
            label="Parshawa"
            value={temple.parshawa_name}
            icon={Building}
          />
          <ProfileField
            label="Province"
            value={temple.province_name}
            icon={MapPin}
          />
          <ProfileField
            label="District"
            value={temple.district_name}
            icon={MapPin}
          />
          <ProfileField
            label="DS Division"
            value={temple.dvsec_name}
            icon={MapPin}
          />
          <ProfileField
            label="GN Division"
            value={temple.gn_name}
            icon={MapPin}
          />
          <ProfileField
            label="Phone"
            value={temple.phone}
            icon={Phone}
          />
          <ProfileField
            label="Email"
            value={temple.email}
            icon={Mail}
          />
          <ProfileField
            label="Established"
            value={temple.established_date}
            icon={Calendar}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Temple Address
function TempleAddress({ temple }) {
  const fullAddress = [
    temple.address_line1,
    temple.address_line2,
    temple.city,
    temple.postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card>
      <CardHeader title="Address" icon={MapPin} />
      <CardContent>
        <p className="text-gray-700">{fullAddress || 'Address not available'}</p>
        {temple.latitude && temple.longitude && (
          <a
            href={`https://maps.google.com/?q=${temple.latitude},${temple.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-saffron-600 hover:text-saffron-700"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// Temple Monks List
function TempleMonks({ templeId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['temple-monks', templeId],
    queryFn: () => templeApi.getMonks(templeId),
    enabled: !!templeId,
  });

  const columns = [
    {
      key: 'monk_name',
      header: 'Name / නම',
      render: (val, row) => (
        <div>
          <p className="font-medium">{val}</p>
          <p className="text-xs text-gray-500">{row.ordination_name}</p>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade' },
    { key: 'registration_no', header: 'Reg. No' },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <span
          className={`badge ${
            val === 'Active' ? 'badge-success' : 'badge-warning'
          }`}
        >
          {val || 'Unknown'}
        </span>
      ),
    },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Resident Monks"
        subtitle="භික්ෂූන් වහන්සේලා"
        icon={Users}
        action={
          <span className="text-sm text-gray-500">
            {data?.length || 0} monks
          </span>
        }
      />
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingSection height="200px" />
        ) : error ? (
          <div className="p-4">
            <Error message={error.message} />
          </div>
        ) : (
          <Table
            columns={columns}
            data={data || []}
            idField="monk_id"
            emptyMessage="No monks registered at this temple"
          />
        )}
      </CardContent>
    </Card>
  );
}

// Temple Arama Info
function TempleArama({ templeId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['temple-arama', templeId],
    queryFn: () => templeApi.getArama(templeId),
    enabled: !!templeId,
  });

  if (isLoading) return <LoadingSection height="200px" />;
  if (error) return <Error message={error.message} />;
  if (!data) return null;

  return (
    <Card>
      <CardHeader title="Arama Details" subtitle="ආරාම තොරතුරු" icon={TreeDeciduous} />
      <CardContent>
        <div className="space-y-3">
          <ProfileField label="Land Extent" value={data.land_extent} />
          <ProfileField label="Building Count" value={data.building_count} />
          <ProfileField label="Bodhi Tree" value={data.has_bodhi ? 'Yes' : 'No'} />
          <ProfileField label="Dagoba" value={data.has_dagoba ? 'Yes' : 'No'} />
          <ProfileField label="Image House" value={data.has_image_house ? 'Yes' : 'No'} />
        </div>
      </CardContent>
    </Card>
  );
}

// Chief Incumbent Info
function ChiefIncumbent({ temple }) {
  if (!temple.chief_incumbent_name) {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Chief Incumbent" subtitle="විහාරාධිපති" icon={User} />
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-saffron-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-saffron-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">
              {temple.chief_incumbent_name}
            </p>
            <p className="text-sm text-gray-500">
              {temple.chief_incumbent_title || 'Chief Incumbent'}
            </p>
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
        {/* Basic Info - Full width */}
        <TempleBasicInfo temple={temple || {}} />

        {/* Chief Incumbent */}
        <ChiefIncumbent temple={temple || {}} />

        {/* Address */}
        <TempleAddress temple={temple || {}} />

        {/* Arama Details */}
        <TempleArama templeId={templeId} />

        {/* Monks List - Full width */}
        <TempleMonks templeId={templeId} />
      </div>
    </div>
  );
}

export default Section4TempleProfile;
