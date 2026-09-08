import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessArea, PaymentMethod } from '../types';
import {
  History,
  Search,
  Filter,
  Calendar,
  Coins,
  ArrowRightLeft,
  Receipt,
  Eye,
  X,
} from 'lucide-react';
import { formatCOP, getTodayDateString, formatFullDateEs } from '../utils/formatters';

type DatePreset = 'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizada' | 'todas';

export const SalesHistoryView: React.FC = () => {
  const { sales } = useApp();

  const [datePreset, setDatePreset] = useState<DatePreset>('hoy');
  const [customStartDate, setCustomStartDate] = useState<string>(getTodayDateString());
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayDateString());

  const [filterArea, setFilterArea] = useState<string>('todas');
  const [filterPayment, setFilterPayment] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected sale for detail modal
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<any | null>(null);

  // Filter logic
  const filteredSales = useMemo(() => {
    const today = new Date();
    const todayStr = getTodayDateString();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return sales.filter(s => {
      // Date preset
      if (datePreset === 'hoy') {
        if (s.date !== todayStr) return false;
      } else if (datePreset === 'ayer') {
        if (s.date !== yesterdayStr) return false;
      } else if (datePreset === 'semana') {
        const sDate = new Date(`${s.date}T00:00:00`);
        if (sDate < weekAgo) return false;
      } else if (datePreset === 'mes') {
        const sDate = new Date(`${s.date}T00:00:00`);
        if (sDate < monthAgo) return false;
      } else if (datePreset === 'personalizada') {
        if (customStartDate && s.date < customStartDate) return false;
        if (customEndDate && s.date > customEndDate) return false;
      }

      // Area
      if (filterArea !== 'todas' && s.area !== filterArea) return false;

      // Payment
      if (filterPayment !== 'todos' && s.paymentMethod !== filterPayment) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const itemMatch = s.items.some(i => i.name.toLowerCase().includes(q));
        const refMatch = s.transferReference?.toLowerCase().includes(q);
        const notesMatch = s.notes?.toLowerCase().includes(q);
        if (!itemMatch && !refMatch && !notesMatch) return false;
      }

      return true;
    });
  }, [sales, datePreset, customStartDate, customEndDate, filterArea, filterPayment, searchQuery]);

  const totalFilteredSales = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  const totalCash = useMemo(() => {
    return filteredSales.filter(s => s.paymentMethod === 'efectivo').reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  const totalTransfer = useMemo(() => {
    return filteredSales.filter(s => s.paymentMethod === 'transferencia').reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              HISTORIAL DE VENTAS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Registro completo de transacciones, medios de pago e items
            </p>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 p-2 sm:p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Total ventas:</span>
            <strong className="text-sm sm:text-base font-black text-slate-900">{formatCOP(totalFilteredSales)}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-emerald-700 block">Efectivo:</span>
            <strong className="text-sm sm:text-base font-black text-emerald-700">{formatCOP(totalCash)}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-blue-700 block">Transferencias:</span>
            <strong className="text-sm sm:text-base font-black text-blue-700">{formatCOP(totalTransfer)}</strong>
          </div>
        </div>
      </div>

      {/* Filter Controls (Item 17 in Prompt) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Date presets */}
        <div>
          <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5">
            Período:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1">
            {(['hoy', 'ayer', 'semana', 'mes', 'personalizada', 'todas'] as DatePreset[]).map(dp => (
              <button
                key={dp}
                onClick={() => setDatePreset(dp)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer capitalize whitespace-nowrap transition-colors ${
                  datePreset === dp
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dp === 'hoy' ? 'Hoy' : dp === 'ayer' ? 'Ayer' : dp === 'semana' ? 'Esta semana' : dp === 'mes' ? 'Este mes' : dp === 'personalizada' ? 'Fecha personalizada' : 'Todas'}
              </button>
            ))}
          </div>

          {datePreset === 'personalizada' && (
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block">Desde:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Hasta:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Area, Payment Method & Search Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Area */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Filtrar por Área:</label>
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="todas">Todas las áreas</option>
              <option value="gargueria">🍔 Garguería</option>
              <option value="xbox">🎮 Xbox</option>
              <option value="papeleria">📚 Papelería</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Medio de Pago:</label>
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="todos">Todos los medios</option>
              <option value="efectivo">🟢 Solo Efectivo</option>
              <option value="transferencia">🔵 Solo Transferencias</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Buscar producto o referencia:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej. Doritos, Nequi, PS5..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-2 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No hay ventas registradas con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Área</th>
                  <th className="py-3 px-4">Productos / Items</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(s => {
                  const isEfectivo = s.paymentMethod === 'efectivo';
                  const areaEmoji = s.area === 'xbox' ? '🎮' : s.area === 'gargueria' ? '🍔' : '📚';
                  const areaLabel = s.area === 'xbox' ? 'Xbox' : s.area === 'gargueria' ? 'Garguería' : 'Papelería';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{s.time}</span>
                        <span className="text-[11px] text-slate-400">{s.date}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {areaEmoji} {areaLabel}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate">
                        <div className="space-y-0.5">
                          {s.items.map((item, idx) => (
                            <span key={idx} className="block text-slate-800 text-xs">
                              {item.name} <strong className="text-slate-500">x{item.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isEfectivo ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span>🟢 Efectivo</span>
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                              <span>🔵 {s.transferProvider || 'Transferencia'}</span>
                            </span>
                            {s.transferReference && (
                              <span className="text-[10px] font-mono text-slate-500 block">
                                Ref: {s.transferReference}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm sm:text-base">
                        {formatCOP(s.total)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedSaleDetail(s)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Detalle de la Venta</h3>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Fecha y hora:</span>
                <strong className="text-slate-900">{selectedSaleDetail.date} {selectedSaleDetail.time}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Área:</span>
                <strong className="text-slate-900 capitalize">{selectedSaleDetail.area}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Medio de pago:</span>
                <strong className={selectedSaleDetail.paymentMethod === 'efectivo' ? 'text-emerald-700' : 'text-blue-700'}>
                  {selectedSaleDetail.paymentMethod.toUpperCase()} {selectedSaleDetail.transferProvider ? `(${selectedSaleDetail.transferProvider})` : ''}
                </strong>
              </div>
              {selectedSaleDetail.transferReference && (
                <div className="flex justify-between text-slate-600">
                  <span>Referencia:</span>
                  <strong className="font-mono text-slate-900">{selectedSaleDetail.transferReference}</strong>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Items:</span>
                {selectedSaleDetail.items.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-slate-800 py-0.5">
                    <span>{i.name} x{i.quantity}</span>
                    <span className="font-bold">{formatCOP(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total:</span>
                <strong className="font-black text-emerald-700 text-base">{formatCOP(selectedSaleDetail.total)}</strong>
              </div>

              {selectedSaleDetail.cashGiven && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Pagó con: {formatCOP(selectedSaleDetail.cashGiven)}</span>
                  <span>Cambio: {formatCOP(selectedSaleDetail.change || 0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
