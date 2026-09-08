import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BusinessArea,
  PaymentMethod,
  TransferProvider,
  SaleItem,
  Product,
  XboxConsole,
  LightMode,
  ConsoleRate,
  ExtraControllerRate,
} from '../types';
import {
  X,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Coins,
  ArrowRightLeft,
  Gamepad2,
  AlertTriangle,
  Receipt,
  Sun,
  Moon,
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArea?: BusinessArea;
}

export const SalesModal: React.FC<SalesModalProps> = ({
  isOpen,
  onClose,
  initialArea = 'gargueria',
}) => {
  const {
    products,
    consoles,
    extraControllerRates,
    registerSale,
  } = useApp();

  // Selected Area
  const [selectedArea, setSelectedArea] = useState<BusinessArea>(initialArea);

  // Cart / Items in current sale
  const [cart, setCart] = useState<SaleItem[]>([]);

  // Search & Filters for Products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Xbox specific selections (when area === 'xbox')
  const [selectedConsoleId, setSelectedConsoleId] = useState<string>(consoles[0]?.id || 'c1');
  const [selectedLightMode, setSelectedLightMode] = useState<LightMode>('con_luz');
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [extraControllersCount, setExtraControllersCount] = useState<number>(0);
  const [selectedExtraRateId, setSelectedExtraRateId] = useState<string>(extraControllerRates[0]?.id || '');

  // Payment State (Mandatory)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [transferProvider, setTransferProvider] = useState<TransferProvider>('Nequi');
  const [transferReference, setTransferReference] = useState('');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState('');

  // UI state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered products for current non-xbox area
  const areaProducts = useMemo(() => {
    if (selectedArea === 'xbox') return [];
    return products.filter(p => p.area === selectedArea && p.isActive);
  }, [products, selectedArea]);

  // Categories for current area
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('Todos');
    areaProducts.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [areaProducts]);

  const displayedProducts = useMemo(() => {
    return areaProducts.filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.presentation && p.presentation.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [areaProducts, selectedCategory, searchQuery]);

  // Current selected Xbox console
  const currentConsole = useMemo(() => {
    return consoles.find(c => c.id === selectedConsoleId) || consoles[0];
  }, [consoles, selectedConsoleId]);

  // Cart Total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  // Cash change calculation
  const parsedCashGiven = parseFloat(cashGiven.replace(/\D/g, '')) || 0;
  const cashChange = parsedCashGiven >= cartTotal ? parsedCashGiven - cartTotal : 0;

  // Add product to cart
  const handleAddProduct = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.presentation ? `${product.name} (${product.presentation})` : product.name,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
          category: product.category,
        },
      ];
    });
  };

  // Add Xbox session to cart directly
  const handleAddXboxRate = (rate: ConsoleRate) => {
    const extraRate = extraControllerRates.find(r => r.id === selectedExtraRateId) || extraControllerRates[0];
    const basePrice = selectedLightMode === 'con_luz' ? rate.priceConLuz : rate.priceSinLuz;
    const extraPerCtrl = extraRate
      ? selectedLightMode === 'con_luz'
        ? extraRate.priceConLuz
        : extraRate.priceSinLuz
      : 0;
    const extraTotal = extraControllersCount > 0 ? extraControllersCount * extraPerCtrl : 0;
    const finalPrice = basePrice + extraTotal;

    const modeText = selectedLightMode === 'con_luz' ? 'Con luz' : 'Sin luz';
    let itemName = `${currentConsole.name} (${currentConsole.model}) — ${rate.label} [${modeText}]`;
    if (extraControllersCount > 0) {
      itemName += ` + ${extraControllersCount} ctrl extra`;
    }

    setCart(prev => [
      ...prev,
      {
        name: itemName,
        quantity: 1,
        unitPrice: finalPrice,
        subtotal: finalPrice,
        category: 'Xbox / Consolas',
      },
    ]);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = {
        ...item,
        quantity: newQty,
        subtotal: newQty * item.unitPrice,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'transferencia' && !transferReference.trim()) {
      alert('Por favor ingrese el número o referencia de la transferencia para validar el pago.');
      return;
    }

    registerSale({
      area: selectedArea,
      items: cart,
      total: cartTotal,
      paymentMethod,
      transferProvider: paymentMethod === 'transferencia' ? transferProvider : undefined,
      transferReference: paymentMethod === 'transferencia' ? transferReference : undefined,
      cashGiven: paymentMethod === 'efectivo' && parsedCashGiven > 0 ? parsedCashGiven : undefined,
      change: paymentMethod === 'efectivo' && parsedCashGiven > 0 ? cashChange : undefined,
      notes: saleNotes.trim() || undefined,
    });

    setSuccessMessage(`¡Venta de ${formatCOP(cartTotal)} registrada con éxito en ${paymentMethod.toUpperCase()}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      // Reset form
      setCart([]);
      setCashGiven('');
      setTransferReference('');
      setSaleNotes('');
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              +
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
                REGISTRAR NUEVA VENTA
              </h3>
              <p className="text-xs text-slate-500">Seleccione área, producto y medio de pago</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AREA SELECTION TABS (Item 2 & 21 in prompt) */}
        <div className="p-3 sm:px-5 bg-white border-b border-slate-200">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Paso 1: Seleccione el Área del Negocio
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="area-btn-gargueria"
              onClick={() => {
                setSelectedArea('gargueria');
                setSelectedCategory('Todos');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                selectedArea === 'gargueria'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">🍔</span>
              <span>Garguería</span>
            </button>

            <button
              id="area-btn-xbox"
              onClick={() => {
                setSelectedArea('xbox');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                selectedArea === 'xbox'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">🎮</span>
              <span>Xbox</span>
            </button>

            <button
              id="area-btn-papeleria"
              onClick={() => {
                setSelectedArea('papeleria');
                setSelectedCategory('Todos');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                selectedArea === 'papeleria'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">📚</span>
              <span>Papelería</span>
            </button>
          </div>
        </div>

        {/* Main Body: Split between Product Picker and Current Cart/Checkout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Product Selection or Xbox Console Selector */}
          <div className="md:col-span-7 p-4 border-r border-slate-200 overflow-y-auto max-h-[55vh] md:max-h-[62vh] space-y-4">
            {selectedArea === 'xbox' ? (
              /* XBOX SELECTION MODULE (Prompt sections 4, 5, 7) */
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600 block mb-2">
                    1. Seleccione la Consola
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {consoles.map(c => {
                      const isSelected = selectedConsoleId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConsoleId(c.id)}
                          className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">{c.name}</span>
                            <Gamepad2 className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          </div>
                          <span className="text-[11px] text-slate-500 block">{c.model}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modalidad: Con Luz vs Sin Luz */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase block">
                    Modalidad de energía / servicio:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLightMode('con_luz')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                        selectedLightMode === 'con_luz'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Con luz (Normal)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLightMode('sin_luz')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                        selectedLightMode === 'sin_luz'
                          ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Sin luz (Planta)</span>
                    </button>
                  </div>
                </div>

                {/* Extra Controllers configuration */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Controles adicionales
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExtraControllersCount(Math.max(0, extraControllersCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{extraControllersCount}</span>
                      <button
                        type="button"
                        onClick={() => setExtraControllersCount(extraControllersCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {extraControllersCount > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <label className="text-[11px] text-slate-500 block mb-1">Tarifa de control adicional:</label>
                      <select
                        value={selectedExtraRateId || ''}
                        onChange={e => setSelectedExtraRateId(e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-1.5"
                      >
                        {extraControllerRates.map(r => {
                          const price = selectedLightMode === 'con_luz' ? r.priceConLuz : r.priceSinLuz;
                          return (
                            <option key={r.id} value={r.id}>
                              {r.name} ({formatCOP(price)} c/u)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Rates for current console */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600 block mb-2">
                    2. Seleccione Tiempo ({currentConsole.name} - {currentConsole.model})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentConsole.rates.map(r => {
                      const price = selectedLightMode === 'con_luz' ? r.priceConLuz : r.priceSinLuz;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleAddXboxRate(r)}
                          className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-left font-bold shadow-xs cursor-pointer transition-all flex items-center justify-between active:scale-98"
                        >
                          <div>
                            <span className="text-sm block">{r.label}</span>
                            <span className="text-xs opacity-80">{r.minutes} minutos</span>
                          </div>
                          <span className="text-base font-black bg-emerald-700/50 px-2.5 py-1 rounded-lg">
                            {formatCOP(price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* GARGUERÍA OR PAPELERÍA PRODUCT PICKER (Prompt sections 8, 9, 10, 11) */
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder={`Buscar en ${selectedArea === 'gargueria' ? 'garguería (Chocorramo, Doritos, Coca-Cola...)' : 'papelería (copias, cuadernos, lápices...)'}`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap font-medium cursor-pointer transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {displayedProducts.map(p => {
                    const isLowStock = p.trackStock && p.stock <= p.minStock;
                    const isOutOfStock = p.trackStock && p.stock <= 0;

                    return (
                      <button
                        key={p.id}
                        disabled={isOutOfStock}
                        onClick={() => handleAddProduct(p)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xs active:scale-95'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight block line-clamp-2">
                              {p.name}
                            </span>
                          </div>
                          {p.presentation && (
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              {p.presentation}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-700">
                            {formatCOP(p.price)}
                          </span>
                          {p.trackStock && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {p.stock} disp.
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Shopping Cart, Payment Method & Confirm */}
          <div className="md:col-span-5 p-4 bg-slate-50 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[62vh] space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="text-xs font-bold uppercase text-slate-700">
                  Artículos en la venta ({cart.length})
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Vaciar lista
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Haga clic en un producto o tarifa de Xbox para agregarlo a esta venta.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 mr-2">
                        <span className="font-bold text-slate-800 block line-clamp-1">{item.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {item.quantity} x {formatCOP(item.unitPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-md border border-slate-200">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                          >
                            -
                          </button>
                          <span className="px-1.5 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 w-16 text-right">
                          {formatCOP(item.subtotal)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-600">Total a Pagar</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCOP(cartTotal)}
              </span>
            </div>

            {/* PAYMENT METHOD SELECTION (Item 3 in Prompt: Mandatory & visually very distinct) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Paso 2: Medio de Pago Obligatorio
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* 🟢 EFECTIVO */}
                <button
                  id="pay-method-efectivo"
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${
                    paymentMethod === 'efectivo'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🟢 EFECTIVO</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">Entra a caja física</span>
                </button>

                {/* 🔵 TRANSFERENCIA */}
                <button
                  id="pay-method-transferencia"
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-3 rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${
                    paymentMethod === 'transferencia'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
                    <span>🔵 TRANSFERENCIA</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">No entra a caja</span>
                </button>
              </div>

              {/* Conditional options depending on payment method */}
              {paymentMethod === 'transferencia' ? (
                <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-blue-900 block mb-1">Medio utilizado:</label>
                    <select
                      value={transferProvider}
                      onChange={e => setTransferProvider(e.target.value as TransferProvider)}
                      className="w-full bg-white border border-blue-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Otro">Otro medio digital</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-blue-900 block mb-1">
                      Número / Referencia de transferencia: *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. M492819 o comprobante"
                      value={transferReference}
                      onChange={e => setTransferReference(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Paga con (opcional):</span>
                    <input
                      type="number"
                      placeholder="Ej. 10000"
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value)}
                      className="w-28 bg-white border border-emerald-300 rounded-md p-1 text-right text-xs font-bold"
                    />
                  </div>
                  {parsedCashGiven > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                      <span className="font-bold text-emerald-900">Cambio / Vueltas:</span>
                      <span className="font-black text-sm text-emerald-700">
                        {formatCOP(cashChange)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="p-3 bg-emerald-600 text-white font-bold text-center rounded-xl text-xs animate-bounce">
                {successMessage}
              </div>
            )}

            {/* Confirm button */}
            <button
              id="btn-confirmar-venta"
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                cart.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-emerald-700/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>REGISTRAR VENTA ({formatCOP(cartTotal)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
