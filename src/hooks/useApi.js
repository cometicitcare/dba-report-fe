import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { section1Api, section2Api, section3Api, templeApi, dashboardApi } from '../services/api';

// ============================================
// Section 1 Hooks
// ============================================

export function useSection1Overview(filters = {}) {
  return useQuery({
    queryKey: ['section1-overview', filters],
    queryFn: () => section1Api.getOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSummaryA(filters = {}) {
  return useQuery({
    queryKey: ['section1-summary-a', filters],
    queryFn: () => section1Api.getSummaryA(filters),
  });
}

export function useSummaryB(filters = {}) {
  return useQuery({
    queryKey: ['section1-summary-b', filters],
    queryFn: () => section1Api.getSummaryB(filters),
  });
}

export function useSummaryC(filters = {}) {
  return useQuery({
    queryKey: ['section1-summary-c', filters],
    queryFn: () => section1Api.getSummaryC(filters),
  });
}

// ============================================
// Section 2 Hooks
// ============================================

export function useSection2Data(filters = {}) {
  return useQuery({
    queryKey: ['section2', filters],
    queryFn: () => section2Api.getAll(filters),
  });
}

export function useBhikkuTypes(filters = {}) {
  return useQuery({
    queryKey: ['section2-bhikku-types', filters],
    queryFn: () => section2Api.getBhikkuTypes(filters),
  });
}

export function useProvinces(filters = {}) {
  return useQuery({
    queryKey: ['section2-provinces', filters],
    queryFn: () => section2Api.getProvinces(filters),
  });
}

export function useDistricts(provinceId, filters = {}) {
  return useQuery({
    queryKey: ['section2-districts', provinceId, filters],
    queryFn: () => section2Api.getDistricts(provinceId, filters),
    enabled: !!provinceId,
  });
}

// ============================================
// Section 3 Hooks
// ============================================

export function useParshawa(filters = {}) {
  return useQuery({
    queryKey: ['section3-parshawa', filters],
    queryFn: () => section3Api.getParshawa(filters),
  });
}

export function useSsbm(parshawaId, filters = {}) {
  return useQuery({
    queryKey: ['section3-ssbm', parshawaId, filters],
    queryFn: () => section3Api.getSsbm(parshawaId, filters),
    enabled: !!parshawaId,
  });
}

export function useDivisionalSecretariat(districtId, filters = {}) {
  return useQuery({
    queryKey: ['section3-dvsec', districtId, filters],
    queryFn: () => section3Api.getDivisionalSecretariat(districtId, filters),
    enabled: !!districtId,
  });
}

export function useGnDivisions(dvsecId, filters = {}) {
  return useQuery({
    queryKey: ['section3-gn', dvsecId, filters],
    queryFn: () => section3Api.getGnDivisions(dvsecId, filters),
    enabled: !!dvsecId,
  });
}

export function useTempleList(gnId, filters = {}) {
  return useQuery({
    queryKey: ['section3-temples', gnId, filters],
    queryFn: () => section3Api.getTemples(gnId, filters),
    enabled: !!gnId,
  });
}

// ============================================
// Temple Profile Hooks
// ============================================

export function useTempleProfile(templeId) {
  return useQuery({
    queryKey: ['temple-profile', templeId],
    queryFn: () => templeApi.getProfile(templeId),
    enabled: !!templeId,
  });
}

export function useTempleStatistics(templeId) {
  return useQuery({
    queryKey: ['temple-stats', templeId],
    queryFn: () => templeApi.getStatistics(templeId),
    enabled: !!templeId,
  });
}

export function useTempleSearch(query, limit = 20) {
  return useQuery({
    queryKey: ['temple-search', query],
    queryFn: () => templeApi.search(query, limit),
    enabled: query?.length >= 2,
  });
}

// ============================================
// Dashboard Hooks
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRefreshViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.refreshViews,
    onSuccess: () => {
      // Invalidate all queries to refetch fresh data
      queryClient.invalidateQueries();
    },
  });
}
