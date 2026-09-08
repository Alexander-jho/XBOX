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
} from 'lucide-react';
import { formatCOP, formatFullDateEs } from '../utils/formatters';

interface DashboardProps {
  onOpenNewSale: (initialArea?: 'gargueria' | 'xbox' | 'papeleria') => void;
  onOpenXboxSessionModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenCashModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'xbox' | 'inventory' | 'transfers' | 'history' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewSale,
  onOpenXboxSessionModal,
  onOpenExpenseModal,
  onOpenCashModal,
  onNavigateTab,
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
  } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title & Date Banner */}
      <div className="text-center bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
          Punto de Venta & Caja Diaria
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          CONTROL DEL NEGOCIO
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base capitalize mt-1">
          {formatFullDateEs()}
        </p>
      </div>

      {/* Primary Financial Metric Cards (as outlined in user prompt mockup) */}
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

      {/* Caja Esperada Highlight Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Caja Esperada en Efectivo
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatCOP(todayExpectedCash)}
            </div>
            <p className="text-xs text-slate-300">
              Base inicial ({formatCOP(currentCash.initialCash)}) + Efectivo ({formatCOP(todayCashSales)}) - Gastos/Retiros
            </p>
          </div>
        </div>
        <button
          id="btn-dash-ver-arqueo"
          onClick={onOpenCashModal}
          className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>Arqueo & Cierre de Caja</span>
        </button>
      </div>

      {/* Ventas por Área (Garguería, Xbox, Papelería) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Ventas de hoy por área
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Garguería */}
          <div 
            onClick={() => onOpenNewSale('gargueria')}
            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🍔</span>
              <div>
                <span className="text-xs font-bold text-amber-900 block uppercase">Garguería</span>
                <span className="text-lg font-black text-amber-950">{formatCOP(areaSales.gargueria)}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Vender</span>
          </div>

          {/* Xbox */}
          <div 
            onClick={() => onOpenNewSale('xbox')}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎮</span>
              <div>
                <span className="text-xs font-bold text-emerald-900 block uppercase">Xbox & Consolas</span>
                <span className="text-lg font-black text-emerald-950">{formatCOP(areaSales.xbox)}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Vender</span>
          </div>

          {/* Papelería */}
          <div 
            onClick={() => onOpenNewSale('papeleria')}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📚</span>
              <div>
                <span className="text-xs font-bold text-indigo-900 block uppercase">Papelería</span>
                <span className="text-lg font-black text-indigo-950">{formatCOP(areaSales.papeleria)}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">Vender</span>
          </div>
        </div>
      </div>

      {/* BIG ACTION BUTTONS - As specifically required in Prompt */}
      <div className="space-y-3">
        {/* ➕ NUEVA VENTA (Primary Hero Button) */}
        <button
          id="btn-hero-nueva-venta"
          onClick={() => onOpenNewSale()}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-black text-lg sm:text-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <PlusCircle className="w-7 h-7" />
          <span>➕ NUEVA VENTA</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 🎮 NUEVA SESIÓN XBOX */}
          <button
            id="btn-hero-xbox-session"
            onClick={onOpenXboxSessionModal}
            className="py-3.5 px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-800"
          >
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>🎮 NUEVA SESIÓN XBOX</span>
          </button>

          {/* 💸 NUEVO GASTO */}
          <button
            id="btn-hero-nuevo-gasto"
            onClick={onOpenExpenseModal}
            className="py-3.5 px-5 bg-white hover:bg-rose-50 active:scale-[0.99] text-rose-700 rounded-2xl font-bold text-base shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-rose-200"
          >
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>💸 NUEVO GASTO</span>
          </button>

          {/* 💵 CAJA */}
          <button
            id="btn-hero-caja"
            onClick={onOpenCashModal}
            className="py-3.5 px-5 bg-white hover:bg-amber-50 active:scale-[0.99] text-amber-900 rounded-2xl font-bold text-base shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-amber-200"
          >
            <Coins className="w-5 h-5 text-amber-600" />
            <span>💵 CAJA & ARQUEO</span>
          </button>

          {/* 🔵 TRANSFERENCIAS */}
          <button
            id="btn-hero-transferencias"
            onClick={() => onNavigateTab('transfers')}
            className="py-3.5 px-5 bg-white hover:bg-blue-50 active:scale-[0.99] text-blue-800 rounded-2xl font-bold text-base shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-blue-200"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <span>🔵 TRANSFERENCIAS ({formatCOP(todayTransferSales)})</span>
          </button>
        </div>
      </div>

      {/* Active Xbox Sessions Quick Live Glance Banner */}
      {activeSessions.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
              <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                Sesiones Activas de Xbox ({activeSessions.length})
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('xbox')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver consolas <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSessions.map(session => {
              const now = Date.now();
              const remainingMs = session.endTime - now;
              const remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
              const isWarning = remainingMinutes <= 3;
              const isExpired = remainingMs <= 0;

              return (
                <div
                  key={session.id}
                  onClick={() => onNavigateTab('xbox')}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors border ${
                    isExpired
                      ? 'bg-rose-950/60 border-rose-500 text-rose-100'
                      : isWarning
                      ? 'bg-amber-950/60 border-amber-500 text-amber-100'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{session.consoleName}</span>
                    <span className="text-xs text-slate-300">
                      {session.rateLabel} {session.extraControllers > 0 ? `+ ${session.extraControllers} ctrl` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      isExpired
                        ? 'bg-rose-600 text-white'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isExpired ? 'TIEMPO CUMPLIDO' : `${remainingMinutes} min rest.`}
                    </span>
                    <span className="text-xs font-bold block text-emerald-400 mt-1">
                      {formatCOP(session.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low Stock Warning Banner (Item 12 in Prompt) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">
                ⚠️ Alerta: {lowStockProducts.length} producto(s) con stock bajo
              </h4>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                Ver inventario
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lowStockProducts.slice(0, 6).map(p => (
                <span
                  key={p.id}
                  className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-medium text-amber-950"
                >
                  {p.name} {p.presentation ? `(${p.presentation})` : ''}: <strong className="text-amber-800">{p.stock}</strong> (mín. {p.minStock})
                </span>
              ))}
              {lowStockProducts.length > 6 && (
                <span className="text-xs font-medium text-amber-700 self-center">
                  +{lowStockProducts.length - 6} más...
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
