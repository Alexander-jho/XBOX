import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  XboxConsole,
  ActiveXboxSession,
  PaymentMethod,
  TransferProvider,
  LightMode,
  Product,
} from '../types';
import {
  Gamepad2,
  Clock,
  Play,
  Square,
  AlertTriangle,
  Plus,
  Coins,
  ArrowRightLeft,
  X,
  CheckCircle,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Trash2,
  Search,
  Check,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { formatCOP, formatShortTime } from '../utils/formatters';

interface XboxManagerProps {
  isStartModalOpen?: boolean;
  onCloseStartModal?: () => void;
  selectedConsoleIdFromDash?: string | null;
}

export const XboxManager: React.FC<XboxManagerProps> = ({
  isStartModalOpen = false,
  onCloseStartModal,
  selectedConsoleIdFromDash,
}) => {
  const {
    consoles,
    activeSessions,
    extraControllerRates,
    products,
    startXboxSession,
    addTimeToSession,
    addProductToSession,
    removeProductFromSession,
    addExtraControllersToSession,
    finalizeXboxSessionAndPay,
    cancelXboxSession,
  } = useApp();

  // Re-render live remaining time smoothly every second
  const [ticker, setTicker] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTicker(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal State: Start New Session
  const [showStartModal, setShowStartModal] = useState(isStartModalOpen);
  const [targetConsoleId, setTargetConsoleId] = useState<string>(selectedConsoleIdFromDash || consoles[0]?.id || 'c1');
  const [selectedLightMode, setSelectedLightMode] = useState<LightMode>('con_luz');
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [extraControllersCount, setExtraControllersCount] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Modal State: Add Time to Open Account
  const [timeModalSession, setTimeModalSession] = useState<ActiveXboxSession | null>(null);

  // Modal State: Add Products to Open Account
  const [productModalSession, setProductModalSession] = useState<ActiveXboxSession | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('todos');

  // Modal State: Finalize & Pay Account
  const [checkoutSession, setCheckoutSession] = useState<ActiveXboxSession | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [checkoutTransferProvider, setCheckoutTransferProvider] = useState<TransferProvider>('Nequi');
  const [checkoutReference, setCheckoutReference] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');

  // Sync prop changes
  useEffect(() => {
    if (isStartModalOpen) {
      setShowStartModal(true);
    }
  }, [isStartModalOpen]);

  useEffect(() => {
    if (selectedConsoleIdFromDash) {
      setTargetConsoleId(selectedConsoleIdFromDash);
    }
  }, [selectedConsoleIdFromDash]);

  const handleCloseModal = () => {
    setShowStartModal(false);
    if (onCloseStartModal) onCloseStartModal();
  };

  const currentConsole = consoles.find(c => c.id === targetConsoleId) || consoles[0];

  // Set default rate whenever console or lightMode changes
  useEffect(() => {
    if (currentConsole && currentConsole.rates.length > 0) {
      const defaultRate = currentConsole.rates.find(r => r.minutes === 60) || currentConsole.rates[0];
      setSelectedRateId(defaultRate.id);
    }
  }, [targetConsoleId, currentConsole, selectedLightMode]);

  // Handle Opening an Account
  const handleStartSessionSubmit = () => {
    const rate = currentConsole.rates.find(r => r.id === selectedRateId);
    if (!rate) return;

    const basePrice = selectedLightMode === 'con_luz' ? rate.priceConLuz : rate.priceSinLuz;
    const ctrlRate = extraControllerRates[0];
    const ctrlUnitPrice = selectedLightMode === 'con_luz'
      ? (ctrlRate?.priceConLuz || 1500)
      : (ctrlRate?.priceSinLuz || 2500);

    const extraControllerPrice = extraControllersCount * ctrlUnitPrice;

    startXboxSession({
      consoleId: currentConsole.id,
      durationMinutes: rate.minutes,
      lightMode: selectedLightMode,
      rateLabel: `${rate.label}`,
      basePrice,
      extraControllers: extraControllersCount,
      extraControllerPrice,
      notes: sessionNotes.trim() || undefined,
    });

    setExtraControllersCount(0);
    setSessionNotes('');
    handleCloseModal();
  };

  // Finalize Session Submit
  const handleCompleteCheckout = () => {
    if (!checkoutSession) return;

    if (checkoutPaymentMethod === 'transferencia' && !checkoutReference.trim()) {
      alert('Por favor ingrese el número o referencia de la transferencia.');
      return;
    }

    finalizeXboxSessionAndPay(
      checkoutSession.id,
      checkoutPaymentMethod,
      checkoutPaymentMethod === 'transferencia' ? checkoutTransferProvider : undefined,
      checkoutPaymentMethod === 'transferencia' ? checkoutReference.trim() : undefined
    );

    setCheckoutSession(null);
    setCheckoutReference('');
    setCashReceived('');
  };

  // Filter available products for adding to open account
  const availableProducts = products.filter(p => {
    if (!p.isActive) return false;
    // Garguería or Bebidas
    if (selectedProductCategory !== 'todos' && p.category !== selectedProductCategory) {
      return false;
    }
    if (productSearch.trim()) {
      const query = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        (p.presentation && p.presentation.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const productCategories = ['todos', ...Array.from(new Set(products.filter(p => p.area === 'gargueria').map(p => p.category)))];

  // Helper for extra controller price
  const getExtraCtrlRatePrice = (lightMode: LightMode) => {
    const rate = extraControllerRates[0];
    return lightMode === 'con_luz' ? (rate?.priceConLuz || 1500) : (rate?.priceSinLuz || 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Gamepad2 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Cuentas de Consola & Tiempos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Xbox 360 / One, PlayStation 5 y PlayStation 4 con tarifas Con Luz / Sin Luz
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-open-session-modal"
          onClick={() => {
            // Pick first free console if available
            const freeConsole = consoles.find(c => !activeSessions.some(s => s.consoleId === c.id));
            if (freeConsole) setTargetConsoleId(freeConsole.id);
            setShowStartModal(true);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Abrir Nueva Cuenta</span>
        </button>
      </div>

      {/* 6 Consoles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consoles.map(consoleItem => {
          const activeSession = activeSessions.find(s => s.consoleId === consoleItem.id);
          const isOccupied = !!activeSession;

          let remainingMinutes = 0;
          let isWarning = false;
          let isExpired = false;
          let progressPercent = 0;

          if (activeSession) {
            const now = Date.now();
            const remainingMs = activeSession.endTime - now;
            remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
            const totalDurationMs = activeSession.durationMinutes * 60 * 1000;
            const elapsedMs = totalDurationMs - remainingMs;
            progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

            isWarning = remainingMinutes <= 3 && remainingMinutes > 0;
            isExpired = remainingMs <= 0;
          }

          const modelBadgeColor =
            consoleItem.model === 'PlayStation 5'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : consoleItem.model === 'PlayStation 4'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          return (
            <div
              key={consoleItem.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between ${
                isOccupied
                  ? isExpired
                    ? 'bg-rose-50/70 border-rose-400 shadow-md ring-2 ring-rose-400'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400'
                    : 'bg-white border-emerald-300 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                      isOccupied ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {consoleItem.name.replace('Consola ', '#')}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight">
                      {consoleItem.name}
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${modelBadgeColor}`}>
                      {consoleItem.model}
                    </span>
                  </div>
                </div>

                {isOccupied ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      🟢 ACTIVA
                    </span>
                    <span className="block text-[11px] font-bold text-slate-500 mt-0.5">
                      {activeSession?.accountNumber}
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    ⚪ DISPONIBLE
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {isOccupied && activeSession ? (
                  <div className="space-y-3">
                    {/* Time & Countdown */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isExpired
                          ? 'bg-rose-500 text-white border-rose-600 animate-bounce'
                          : isWarning
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-slate-900 text-white border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                            {isExpired ? '¡Tiempo Cumplido!' : 'Tiempo Restante'}
                          </span>
                          <span className="text-lg font-black tracking-tight">
                            {isExpired ? '00:00 TERMINADO' : `${remainingMinutes} min restantes`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-xs font-semibold">
                        <span>Fin: {formatShortTime(activeSession.endTime)}</span>
                        <div className="text-[10px] opacity-80">
                          {activeSession.durationMinutes} min totales
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 transition-all duration-1000 ${
                          isExpired ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Account Details */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Modalidad:</span>
                        <span className="font-bold flex items-center gap-1 text-slate-800">
                          {activeSession.lightMode === 'con_luz' ? (
                            <>
                              <Sun className="w-3.5 h-3.5 text-amber-500" /> Con luz
                            </>
                          ) : (
                            <>
                              <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sin luz
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600">
                        <span>Tiempo contratado:</span>
                        <span className="font-bold text-slate-800">
                          {activeSession.durationMinutes} min ({formatCOP(activeSession.initialPrice + activeSession.addedTimePrice)})
                        </span>
                      </div>

                      {activeSession.extraControllers > 0 && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Controles extra:</span>
                          <span className="font-bold text-slate-800">
                            {activeSession.extraControllers} ({formatCOP(activeSession.extraControllerPrice)})
                          </span>
                        </div>
                      )}

                      {/* Consumed Products */}
                      {activeSession.products.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1">
                            Productos agregados ({activeSession.products.length}):
                          </span>
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {activeSession.products.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600 bg-white p-1 rounded border border-slate-200/60">
                                <span>{p.quantity}x {p.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{formatCOP(p.subtotal)}</span>
                                  <button
                                    onClick={() => removeProductFromSession(activeSession.id, idx)}
                                    className="text-rose-500 hover:text-rose-700 p-0.5"
                                    title="Remover producto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Total Acumulado */}
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                        <span className="font-black text-slate-700 uppercase">Total Cuenta:</span>
                        <span className="font-black text-base text-emerald-700">
                          {formatCOP(activeSession.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Account Management Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTimeModalSession(activeSession)}
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+ Tiempo</span>
                      </button>

                      <button
                        onClick={() => {
                          setProductModalSession(activeSession);
                          setProductSearch('');
                        }}
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        <span>+ Producto</span>
                      </button>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={() => {
                        setCheckoutSession(activeSession);
                        setCheckoutPaymentMethod('efectivo');
                        setCashReceived('');
                        setCheckoutReference('');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Coins className="w-4 h-4" />
                      <span>FINALIZAR & COBRAR ({formatCOP(activeSession.totalPrice)})</span>
                    </button>
                  </div>
                ) : (
                  /* Console Available State */
                  <div className="space-y-4 py-2 text-center">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <Gamepad2 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                      <p className="text-xs text-slate-500 font-medium">
                        Consola lista para iniciar sesión
                      </p>
                      <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                        {consoleItem.rates.map(r => (
                          <div key={r.id} className="flex justify-between px-2">
                            <span>{r.label}:</span>
                            <span className="font-semibold text-slate-600">
                              Luz {formatCOP(r.priceConLuz)} / Sin {formatCOP(r.priceSinLuz)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTargetConsoleId(consoleItem.id);
                        setShowStartModal(true);
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                      <span>Abrir Cuenta en {consoleItem.name}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ABRIR NUEVA CUENTA                                               */}
      {/* ========================================================================= */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Abrir Cuenta de Consola</h3>
                  <p className="text-xs text-slate-500">Seleccione consola, modalidad y tiempo</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Seleccionar Consola */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                1. Seleccionar Consola
              </label>
              <div className="grid grid-cols-3 gap-2">
                {consoles.map(c => {
                  const isBusy = activeSessions.some(s => s.consoleId === c.id);
                  const isSelected = targetConsoleId === c.id;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setTargetConsoleId(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : isBusy
                          ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black block">{c.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{c.model}</span>
                      {isBusy && <span className="text-[9px] font-bold text-rose-500">Ocupada</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Seleccionar Modalidad: Con Luz / Sin Luz */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                2. Modalidad de Energía
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedLightMode('con_luz')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    selectedLightMode === 'con_luz'
                      ? 'border-amber-400 bg-amber-50/70 text-amber-950 ring-2 ring-amber-400/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedLightMode === 'con_luz' ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black block">CON LUZ</span>
                    <span className="text-[10px] text-slate-500">Tarifa estándar</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLightMode('sin_luz')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    selectedLightMode === 'sin_luz'
                      ? 'border-indigo-400 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-400/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedLightMode === 'sin_luz' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black block">SIN LUZ</span>
                    <span className="text-[10px] text-slate-500">Tarifa planta / batería</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Seleccionar Tiempo */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                3. Tiempo Contratado (Tarifa Automática)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentConsole.rates.map(rate => {
                  const isSelected = selectedRateId === rate.id;
                  const price = selectedLightMode === 'con_luz' ? rate.priceConLuz : rate.priceSinLuz;

                  return (
                    <button
                      key={rate.id}
                      type="button"
                      onClick={() => setSelectedRateId(rate.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{rate.label}</span>
                      <span className="text-sm font-black text-emerald-700 mt-0.5 block">
                        {formatCOP(price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Controles Extra */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Controles Extra
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatCOP(getExtraCtrlRatePrice(selectedLightMode))} por hora ({selectedLightMode === 'con_luz' ? 'Con luz' : 'Sin luz'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtraControllersCount(Math.max(0, extraControllersCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center font-black text-sm">{extraControllersCount}</span>
                <button
                  type="button"
                  onClick={() => setExtraControllersCount(extraControllersCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total inicial estimado */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Valor Inicial de la Cuenta:</span>
                <span className="text-lg font-black text-emerald-400">
                  {(() => {
                    const r = currentConsole.rates.find(rate => rate.id === selectedRateId) || currentConsole.rates[0];
                    const base = selectedLightMode === 'con_luz' ? r?.priceConLuz || 0 : r?.priceSinLuz || 0;
                    const extra = extraControllersCount * getExtraCtrlRatePrice(selectedLightMode);
                    return formatCOP(base + extra);
                  })()}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-300">
                {currentConsole.name} • {selectedLightMode === 'con_luz' ? 'Con luz' : 'Sin luz'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartSessionSubmit}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR CUENTA ABIERTA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AGREGAR MÁS TIEMPO (+ AGREGAR TIEMPO)                           */}
      {/* ========================================================================= */}
      {timeModalSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Agregar Más Tiempo</h3>
                  <p className="text-xs text-slate-500">
                    {timeModalSession.accountNumber} — {timeModalSession.consoleName} ({timeModalSession.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTimeModalSession(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 font-medium">
              El tiempo seleccionado se sumará a la cuenta actual sin crear una venta separada. La hora estimada de fin se actualizará automáticamente.
            </div>

            {/* Rates for current console */}
            <div className="space-y-2">
              {(() => {
                const targetConsole = consoles.find(c => c.id === timeModalSession.consoleId);
                const rates = targetConsole?.rates || [];

                return rates.map(rate => {
                  const price = timeModalSession.lightMode === 'con_luz' ? rate.priceConLuz : rate.priceSinLuz;

                  return (
                    <button
                      key={rate.id}
                      onClick={() => {
                        addTimeToSession(timeModalSession.id, rate.minutes, price);
                        setTimeModalSession(null);
                      }}
                      className="w-full p-3.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl flex items-center justify-between transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="text-left">
                        <span className="text-sm font-bold text-slate-900 block">
                          + {rate.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          Extiende la sesión {rate.minutes} minutos
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-700">
                        {formatCOP(price)}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => setTimeModalSession(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AGREGAR PRODUCTOS A LA CUENTA ABIERTA (+ AGREGAR PRODUCTO)      */}
      {/* ========================================================================= */}
      {productModalSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Agregar Consumo a la Cuenta</h3>
                  <p className="text-xs text-slate-500">
                    {productModalSession.accountNumber} — {productModalSession.consoleName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProductModalSession(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar Chocorramo, Coca-Cola, Doritos..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <select
                value={selectedProductCategory}
                onChange={e => setSelectedProductCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                {productCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'todos' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {availableProducts.slice(0, 30).map(prod => (
                <div
                  key={prod.id}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {prod.name} {prod.presentation ? `(${prod.presentation})` : ''}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatCOP(prod.price)} {prod.trackStock ? `• Stock: ${prod.stock}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addProductToSession(productModalSession.id, prod, 1);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Current Products in Session Summary */}
            {productModalSession.products.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  En esta cuenta actualmente ({productModalSession.products.length} items):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {productModalSession.products.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-medium text-slate-800">
                      {p.quantity}x {p.name} ({formatCOP(p.subtotal)})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProductModalSession(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FINALIZAR CUENTA & COBRAR (RESUMEN + MEDIO DE PAGO)             */}
      {/* ========================================================================= */}
      {checkoutSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Finalizar Cuenta & Cobrar</h3>
                  <p className="text-xs text-slate-500">
                    {checkoutSession.accountNumber} — {checkoutSession.consoleName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutSession(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complete Summary Box as specified in user prompt */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Consola:</span>
                <span className="font-bold text-slate-900">{checkoutSession.consoleName} ({checkoutSession.consoleModel})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Modalidad:</span>
                <span className="font-bold text-slate-900">
                  {checkoutSession.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hora de inicio:</span>
                <span className="font-bold text-slate-900">{formatShortTime(checkoutSession.startTime)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hora de finalización:</span>
                <span className="font-bold text-slate-900">{formatShortTime(Date.now())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tiempo contratado:</span>
                <span className="font-bold text-slate-900">
                  {checkoutSession.initialMinutes} min iniciales {checkoutSession.addedTimeMinutes > 0 ? `+ ${checkoutSession.addedTimeMinutes} min adicionales` : ''} = {checkoutSession.durationMinutes} min ({formatCOP(checkoutSession.initialPrice + checkoutSession.addedTimePrice)})
                </span>
              </div>

              {checkoutSession.extraControllers > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Controles adicionales:</span>
                  <span className="font-bold text-slate-900">
                    {checkoutSession.extraControllers} control(es) ({formatCOP(checkoutSession.extraControllerPrice)})
                  </span>
                </div>
              )}

              {/* Items */}
              {checkoutSession.products.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Productos consumidos:</span>
                  {checkoutSession.products.map((prod, i) => (
                    <div key={i} className="flex justify-between text-slate-600 pl-2">
                      <span>• {prod.quantity}x {prod.name}</span>
                      <span className="font-semibold text-slate-800">{formatCOP(prod.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm">
                <span className="font-black text-slate-800 uppercase">Total a Cobrar:</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatCOP(checkoutSession.totalPrice)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Medio de Pago Obligatorio
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCheckoutPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    checkoutPaymentMethod === 'efectivo'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Coins className={`w-5 h-5 ${checkoutPaymentMethod === 'efectivo' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="text-xs font-black block">🟢 EFECTIVO</span>
                    <span className="text-[10px] text-slate-500">Suma a la caja física</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutPaymentMethod('transferencia')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    checkoutPaymentMethod === 'transferencia'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowRightLeft className={`w-5 h-5 ${checkoutPaymentMethod === 'transferencia' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="text-xs font-black block">🔵 TRANSFERENCIA</span>
                    <span className="text-[10px] text-slate-500">No altera caja física</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Efectivo: Calculadora de cambio / devuelta */}
            {checkoutPaymentMethod === 'efectivo' && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Efectivo recibido:</span>
                  <input
                    type="number"
                    placeholder="Ej. 20000"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    className="w-32 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-right font-black text-sm text-emerald-900 outline-hidden"
                  />
                </div>
                {cashReceived && parseInt(cashReceived, 10) >= checkoutSession.totalPrice && (
                  <div className="flex justify-between items-center text-xs font-black text-emerald-800 pt-1 border-t border-emerald-200">
                    <span>Devuelta / Cambio:</span>
                    <span className="text-sm text-emerald-700">
                      {formatCOP(parseInt(cashReceived, 10) - checkoutSession.totalPrice)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Transferencia: Proveedor y Referencia */}
            {checkoutPaymentMethod === 'transferencia' && (
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div>
                  <label className="text-xs font-bold text-blue-900 block mb-1">
                    Entidad de Transferencia
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Nequi', 'Daviplata', 'Bancolombia', 'Otro'] as TransferProvider[]).map(prov => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setCheckoutTransferProvider(prov)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                          checkoutTransferProvider === prov
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-900 block mb-1">
                    Número de Comprobante / Referencia *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. M12345678 o # de aprobación"
                    value={checkoutReference}
                    onChange={e => setCheckoutReference(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutSession(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCompleteCheckout}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm cursor-pointer transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>CONFIRMAR & CERRAR CUENTA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
