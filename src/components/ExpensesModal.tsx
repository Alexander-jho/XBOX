import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  Receipt,
  X,
  Plus,
  Coins,
  ArrowRightLeft,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCOP, getTodayDateString, getCurrentTimeString } from '../utils/formatters';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { expenses, addExpense, todayExpensesTotal } = useApp();

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(/\D/g, '')) || 0;
    if (!concept.trim() || val <= 0) {
      alert('Por favor ingrese el concepto y el valor del gasto.');
      return;
    }

    addExpense({
      concept: concept.trim(),
      amount: val,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setConcept('');
      setAmount('');
      setNotes('');
      onClose();
    }, 800);
  };

  const todayExpenses = expenses.filter(e => e.date === getTodayDateString());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <div>
              <h3 className="font-black text-lg">REGISTRO DE GASTOS</h3>
              <p className="text-xs text-rose-100">Registrar egresos del negocio en efectivo o transferencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-rose-800 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Concepto */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
              Concepto del Gasto: *
            </label>
            <input
              type="text"
              placeholder="Ej. Bolsas plásticas, Hielo, Pago servicio de luz, Transporte..."
              value={concept}
              onChange={e => setConcept(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
              Valor del Gasto ($): *
            </label>
            <input
              type="number"
              placeholder="Ej. 15000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-lg font-black focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-700 block mb-2">
              Medio de Pago del Gasto:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'bg-rose-50 text-rose-800 border-rose-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🟢 EFECTIVO</span>
                <span className="text-[10px] text-slate-500 font-normal">Descuenta de caja física</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 cursor-pointer transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'bg-blue-50 text-blue-800 border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🔵 TRANSFERENCIA</span>
                <span className="text-[10px] text-slate-500 font-normal">No descuenta caja física</span>
              </button>
            </div>
          </div>

          {/* Observación */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Observación / Proveedor (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej. Factura #402 / Comprado a Don Pedro"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Gasto guardado con éxito!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black rounded-xl text-sm shadow-md cursor-pointer transition-all"
          >
            GUARDAR GASTO
          </button>
        </form>

        {/* Today's Expense List */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 max-h-48 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase">
            <span>Gastos de Hoy ({todayExpenses.length})</span>
            <span className="text-rose-600 font-black">{formatCOP(todayExpensesTotal)}</span>
          </div>

          {todayExpenses.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-2 text-center">No hay gastos registrados hoy.</p>
          ) : (
            todayExpenses.map(e => (
              <div
                key={e.id}
                className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-800 block">{e.concept}</strong>
                  <span className="text-[10px] text-slate-400">
                    {e.time} • {e.paymentMethod === 'efectivo' ? '🟢 Efectivo' : '🔵 Transferencia'}
                  </span>
                </div>
                <span className="font-bold text-rose-600 text-sm">
                  −{formatCOP(e.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
