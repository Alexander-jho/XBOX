import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessArea, PaymentMethod, TransferProvider, Sale, SaleItem, Product } from '../types';
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
  Edit2,
  Trash2,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Save,
  Package,
  PlusCircle,
  CreditCard,
} from 'lucide-react';
import { formatCOP, getTodayDateString, getCurrentTimeString, formatFullDateEs } from '../utils/formatters';

type DatePreset = 'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizada' | 'todas';

export const SalesHistoryView: React.FC = () => {
  const {
    sales,
    products,
    isAdmin,
    currentUser,
    editSale,
    deleteSale,
    registerSale,
    isOnlineSyncActive,
    cloudVersion,
  } = useApp();

  const [datePreset, setDatePreset] = useState<DatePreset>('hoy');
  const [customStartDate, setCustomStartDate] = useState<string>(getTodayDateString());
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayDateString());

  const [filterArea, setFilterArea] = useState<string>('todas');
  const [filterPayment, setFilterPayment] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected sale for detail modal
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Admin Edit Sale Modal State
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editItems, setEditItems] = useState<SaleItem[]>([]);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [editTransferProvider, setEditTransferProvider] = useState<TransferProvider>('Nequi');
  const [editTransferRef, setEditTransferRef] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [selectedAddProductId, setSelectedAddProductId] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Admin Extemporaneous Sale Modal State
  const [showExtemporaneousModal, setShowExtemporaneousModal] = useState<boolean>(false);
  const [extempDate, setExtempDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [extempTime, setExtempTime] = useState<string>('16:00');
  const [extempArea, setExtempArea] = useState<BusinessArea>('gargueria');
  const [extempItems, setExtempItems] = useState<SaleItem[]>([]);
  const [extempPaymentMethod, setExtempPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [extempTransferProvider, setExtempTransferProvider] = useState<TransferProvider>('Nequi');
  const [extempTransferRef, setExtempTransferRef] = useState<string>('');
  const [extempNotes, setExtempNotes] = useState<string>('');
  const [extempCustomerName, setExtempCustomerName] = useState<string>('');
  const [extempCustomerPhone, setExtempCustomerPhone] = useState<string>('');
  const [extempAddProductId, setExtempAddProductId] = useState<string>('');
  const [isSavingExtemp, setIsSavingExtemp] = useState<boolean>(false);

  // Delete Confirmation Modal
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [returnStockOnDelete, setReturnStockOnDelete] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Feedback banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => setBannerMessage(null), 4500);
  };

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
        const idMatch = s.id.toLowerCase().includes(q);
        const itemMatch = s.items.some(i => i.name.toLowerCase().includes(q));
        const refMatch = s.transferReference?.toLowerCase().includes(q);
        const notesMatch = s.notes?.toLowerCase().includes(q);
        const userMatch = s.recordedBy?.toLowerCase().includes(q);
        const clientMatch = s.customerName?.toLowerCase().includes(q);
        if (!idMatch && !itemMatch && !refMatch && !notesMatch && !userMatch && !clientMatch) return false;
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

  const totalCredit = useMemo(() => {
    return filteredSales.filter(s => s.paymentMethod === 'credito').reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  // Open Edit Modal
  const handleOpenEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setEditItems(sale.items.map(i => ({ ...i })));
    setEditPaymentMethod(sale.paymentMethod);
    setEditTransferProvider(sale.transferProvider || 'Nequi');
    setEditTransferRef(sale.transferReference || '');
    setEditDate(sale.date);
    setEditTime(sale.time);
    setEditNotes(sale.notes || '');
    setEditCustomerName(sale.customerName || '');
    setEditCustomerPhone(sale.customerPhone || '');
    setSelectedAddProductId('');
  };

  // Modify quantity in Edit Modal
  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setEditItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = Math.max(1, item.quantity + delta);
      item.quantity = newQty;
      item.subtotal = item.unitPrice * newQty;
      return updated;
    });
  };

  const handleSetItemQuantityDirect = (index: number, val: string) => {
    const qty = parseInt(val.replace(/\D/g, ''), 10) || 1;
    setEditItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.quantity = Math.max(1, qty);
      item.subtotal = item.unitPrice * item.quantity;
      return updated;
    });
  };

  const handleSetItemPriceDirect = (index: number, val: string) => {
    const price = parseFloat(val.replace(/\D/g, '')) || 0;
    setEditItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.unitPrice = price;
      item.subtotal = price * item.quantity;
      return updated;
    });
  };

  const handleRemoveItemFromEdit = (index: number) => {
    if (editItems.length <= 1) {
      alert('La venta debe contener al menos un producto. Si desea cancelar toda la venta, utilice la opción Anular.');
      return;
    }
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItemToEdit = () => {
    if (!selectedAddProductId) return;
    const prod = products.find(p => p.id === selectedAddProductId);
    if (!prod) return;

    setEditItems(prev => {
      const existingIdx = prev.findIndex(i => i.productId === prod.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].subtotal = updated[existingIdx].unitPrice * updated[existingIdx].quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          unitPrice: prod.price,
          quantity: 1,
          subtotal: prod.price,
          area: prod.area,
        },
      ];
    });
    setSelectedAddProductId('');
  };

  const calculatedEditTotal = useMemo(() => {
    return editItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [editItems]);

  // Submit Sale Edit
  const handleSaveSaleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    if (editItems.length === 0) {
      alert('La venta debe tener al menos un artículo.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await editSale(editingSale.id, {
        items: editItems,
        total: calculatedEditTotal,
        paymentMethod: editPaymentMethod,
        transferProvider: editPaymentMethod === 'transferencia' ? editTransferProvider : undefined,
        transferReference: editPaymentMethod === 'transferencia' ? editTransferRef.trim() || undefined : undefined,
        notes: editNotes.trim() || undefined,
        date: editDate || editingSale.date,
        time: editTime || editingSale.time,
        customerName: editPaymentMethod === 'credito' ? editCustomerName.trim() || undefined : undefined,
        customerPhone: editPaymentMethod === 'credito' ? editCustomerPhone.trim() || undefined : undefined,
      });

      if (res.success) {
        showBanner(`✓ ${res.message}`, 'success');
        setEditingSale(null);
      } else {
        showBanner(`Error: ${res.message}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Error al actualizar la venta: ${err?.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Delete Sale
  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteSale(saleToDelete.id, returnStockOnDelete);
      if (res.success) {
        showBanner(`✓ ${res.message}`, 'success');
        setSaleToDelete(null);
      } else {
        showBanner(`Error: ${res.message}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Error al anular la venta: ${err?.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Extemporaneous Sale Logic
  const handleAddExtempItem = () => {
    if (!extempAddProductId) return;
    const prod = products.find(p => p.id === extempAddProductId);
    if (!prod) return;

    setExtempItems(prev => {
      const existingIdx = prev.findIndex(i => i.productId === prod.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].subtotal = updated[existingIdx].unitPrice * updated[existingIdx].quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          unitPrice: prod.price,
          quantity: 1,
          subtotal: prod.price,
          area: prod.area,
        },
      ];
    });
    setExtempAddProductId('');
  };

  const calculatedExtempTotal = useMemo(() => {
    return extempItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [extempItems]);

  const handleSaveExtemporaneousSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (extempItems.length === 0) {
      alert('Por favor agregue al menos un producto a la venta extemporánea.');
      return;
    }
    if (!extempDate) {
      alert('Seleccione la fecha histórica de la venta.');
      return;
    }

    setIsSavingExtemp(true);
    try {
      const [year, month, day] = extempDate.split('-');
      const [hour, min] = (extempTime || '12:00').split(':');
      const timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min)).getTime();

      registerSale({
        area: extempArea,
        items: extempItems,
        total: calculatedExtempTotal,
        paymentMethod: extempPaymentMethod,
        transferProvider: extempPaymentMethod === 'transferencia' ? extempTransferProvider : undefined,
        transferReference: extempPaymentMethod === 'transferencia' ? extempTransferRef.trim() || undefined : undefined,
        notes: extempNotes.trim() ? `[Extemporánea] ${extempNotes.trim()}` : '[Venta Extemporánea]',
        date: extempDate,
        time: extempTime || '12:00',
        timestamp,
        isExtemporaneous: true,
        customerName: extempPaymentMethod === 'credito' ? extempCustomerName.trim() || undefined : undefined,
        customerPhone: extempPaymentMethod === 'credito' ? extempCustomerPhone.trim() || undefined : undefined,
      });

      showBanner(`✓ Venta extemporánea del día ${extempDate} registrada correctamente en el historial permanente. Total: ${formatCOP(calculatedExtempTotal)}.`, 'success');
      setShowExtemporaneousModal(false);
      setExtempItems([]);
      setExtempNotes('');
      setExtempCustomerName('');
      setExtempCustomerPhone('');
      setExtempTransferRef('');
    } catch (err: any) {
      showBanner(`Error al registrar venta extemporánea: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsSavingExtemp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14">
      {/* Toast Notification Banner */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-950/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 shrink-0" />
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Historial de Ventas & Movimientos
              </h2>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                title="Feed de ventas sincronizado en tiempo real"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>En vivo ({sales.length} transacciones)</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Registro permanente e individual de Papelería, Garguería y Consolas Xbox
            </p>
          </div>
        </div>

        {/* Action Buttons & Totals Summary */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Extemporaneous Button */}
          {isAdmin && (
            <button
              id="btn-venta-extemporanea-historial"
              onClick={() => setShowExtemporaneousModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-950/20 flex items-center gap-2 transition-all cursor-pointer"
              title="Registrar una venta con fecha pasada para nivelar inventario (ej. martes o miércoles no anotados)"
            >
              <Calendar className="w-4 h-4 text-indigo-200" />
              <span>+ Venta Extemporánea (Admin)</span>
            </button>
          )}

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Ventas:</span>
              <strong className="text-sm font-black text-slate-900">{formatCOP(totalFilteredSales)}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">Efectivo:</span>
              <strong className="text-sm font-black text-emerald-700">{formatCOP(totalCash)}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-blue-700 block text-[10px] uppercase font-bold">Transferencias:</span>
              <strong className="text-sm font-black text-blue-700">{formatCOP(totalTransfer)}</strong>
            </div>
            {totalCredit > 0 && (
              <>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-amber-700 block text-[10px] uppercase font-bold">Créditos:</span>
                  <strong className="text-sm font-black text-amber-700">{formatCOP(totalCredit)}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Date presets */}
        <div>
          <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5">
            Período de Consulta:
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
                {dp === 'hoy'
                  ? 'Hoy'
                  : dp === 'ayer'
                  ? 'Ayer'
                  : dp === 'semana'
                  ? 'Esta semana'
                  : dp === 'mes'
                  ? 'Este mes'
                  : dp === 'personalizada'
                  ? 'Fecha personalizada'
                  : 'Todas las fechas'}
              </button>
            ))}
          </div>

          {datePreset === 'personalizada' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-sm text-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-100">
          {/* Area */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Área de Negocio:</label>
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="todas">Todas las áreas</option>
              <option value="papeleria">📚 Papelería e Impresiones</option>
              <option value="gargueria">🍔 Garguería y Bebidas</option>
              <option value="xbox">🎮 Consolas Xbox</option>
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
              <option value="transferencia">🔵 Solo Transferencias (Nequi / Bancos)</option>
              <option value="credito">🟠 Solo Créditos (Fiados)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Buscar producto, ID o referencia:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej. Doritos, Nequi, Ref, Admin..."
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
          <div className="py-14 text-center text-slate-400 text-sm">
            <History className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
            <p className="font-bold text-slate-600">No hay ventas registradas con los filtros seleccionados.</p>
            <p className="text-xs text-slate-400 mt-1">
              Las nuevas ventas que realice se reflejarán aquí de forma instantánea.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Usuario / Rol</th>
                  <th className="py-3.5 px-4">Área</th>
                  <th className="py-3.5 px-4">Productos / Items</th>
                  <th className="py-3.5 px-4">Medio de Pago</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(s => {
                  const isEfectivo = s.paymentMethod === 'efectivo';
                  const isCredito = s.paymentMethod === 'credito';
                  const areaEmoji = s.area === 'xbox' ? '🎮' : s.area === 'gargueria' ? '🍔' : '📚';
                  const areaLabel = s.area === 'xbox' ? 'Xbox' : s.area === 'gargueria' ? 'Garguería' : 'Papelería';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{s.time}</span>
                          {s.isExtemporaneous && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold" title="Venta registrada de fecha anterior">
                              Extemp.
                            </span>
                          )}
                          {s.editedAt && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold" title={`Editada por ${s.editedBy || 'Admin'}`}>
                              Editada
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block font-mono">{s.date}</span>
                        <span className="text-[9px] text-slate-400 font-mono">ID: {s.id.slice(-6)}</span>
                      </td>

                      {/* User / Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800 capitalize">
                            {s.recordedBy || 'Cajero'}
                          </span>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                          <span>{areaEmoji}</span>
                          <span>{areaLabel}</span>
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          {s.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-slate-800 text-xs gap-2">
                              <span className="truncate">{item.name}</span>
                              <span className="font-mono text-slate-600 shrink-0">
                                <strong className="text-emerald-700">x{item.quantity}</strong> ({formatCOP(item.subtotal)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        {isEfectivo ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span>🟢 Efectivo</span>
                          </span>
                        ) : isCredito ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                              <span>🟠 Crédito (Fiado)</span>
                            </span>
                            {s.customerName && (
                              <span className="text-[11px] font-bold text-slate-600 block">
                                Cliente: {s.customerName}
                              </span>
                            )}
                          </div>
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

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm sm:text-base">
                        {formatCOP(s.total)}
                        {s.originalTotal && s.originalTotal !== s.total && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            {formatCOP(s.originalTotal)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedSaleDetail(s)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                            title="Ver detalles completos de la transacción"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin Edit Sale / Adjust Units */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEditSale(s)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Editar venta o ajustar unidades (Exclusivo Administrador)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Editar</span>
                            </button>
                          )}

                          {/* Admin Delete Sale */}
                          {isAdmin && (
                            <button
                              onClick={() => setSaleToDelete(s)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                              title="Anular venta del historial permanente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW DETAIL */}
      {/* ======================================================== */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Detalle de Transacción</h3>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>ID Transacción:</span>
                <strong className="font-mono text-slate-900">{selectedSaleDetail.id}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fecha y hora:</span>
                <strong className="text-slate-900">{selectedSaleDetail.date} a las {selectedSaleDetail.time}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Usuario que registró:</span>
                <strong className="text-slate-900 capitalize">{selectedSaleDetail.recordedBy || 'Cajero'}</strong>
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
                  <span>Referencia transferencia:</span>
                  <strong className="font-mono text-slate-900">{selectedSaleDetail.transferReference}</strong>
                </div>
              )}
              {selectedSaleDetail.customerName && (
                <div className="flex justify-between text-slate-600">
                  <span>Cliente registrado:</span>
                  <strong className="text-slate-900">{selectedSaleDetail.customerName} {selectedSaleDetail.customerPhone ? `(${selectedSaleDetail.customerPhone})` : ''}</strong>
                </div>
              )}
              {selectedSaleDetail.editedBy && (
                <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-xl">
                  <span>Última edición por:</span>
                  <strong className="font-bold">{selectedSaleDetail.editedBy}</strong>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="pt-2.5 border-t border-slate-200">
                <span className="font-bold text-slate-800 block mb-1.5">Artículos Vendidos:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedSaleDetail.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-800 p-2 bg-slate-50 rounded-xl">
                      <div>
                        <span className="font-bold">{i.name}</span>
                        <span className="block text-[11px] text-slate-500">
                          {i.quantity} x {formatCOP(i.unitPrice)}
                        </span>
                      </div>
                      <span className="font-black text-slate-900">{formatCOP(i.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Total Transacción:</span>
                <strong className="font-black text-emerald-700 text-lg">{formatCOP(selectedSaleDetail.total)}</strong>
              </div>

              {selectedSaleDetail.cashGiven && (
                <div className="flex justify-between text-slate-500 text-[11px] bg-slate-50 p-2 rounded-xl">
                  <span>Entregado: {formatCOP(selectedSaleDetail.cashGiven)}</span>
                  <span>Cambio devuelto: {formatCOP(selectedSaleDetail.change || 0)}</span>
                </div>
              )}

              {selectedSaleDetail.notes && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
                  <strong>Notas:</strong> {selectedSaleDetail.notes}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMIN EDIT SALE / AJUSTAR UNIDADES */}
      {/* ======================================================== */}
      {editingSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Editar Venta & Ajustar Unidades
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modifique las unidades, productos, precios o medio de pago. El stock y arqueo se recalcularán automáticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSale(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSaleEdit} className="space-y-4">
              {/* Notice Banner */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Ajuste en tiempo real:</span>
                  <span>
                    Al guardar los cambios, el inventario se ajustará automáticamente (sumando o restando la diferencia de unidades) y el Arqueo / Cierre de Caja del día correspondiente se actualizará de inmediato.
                  </span>
                </div>
              </div>

              {/* Date & Time fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de la Venta:</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora de la Venta:</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                  />
                </div>
              </div>

              {/* Items in Sale with Quantity and Price Controls */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Artículos de la Venta ({editItems.length})
                </label>

                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50 max-h-60 overflow-y-auto">
                  {editItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <div className="flex-1">
                        <span className="font-black text-slate-900 text-xs sm:text-sm block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Precio Unitario: {formatCOP(item.unitPrice)}
                        </span>
                      </div>

                      {/* Unit Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, -1)}
                            className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer font-bold"
                            title="Disminuir unidades"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={e => handleSetItemQuantityDirect(index, e.target.value)}
                            className="w-12 text-center bg-white py-1 font-black text-xs text-slate-900 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, 1)}
                            className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer font-bold"
                            title="Aumentar unidades"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="font-black text-slate-900 text-xs w-20 text-right">
                          {formatCOP(item.subtotal)}
                        </span>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromEdit(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Eliminar artículo de la venta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add product to current sale */}
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedAddProductId}
                    onChange={e => setSelectedAddProductId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                  >
                    <option value="">-- Agregar otro producto a esta venta --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatCOP(p.price)} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItemToEdit}
                    disabled={!selectedAddProductId}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <label className="font-bold text-slate-800 uppercase tracking-wider block">
                  Medio de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPaymentMethod('efectivo')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      editPaymentMethod === 'efectivo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟢 Efectivo
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPaymentMethod('transferencia')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      editPaymentMethod === 'transferencia'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔵 Transferencia
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPaymentMethod('credito')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      editPaymentMethod === 'credito'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟠 Crédito (Fiado)
                  </button>
                </div>

                {editPaymentMethod === 'transferencia' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Entidad:</label>
                      <select
                        value={editTransferProvider}
                        onChange={e => setEditTransferProvider(e.target.value as TransferProvider)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-xs"
                      >
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Dale">Dale</option>
                        <option value="Movii">Movii</option>
                        <option value="Otro">Otro banco</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Número de Referencia:</label>
                      <input
                        type="text"
                        value={editTransferRef}
                        onChange={e => setEditTransferRef(e.target.value)}
                        placeholder="Ej. M123456"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {editPaymentMethod === 'credito' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre del Cliente:</label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={e => setEditCustomerName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Teléfono:</label>
                      <input
                        type="text"
                        value={editCustomerPhone}
                        onChange={e => setEditCustomerPhone(e.target.value)}
                        placeholder="Ej. 3101234567"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Motivo o Notas de la Edición:
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Ej. Corrección de 2 a 1 unidad por error en tipeo..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                />
              </div>

              {/* Total Summary and Buttons */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Total Recalculado:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatCOP(calculatedEditTotal)}
                  </span>
                  {editingSale.total !== calculatedEditTotal && (
                    <span className="text-xs text-slate-400 block">
                      Anterior: {formatCOP(editingSale.total)} ({calculatedEditTotal > editingSale.total ? '+' : ''}{formatCOP(calculatedEditTotal - editingSale.total)})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSale(null)}
                    disabled={isSavingEdit}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-950/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingEdit ? 'Guardando...' : 'Guardar y Recalcular Caja'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADMIN NEW EXTEMPORANEOUS SALE (PAST DATES) */}
      {/* ======================================================== */}
      {showExtemporaneousModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Nueva Venta Extemporánea (Fechas Pasadas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nivelar inventario con ventas no registradas de días anteriores (ej. martes o miércoles)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExtemporaneousModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExtemporaneousSale} className="space-y-4">
              {/* Past Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs">
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">Fecha Pasada:</label>
                  <input
                    type="date"
                    value={extempDate}
                    max={getTodayDateString()}
                    onChange={e => setExtempDate(e.target.value)}
                    required
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">Hora Aproximada:</label>
                  <input
                    type="time"
                    value={extempTime}
                    onChange={e => setExtempTime(e.target.value)}
                    required
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">Área de Negocio:</label>
                  <select
                    value={extempArea}
                    onChange={e => setExtempArea(e.target.value as BusinessArea)}
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2 font-medium"
                  >
                    <option value="gargueria">🍔 Garguería y Bebidas</option>
                    <option value="papeleria">📚 Papelería e Impresiones</option>
                    <option value="xbox">🎮 Tiempo de Consolas</option>
                  </select>
                </div>
              </div>

              {/* Product Selector for Extemporaneous sale */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Artículos a Registrar ({extempItems.length})
                </label>

                <div className="flex items-center gap-2">
                  <select
                    value={extempAddProductId}
                    onChange={e => setExtempAddProductId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="">-- Seleccionar producto para agregar --</option>
                    {products
                      .filter(p => (extempArea === 'xbox' ? true : p.area === extempArea))
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatCOP(p.price)} (Stock actual: {p.stock})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExtempItem}
                    disabled={!extempAddProductId}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50 max-h-56 overflow-y-auto">
                  {extempItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium">
                      Seleccione productos arriba para agregarlos a esta venta histórica.
                    </div>
                  ) : (
                    extempItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <div className="flex-1">
                          <span className="font-black text-slate-900 text-xs block">{item.name}</span>
                          <span className="text-[11px] text-slate-500">{formatCOP(item.unitPrice)} c/u</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => {
                                setExtempItems(prev => {
                                  const updated = [...prev];
                                  const newQty = Math.max(1, updated[index].quantity - 1);
                                  updated[index].quantity = newQty;
                                  updated[index].subtotal = updated[index].unitPrice * newQty;
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 hover:bg-slate-200 text-slate-700 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-black text-xs text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setExtempItems(prev => {
                                  const updated = [...prev];
                                  updated[index].quantity += 1;
                                  updated[index].subtotal = updated[index].unitPrice * updated[index].quantity;
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 hover:bg-slate-200 text-slate-700 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-black text-slate-900 text-xs w-20 text-right">
                            {formatCOP(item.subtotal)}
                          </span>

                          <button
                            type="button"
                            onClick={() => setExtempItems(prev => prev.filter((_, i) => i !== index))}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <label className="font-bold text-slate-800 uppercase tracking-wider block">
                  Medio de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExtempPaymentMethod('efectivo')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      extempPaymentMethod === 'efectivo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟢 Efectivo
                  </button>

                  <button
                    type="button"
                    onClick={() => setExtempPaymentMethod('transferencia')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      extempPaymentMethod === 'transferencia'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔵 Transferencia
                  </button>

                  <button
                    type="button"
                    onClick={() => setExtempPaymentMethod('credito')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      extempPaymentMethod === 'credito'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🟠 Crédito (Fiado)
                  </button>
                </div>

                {extempPaymentMethod === 'transferencia' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Entidad:</label>
                      <select
                        value={extempTransferProvider}
                        onChange={e => setExtempTransferProvider(e.target.value as TransferProvider)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-xs"
                      >
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Dale">Dale</option>
                        <option value="Movii">Movii</option>
                        <option value="Otro">Otro banco</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Referencia comprobante:</label>
                      <input
                        type="text"
                        value={extempTransferRef}
                        onChange={e => setExtempTransferRef(e.target.value)}
                        placeholder="Ej. M123456"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {extempPaymentMethod === 'credito' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre del Cliente:</label>
                      <input
                        type="text"
                        value={extempCustomerName}
                        onChange={e => setExtempCustomerName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Teléfono:</label>
                      <input
                        type="text"
                        value={extempCustomerPhone}
                        onChange={e => setExtempCustomerPhone(e.target.value)}
                        placeholder="Ej. 3101234567"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Observaciones / Justificación:
                </label>
                <input
                  type="text"
                  value={extempNotes}
                  onChange={e => setExtempNotes(e.target.value)}
                  placeholder="Ej. Venta del martes no anotada en el cuaderno de entrega..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                />
              </div>

              {/* Total Summary and Buttons */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Total a Registrar:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatCOP(calculatedExtempTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExtemporaneousModal(false)}
                    disabled={isSavingExtemp}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingExtemp || extempItems.length === 0}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-950/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingExtemp ? 'Guardando...' : 'Registrar Venta Extemporánea'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CONFIRM DELETE SALE */}
      {/* ======================================================== */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">¿Anular esta venta?</h3>
                <p className="text-xs text-slate-500">Transacción ID: {saleToDelete.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Está a punto de eliminar la venta por <strong>{formatCOP(saleToDelete.total)}</strong> realizada el {saleToDelete.date} a las {saleToDelete.time}.
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnStockOnDelete}
                  onChange={e => setReturnStockOnDelete(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Reintegrar unidades vendidas al stock de inventario</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Anulando...' : 'Sí, Anular Venta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
