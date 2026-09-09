import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Wallet,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Lock,
  Unlock,
  Layers,
  Gamepad2,
  ShoppingBag,
  FileText,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';
import { formatCOP, formatFullDateEs, formatShortTime, BANK_ACCOUNT_NOTICE, BANK_ACCOUNT_NUMBER } from '../utils/formatters';
import { exportToPDF } from '../utils/exportUtils';
import { CashClosure } from '../types';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentCash,
    todayDate,
    todaySalesTotal,
    todayCashSales,
    todayTransferSales,
    todayExpensesTotal,
    todayCashExpenses,
    todayTransferExpenses,
    todayWithdrawalsTotal,
    todayExpectedCash,
    areaSales,
    todayConsoleSessionsCount,
    todayProductsSoldCount,
    cashClosures,
    openCashRegister,
    addCashWithdrawal,
    closeCashRegister,
    sales,
    expenses,
    closedSessions,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'arqueo' | 'retiro' | 'historial'>('arqueo');
  const [copiedBank, setCopiedBank] = useState(false);

  // Base inicial config
  const [initialBaseInput, setInitialBaseInput] = useState<string>(
    currentCash.initialCash ? String(currentCash.initialCash) : '50000'
  );

  // Retiro de efectivo
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalReason, setWithdrawalReason] = useState<string>('');

  // Cierre de caja contado
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [closureSuccessMessage, setClosureSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedCountedCash = parseFloat(countedCashInput.replace(/\D/g, '')) || 0;
  const diff = countedCashInput !== '' ? parsedCountedCash - todayExpectedCash : 0;
  const isDiffZero = Math.abs(diff) <= 50;
  const isMissing = diff < -50;
  const isSurplus = diff > 50;

  const handleCopyBank = () => {
    navigator.clipboard?.writeText(BANK_ACCOUNT_NUMBER);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleDownloadTodayPDF = () => {
    const todaySalesList = sales.filter(s => s.date === todayDate);
    const todayExpensesList = expenses.filter(e => e.date === todayDate);
    const todaySessionsList = closedSessions.filter(cs => {
      const d = new Date(cs.closedAt).toISOString().split('T')[0];
      return d === todayDate;
    });

    exportToPDF({
      periodLabel: `Cierre Diario - ${todayDate}`,
      startDate: todayDate,
      endDate: todayDate,
      sales: todaySalesList,
      expenses: todayExpensesList,
      closedSessions: todaySessionsList,
      initialCash: currentCash.initialCash,
      countedCash: parsedCountedCash > 0 ? parsedCountedCash : undefined,
      cashWithdrawals: currentCash.withdrawals,
      closureNotes: closureNotes.trim() || undefined,
      operatorName: currentUser.name || currentUser.username,
    });
  };

  const handleDownloadPastClosurePDF = (c: CashClosure) => {
    const closureSales = sales.filter(s => s.date === c.date);
    const closureExpenses = expenses.filter(e => e.date === c.date);
    const closureSessions = closedSessions.filter(cs => {
      const d = new Date(cs.closedAt).toISOString().split('T')[0];
      return d === c.date;
    });

    exportToPDF({
      periodLabel: `Cierre Diario - ${c.date}`,
      startDate: c.date,
      endDate: c.date,
      sales: closureSales,
      expenses: closureExpenses,
      closedSessions: closureSessions,
      initialCash: c.initialCash,
      countedCash: c.countedCash,
      closureNotes: c.notes,
      operatorName: currentUser.name || currentUser.username,
    });
  };

  const handleUpdateBase = () => {
    const val = parseFloat(initialBaseInput.replace(/\D/g, '')) || 0;
    openCashRegister(val);
    alert(`Base inicial actualizada a ${formatCOP(val)}`);
  };

  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawalAmount.replace(/\D/g, '')) || 0;
    if (val <= 0 || !withdrawalReason.trim()) {
      alert('Por favor ingrese un valor válido y el motivo del retiro de efectivo.');
      return;
    }
    addCashWithdrawal(val, withdrawalReason.trim());
    setWithdrawalAmount('');
    setWithdrawalReason('');
    setActiveTab('arqueo');
  };

  const handleConfirmClosure = () => {
    if (countedCashInput === '') {
      alert('Por favor ingrese el efectivo contado en billetes y monedas.');
      return;
    }
    if (!confirm('¿Está seguro de cerrar y guardar definitivamente la caja del día? Esta operación registrará el arqueo.')) {
      return;
    }

    const closure = closeCashRegister(parsedCountedCash, closureNotes.trim() || undefined);
    setClosureSuccessMessage(`¡Cierre de caja guardado con éxito! Estado: ${closure.status.toUpperCase()}`);
    setTimeout(() => {
      setClosureSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">
                CONTROL DE CAJA & ARQUEO DIARIO
              </h3>
              <p className="text-xs text-slate-400 capitalize">{formatFullDateEs(currentCash.date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('arqueo')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'arqueo'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            💵 Arqueo y Cierre del Día
          </button>
          <button
            onClick={() => setActiveTab('retiro')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'retiro'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            💸 Retiro de Efectivo ({currentCash.withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'historial'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1" />
            Historial de Cierres ({cashClosures.length})
          </button>
        </div>

        {/* Bank Account Notice Banner */}
        <div className="mx-4 mt-3 sm:mx-5 bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                Cuenta Bancaria para Consignar
              </p>
              <p className="text-xs sm:text-sm font-black text-amber-800">
                {BANK_ACCOUNT_NOTICE}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyBank}
            className="self-start sm:self-center px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBank ? '¡Copiado!' : 'Copiar Cuenta'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'arqueo' && (
            <>
              {/* Formula & Live Balance Display */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Estado de la Caja:</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${currentCash.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {currentCash.isOpen ? '🟢 ABIERTA' : '🔒 CERRADA'}
                  </span>
                </div>

                {/* Base inicial config */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium">Base Inicial en Efectivo:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={initialBaseInput ?? ''}
                      onChange={e => setInitialBaseInput(e.target.value)}
                      className="w-28 bg-white border border-slate-300 rounded px-2 py-1 text-right font-bold text-xs"
                    />
                    <button
                      onClick={handleUpdateBase}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* Formula lines */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-800">
                  <span className="font-medium">(+) Ventas en Efectivo:</span>
                  <strong className="font-bold">{formatCOP(todayCashSales)}</strong>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-rose-800">
                  <span className="font-medium">(−) Gastos en Efectivo:</span>
                  <strong className="font-bold">{formatCOP(todayCashExpenses)}</strong>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-amber-900">
                  <span className="font-medium">(−) Retiros de Efectivo:</span>
                  <strong className="font-bold">{formatCOP(todayWithdrawalsTotal)}</strong>
                </div>

                {/* Result: CAJA ESPERADA */}
                <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-black text-sm uppercase text-slate-900 block">
                      CAJA ESPERADA (FÍSICA)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dinero que debe haber físicamente en el cajón
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                    {formatCOP(todayExpectedCash)}
                  </span>
                </div>
              </div>

              {/* Informative: Non-cash balance (Transferencias) */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-950 block">Transferencias recibidas hoy:</span>
                  <span className="text-blue-600">Nequi, Daviplata, Bancolombia (no entra a caja física)</span>
                </div>
                <span className="font-black text-sm text-blue-800">{formatCOP(todayTransferSales)}</span>
              </div>

              {/* CIERRE DIARIO: 16 Required Fields Display Box */}
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/30 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-black text-sm uppercase tracking-wide text-slate-900">
                    Resumen Previo al Cierre Diario
                  </h4>
                </div>

                {/* Grid with the 16 exact values from Section 25 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">FECHA</span>
                    <span className="font-bold text-slate-900">{todayDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">VENTAS TOTALES</span>
                    <span className="font-bold text-slate-900">{formatCOP(todaySalesTotal)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px] uppercase font-bold">EFECTIVO</span>
                    <span className="font-bold text-emerald-700">{formatCOP(todayCashSales)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block text-[10px] uppercase font-bold">TRANSFERENCIAS</span>
                    <span className="font-bold text-blue-700">{formatCOP(todayTransferSales)}</span>
                  </div>
                  <div>
                    <span className="text-rose-700 block text-[10px] uppercase font-bold">GASTOS TOTALES</span>
                    <span className="font-bold text-rose-700">{formatCOP(todayExpensesTotal)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">GASTOS EFECTIVO</span>
                    <span className="font-bold text-slate-900">{formatCOP(todayCashExpenses)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">GASTOS TRANSFERENCIA</span>
                    <span className="font-bold text-slate-900">{formatCOP(todayTransferExpenses)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">BASE INICIAL</span>
                    <span className="font-bold text-slate-900">{formatCOP(currentCash.initialCash)}</span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[10px] uppercase font-bold">VENTAS GARGUERÍA</span>
                    <span className="font-bold text-amber-800">{formatCOP(areaSales.gargueria)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">VENTAS XBOX / PS</span>
                    <span className="font-bold text-emerald-800">{formatCOP(areaSales.xbox)}</span>
                  </div>
                  <div>
                    <span className="text-indigo-800 block text-[10px] uppercase font-bold">VENTAS PAPELERÍA / BEB</span>
                    <span className="font-bold text-indigo-800">{formatCOP(areaSales.papeleria)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">SESIONES CONSOLA</span>
                    <span className="font-bold text-slate-900">{todayConsoleSessionsCount} cerradas</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">PRODUCTOS VENDIDOS</span>
                    <span className="font-bold text-slate-900">{todayProductsSoldCount} unidades</span>
                  </div>
                  <div>
                    <span className="text-emerald-900 block text-[10px] uppercase font-bold">CAJA ESPERADA</span>
                    <span className="font-black text-emerald-700">{formatCOP(todayExpectedCash)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    EFECTIVO CONTADO EN CAJA (BILLETES Y MONEDAS) ($):
                  </label>
                  <input
                    type="number"
                    placeholder="Ingrese el valor total contado en el cajón"
                    value={countedCashInput}
                    onChange={e => setCountedCashInput(e.target.value)}
                    className="w-full text-lg font-black bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Real-Time Difference calculation */}
                {countedCashInput !== '' && (
                  <div className="p-3.5 rounded-xl border space-y-2 bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">DIFERENCIA (Contado − Esperado):</span>
                      <span className={`text-base font-black ${
                        isDiffZero ? 'text-emerald-700' : isMissing ? 'text-rose-600' : 'text-amber-700'
                      }`}>
                        {formatCOP(diff)}
                      </span>
                    </div>

                    {/* Prominent Badge */}
                    <div className="text-center pt-1">
                      {isDiffZero && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-full shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>🟢 CAJA CUADRADA</span>
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 text-white font-black text-xs sm:text-sm rounded-full shadow-xs animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                          <span>🔴 FALTANTE DE {formatCOP(Math.abs(diff))}</span>
                        </span>
                      )}
                      {isSurplus && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-xs">
                          <span>🟠 SOBRANTE DE {formatCOP(diff)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Observaciones del cierre (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Se pagó taxi con base / pendiente arqueo monedas"
                    value={closureNotes}
                    onChange={e => setClosureNotes(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>

                {closureSuccessMessage && (
                  <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center rounded-xl">
                    {closureSuccessMessage}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-descargar-pdf-cierre-hoy"
                    onClick={handleDownloadTodayPDF}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <FileText className="w-4 h-4" />
                    <span>DESCARGAR PDF CIERRE</span>
                  </button>

                  <button
                    id="btn-confirmar-cierre-caja"
                    onClick={handleConfirmClosure}
                    className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>GUARDAR CIERRE DIARIO</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB: RETIROS DE EFECTIVO */}
          {activeTab === 'retiro' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-700">Registrar Salida de Dinero de Caja</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Monto a retirar ($):</label>
                    <input
                      type="number"
                      placeholder="Ej. 20000"
                      value={withdrawalAmount}
                      onChange={e => setWithdrawalAmount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Motivo / Para quién:</label>
                    <input
                      type="text"
                      placeholder="Ej. Adelanto, compra insumos"
                      value={withdrawalReason}
                      onChange={e => setWithdrawalReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateWithdrawal}
                  className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 cursor-pointer"
                >
                  Registrar Retiro
                </button>
              </div>

              {/* History of withdrawals today */}
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase block mb-2">
                  Retiros del Día ({currentCash.withdrawals.length})
                </span>
                {currentCash.withdrawals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No hay retiros registrados hoy.</p>
                ) : (
                  <div className="space-y-2">
                    {currentCash.withdrawals.map(w => (
                      <div
                        key={w.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-800 block">{w.reason}</strong>
                          <span className="text-slate-400">{w.time}</span>
                        </div>
                        <span className="font-black text-rose-600 text-sm">
                          −{formatCOP(w.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL DE CIERRES ANTERIORES */}
          {activeTab === 'historial' && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-slate-600 block">
                Cierres Diarios Anteriores Guardados ({cashClosures.length})
              </span>
              {cashClosures.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No hay cierres guardados aún. Al pulsar &quot;Guardar Cierre Diario&quot;, quedará archivado permanentemente aquí.
                </div>
              ) : (
                <div className="space-y-3">
                  {cashClosures.map(c => (
                    <div
                      key={c.id}
                      className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold capitalize">
                          {formatFullDateEs(c.date)}
                        </strong>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadPastClosurePDF(c)}
                            className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Descargar PDF de este cierre"
                          >
                            <FileText className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                              c.status === 'cuadrada'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'faltante'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
                        <div>
                          <span>Ventas Totales:</span>
                          <strong className="block text-slate-900">{formatCOP(c.totalSales)}</strong>
                        </div>
                        <div>
                          <span>Efectivo:</span>
                          <strong className="block text-emerald-700">{formatCOP(c.cashSales)}</strong>
                        </div>
                        <div>
                          <span>Transferencias:</span>
                          <strong className="block text-blue-700">{formatCOP(c.transferSales)}</strong>
                        </div>
                        <div>
                          <span>Diferencia:</span>
                          <strong className="block font-bold">{formatCOP(c.difference)}</strong>
                        </div>
                      </div>

                      {c.gargueriaSales !== undefined && (
                        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                          <span>Garguería: <strong className="text-slate-700">{formatCOP(c.gargueriaSales)}</strong></span>
                          <span>Xbox/PS: <strong className="text-slate-700">{formatCOP(c.xboxSales || 0)}</strong></span>
                          <span>Papelería: <strong className="text-slate-700">{formatCOP(c.papeleriaSales || 0)}</strong></span>
                        </div>
                      )}

                      {c.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                          Nota: {c.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
