import { useState } from 'react';
import { StoreProvider } from '@/lib/store';
import { Layout } from '@/components/Layout';
import type { PageId } from '@/components/Sidebar';
import { OverviewPage } from '@/pages/OverviewPage';
import { LiveAlertsPage } from '@/pages/LiveAlertsPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { AlertGroupsPage } from '@/pages/AlertGroupsPage';
import { CooldownPage } from '@/pages/CooldownPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const [page, setPage] = useState<PageId>('overview');

  return (
    <StoreProvider>
      <Layout active={page} onNavigate={setPage}>
        {page === 'overview' && <OverviewPage onNavigate={setPage} />}
        {page === 'alerts' && <LiveAlertsPage />}
        {page === 'incidents' && <IncidentsPage />}
        {page === 'groups' && <AlertGroupsPage />}
        {page === 'cooldown' && <CooldownPage />}
        {page === 'services' && <ServicesPage onNavigate={setPage} />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'notifications' && <NotificationsPage />}
        {page === 'settings' && <SettingsPage />}
      </Layout>
    </StoreProvider>
  );
}

export default App;
