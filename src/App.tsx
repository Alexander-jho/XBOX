import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SalesModal } from './components/SalesModal';
import { ExpensesModal } from './components/ExpensesModal';
import { CashRegisterModal } from './components/CashRegisterModal';
import { XboxManager } from './components/XboxManager';
import { TransfersView } from './components/TransfersView';
import { InventoryManager } from './components/InventoryManager';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ConfigView } from './components/ConfigView';
import { NavTab, BusinessArea } from './types';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Global Action Modals
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [selectedSalesArea, setSelectedSalesArea] = useState<BusinessArea>('gargueria');
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isXboxStartModalOpen, setIsXboxStartModalOpen] = useState(false);

  const handleOpenSale = (area: BusinessArea = 'gargueria') => {
    setSelectedSalesArea(area);
    setIsSalesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewSale={() => handleOpenSale('gargueria')}
        onOpenCash={() => setIsCashModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 md:p-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            onOpenNewSale={handleOpenSale}
            onOpenExpenseModal={() => setIsExpensesModalOpen(true)}
            onOpenCashModal={() => setIsCashModalOpen(true)}
            onOpenXboxSessionModal={() => {
              setCurrentTab('xbox');
              setIsXboxStartModalOpen(true);
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'xbox' && (
          <XboxManager
            isStartModalOpen={isXboxStartModalOpen}
            onCloseStartModal={() => setIsXboxStartModalOpen(false)}
          />
        )}

        {currentTab === 'inventory' && <InventoryManager />}

        {currentTab === 'transfers' && <TransfersView />}

        {currentTab === 'history' && <SalesHistoryView />}

        {currentTab === 'settings' && <ConfigView />}
      </main>

      {/* Quick Access Global Modals */}
      <SalesModal
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
        initialArea={selectedSalesArea}
      />

      <ExpensesModal
        isOpen={isExpensesModalOpen}
        onClose={() => setIsExpensesModalOpen(false)}
      />

      <CashRegisterModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
