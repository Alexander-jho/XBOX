import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TransferProvider, BusinessArea } from '../types';
import {
  ArrowRightLeft,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatCOP, getTodayDateString } from '../utils/formatters';

export const TransfersView: React.FC = () => {
  const { sales, todayTransferSales } = useApp();

  const [dateFilter, setDateFilter] = useState<string>(getTodayDateString());
  const [providerFilter, setProviderFilter] = useState<string>('todos');
  const [areaFilter, setAreaFilter] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // All sales paid via Transferencia
  const transferSales = useMemo(() => {
    return sales.filter(s => s.paymentMethod === 'transferencia');
  }, [sales]);

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    return transferSales.filter(s => {
      // Date filter
      if (dateFilter && s.date !== dateFilter) return false;
      // Provider filter
      if (providerFilter !== 'todos' && s.transferProvider !== providerFilter) return false;
      // Area filter
      if (areaFilter !== 'todas' && s.area !== areaFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const refMatch = s.transferReference?.toLowerCase().includes(query);
        const itemMatch = s.items.some(i => i.name.toLowerCase().includes(query));
        const providerMatch = s.transferProvider?.toLowerCase().includes(query);
        if (!refMatch && !itemMatch && !providerMatch) return false;
      }
      return true;
    });
  }, [transferSales, dateFilter, providerFilter, areaFilter, searchTerm]);

  // Total for the selected filtered date or current view
  const selectedTotal = useMemo(() => {
    return filteredTransfers.reduce((sum, s) => sum + s.total, 0);
  }, [filteredTransfers]);

  // Breakdown by Provider for current filter
  const providerBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Nequi: 0, Daviplata: 0, Bancolombia: 0, Otro: 0 };
    filteredTransfers.forEach(s => {
      const p = s.transferProvider || 'Otro';
      counts[p] = (counts[p] || 0) + s.total;
    });
    return counts;
  }, [filteredTransfers]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyRef = (id: string, refText?: string) => {
    if (!refText) return;
    navigator.clipboard?.writeText(refText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner with Total Highlight */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-black">
            <ArrowRightLeft className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-blue-300 tracking-wider">
              Control de Transferencias
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {dateFilter === getTodayDateString() ? 'TOTAL TRANSFERENCIAS DEL DÍA' : 'TOTAL TRANSFERENCIAS FILTRADAS'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Comprobación directa de Nequi, Daviplata, Bancolombia y otros medios
            </p>
          </div>
        </div>

        <div className="bg-blue-800/40 border border-blue-700/60 p-4 rounded-xl text-right">
          <span className="text-xs text-blue-300 uppercase font-bold block">Monto Total</span>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatCOP(selectedTotal)}
          </div>
          <span className="text-xs text-blue-200 font-medium">
            {filteredTransfers.length} transacción(es) registrada(s)
          </span>
        </div>
      </div>

      {/* Provider Mini Cards Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-purple-700 block uppercase">Nequi</span>
          <span className="text-lg font-black text-slate-900">{formatCOP(providerBreakdown.Nequi)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-rose-700 block uppercase">Daviplata</span>
          <span className="text-lg font-black text-slate-900">{formatCOP(providerBreakdown.Daviplata)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-700 block uppercase">Bancolombia</span>
          <span className="text-lg font-black text-slate-900">{formatCOP(providerBreakdown.Bancolombia)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block uppercase">Otro</span>
          <span className="text-lg font-black text-slate-900">{formatCOP(providerBreakdown.Otro)}</span>
        </div>
      </div>

      {/* Filter Bar (Prompt: Debe poder filtrarse por: Fecha, Medio, Área) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Fecha */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Filtrar por Fecha:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          {/* Medio */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Medio utilizado:</label>
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="todos">Todos los medios</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Área */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Área del Negocio:</label>
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="todas">Todas las áreas</option>
              <option value="gargueria">🍔 Garguería</option>
              <option value="xbox">🎮 Xbox</option>
              <option value="papeleria">📚 Papelería</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Buscar comprobante / item:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Referencia, producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-1.5 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Table (as outlined in prompt Section 16) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <ArrowRightLeft className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No hay transferencias registradas con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Área</th>
                  <th className="py-3 px-4">Concepto / Items</th>
                  <th className="py-3 px-4">Medio</th>
                  <th className="py-3 px-4">Referencia / Comprobante</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.map(s => {
                  const areaEmoji = s.area === 'xbox' ? '🎮' : s.area === 'gargueria' ? '🍔' : '📚';
                  const areaLabel = s.area === 'xbox' ? 'Xbox' : s.area === 'gargueria' ? 'Garguería' : 'Papelería';

                  const conceptText = s.items.map(i => `${i.name} (${i.quantity})`).join(', ');

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {s.time || '10:00'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <span>{areaEmoji}</span>
                          <span>{areaLabel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate" title={conceptText}>
                        {conceptText}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.transferProvider === 'Nequi'
                            ? 'bg-purple-100 text-purple-800'
                            : s.transferProvider === 'Daviplata'
                            ? 'bg-rose-100 text-rose-800'
                            : s.transferProvider === 'Bancolombia'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {s.transferProvider || 'Transferencia'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-800">
                            {s.transferReference || 'Sin ref'}
                          </code>
                          {s.transferReference && (
                            <button
                              onClick={() => handleCopyRef(s.id, s.transferReference)}
                              title="Copiar referencia"
                              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                            >
                              {copiedId === s.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">
                        {formatCOP(s.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
