import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/Dashboard/OverviewTab';
import { POSTerminal } from './components/POS/POSTerminal';
import { InventoryManager } from './components/POS/InventoryManager';
import { JobCardList } from './components/Garage/JobCardList';
import { YardTracker } from './components/Yard/YardTracker';
import { ToolRentalDesk } from './components/Tools/ToolRentalDesk';
import { ShiftManagement } from './components/Audit/ShiftManagement';
import { StockTaking } from './components/Audit/StockTaking';
import { FinancialReports } from './components/Reports/FinancialReports';
import { DebtorsLedger } from './components/Credit/DebtorsLedger';
import { QuickActionModal } from './components/Modals/QuickActionModal';
import { LoginPage } from './components/Auth/LoginPage';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
      />
      <div className="main-content">
        <Header 
          onOpenQuickAction={() => setShowQuickAction(true)} 
          onToggleNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />
        <main className="content-body">
          {/* Executive Overview (Admin Surveillance) */}
          {activeTab === 'overview' && isAdmin && (
            <OverviewTab onOpenQuickAction={() => setShowQuickAction(true)} />
          )}

          {/* Full Financial Statements (Admin Oversight) */}
          {activeTab === 'reports' && isAdmin && <FinancialReports />}

          {/* Customer Credit / Debtors Ledger (Kitabu cha Madeni) */}
          {activeTab === 'credit' && <DebtorsLedger />}

          {/* Counter Parts POS (Both Attendants & Admin) */}
          {activeTab === 'pos' && <POSTerminal />}

          {/* Stock Intake & Catalog (Both Attendants & Admin) */}
          {activeTab === 'inventory' && <InventoryManager />}

          {/* Garage & Car Builds (Both Attendants & Admin) */}
          {activeTab === 'garage' && <JobCardList />}

          {/* Yard Parking (Both Attendants & Admin) */}
          {activeTab === 'yard' && <YardTracker />}

          {/* Tool Rentals (Both Attendants & Admin) */}
          {activeTab === 'tools' && <ToolRentalDesk />}

          {/* Shift Handover & Stock Auditing */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ShiftManagement />
              <StockTaking />
            </div>
          )}
        </main>
      </div>

      {showQuickAction && (
        <QuickActionModal
          onClose={() => setShowQuickAction(false)}
          onSelectAction={() => setShowQuickAction(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
