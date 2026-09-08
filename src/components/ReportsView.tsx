import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Coins,
  ArrowRightLeft,
  Receipt,
  Gamepad2,
  ShoppingBag,
  Layers,
  Filter,
} from 'lucide-react';
import { formatCOP, getTodayDateString } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Sale, Expense, ClosedConsoleSession } from '../types';

export const ReportsView: React.FC = () => {
  const {
    sales,
    expenses,
    closedSessions,
    currentCash,
  } = useApp();

  // Period Filter State
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayDateString());

  // Calculate Date Boundaries
  const { filteredSales, filteredExpenses, filteredClosedSessions, periodLabel, startDateStr, endDateStr } = useMemo(() => {
    const today = getTodayDateString();
    let start = today;
    let end = today;
    let label = 'Hoy';

    if (period === 'today') {
      start = today;
      end = today;
      label = 'Hoy';
    } else if (period === 'week') {
      const d = new Date();
      const day = d.getDay() || 7; // Sunday is 7
      d.setDate(d.getDate() - day + 1); // Monday
      start = d.toISOString().split('T')[0];
      end = today;
      label = 'Esta Semana';
    } else if (period === 'month') {
      const d = new Date();
      d.setDate(1); // 1st of month
      start = d.toISOString().split('T')[0];
      end = today;
      label = 'Este Mes';
    } else if (period === 'custom') {
      start = customStartDate;
      end = customEndDate;
      label = `Personalizado (${start} a ${end})`;
    }

    const fSales = sales.filter(s => s.date >= start && s.date <= end);
    const fExpenses = expenses.filter(e => e.date >= start && e.date <= end);
    const fSessions = closedSessions.filter(cs => {
      const sessionDate = new Date(cs.closedAt).toISOString().split('T')[0];
      return sessionDate >= start && sessionDate <= end;
    });

    return {
      filteredSales: fSales,
      filteredExpenses: fExpenses,
      filteredClosedSessions: fSessions,
      periodLabel: label,
      startDateStr: start,
      endDateStr: end,
    };
  }, [period, customStartDate, customEndDate, sales, expenses, closedSessions]);

  // Aggregate Metrics for Selected Period
  const totalSales = useMemo(() => filteredSales.reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const cashSales = useMemo(() => filteredSales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const transferSales = useMemo(() => filteredSales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0), [filteredSales]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);
  const cashExpenses = useMemo(() => filteredExpenses.filter(e => e.paymentMethod === 'efectivo').reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);
  const transferExpenses = useMemo(() => filteredExpenses.filter(e => e.paymentMethod === 'transferencia').reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);

  const gargueriaSales = useMemo(() => filteredSales.filter(s => s.area === 'gargueria').reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const xboxSales = useMemo(() => filteredSales.filter(s => s.area === 'xbox').reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const papeleriaSales = useMemo(() => filteredSales.filter(s => s.area === 'papeleria').reduce((acc, s) => acc + s.total, 0), [filteredSales]);

  const expectedCashForPeriod = currentCash.initialCash + cashSales - cashExpenses;

  // Handlers for Exporting
  const handleExportExcel = () => {
    exportToExcel({
      periodLabel,
      startDate: startDateStr,
      endDate: endDateStr,
      sales: filteredSales,
      expenses: filteredExpenses,
      closedSessions: filteredClosedSessions,
      initialCash: currentCash.initialCash,
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      periodLabel,
      startDate: startDateStr,
      endDate: endDateStr,
      sales: filteredSales,
      expenses: filteredExpenses,
      closedSessions: filteredClosedSessions,
      initialCash: currentCash.initialCash,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Reportes Financieros & Operativos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Consulta y exporta en Excel (.xlsx) y PDF (.pdf) con resumen y detalle completo
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download Excel and PDF */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel</span>
          </button>

          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Período de Consulta</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['today', 'week', 'month', 'custom'] as const).map(p => {
            const labels = {
              today: 'Hoy',
              week: 'Esta Semana',
              month: 'Este Mes',
              custom: 'Rango Personalizado',
            };

            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {/* Custom Range Inputs */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600">Desde:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600">Hasta:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Metrics for Selected Period */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Ventas Totales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCOP(totalSales)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {filteredSales.length} transacciones
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase">Efectivo</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatCOP(cashSales)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Ingreso a caja
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase">Transferencias</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {formatCOP(transferSales)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Nequi / Daviplata
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase">Gastos Totales</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {formatCOP(totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Efectivo: {formatCOP(cashExpenses)}
          </span>
        </div>
      </div>

      {/* Breakdown by Areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800 uppercase">Garguería</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">
              Snacks & Dulces
            </span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCOP(gargueriaSales)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase">Xbox & PlayStation</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
              {filteredClosedSessions.length} sesiones
            </span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCOP(xboxSales)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-indigo-800 uppercase">Papelería & Bebidas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold">
              Servicios & Bebidas
            </span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCOP(papeleriaSales)}
          </div>
        </div>
      </div>

      {/* Preview Table: Recent Sales in Selected Period */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
            Detalle de Ventas en el Período ({filteredSales.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {periodLabel}
          </span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No se encontraron ventas registradas en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Fecha / Hora</th>
                  <th className="py-2.5 px-4">Área</th>
                  <th className="py-2.5 px-4">Detalle / Productos</th>
                  <th className="py-2.5 px-4">Medio de Pago</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSales.slice(0, 15).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-500">
                      {sale.date} <span className="font-semibold text-slate-800">{sale.time}</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 uppercase">
                        {sale.area}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {sale.paymentMethod === 'efectivo' ? (
                        <span className="font-bold text-emerald-700">🟢 Efectivo</span>
                      ) : (
                        <span className="font-bold text-blue-700">
                          🔵 {sale.transferProvider || 'Transf.'} {sale.transferReference ? `(${sale.transferReference})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCOP(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
