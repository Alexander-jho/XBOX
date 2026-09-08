import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  XboxConsole,
  ActiveXboxSession,
  PaymentMethod,
  TransferProvider,
  ExtraControllerRate,
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
  Volume2,
} from 'lucide-react';
import { formatCOP, formatShortTime, playAlertSound } from '../utils/formatters';

interface XboxManagerProps {
  isStartModalOpen?: boolean;
  onCloseStartModal?: () => void;
}

export const XboxManager: React.FC<XboxManagerProps> = ({
  isStartModalOpen = false,
  onCloseStartModal,
}) => {
  const {
    consoles,
    activeSessions,
    extraControllerRates,
    startXboxSession,
    finalizeXboxSessionAndPay,
    cancelXboxSession,
    extendXboxSession,
  } = useApp();

  // Local ticker to re-render remaining time smoothly every second
  const [ticker, setTicker] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTicker(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal State for starting a session
  const [showStartModal, setShowStartModal] = useState(isStartModalOpen);
  const [targetConsoleId, setTargetConsoleId] = useState<string>(consoles[0]?.id || 'c1');
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [extraControllersCount, setExtraControllersCount] = useState<number>(0);
  const [selectedExtraRateId, setSelectedExtraRateId] = useState<string>(extraControllerRates[0]?.id || '');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Modal State for finalizing session & collecting payment
  const [checkoutSession, setCheckoutSession] = useState<ActiveXboxSession | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [checkoutTransferProvider, setCheckoutTransferProvider] = useState<TransferProvider>('Nequi');
  const [checkoutReference, setCheckoutReference] = useState<string>('');

  // Modal State for extending time
  const [extendSessionData, setExtendSessionData] = useState<ActiveXboxSession | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (isStartModalOpen) {
      setShowStartModal(true);
    }
  }, [isStartModalOpen]);

  const handleCloseModal = () => {
    setShowStartModal(false);
    if (onCloseStartModal) onCloseStartModal();
  };

  const currentConsole = consoles.find(c => c.id === targetConsoleId) || consoles[0];

  // Set default rate whenever console changes
  useEffect(() => {
    if (currentConsole && currentConsole.rates.length > 0) {
      // Pick first rate or 1 hour rate
      const defaultRate = currentConsole.rates.find(r => r.minutes === 60) || currentConsole.rates[0];
      setSelectedRateId(defaultRate.id);
    }
  }, [targetConsoleId, currentConsole]);

  const handleStartSessionSubmit = () => {
    const rate = currentConsole.rates.find(r => r.id === selectedRateId);
    if (!rate) return;

    const extraRate = extraControllerRates.find(r => r.id === selectedExtraRateId) || extraControllerRates[0];

    startXboxSession({
      consoleId: currentConsole.id,
      durationMinutes: rate.minutes,
      rateLabel: rate.label,
      basePrice: rate.price,
      extraControllers: extraControllersCount,
      extraControllerRate: extraControllersCount > 0 ? extraRate : undefined,
      notes: sessionNotes.trim() || undefined,
    });

    // Reset and close
    setExtraControllersCount(0);
    setSessionNotes('');
    handleCloseModal();
  };

  const handleCompleteCheckout = () => {
    if (!checkoutSession) return;

    if (checkoutPaymentMethod === 'transferencia' && !checkoutReference.trim()) {
      alert('Por favor ingrese la referencia de la transferencia.');
      return;
    }

    finalizeXboxSessionAndPay(
      checkoutSession.id,
      checkoutPaymentMethod,
      checkoutPaymentMethod === 'transferencia' ? checkoutTransferProvider : undefined,
      checkoutPaymentMethod === 'transferencia' ? checkoutReference : undefined
    );

    setCheckoutSession(null);
    setCheckoutReference('');
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
                Control de Consolas & Tiempos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                6 consolas en operación con cronómetro regresivo y tarifas configurables
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playAlertSound('finish')}
            title="Probar sonido de alarma"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            id="btn-iniciar-sesion-xbox"
            onClick={() => {
              // Find first free console
              const free = consoles.find(c => !activeSessions.some(s => s.consoleId === c.id));
              if (free) setTargetConsoleId(free.id);
              setShowStartModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>+ Iniciar Sesión de Juego</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Consoles (Consola 1 to Consola 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consoles.map(c => {
          const session = activeSessions.find(s => s.consoleId === c.id);
          const isBusy = !!session;

          let remainingSeconds = 0;
          let remainingMinutes = 0;
          let isWarning = false;
          let isExpired = false;
          let percentElapsed = 0;

          if (session) {
            const now = Date.now();
            const totalMs = session.durationMinutes * 60 * 1000;
            const elapsedMs = Math.max(0, now - session.startTime);
            const leftMs = session.endTime - now;
            remainingSeconds = Math.max(0, Math.floor(leftMs / 1000));
            remainingMinutes = Math.ceil(remainingSeconds / 60);
            percentElapsed = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

            isWarning = remainingMinutes <= 3 && remainingSeconds > 0;
            isExpired = leftMs <= 0;
          }

          const formatMinSec = (secs: number) => {
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          };

          return (
            <div
              key={c.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                !isBusy
                  ? 'bg-white border-slate-200'
                  : isExpired
                  ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20'
                  : isWarning
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/20'
                  : 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {c.model}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{c.description}</span>
                </div>

                {/* Status Badge */}
                {isBusy ? (
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      isExpired
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{isExpired ? 'TIEMPO CUMPLIDO' : isWarning ? 'POR VENCER' : 'EN JUEGO'}</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    🟢 DISPONIBLE
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1">
                {isBusy && session ? (
                  <>
                    {/* Live Timer Clock */}
                    <div className="text-center py-2 bg-white rounded-xl border border-slate-200/80 shadow-inner">
                      <span className="text-[11px] uppercase font-bold text-slate-500 block mb-0.5">
                        {isExpired ? 'Tiempo Finalizado' : 'Tiempo Restante'}
                      </span>
                      <div
                        className={`font-mono text-3xl font-black tracking-tight ${
                          isExpired
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {isExpired ? '00:00' : formatMinSec(remainingSeconds)}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <span>Inicio: {formatShortTime(session.startTime)}</span>
                        <span>•</span>
                        <span>Fin: {formatShortTime(session.endTime)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isExpired ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentElapsed}%` }}
                      />
                    </div>

                    {/* Hired Details */}
                    <div className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tarifa contratada:</span>
                        <strong className="text-slate-900">{session.rateLabel}</strong>
                      </div>
                      {session.extraControllers > 0 && (
                        <div className="flex justify-between text-indigo-900">
                          <span>Controles extra:</span>
                          <strong>+{session.extraControllers} ({formatCOP(session.extraControllerPrice)})</strong>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                        <span className="font-bold text-slate-700">Total a cobrar:</span>
                        <strong className="font-black text-emerald-700">{formatCOP(session.totalPrice)}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Available Console View with Quick Rates */
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Tarifas programadas:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {c.rates.map(r => (
                        <div
                          key={r.id}
                          className="bg-slate-50 border border-slate-200/70 p-2 rounded-lg text-xs"
                        >
                          <span className="text-slate-600 block text-[11px]">{r.label}</span>
                          <strong className="font-black text-slate-900">{formatCOP(r.price)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                {isBusy && session ? (
                  <>
                    <button
                      onClick={() => setExtendSessionData(session)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      + Tiempo
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Cancelar la sesión de ${c.name} sin registrar cobro?`)) {
                          cancelXboxSession(session.id);
                        }
                      }}
                      className="px-2 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      id={`btn-finalizar-${c.id}`}
                      onClick={() => setCheckoutSession(session)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>COBRAR Y FINALIZAR</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setTargetConsoleId(c.id);
                      setShowStartModal(true);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Iniciar Sesión en {c.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* START SESSION MODAL */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">Nueva Sesión de Juego</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Select Console */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">
                  1. Seleccionar Consola
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {consoles.map(c => {
                    const isBusy = activeSessions.some(s => s.consoleId === c.id);
                    const isSelected = targetConsoleId === c.id;

                    return (
                      <button
                        key={c.id}
                        disabled={isBusy}
                        onClick={() => setTargetConsoleId(c.id)}
                        className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                          isBusy
                            ? 'bg-slate-100 opacity-50 cursor-not-allowed border-slate-200'
                            : isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block">{c.name}</span>
                        <span className="text-[10px] text-slate-500 block">{c.model}</span>
                        {isBusy && <span className="text-[9px] font-bold text-rose-600 block mt-0.5">En uso</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Rate */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">
                  2. Seleccionar Tiempo ({currentConsole.name} - {currentConsole.model})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentConsole.rates.map(r => {
                    const isSelected = selectedRateId === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRateId(r.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div>
                          <strong className="block text-sm leading-tight">{r.label}</strong>
                          <span className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {r.minutes} minutos
                          </span>
                        </div>
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${isSelected ? 'bg-emerald-700' : 'bg-white text-slate-900 border border-slate-200'}`}>
                          {formatCOP(r.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Controllers */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs uppercase text-slate-700 block">
                      Controles adicionales
                    </span>
                    <span className="text-[11px] text-slate-500">¿Jugarán con mandos extra?</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setExtraControllersCount(Math.max(0, extraControllersCount - 1))}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-sm">{extraControllersCount}</span>
                    <button
                      onClick={() => setExtraControllersCount(extraControllersCount + 1)}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                {extraControllersCount > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tarifa de control adicional:
                    </label>
                    <select
                      value={selectedExtraRateId}
                      onChange={e => setSelectedExtraRateId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2"
                    >
                      {extraControllerRates.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} (+{formatCOP(r.price)} c/u)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Summary Calculation */}
              {(() => {
                const rate = currentConsole.rates.find(r => r.id === selectedRateId);
                const extraRate = extraControllerRates.find(r => r.id === selectedExtraRateId) || extraControllerRates[0];
                const extraTotal = extraControllersCount > 0 && extraRate ? extraControllersCount * extraRate.price : 0;
                const grandTotal = (rate?.price || 0) + extraTotal;

                return (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block">Total a liquidar:</span>
                      <span className="text-[11px] text-emerald-600">
                        {rate?.label} {extraControllersCount > 0 ? `+ ${extraControllersCount} ctrl` : ''}
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-800">{formatCOP(grandTotal)}</span>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-bold rounded-xl text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-iniciar-sesion"
                onClick={handleStartSessionSubmit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-sm shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>INICIAR CRONÓMETRO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTEND SESSION MODAL */}
      {extendSessionData && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Agregar más tiempo</h3>
              <button
                onClick={() => setExtendSessionData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Agregar tiempo adicional a la sesión de <strong>{extendSessionData.consoleName}</strong>:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  extendXboxSession(extendSessionData.id, 20, 2000);
                  setExtendSessionData(null);
                }}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center cursor-pointer"
              >
                <span className="font-bold text-sm block">+20 minutos</span>
                <span className="text-xs text-emerald-700 font-bold">{formatCOP(2000)}</span>
              </button>
              <button
                onClick={() => {
                  extendXboxSession(extendSessionData.id, 30, 2500);
                  setExtendSessionData(null);
                }}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center cursor-pointer"
              >
                <span className="font-bold text-sm block">+30 minutos</span>
                <span className="text-xs text-emerald-700 font-bold">{formatCOP(2500)}</span>
              </button>
              <button
                onClick={() => {
                  extendXboxSession(extendSessionData.id, 60, 4000);
                  setExtendSessionData(null);
                }}
                className="col-span-2 p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center cursor-pointer"
              >
                <span className="font-bold text-sm block">+1 hora adicional</span>
                <span className="text-xs text-emerald-700 font-bold">{formatCOP(4000)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINALIZE & CHECKOUT MODAL (Prompt: "Al finalizar la sesión, permitir marcar FINALIZAR SESIÓN. La venta debe quedar registrada automáticamente.") */}
      {checkoutSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <h3 className="font-black text-lg">Cobrar y Finalizar Sesión</h3>
              </div>
              <button
                onClick={() => setCheckoutSession(null)}
                className="w-8 h-8 rounded-lg hover:bg-emerald-700 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Summary of console session */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consola:</span>
                  <strong className="text-slate-900">{checkoutSession.consoleName} ({checkoutSession.consoleModel})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiempo jugado:</span>
                  <strong className="text-slate-900">{checkoutSession.rateLabel} ({checkoutSession.durationMinutes} min)</strong>
                </div>
                {checkoutSession.extraControllers > 0 && (
                  <div className="flex justify-between text-indigo-900">
                    <span>Controles extra:</span>
                    <strong>{checkoutSession.extraControllers} ({formatCOP(checkoutSession.extraControllerPrice)})</strong>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base">
                  <span className="font-bold text-slate-800">Total a Pagar:</span>
                  <strong className="font-black text-emerald-700 text-xl">{formatCOP(checkoutSession.totalPrice)}</strong>
                </div>
              </div>

              {/* Payment Method Selector (Mandatory) */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">
                  Medio de Pago Obligatorio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('efectivo')}
                    className={`p-3 rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                      checkoutPaymentMethod === 'efectivo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span>🟢 EFECTIVO</span>
                    <span className="text-[10px] font-normal opacity-90">Suma a caja física</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('transferencia')}
                    className={`p-3 rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                      checkoutPaymentMethod === 'transferencia'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <span>🔵 TRANSFERENCIA</span>
                    <span className="text-[10px] font-normal opacity-90">No entra a caja</span>
                  </button>
                </div>

                {checkoutPaymentMethod === 'transferencia' && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                    <div>
                      <label className="font-bold text-blue-900 block mb-1">Medio utilizado:</label>
                      <select
                        value={checkoutTransferProvider}
                        onChange={e => setCheckoutTransferProvider(e.target.value as TransferProvider)}
                        className="w-full bg-white border border-blue-300 rounded-lg p-2 font-semibold"
                      >
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-blue-900 block mb-1">Número / Referencia:</label>
                      <input
                        type="text"
                        placeholder="Ej. Nequi M381928"
                        value={checkoutReference}
                        onChange={e => setCheckoutReference(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-mono font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setCheckoutSession(null)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm"
              >
                Volver
              </button>
              <button
                id="btn-confirmar-cobro-xbox"
                onClick={handleCompleteCheckout}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>CONFIRMAR Y LIBERAR CONSOLA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
