import React, { useState } from 'react';
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
  BarChart3,
  User,
  Lock,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { formatFullDateEs, formatCOP } from '../utils/formatters';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onOpenNewSale: () => void;
  onOpenCash: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewSale,
  onOpenCash,
  onOpenLoginModal,
}) => {
  const { activeSessions, lowStockProducts, todayExpectedCash, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Business Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white shadow-md text-base tracking-wider">
              POS
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                Control de Negocio
              </h1>
              <p className="text-xs text-slate-400 capitalize hidden sm:block">
                Garguería • Xbox • Papelería
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-xbox"
              onClick={() => handleTabClick('xbox')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer relative ${
                currentTab === 'xbox'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Consolas</span>
              {activeSessions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
                  {activeSessions.length}
                </span>
              )}
            </button>

            <button
              id="nav-tab-transfers"
              onClick={() => handleTabClick('transfers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'transfers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Transferencias</span>
            </button>

            <button
              id="nav-tab-history"
              onClick={() => handleTabClick('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial</span>
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => handleTabClick('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Reportes</span>
            </button>

            <button
              id="nav-tab-inventory"
              onClick={() => handleTabClick('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer relative ${
                currentTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventario</span>
              {currentUser.role === 'cajero' && <Lock className="w-3 h-3 text-slate-500" />}
              {(currentUser.role === 'admin' || currentUser.role === 'operador') && lowStockProducts.length > 0 && (
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              id="nav-tab-settings"
              onClick={() => handleTabClick('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuración</span>
              {currentUser.role !== 'admin' && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
          </nav>

          {/* Right Action Icons & User Switch */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Nueva Venta */}
            <button
              id="btn-nav-nueva-venta"
              onClick={onOpenNewSale}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">+ Nueva Venta</span>
            </button>

            {/* Quick Cash Pill */}
            <button
              id="btn-nav-caja"
              onClick={onOpenCash}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ver caja esperada"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-mono">{formatCOP(todayExpectedCash)}</span>
            </button>

            {/* User Switch Badge */}
            <button
              id="btn-nav-user"
              onClick={onOpenLoginModal}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200 hover:bg-indigo-900'
                  : currentUser.role === 'operador'
                  ? 'bg-amber-950/80 border-amber-700 text-amber-200 hover:bg-amber-900'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Haga clic para cambiar de usuario"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="capitalize">{currentUser.username}</span>
              <span className="text-[10px] px-1 py-0.2 rounded-sm bg-slate-700 text-slate-300 font-mono capitalize">
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'operador' ? 'Operador' : 'Cajero'}
              </span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              currentTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Principal</span>
          </button>

          <button
            onClick={() => handleTabClick('xbox')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              currentTab === 'xbox' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Consolas Xbox & PS</span>
            </div>
            {activeSessions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                {activeSessions.length} activas
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('transfers')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              currentTab === 'transfers' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Transferencias</span>
          </button>

          <button
            onClick={() => handleTabClick('history')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              currentTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Ventas</span>
          </button>

          <button
            onClick={() => handleTabClick('reports')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              currentTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Reportes & Descargas (Excel / PDF)</span>
          </button>

          <button
            onClick={() => handleTabClick('inventory')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              currentTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Inventario</span>
            </div>
            {currentUser.role === 'cajero' && <Lock className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            onClick={() => handleTabClick('settings')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              currentTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </div>
            {currentUser.role !== 'admin' && <Lock className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      )}
    </header>
  );
};
