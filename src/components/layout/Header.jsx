import React from 'react';
import { Building2, RefreshCw, X, LogOut, UserCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { resetFlow, hasSection1Selection } = useDashboard();
  const { user, logout } = useAuth();

  return (
    <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-saffron-500 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Buddhist Affairs MIS
              </h1>
              <p className="text-xs text-gray-500 sinhala-text">
                බෞද්ධ කටයුතු දෙපාර්තමෙන්තුව
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Clear Tab 1 selections */}
            {hasSection1Selection && (
              <button
                onClick={() => resetFlow()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Selections
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* User info + Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200">
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
                  <UserCircle2 className="w-4 h-4" />
                  <span className="font-medium text-gray-700">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
