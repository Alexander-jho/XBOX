import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SalesModal } from './components/SalesModal';
import { ExpensesModal } from './components/ExpensesModal';
import { CashRegisterModal } from './components/CashRegisterModal';
import { XboxManager } from './components/XboxManager';
import { TransfersView } from './components/TransfersView';
import { InventoryManager } from './components/InventoryManager';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { ConfigView } from './components/ConfigView';
import { CreditsView } from './components/CreditsView';
import { LoginModal } from './components/LoginModal';
import { DatabaseSecurityBanner } from './components/DatabaseSecurityBanner';
import { NavTab, BusinessArea } from './types';
import { Lock, ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Global Action Modals
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [selectedSalesArea, setSelectedSalesArea] = useState<BusinessArea>('gargueria');
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isXboxStartModalOpen, setIsXboxStartModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedConsoleId, setSelectedConsoleId] = useState<string | null>(null);

  const handleOpenSale = (area: BusinessArea = 'gargueria') => {
    setSelectedSalesArea(area);
    setIsSalesModalOpen(true);
  };

  const handleSelectConsoleFromDashboard = (consoleId: string) => {
    setSelectedConsoleId(consoleId);
    setCurrentTab('xbox');
  };

  // Guard for Tabs according to roles:
  // - settings: exclusively admin
  // - inventory: admin and operador (blocked for cajero)
  const isBlocked =
    (currentTab === 'settings' && currentUser.role !== 'admin') ||
    (currentTab === 'inventory' && currentUser.role === 'cajero');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewSale={() => handleOpenSale('gargueria')}
        onOpenCash={() => setIsCashModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Security and Database Status Banner */}
      <DatabaseSecurityBanner />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 md:p-6">
        {/* If trying to access Admin tab without admin privileges */}
        {isBlocked ? (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {currentTab === 'settings'
                  ? 'Acceso Exclusivo de Administrador'
                  : 'Acceso Restringido para Cajero'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {currentTab === 'settings'
                  ? 'El módulo de Configuración (tarifas, consolas y negocio) solo puede ser administrado por el Administrador.'
                  : 'El módulo de Inventario está disponible para Operador y Administrador para modificar stock y precios.'}
              </p>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ingresar como Administrador</span>
            </button>
          </div>
        ) : (
          <>
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
                onSelectConsole={handleSelectConsoleFromDashboard}
              />
            )}

            {currentTab === 'xbox' && (
              <XboxManager
                isStartModalOpen={isXboxStartModalOpen}
                onCloseStartModal={() => setIsXboxStartModalOpen(false)}
                selectedConsoleIdFromDash={selectedConsoleId}
              />
            )}

            {currentTab === 'inventory' && <InventoryManager />}

            {currentTab === 'transfers' && <TransfersView />}

            {currentTab === 'credits' && <CreditsView />}

            {currentTab === 'history' && <SalesHistoryView />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'settings' && <ConfigView />}
          </>
        )}
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
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
