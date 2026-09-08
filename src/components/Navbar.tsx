import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import {
  Gamepad2,
  Package,
  History,
  Settings,
  LayoutDashboard,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { formatFullDateEs, formatCOP } from '../utils/formatters';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onOpenNewSale: () => void;
  onOpenCash: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewSale,
  onOpenCash,
}) => {
  const { activeSessions, lowStockProducts, currentCash, todayExpectedCash } = useApp();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Business Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white shadow-md text-lg tracking-wider">
              POS
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                Control de Negocio
              </h1>
              <p className="text-xs text-slate-400 capitalize hidden sm:block">
                {formatFullDateEs()}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-xbox"
              onClick={() => setCurrentTab('xbox')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative ${
                currentTab === 'xbox'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Consolas Xbox</span>
              {activeSessions.length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
                  {activeSessions.length}
                </span>
              )}
            </button>

            <button
              id="nav-tab-transfers"
              onClick={() => setCurrentTab('transfers')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentTab === 'transfers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>Transferencias</span>
            </button>

            <button
              id="nav-tab-inventory"
              onClick={() => setCurrentTab('inventory')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative ${
                currentTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario</span>
              {lowStockProducts.length > 0 && (
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              )}
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Ventas</span>
            </button>

            <button
              id="nav-tab-settings"
              onClick={() => setCurrentTab('settings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </nav>

          {/* Quick Cash indicator & Sale CTA */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-nav-caja-status"
              onClick={onOpenCash}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
              title="Abrir o ver arqueo de caja"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-slate-400 block leading-tight">Caja esperada</span>
                <span className="font-bold text-emerald-400 text-xs">{formatCOP(todayExpectedCash)}</span>
              </div>
            </button>

            <button
              id="btn-nav-nueva-venta"
              onClick={onOpenNewSale}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
            >
              <span className="text-base font-black">+</span>
              <span>Nueva Venta</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-800/80 py-2 overflow-x-auto text-xs space-x-2">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('xbox')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap flex items-center gap-1 ${currentTab === 'xbox' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Xbox ({activeSessions.length})
          </button>
          <button
            onClick={() => setCurrentTab('transfers')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'transfers' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Transferencias
          </button>
          <button
            onClick={() => setCurrentTab('inventory')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap flex items-center gap-1 ${currentTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Inventario {lowStockProducts.length > 0 && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Historial
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
          >
            Ajustes
          </button>
        </div>
      </div>
    </header>
  );
};
