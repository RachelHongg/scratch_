import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Dashboard } from './components/pages/Dashboard';
import { PerformanceMonitor } from './components/organisms/PerformanceMonitor';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <ConnectionProvider>
          <ConfirmProvider>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
            <PerformanceMonitor />
          </ConfirmProvider>
        </ConnectionProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
}

export default App;
