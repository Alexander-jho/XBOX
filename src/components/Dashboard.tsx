import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Coins,
  ArrowRightLeft,
  Receipt,
  Wallet,
  Gamepad2,
  AlertTriangle,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  Play,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { formatCOP, formatFullDateEs, formatShortTime } from '../utils/formatters';

interface DashboardProps {
  onOpenNewSale: (initialArea?: 'gargueria' | 'xbox' | 'papeleria') => void;
  onOpenXboxSessionModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenCashModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'xbox' | 'inventory' | 'transfers' | 'history' | 'reports' | 'settings') => void;
  onSelectConsole?: (consoleId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewSale,
  onOpenXboxSessionModal,
  onOpenExpenseModal,
  onOpenCashModal,
  onNavigateTab,
  onSelectConsole,
}) => {
  const {
    todaySalesTotal,
    todayCashSales,
    todayTransferSales,
    todayExpensesTotal,
    todayExpectedCash,
    areaSales,
    activeSessions,
    lowStockProducts,
    currentCash,
    currentUser,
    consoles,
  } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title & Date Banner */}
      <div className="text-center bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            Punto de Venta & Caja Diaria
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            👤 {currentUser.role === 'admin' ? 'Administrador' : 'Cajero'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          CONTROL DEL NEGOCIO
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base capitalize mt-1">
          {formatFullDateEs()}
        </p>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Ventas Totales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-600">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatCOP(todaySalesTotal)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Del día en curso</span>
          </div>
        </div>

        {/* Efectivo */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-emerald-700">
              Efectivo
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {formatCOP(todayCashSales)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Entró a caja física</span>
          </div>
        </div>

        {/* Transferencias */}
        <div
          onClick={() => onNavigateTab('transfers')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-blue-700">
              Transferencias
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">
              {formatCOP(todayTransferSales)}
            </div>
            <span className="text-[11px] text-blue-500 font-medium flex items-center gap-0.5">
              Nequi / Bancolombia <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Gastos */}
        <div
          onClick={onOpenExpenseModal}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-rose-700">
              Gastos
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {formatCOP(todayExpensesTotal)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Registrados hoy</span>
          </div>
        </div>
      </div>

      {/* Caja Esperada en Efectivo */}
      <div
        onClick={onOpenCashModal}
        className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Caja Esperada en Efectivo
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentCash.isOpen ? 'bg-emerald-500/30 text-emerald-200' : 'bg-rose-500/30 text-rose-200'}`}>
                {currentCash.isOpen ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              {formatCOP(todayExpectedCash)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs border-t sm:border-t-0 border-slate-700/60 pt-3 sm:pt-0">
          <div className="text-slate-300 text-left sm:text-right">
            <div>Base inicial: <span className="font-bold text-white">{formatCOP(currentCash.initialCash)}</span></div>
            <div>+ Efectivo recibido - Gastos efectivo</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCashModal();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Arqueo / Cierre
          </button>
        </div>
      </div>

      {/* Ventas por Área */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Ventas de Hoy por Área</span>
          </h3>
          <span className="text-xs font-bold text-slate-600">
            Total: {formatCOP(todaySalesTotal)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Garguería */}
          <div
            onClick={() => onOpenNewSale('gargueria')}
            className="bg-white rounded-2xl p-4 border border-amber-200/90 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Garguería
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                Snacks & Dulces
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCOP(areaSales.gargueria)}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-1 inline-flex items-center gap-1">
              + Venta Rápida <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Xbox / PlayStation */}
          <div
            onClick={() => onNavigateTab('xbox')}
            className="bg-white rounded-2xl p-4 border border-emerald-200/90 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Xbox / PlayStation
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                6 Consolas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCOP(areaSales.xbox)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
              Ver Tiempos & Cuentas <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Papelería y Bebidas */}
          <div
            onClick={() => onOpenNewSale('papeleria')}
            className="bg-white rounded-2xl p-4 border border-indigo-200/90 shadow-xs cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                Papelería & Bebidas
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                Impresiones & Bebidas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCOP(areaSales.papeleria)}
            </div>
            <span className="text-[11px] text-indigo-700 font-medium mt-1 inline-flex items-center gap-1">
              + Venta Rápida <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Live Active Consoles Panel (Cuentas Abiertas) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              Consolas en Operación ({activeSessions.length} Activas)
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('xbox')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas las 6 consolas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
            No hay cuentas abiertas en consolas actualmente. Todas las 6 consolas están disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSessions.map(session => {
              const remainingMs = session.endTime - Date.now();
              const remainingMins = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
              const isExpired = remainingMs <= 0;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (onSelectConsole) onSelectConsole(session.consoleId);
                    onNavigateTab('xbox');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isExpired
                      ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
                      : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-slate-900">{session.consoleName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-white text-slate-600 border border-slate-200">
                        {session.accountNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Inicio {formatShortTime(session.startTime)} • Fin {formatShortTime(session.endTime)} • {session.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz'}
                    </p>
                    {session.products.length > 0 && (
                      <p className="text-[10px] font-semibold text-amber-700">
                        +{session.products.length} productos agregados
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black block ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {isExpired ? 'TERMINADO' : `${remainingMins}m rest.`}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatCOP(session.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Action Buttons (Grandes y Directos) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          Acciones Rápidas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Botón Grande: NUEVA VENTA */}
          <button
            id="btn-dash-nueva-venta"
            onClick={() => onOpenNewSale()}
            className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-base sm:text-lg shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <PlusCircle className="w-6 h-6" />
            <span>➕ NUEVA VENTA RÁPIDA</span>
          </button>

          {/* Botón Grande: NUEVA SESIÓN XBOX / PLAYSTATION */}
          <button
            id="btn-dash-nueva-sesion"
            onClick={onOpenXboxSessionModal}
            className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-base sm:text-lg shadow-md shadow-slate-950/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            <span>🎮 ABRIR CUENTA CONSOLA</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* NUEVO GASTO */}
          <button
            id="btn-dash-nuevo-gasto"
            onClick={onOpenExpenseModal}
            className="py-3 px-3 bg-white hover:bg-rose-50/50 border border-slate-200/90 rounded-2xl font-bold text-xs sm:text-sm text-slate-800 shadow-xs hover:border-rose-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-rose-500" />
            <span>💸 NUEVO GASTO</span>
          </button>

          {/* CAJA & ARQUEO */}
          <button
            id="btn-dash-caja"
            onClick={onOpenCashModal}
            className="py-3 px-3 bg-white hover:bg-emerald-50/50 border border-slate-200/90 rounded-2xl font-bold text-xs sm:text-sm text-slate-800 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>💵 CAJA & ARQUEO</span>
          </button>

          {/* TRANSFERENCIAS */}
          <button
            id="btn-dash-transferencias"
            onClick={() => onNavigateTab('transfers')}
            className="py-3 px-3 bg-white hover:bg-blue-50/50 border border-slate-200/90 rounded-2xl font-bold text-xs sm:text-sm text-slate-800 shadow-xs hover:border-blue-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>🔵 TRANSFERENCIAS</span>
          </button>
        </div>
      </div>

      {/* Alertas de Inventario (SOLO VISIBLE PARA EL ADMINISTRADOR) */}
      {currentUser.role === 'admin' ? (
        lowStockProducts.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>ALERTAS DE STOCK (Solo visibles para Administrador)</span>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-amber-800 underline cursor-pointer"
              >
                Gestionar inventario
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {lowStockProducts.slice(0, 4).map(prod => (
                <div
                  key={prod.id}
                  className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800 truncate pr-2">
                    {prod.name} {prod.presentation ? `(${prod.presentation})` : ''}
                  </span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-full shrink-0 ${
                      prod.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prod.stock === 0 ? '🔴 AGOTADO' : `⚠️ Quedan ${prod.stock}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
};
