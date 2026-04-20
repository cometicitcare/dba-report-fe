import axios from 'axios';

// Base URL from environment variable (Vite bakes this in at build time)
// .env:  VITE_API_BASE_URL=http://localhost:8000/api/v1
// Railway: set VITE_API_BASE_URL=https://your-backend.up.railway.app/api/v1
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ── Auth token helpers (sessionStorage clears on tab close) ──
const TOKEN_KEY = 'dba_access_token';

export const tokenStorage = {
  get: ()        => sessionStorage.getItem(TOKEN_KEY),
  set: (token)   => sessionStorage.setItem(TOKEN_KEY, token),
  clear: ()      => sessionStorage.removeItem(TOKEN_KEY),
  exists: ()     => !!sessionStorage.getItem(TOKEN_KEY),
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token + cache-bust
api.interceptors.request.use(
  (config) => {
    // Inject Bearer token on every request if available
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap data, handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload to show login
      tokenStorage.clear();
      window.location.reload();
    }
    const message =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// ============================================
// Section 1: Overall Dashboard Summary APIs
// ============================================

export const section1Api = {
  // Get complete Section 1 overview
  getOverview: (filters = {}) =>
    api.get('/section1/', { params: filters }),

  // Get Summary A - Types (Bhikkhu, High Education, Silmatha)
  getSummaryA: (filters = {}) =>
    api.get('/section1/types/', { params: filters }),

  // Get Summary B - By Nikaya
  getSummaryB: (filters = {}) =>
    api.get('/section1/nikaya/', { params: filters }),

  // Get Summary C - By Grades
  getSummaryC: (filters = {}) =>
    api.get('/section1/grades/', { params: filters }),
};

// ============================================
// Section 2: Detail Selection APIs
// ============================================

export const section2Api = {
  // Get complete Section 2 data
  getAll: (filters = {}) =>
    api.get('/section2/', { params: filters }),

  // Get Bhikku type details  
  getBhikkuTypes: (filters = {}) =>
    api.get('/section2/bikku-types/', { params: filters }),

  // Get Dahampasal summary
  getDahampasal: (filters = {}) =>
    api.get('/section2/dahampasal/', { params: filters }),

  // Get Dahampasal teachers
  getTeachers: (filters = {}) =>
    api.get('/section2/teachers/', { params: filters }),

  // Get Dahampasal students
  getStudents: (filters = {}) =>
    api.get('/section2/students/', { params: filters }),

  // Get Province summary
  getProvinces: (filters = {}) =>
    api.get('/section2/provinces/', { params: filters }),

  // Get District summary with province filter
  getDistricts: (provinceCode, filters = {}) =>
    api.get('/section2/districts/', { params: { province_code: provinceCode, ...filters } }),
};

// ============================================
// Section 3: Entity Selection APIs
// ============================================

export const section3Api = {
  // Get complete Section 3 data
  getAll: (filters = {}) =>
    api.get('/section3', { params: filters }),

  // Get Parshawa list
  getParshawa: (filters = {}) =>
    api.get('/section3/parshawa', { params: filters }),

  // Get SSBM organisations with vihara/bhikku/silmatha/arama counts
  getSsbmOrgList: ({ districtCode = null, dsCode = null, provinceCode = null } = {}) =>
    api.get('/section3/ssbm-org', {
      params: {
        ...(provinceCode  ? { province_code:  provinceCode  } : {}),
        ...(districtCode  ? { district_code:  districtCode  } : {}),
        ...(dsCode        ? { ds_code:        dsCode        } : {}),
      },
    }),

  // Get SSBM (Sasanarakshana) list
  getSsbm: (filters = {}) =>
    api.get('/section3/ssbm', { params: filters }),

  // Get Divisional Secretariats
  getDivisionalSecretariat: (districtCode, filters = {}) =>
    api.get('/section3/divisional-secretariat', { params: { district_code: districtCode, ...filters } }),

  // Get GN Divisions
  getGnDivisions: (dsCode, filters = {}) =>
    api.get('/section3/gn', { params: { ds_code: dsCode, ...filters } }),

  // Get Temple list (by gn_code)
  getTemples: (gnCode, filters = {}) =>
    api.get('/section3/temples', { params: { gn_code: gnCode, ...filters } }),

  // Get all temples with optional filters + optional free-text search + date range
  getAllTemples: (filters = {}, search = null, typeCode = null, dateFrom = null, dateTo = null) =>
    api.get('/section3/temples', {
      params: {
        ...filters,
        ...(search   ? { search }              : {}),
        ...(typeCode ? { grade: typeCode }     : {}),
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo   ? { date_to:   dateTo   } : {}),
      },
    }),
};

// ============================================
// Section 4: Temple Profile APIs
// ============================================

export const templeApi = {
  // Get temple profile by ID
  getProfile: (templeId) =>
    api.get(`/temples/${templeId}`),

  // Get temple statistics (bikku count, ssbm, etc.)
  getStatistics: (templeId) =>
    api.get(`/temples/${templeId}/statistics`),

  // Search temples — uses GET /temples/ with search param
  search: (query, limit = 20) =>
    api.get('/temples/', { params: { search: query, page_size: limit } }),
};

// ============================================
// Lookup APIs
// ============================================

export const lookupApi = {
  // Get all provinces
  getProvinces: () => api.get('/lookups/provinces'),

  // Get districts by province
  getDistricts: (provinceCode) =>
    api.get('/lookups/districts', { params: { province_code: provinceCode } }),

  // Get all nikaya
  getNikaya: () => api.get('/lookups/nikaya'),

  // Get parshawa by nikaya
  getParshawa: (nikayaCode) =>
    api.get('/lookups/parshawa', { params: { nikaya_code: nikayaCode } }),

  // Get divisional secretariats — accepts district_code OR ssbm_code for cascade
  getDivisionalSecretariats: ({ districtCode = null, ssbmCode = null } = {}) =>
    api.get('/lookups/divisional-secretariat', {
      params: {
        ...(ssbmCode    ? { ssbm_code:     ssbmCode    } : {}),
        ...(districtCode ? { district_code: districtCode } : {}),
      },
    }),

  // Get GN divisions — accepts ds_code OR ssbm_code for cascade
  getGnDivisions: ({ dsCode = null, ssbmCode = null } = {}) =>
    api.get('/lookups/gn', {
      params: {
        ...(dsCode   ? { ds_code:   dsCode   } : {}),
        ...(ssbmCode ? { ssbm_code: ssbmCode } : {}),
      },
    }),

  // Get SSBM organizations — accepts district_code OR ds_code for cascade
  getSsbmList: ({ districtCode = null, dsCode = null } = {}) =>
    api.get('/lookups/ssbm', {
      params: {
        ...(dsCode       ? { ds_code:       dsCode       } : {}),
        ...(districtCode ? { district_code: districtCode } : {}),
      },
    }),

  // Get vihara grades
  getGrades: () => api.get('/lookups/grades'),

  // Get distinct vihara/arama types (vh_typ) from vihaddata
  getViharaTypes: () => api.get('/lookups/vihara-types'),

  // Get bhikku types (registration categories)
  getBhikkuTypes: () => api.get('/lookups/bhikku-types'),
};

// ============================================
// Persons API (Bhikku, Silmatha, etc.)
// ============================================

export const personsApi = {
  // Get combined bhikku + silmatha list with filters
  getList: ({
    personType   = null,
    provinceCode = null,
    districtCode = null,
    nikayaCode   = null,
    parshawaCode = null,
    search       = null,
    dateFrom     = null,
    dateTo       = null,
    limit        = 200,
  } = {}) =>
    api.get('/persons', {
      params: {
        ...(personType   ? { person_type:   personType   } : {}),
        ...(provinceCode ? { province_code: provinceCode } : {}),
        ...(districtCode ? { district_code: districtCode } : {}),
        ...(nikayaCode   ? { nikaya_code:   nikayaCode   } : {}),
        ...(parshawaCode ? { parshawa_code: parshawaCode } : {}),
        ...(search       ? { search }                      : {}),
        ...(dateFrom     ? { date_from:     dateFrom     } : {}),
        ...(dateTo       ? { date_to:       dateTo       } : {}),
        limit,
      },
    }),
};

export const dashboardApi = {
  // Get complete dashboard data
  getAll: (filters = {}) =>
    api.get('/dashboard', { params: filters }),

  // Get summary stats
  getStats: () => api.get('/dashboard/stats'),

  // Refresh materialized views (admin only)
  refreshViews: () => api.post('/dashboard/refresh-views'),
};

// ============================================
// Auth API (public — no token needed)
// ============================================

export const authApi = {
  /**
   * Login with username + password.
   * FastAPI OAuth2 expects application/x-www-form-urlencoded.
   */
  login: (username, password) => {
    const body = new URLSearchParams({ username, password });
    return axios.post(`${BASE_URL}/auth/login`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => res.data);
  },

  /** Verify current token and return logged-in user info. */
  me: () => api.get('/auth/me'),
};

export default api;
