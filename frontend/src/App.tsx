import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Dashboard } from './components/pages/Dashboard';
import { PerformanceMonitor } from './components/organisms/PerformanceMonitor';

function App() {
  const [testMode, setTestMode] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <ConnectionProvider>
          <ConfirmProvider>
            <DashboardLayout testMode={testMode} onToggleTestMode={() => setTestMode(t => !t)}>
              <Dashboard testMode={testMode} />
            </DashboardLayout>
            {testMode && <PerformanceMonitor />}
          </ConfirmProvider>
        </ConnectionProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
}

export default App;
