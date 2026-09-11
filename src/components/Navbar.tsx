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
  CreditCard,
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
  const {
    activeSessions,
    lowStockProducts,
    todayExpectedCash,
    currentUser,
    pendingCreditsCount,
    cloudSyncStatus,
    cloudVersion,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Business Brand */}
          <div
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none"
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white shadow-md text-base tracking-wider shrink-0">
              POS
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-base sm:text-lg leading-tight text-white tracking-tight">
                POS Negocio
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 hidden sm:block">
                Garguería • Xbox • Papelería
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-xbox"
              onClick={() => handleTabClick('xbox')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap relative ${
                currentTab === 'xbox'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>Consolas</span>
              {activeSessions.length > 0 && (
                <span className="h-4 min-w-4 px-1 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center leading-none animate-pulse">
                  {activeSessions.length}
                </span>
              )}
            </button>

            <button
              id="nav-tab-transfers"
              onClick={() => handleTabClick('transfers')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentTab === 'transfers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Transferencias</span>
            </button>

            <button
              id="nav-tab-credits"
              onClick={() => handleTabClick('credits')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap relative ${
                currentTab === 'credits'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-amber-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Créditos (Fiados)</span>
              {pendingCreditsCount > 0 && (
                <span className="h-4 min-w-4 px-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center leading-none">
                  {pendingCreditsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-history"
              onClick={() => handleTabClick('history')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>Historial</span>
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => handleTabClick('reports')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Reportes</span>
            </button>

            <button
              id="nav-tab-inventory"
              onClick={() => handleTabClick('inventory')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap relative ${
                currentTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>Inventario</span>
              {currentUser.role === 'cajero' && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
              {(currentUser.role === 'admin' || currentUser.role === 'operador') && lowStockProducts.length > 0 && (
                <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0" />
              )}
            </button>

            <button
              id="nav-tab-settings"
              onClick={() => handleTabClick('settings')}
              className={`h-9 px-2.5 xl:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Configuración</span>
              {currentUser.role !== 'admin' && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
            </button>
          </nav>

          {/* Right Action Icons & User Switch */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Nueva Venta */}
            <button
              id="btn-nav-nueva-venta"
              onClick={onOpenNewSale}
              className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">+ Nueva Venta</span>
            </button>

            {/* Quick Cash Pill */}
            <button
              id="btn-nav-caja"
              onClick={onOpenCash}
              className="h-9 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
              title="Caja esperada del día. Clic para Arqueo / Cierre de Caja"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono font-black text-emerald-400">{formatCOP(todayExpectedCash)}</span>
            </button>

            {/* Cloud Real-Time Online Status */}
            <div
              id="status-cloud-sync"
              className="hidden md:flex h-9 items-center gap-1.5 px-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs select-none shrink-0 whitespace-nowrap shadow-2xs"
              title={
                cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                  ? `Conexión activa - Sincronización en tiempo real (v${cloudVersion})`
                  : cloudSyncStatus === 'local_mode'
                  ? 'Modo local activo - Las ventas y operaciones se guardan de inmediato sin bloqueos'
                  : cloudSyncStatus === 'offline'
                  ? 'Sin conexión a internet'
                  : 'Verificando red...'
              }
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : cloudSyncStatus === 'local_mode'
                    ? 'bg-amber-400 animate-pulse'
                    : cloudSyncStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-[10px] font-black font-mono tracking-wider ${
                  cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                    ? 'text-emerald-400'
                    : cloudSyncStatus === 'local_mode'
                    ? 'text-amber-400'
                    : cloudSyncStatus === 'connecting'
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                  ? 'ONLINE'
                  : cloudSyncStatus === 'local_mode'
                  ? 'MODO LOCAL / SINCRONIZANDO'
                  : cloudSyncStatus === 'connecting'
                  ? 'CONECTANDO'
                  : 'OFFLINE'}
              </span>
            </div>

            {/* User Profile Badge (Single aligned role label) */}
            <button
              id="btn-nav-user"
              onClick={onOpenLoginModal}
              className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors shrink-0 whitespace-nowrap shadow-2xs ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-200 hover:bg-indigo-900'
                  : currentUser.role === 'operador'
                  ? 'bg-amber-950/80 border-amber-700/80 text-amber-200 hover:bg-amber-900'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={`Perfil: ${currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'operador' ? 'Operador' : 'Cajero'} (${currentUser.name || currentUser.username}). Clic para cambiar de usuario.`}
            >
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                {currentUser.role === 'admin'
                  ? 'Administrador'
                  : currentUser.role === 'operador'
                  ? 'Operador'
                  : 'Cajero'}
              </span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
              aria-label="Abrir menú"
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
            onClick={() => handleTabClick('credits')}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              currentTab === 'credits' ? 'bg-amber-500 text-slate-950 font-black' : 'text-amber-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Créditos (Fiados / Por Cobrar)</span>
            </div>
            {pendingCreditsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {pendingCreditsCount} pendientes
              </span>
            )}
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

          {/* Mobile Network Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs px-2 py-1 text-slate-400">
            <span>Estado de red:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : cloudSyncStatus === 'local_mode'
                    ? 'bg-amber-400 animate-pulse'
                    : cloudSyncStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-[10px] font-black font-mono tracking-wider ${
                  cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                    ? 'text-emerald-400'
                    : cloudSyncStatus === 'local_mode'
                    ? 'text-amber-400'
                    : cloudSyncStatus === 'connecting'
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {cloudSyncStatus === 'online' || cloudSyncStatus === 'connected'
                  ? 'ONLINE'
                  : cloudSyncStatus === 'local_mode'
                  ? 'MODO LOCAL'
                  : cloudSyncStatus === 'connecting'
                  ? 'CONECTANDO'
                  : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
