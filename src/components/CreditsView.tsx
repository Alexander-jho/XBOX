import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CreditAccount, PaymentMethod, TransferProvider, BusinessArea } from '../types';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  ArrowRight,
  Receipt,
  Plus,
  Trash2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  History,
  Copy,
  Check,
  Building2,
  CalendarClock,
  ShieldCheck,
  MessageCircle,
  FileText,
} from 'lucide-react';
import {
  formatCOP,
  formatFullDateEs,
  BANK_ACCOUNT_NOTICE,
  BANK_ACCOUNT_NUMBER,
  getTodayDateString,
  getCurrentTimeString,
} from '../utils/formatters';

export const CreditsView: React.FC = () => {
  const {
    credits,
    registerCreditPayment,
    deleteCredit,
    addCreditSale,
    pendingCreditsCount,
    totalPendingCreditsAmount,
    todayCashCreditPayments,
    todayTransferCreditPayments,
    todayCreditPaymentsTotal,
    isAdmin,
    currentUser,
  } = useApp();

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'pagado'>('todos');
  const [areaFilter, setAreaFilter] = useState<string>('todos');
  const [copiedBank, setCopiedBank] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<CreditAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [paymentTransferProvider, setPaymentTransferProvider] = useState<TransferProvider>('Nequi');
  const [paymentTransferRef, setPaymentTransferRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCreditForHistory, setSelectedCreditForHistory] = useState<CreditAccount | null>(null);

  // New Credit direct modal
  const [isNewCreditModalOpen, setIsNewCreditModalOpen] = useState(false);
  const [newCreditCustomer, setNewCreditCustomer] = useState('');
  const [newCreditPhone, setNewCreditPhone] = useState('');
  const [newCreditAmount, setNewCreditAmount] = useState('');
  const [newCreditArea, setNewCreditArea] = useState<BusinessArea>('gargueria');
  const [newCreditDescription, setNewCreditDescription] = useState('');
  const [newCreditDueDate, setNewCreditDueDate] = useState('');
  const [isNewCreditExtemporaneous, setIsNewCreditExtemporaneous] = useState(false);
  const [newCreditPastDate, setNewCreditPastDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [newCreditPastTime, setNewCreditPastTime] = useState('17:00');

  // Success notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const handleCopyBank = () => {
    navigator.clipboard?.writeText(BANK_ACCOUNT_NUMBER);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Filtered credits
  const filteredCredits = useMemo(() => {
    return credits.filter(c => {
      // Status filter
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
      // Area filter
      if (areaFilter !== 'todos' && c.area !== areaFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.customerName.toLowerCase().includes(q);
        const matchesPhone = c.customerPhone?.toLowerCase().includes(q);
        const desc = c.itemsSummary || (c as any).itemSummary || '';
        const matchesDesc = desc.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesDesc) return false;
      }
      return true;
    });
  }, [credits, statusFilter, areaFilter, searchQuery]);

  // Open payment modal
  const handleOpenPaymentModal = (credit: CreditAccount) => {
    setSelectedCreditForPayment(credit);
    setPaymentAmount(String(credit.currentBalance));
    setPaymentMethod('efectivo');
    setPaymentTransferProvider('Nequi');
    setPaymentTransferRef('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  // Submit payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditForPayment) return;

    const parsedAmount = parseFloat(paymentAmount.replace(/\D/g, '')) || 0;
    if (parsedAmount <= 0) {
      showNotification('error', 'El monto a abonar debe ser mayor a cero.');
      return;
    }

    if (parsedAmount > selectedCreditForPayment.currentBalance) {
      showNotification(
        'error',
        `El abono no puede superar el saldo pendiente actual (${formatCOP(selectedCreditForPayment.currentBalance)}).`
      );
      return;
    }

    if (paymentMethod === 'transferencia' && !paymentTransferRef.trim()) {
      showNotification('error', 'Por favor ingrese la referencia del comprobante de transferencia.');
      return;
    }

    registerCreditPayment({
      creditId: selectedCreditForPayment.id,
      amount: parsedAmount,
      paymentMethod,
      transferProvider: paymentMethod === 'transferencia' ? paymentTransferProvider : undefined,
      transferReference: paymentMethod === 'transferencia' ? paymentTransferRef : undefined,
      notes: paymentNotes.trim() || undefined,
    });

    showNotification(
      'success',
      `¡Abono de ${formatCOP(parsedAmount)} registrado exitosamente a favor de ${selectedCreditForPayment.customerName}!`
    );
    setIsPaymentModalOpen(false);
  };

  // Create new direct credit
  const handleCreateNewCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreditCustomer.trim()) {
      showNotification('error', 'El nombre del cliente es obligatorio para el crédito.');
      return;
    }

    const parsedAmount = parseFloat(newCreditAmount.replace(/\D/g, '')) || 0;
    if (parsedAmount <= 0) {
      showNotification('error', 'El monto de la deuda debe ser mayor a cero.');
      return;
    }

    addCreditSale({
      customerName: newCreditCustomer.trim(),
      customerPhone: newCreditPhone.trim() || undefined,
      area: newCreditArea,
      itemsSummary: newCreditDescription.trim() || `Venta a crédito en área ${newCreditArea.toUpperCase()}`,
      itemSummary: newCreditDescription.trim() || `Venta a crédito en área ${newCreditArea.toUpperCase()}`,
      total: parsedAmount,
      saleTotal: parsedAmount,
      dueDate: newCreditDueDate || undefined,
      notes: newCreditDescription.trim() || undefined,
      date: isNewCreditExtemporaneous && isAdmin ? newCreditPastDate : undefined,
      time: isNewCreditExtemporaneous && isAdmin ? newCreditPastTime : undefined,
      customDate: isNewCreditExtemporaneous && isAdmin ? newCreditPastDate : undefined,
      customTime: isNewCreditExtemporaneous && isAdmin ? newCreditPastTime : undefined,
    });

    showNotification(
      'success',
      `¡Crédito de ${formatCOP(parsedAmount)} creado a nombre de ${newCreditCustomer.trim()}!`
    );
    setIsNewCreditModalOpen(false);
    setNewCreditCustomer('');
    setNewCreditPhone('');
    setNewCreditAmount('');
    setNewCreditDescription('');
    setNewCreditDueDate('');
    setIsNewCreditExtemporaneous(false);
  };

  // Delete credit
  const handleDeleteCredit = (credit: CreditAccount) => {
    if (window.confirm(`¿Está seguro de eliminar el crédito de ${credit.customerName}? Esta acción no se puede deshacer.`)) {
      deleteCredit(credit.id);
      showNotification('success', 'Registro de crédito eliminado.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bank Account Notice - FIXED AND HIGHLY VISIBLE */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 block">
              Mapeo de Datos en Pantalla • Consignaciones Bancarias
            </span>
            <p className="text-sm sm:text-base font-black tracking-tight text-white font-mono">
              {BANK_ACCOUNT_NOTICE}
            </p>
            <span className="text-[11px] text-blue-200">
              Cuentas habilitadas: Nequi / Daviplata / Bancolombia
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyBank}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          {copiedBank ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
          <span>{copiedBank ? '¡Copiado!' : 'Copiar Cuenta'}</span>
        </button>
      </div>

      {/* Alert message notification */}
      {alertMessage && (
        <div
          className={`p-3.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
              : 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Header & KPI Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>Módulo de Créditos Abiertos (Fiados)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cuentas por cobrar a clientes, registro de abonos y control de cartera
          </p>
        </div>

        <button
          id="btn-nuevo-credito"
          onClick={() => setIsNewCreditModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>+ Registrar Nuevo Fiado / Crédito</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total por cobrar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total por Cobrar (Pendiente)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            {formatCOP(totalPendingCreditsAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingCreditsCount} {pendingCreditsCount === 1 ? 'cuenta activa' : 'cuentas activas'}
          </p>
        </div>

        {/* Abonos recaudados hoy */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Abonos Recaudados Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatCOP(todayCreditPaymentsTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            En caja: {formatCOP(todayCashCreditPayments)} • Transf: {formatCOP(todayTransferCreditPayments)}
          </p>
        </div>

        {/* Historial total de créditos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Histórico Fiados
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 tracking-tight">
            {formatCOP(credits.reduce((acc, c) => acc + c.saleTotal, 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {credits.length} créditos registrados en total
          </p>
        </div>

        {/* Pagados / Paz y Salvo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Cuentas Saldadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-600 tracking-tight">
            {credits.filter(c => c.status === 'pagado').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Clientes al día con pago total
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o ítem..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({credits.length})
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pendiente'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Pendientes ({pendingCreditsCount})
            </button>
            <button
              onClick={() => setStatusFilter('pagado')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pagado'
                  ? 'bg-emerald-600 text-white shadow-2xs font-black'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Saldados ({credits.filter(c => c.status === 'pagado').length})
            </button>
          </div>

          {/* Area filter dropdown */}
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:ring-2 focus:ring-amber-400"
          >
            <option value="todos">Todas las Áreas</option>
            <option value="gargueria">Garguería</option>
            <option value="papeleria">Papelería</option>
            <option value="xbox">Xbox / Consolas</option>
          </select>
        </div>
      </div>

      {/* Credits List Grid / Cards */}
      {filteredCredits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-slate-900">No se encontraron cuentas de crédito</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No hay resultados que coincidan con los filtros aplicados.'
              : 'Aún no hay ventas a crédito registradas en el sistema. Puede registrar una con el botón de nuevo fiado.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsNewCreditModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar primer fiado</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredCredits.map(credit => {
            const isFullyPaid = credit.status === 'pagado' || credit.currentBalance <= 0;
            const progressPct = credit.saleTotal > 0 ? Math.min(100, Math.round((credit.paidAmount / credit.saleTotal) * 100)) : 100;
            const cleanPhone = credit.customerPhone?.replace(/\D/g, '');

            return (
              <div
                key={credit.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between ${
                  isFullyPaid
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-amber-200 hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Header: Customer Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isFullyPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900 font-black'
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {credit.customerName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {credit.customerPhone ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{credit.customerPhone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/57${cleanPhone}?text=Hola%20${encodeURIComponent(
                                    credit.customerName
                                  )},%20te%20saludamos%20del%20negocio.%20Tienes%20un%20saldo%20pendiente%20de%20${encodeURIComponent(
                                    formatCOP(credit.currentBalance)
                                  )}.%20La%20cuenta%20para%20consignar%20es%203188287279.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 ml-1 font-bold"
                                  title="Enviar recordatorio por WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sin teléfono</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        isFullyPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isFullyPaid ? '✅ Paz y Salvo' : '⏳ Pendiente'}
                    </span>
                  </div>

                  {/* Financial Balance Summary */}
                  <div className="py-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Saldo Pendiente:</span>
                      <span
                        className={`text-lg font-black tracking-tight ${
                          isFullyPaid ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {formatCOP(credit.currentBalance)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          isFullyPaid ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Deuda Total: {formatCOP(credit.saleTotal)}</span>
                      <span className="font-bold text-slate-600">
                        Abonado: {formatCOP(credit.paidAmount)} ({progressPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Details & Area */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs space-y-1 my-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Área del Negocio:</span>
                      <span className="font-black text-slate-700 uppercase">{credit.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Fecha de Registro:</span>
                      <span className="font-medium text-slate-700">{credit.date} {credit.time}</span>
                    </div>
                    {credit.dueDate && (
                      <div className="flex items-center justify-between text-[11px] text-amber-800 font-bold">
                        <span>Compromiso de Pago:</span>
                        <span>{credit.dueDate}</span>
                      </div>
                    )}
                    <div className="pt-1 text-[11px] text-slate-600 line-clamp-2 border-t border-slate-200">
                      <strong>Detalle:</strong> {credit.itemSummary}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCreditForHistory(credit);
                      setIsHistoryModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Ver historial de abonos"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Abonos ({credit.payments.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Admin delete */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCredit(credit)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Eliminar crédito (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Pay / Abono button */}
                    {!isFullyPaid ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal(credit)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>+ Abonar</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Al Día</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REGISTRAR ABONO / PAGO                                */}
      {/* ============================================================ */}
      {isPaymentModalOpen && selectedCreditForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Registrar Abono a Crédito
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong>{selectedCreditForPayment.customerName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Debt info banner */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Saldo Pendiente Actual
                </span>
                <span className="text-xl font-black text-amber-700">
                  {formatCOP(selectedCreditForPayment.currentBalance)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentAmount(String(selectedCreditForPayment.currentBalance))}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
              >
                Pagar Saldo Total
              </button>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Monto a Abonar (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedCreditForPayment.currentBalance}
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="Monto del abono"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                {/* Quick amount suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[2000, 5000, 10000, 20000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPaymentAmount(String(Math.min(val, selectedCreditForPayment.currentBalance)))}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold cursor-pointer"
                    >
                      +{formatCOP(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medio de Recepción del Abono *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                      paymentMethod === 'efectivo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black">🟢 EFECTIVO</span>
                    <span className="text-[10px] text-slate-500">Suma a caja física</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                      paymentMethod === 'transferencia'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black">🔵 TRANSFERENCIA</span>
                    <span className="text-[10px] text-slate-500">Consignación bancaria</span>
                  </button>
                </div>
              </div>

              {/* Conditional Transfer Options */}
              {paymentMethod === 'transferencia' && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-blue-200 flex items-center justify-between text-[11px]">
                    <span className="text-blue-900 font-mono font-bold">
                      {BANK_ACCOUNT_NOTICE}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyBank}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      {copiedBank ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-blue-900 block mb-0.5">
                        Plataforma
                      </label>
                      <select
                        value={paymentTransferProvider}
                        onChange={e => setPaymentTransferProvider(e.target.value as TransferProvider)}
                        className="w-full p-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Otro">Otro banco</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-blue-900 block mb-0.5">
                        Referencia / Comprobante *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: M184920"
                        value={paymentTransferRef}
                        onChange={e => setPaymentTransferRef(e.target.value)}
                        className="w-full p-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notas u Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Abonó mitad de lo pendiente"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Confirmar Abono ({formatCOP(parseFloat(paymentAmount.replace(/\D/g, '')) || 0)})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: HISTORIAL DE ABONOS DE UN CRÉDITO                    */}
      {/* ============================================================ */}
      {isHistoryModalOpen && selectedCreditForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Historial de Abonos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong>{selectedCreditForHistory.customerName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Summary card */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">DEUDA INICIAL</span>
                <span className="font-bold text-slate-900">{formatCOP(selectedCreditForHistory.saleTotal)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block">TOTAL ABONADO</span>
                <span className="font-bold text-emerald-600">{formatCOP(selectedCreditForHistory.paidAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-600 font-bold block">SALDO ACTUAL</span>
                <span className="font-black text-amber-700">{formatCOP(selectedCreditForHistory.currentBalance)}</span>
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pagos Registrados ({selectedCreditForHistory.payments.length})
              </h5>

              {selectedCreditForHistory.payments.length === 0 ? (
                <div className="bg-slate-50 p-6 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
                  No se han registrado abonos todavía para este crédito.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedCreditForHistory.payments.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{formatCOP(p.amount)}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              p.paymentMethod === 'efectivo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {p.paymentMethod === 'efectivo' ? 'Efectivo' : `Transf. (${p.transferProvider})`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.date} a las {p.time} {p.operatorName ? `• Por: ${p.operatorName}` : ''}
                        </p>
                        {p.transferReference && (
                          <p className="text-[10px] text-blue-600 font-mono mt-0.5">
                            Ref: {p.transferReference}
                          </p>
                        )}
                        {p.notes && <p className="text-[11px] text-slate-600 italic mt-0.5">"{p.notes}"</p>}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Saldo posterior</span>
                        <span className="font-bold text-slate-700">{formatCOP(p.remainingBalanceAfter)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REGISTRAR NUEVO FIADO / CRÉDITO DIRECTO               */}
      {/* ============================================================ */}
      {isNewCreditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  +
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Nuevo Crédito / Fiado
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registrar venta a crédito a nombre de un cliente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCreditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewCredit} className="space-y-3.5">
              {/* Customer Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Cliente *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Gómez / Vecino Tienda"
                    value={newCreditCustomer}
                    onChange={e => setNewCreditCustomer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teléfono / Celular (Opcional - para WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="Ej: 3101234567"
                    value={newCreditPhone}
                    onChange={e => setNewCreditPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Area and Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Área del Negocio *
                  </label>
                  <select
                    value={newCreditArea}
                    onChange={e => setNewCreditArea(e.target.value as BusinessArea)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="gargueria">Garguería</option>
                    <option value="papeleria">Papelería</option>
                    <option value="xbox">Xbox / Consolas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monto Fiado (COP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0"
                      value={newCreditAmount}
                      onChange={e => setNewCreditAmount(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description of items */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Detalle de Productos / Motivo
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2 Papas Margarita, 1 Coca-Cola 400ml"
                  value={newCreditDescription}
                  onChange={e => setNewCreditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:bg-white"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fecha de Compromiso de Pago (Opcional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={newCreditDueDate}
                    onChange={e => setNewCreditDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Extemporaneous option for Admin */}
              {isAdmin && (
                <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNewCreditExtemporaneous}
                        onChange={e => setIsNewCreditExtemporaneous(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span>Registro extemporáneo (Fecha pasada)</span>
                    </label>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded">
                      Admin
                    </span>
                  </div>

                  {isNewCreditExtemporaneous && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-indigo-900 block mb-0.5">
                          Fecha Pasada
                        </label>
                        <input
                          type="date"
                          value={newCreditPastDate}
                          onChange={e => setNewCreditPastDate(e.target.value)}
                          className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-indigo-900 block mb-0.5">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={newCreditPastTime}
                          onChange={e => setNewCreditPastTime(e.target.value)}
                          className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Informative notice */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                ℹ️ Esta venta quedará registrada como cuenta por cobrar. No sumará dinero a la caja física de hoy hasta que el cliente realice un abono en efectivo.
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCreditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Guardar Crédito</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
