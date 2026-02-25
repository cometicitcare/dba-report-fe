import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout';
import { FilterPanelWithApply } from './components/layout/FilterPanelWithApply';
import {
  Section1Overall,
  Section2Details,
  Section3Selection,
  Section4TempleProfile,
  Tab2Summary,
  Tab3Temples,
  Tab4Persons,
} from './components/sections';
import { Printer } from 'lucide-react';
import LoginPage from './components/auth/LoginPage';

// Reusable print button
function PrintButton({ label = 'Print' }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 rounded-lg transition-colors border border-gray-200 shadow-sm"
      title="Print this view"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}

// Tab definitions
const TABS = [
  { id: 1, label: 'Dashboard', sublabel: 'Overall & Detail Summary' },
  { id: 2, label: 'Selection',  sublabel: 'Filtered Reports & Entity Selection' },
  { id: 3, label: 'Temples',   sublabel: 'Vihara List / විහාරස්ථාන' },
  { id: 4, label: 'Persons',   sublabel: 'Bhikku, Silmatha & Others' },
];

// Tab Navigation Bar
function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="no-print bg-white border-b border-gray-200 sticky top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-0" aria-label="Dashboard Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={[
                  'relative flex flex-col items-start px-6 py-3 text-sm font-medium transition-colors border-b-2 min-w-[160px] no-print',
                  isActive
                    ? 'border-saffron-500 text-saffron-700 bg-saffron-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                ].join(' ')}
                aria-selected={isActive}
                role="tab"
              >
                <span className="flex items-center gap-2">
                  <span className={[
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                    isActive ? 'bg-saffron-500 text-white' : 'bg-gray-200 text-gray-600',
                  ].join(' ')}>
                    {tab.id}
                  </span>
                  <span className="font-semibold">{tab.label}</span>
                </span>
                <span className="mt-0.5 ml-8 text-xs text-gray-400 font-normal">
                  {tab.sublabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ── Tab 1: Overall Summary + Detail Reports ──────────────────
function Tab1Content({ showTempleProfile }) {
  return (
    <div className="space-y-6">
      {showTempleProfile && <Section4TempleProfile />}
      {!showTempleProfile && (
        <>
          {/* Print button — hidden when printing */}
          <div className="no-print flex justify-end">
            <PrintButton label="Print Summary" />
          </div>

          {/* Row 1: Summary A / B / C */}
          <Section1Overall />

          {/* Divider */}
          <div className="flex items-center gap-3 no-print">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">Detail Summaries</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          {/* Print-only divider label */}
          <div className="print-only-block" style={{ display: 'none' }}>
            <div style={{ borderTop: '1.5px solid #d97706', margin: '12px 0 8px', textAlign: 'center' }}>
              <span style={{ fontSize: '9pt', color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>Detail Summaries</span>
            </div>
          </div>

          {/* Row 2+: Bhikku Types / Dahampasal / Teachers / Students + Province + District */}
          <Section2Details />
        </>
      )}
    </div>
  );
}

// ── Tab 2: Filtered Summaries (as tables) + Entity Selection ─
function Tab2Content() {
  // appliedFilters = null → not yet applied (no data shown)
  // appliedFilters = { ... } → queries run with these filters
  const [appliedFilters, setAppliedFilters] = useState(null);

  return (
    <div className="space-y-6">
      <div className="no-print flex justify-end">
        <PrintButton label="Print Summary" />
      </div>
      {/* Filter panel with Display button — hidden when printing */}
      <div className="no-print">
        <FilterPanelWithApply
          appliedFilters={appliedFilters || {}}
          onApply={setAppliedFilters}
        />
      </div>

      {/* Summary tables — react only to Display click */}
      <Tab2Summary appliedFilters={appliedFilters} />

      {/* Entity selection — only shown after Display, hidden when printing */}
      {appliedFilters !== null && (
        <div className="no-print">
          <Section3Selection appliedFilters={appliedFilters} />
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Temple List ───────────────────────────────────────
function Tab3Content() {
  return <Tab3Temples />;
}

// ── Tab 4: Persons List ─────────────────────────────────────
function Tab4Content() {
  return <Tab4Persons />;
}

// Dashboard with tab navigation
function DashboardContent() {
  const { ui, section4 } = useDashboard();
  const { activeSection } = ui;
  const [activeTab, setActiveTab] = useState(1);

  const showTempleProfile = section4.templeId && activeSection === 4;

  return (
    <>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Print-only header — hidden on screen, shown only when printing */}
        <div className="print-header hidden">
          <div>
            <strong style={{ fontSize: '14pt', color: '#92400e' }}>Buddhist Affairs MIS</strong>
            <div style={{ fontSize: '10pt', color: '#6b7280', marginTop: 2 }}>බෞද්ධ කටයුතු දෙපාර්තමෙන්තුව</div>
          </div>
          <div style={{ fontSize: '9pt', color: '#6b7280' }}>{new Date().toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        {activeTab === 1 && <Tab1Content showTempleProfile={showTempleProfile} />}
        {activeTab === 2 && <Tab2Content />}
        {activeTab === 3 && <Tab3Content />}
        {activeTab === 4 && <Tab4Content />}
      </main>
    </>
  );
}

// Footer
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="no-print bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>
            <span className="sinhala-text">බෞද්ධ කටයුතු දෙපාර්තමෙන්තුව</span>
            {' '}- Department of Buddhist Affairs
          </p>
          <p>&copy; {currentYear} MIS Dashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Auth-aware root ──────────────────────────────────────────
/**
 * Renders LoginPage while not authenticated, full dashboard when authenticated.
 * Shows a loading spinner while the stored token is being verified on mount.
 */
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-saffron-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-saffron-600">
          <svg
            className="animate-spin h-10 w-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <DashboardContent />
        <Footer />
      </div>
    </DashboardProvider>
  );
}

// Main App — AuthProvider wraps everything
function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
