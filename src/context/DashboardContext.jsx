import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  // Global filters
  filters: {
    provinceId: null,
    districtId: null,
    nikayaId: null,
  },

  // Section 1 selections
  section1: {
    selectedType: null, // 'bhikku', 'high_education', 'silmatha'
    selectedNikaya: null,
    selectedGrade: null,
  },

  // Section 2 selections
  section2: {
    selectedBhikkuType: null,
    selectedDahampasal: null,
    selectedProvince: null,
    selectedDistrict: null,
  },

  // Section 3 selections
  section3: {
    selectedParshawa: null,
    selectedSsbm: null,
    selectedDvsec: null,
    selectedGn: null,
    selectedTemple: null,
  },

  // Section 4 - Temple profile
  section4: {
    templeId: null,
    templeData: null,
  },

  // UI state
  ui: {
    activeSection: 1,
    isLoading: false,
    error: null,
  },
};

// Action types
const ActionTypes = {
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SELECT_SECTION1: 'SELECT_SECTION1',
  SELECT_SECTION2: 'SELECT_SECTION2',
  SELECT_SECTION3: 'SELECT_SECTION3',
  SET_TEMPLE: 'SET_TEMPLE',
  SET_ACTIVE_SECTION: 'SET_ACTIVE_SECTION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_FLOW: 'RESET_FLOW',
};

// Reducer
function dashboardReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ActionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    case ActionTypes.SELECT_SECTION1:
      return {
        ...state,
        section1: {
          ...state.section1,
          ...action.payload,
        },
        // Clear downstream selections when Section 1 changes
        section2: initialState.section2,
        section3: initialState.section3,
        section4: initialState.section4,
      };

    case ActionTypes.SELECT_SECTION2:
      return {
        ...state,
        section2: {
          ...state.section2,
          ...action.payload,
        },
        // Clear Section 3 and 4 when Section 2 changes
        section3: initialState.section3,
        section4: initialState.section4,
      };

    case ActionTypes.SELECT_SECTION3:
      return {
        ...state,
        section3: {
          ...state.section3,
          ...action.payload,
        },
        // Clear Section 4 when Section 3 changes (unless selecting temple)
        ...(action.payload.selectedTemple
          ? {}
          : { section4: initialState.section4 }),
      };

    case ActionTypes.SET_TEMPLE:
      return {
        ...state,
        section4: {
          templeId: action.payload.templeId,
          templeData: action.payload.templeData || null,
        },
        ui: {
          ...state.ui,
          activeSection: 4,
        },
      };

    case ActionTypes.SET_ACTIVE_SECTION:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeSection: action.payload,
        },
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };

    case ActionTypes.RESET_FLOW:
      return {
        ...initialState,
        filters: state.filters, // Keep global filters
      };

    default:
      return state;
  }
}

// Context
const DashboardContext = createContext(null);

// Provider component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Action creators
  const setFilter = useCallback((filterUpdate) => {
    dispatch({ type: ActionTypes.SET_FILTER, payload: filterUpdate });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_FILTERS });
  }, []);

  const selectSection1 = useCallback((selection) => {
    dispatch({ type: ActionTypes.SELECT_SECTION1, payload: selection });
  }, []);

  const selectSection2 = useCallback((selection) => {
    dispatch({ type: ActionTypes.SELECT_SECTION2, payload: selection });
  }, []);

  const selectSection3 = useCallback((selection) => {
    dispatch({ type: ActionTypes.SELECT_SECTION3, payload: selection });
  }, []);

  const setTemple = useCallback((templeId, templeData = null) => {
    dispatch({
      type: ActionTypes.SET_TEMPLE,
      payload: { templeId, templeData },
    });
  }, []);

  const setActiveSection = useCallback((section) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_SECTION, payload: section });
  }, []);

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const resetFlow = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FLOW });
  }, []);

  // Computed values
  const hasSection1Selection = Boolean(
    state.section1.selectedType ||
      state.section1.selectedNikaya ||
      state.section1.selectedGrade
  );

  const hasSection2Selection = Boolean(
    state.section2.selectedProvince || state.section2.selectedDistrict
  );

  const hasSection3Selection = Boolean(
    state.section3.selectedParshawa ||
      state.section3.selectedSsbm ||
      state.section3.selectedDvsec ||
      state.section3.selectedGn
  );

  const value = {
    // State
    ...state,

    // Actions
    setFilter,
    clearFilters,
    selectSection1,
    selectSection2,
    selectSection3,
    setTemple,
    setActiveSection,
    setLoading,
    setError,
    resetFlow,

    // Computed
    hasSection1Selection,
    hasSection2Selection,
    hasSection3Selection,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

export default DashboardContext;
