import type { ReactNode } from 'react';

export function DashboardLayout({ children, testMode, onToggleTestMode }: {
  children: ReactNode;
  testMode: boolean;
  onToggleTestMode: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Crypto Dashboard</h1>
          <button
            onClick={onToggleTestMode}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              testMode
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {testMode ? 'Test Mode ON' : 'Test Mode'}
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
