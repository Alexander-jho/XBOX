import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Gamepad2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Coins,
  CheckCircle,
  Sun,
  Moon,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';
import { ConsoleRate, ExtraControllerRate } from '../types';

export const ConfigView: React.FC = () => {
  const {
    consoles,
    extraControllerRates,
    updateConsoleRates,
    updateExtraControllerRates,
    resetToInitialDefaults,
    currentUser,
    users,
    changePassword,
    adminUpdateUserPassword,
  } = useApp();

  const [selectedConsoleId, setSelectedConsoleId] = useState<string>(consoles[0]?.id || 'c1');
  const activeConsole = consoles.find(c => c.id === selectedConsoleId) || consoles[0];

  // Local state for editing the active console's rates
  const [ratesCopy, setRatesCopy] = useState<ConsoleRate[]>(activeConsole.rates);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local state for editing extra controller rates
  const [extraRatesCopy, setExtraRatesCopy] = useState<ExtraControllerRate[]>(extraControllerRates);

  // Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwAlert, setPwAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Operator Password Reset by Admin
  const [selectedOpId, setSelectedOpId] = useState<string>('u-operador');
  const [newOpPassword, setNewOpPassword] = useState('');
  const [opPwAlert, setOpPwAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAdminChangeOwnPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwAlert({ type: 'error', text: 'Por favor ingrese su contraseña actual y la nueva.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwAlert({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 4) {
      setPwAlert({ type: 'error', text: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (res.success) {
      setPwAlert({ type: 'success', text: '✓ Contraseña actualizada correctamente.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwAlert(null), 4000);
    } else {
      setPwAlert({ type: 'error', text: res.message });
    }
  };

  const handleAdminResetOperatorPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpPassword.trim()) {
      setOpPwAlert({ type: 'error', text: 'Ingrese la nueva clave para el operador.' });
      return;
    }
    const res = adminUpdateUserPassword(selectedOpId, newOpPassword.trim());
    if (res.success) {
      setOpPwAlert({ type: 'success', text: '✓ Contraseña del usuario actualizada correctamente.' });
      setNewOpPassword('');
      setTimeout(() => setOpPwAlert(null), 4000);
    } else {
      setOpPwAlert({ type: 'error', text: res.message });
    }
  };

  // Sync when active console selection changes
  const handleSelectConsole = (id: string) => {
    setSelectedConsoleId(id);
    const found = consoles.find(c => c.id === id);
    if (found) {
      setRatesCopy(found.rates);
    }
  };

  const handleRateFieldChange = (
    index: number,
    field: 'label' | 'minutes' | 'priceConLuz' | 'priceSinLuz',
    value: any
  ) => {
    const updated = [...ratesCopy];
    updated[index] = {
      ...updated[index],
      [field]: field === 'label' ? value : Number(value) || 0,
    };
    setRatesCopy(updated);
  };

  const handleAddRate = () => {
    setRatesCopy([
      ...ratesCopy,
      {
        id: `rate-${Date.now()}`,
        label: 'Nuevo Tiempo',
        minutes: 45,
        priceConLuz: 3500,
        priceSinLuz: 4500,
      },
    ]);
  };

  const handleRemoveRate = (index: number) => {
    if (ratesCopy.length <= 1) {
      alert('Debe conservar al menos una tarifa configurada.');
      return;
    }
    const updated = ratesCopy.filter((_, idx) => idx !== index);
    setRatesCopy(updated);
  };

  const handleSaveRates = () => {
    updateConsoleRates(activeConsole.id, ratesCopy);
    setSaveSuccessMsg(`¡Tarifas de ${activeConsole.name} guardadas con éxito!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleExtraRateChange = (
    index: number,
    field: 'priceConLuz' | 'priceSinLuz',
    priceVal: string
  ) => {
    const updated = [...extraRatesCopy];
    updated[index] = {
      ...updated[index],
      [field]: parseFloat(priceVal.replace(/\D/g, '')) || 0,
    };
    setExtraRatesCopy(updated);
  };

  const handleSaveExtraRates = () => {
    updateExtraControllerRates(extraRatesCopy);
    setSaveSuccessMsg('¡Tarifas de controles adicionales guardadas con éxito!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              CONFIGURACIÓN GENERAL
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Administración de tarifas de consolas, controles adicionales y parámetros del sistema
            </p>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* SECTION 1: XBOX & PS CONSOLES RATES (Item 19 in Prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-600" />
            <span>Tarifas de Consolas de Videojuego (Con Luz / Sin Luz)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Personalice los precios por hora, 30 minutos o 20 minutos para cada consola individualmente, según las modalidades &quot;Con luz&quot; y &quot;Sin luz&quot;.
          </p>
        </div>

        {/* Console Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
          {consoles.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelectConsole(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                selectedConsoleId === c.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name} ({c.model})
            </button>
          ))}
        </div>

        {/* Rates Editor for Selected Console */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700">
              Tarifas vigentes para {activeConsole.name}
            </span>
            <button
              onClick={handleAddRate}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar otra tarifa</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {ratesCopy.map((rate, idx) => (
              <div
                key={rate.id || idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <label className="text-[11px] text-slate-500 block mb-0.5 font-semibold">
                    Etiqueta / Nombre:
                  </label>
                  <input
                    type="text"
                    value={rate.label || ''}
                    onChange={e => handleRateFieldChange(idx, 'label', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 block mb-0.5 font-semibold">
                    Duración (min):
                  </label>
                  <input
                    type="number"
                    value={rate.minutes ?? 0}
                    onChange={e => handleRateFieldChange(idx, 'minutes', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-emerald-700 flex items-center gap-1 mb-0.5 font-bold">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Con luz ($):</span>
                  </label>
                  <input
                    type="number"
                    value={rate.priceConLuz ?? 0}
                    onChange={e => handleRateFieldChange(idx, 'priceConLuz', e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-black text-emerald-800"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-600 flex items-center gap-1 mb-0.5 font-bold">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Sin luz / Planta ($):</span>
                  </label>
                  <input
                    type="number"
                    value={rate.priceSinLuz ?? 0}
                    onChange={e => handleRateFieldChange(idx, 'priceSinLuz', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-800"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end pt-2 sm:pt-0">
                  <button
                    onClick={() => handleRemoveRate(idx)}
                    title="Eliminar tarifa"
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveRates}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Tarifas de {activeConsole.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXTRA CONTROLLERS RATES (Rule: No dejar los precios del control adicional rígidos en el código) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            <span>Tarifas de Controles Adicionales (Con Luz / Sin Luz)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Ajuste el valor a cobrar por cada mando extra en las sesiones de juego según la modalidad del servicio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {extraRatesCopy.map((rate, idx) => (
            <div
              key={rate.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
            >
              <strong className="text-slate-900 block font-bold text-sm">{rate.name}</strong>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-emerald-700 flex items-center gap-1 mb-1 font-bold text-[11px]">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Con luz ($):</span>
                  </label>
                  <input
                    type="number"
                    value={rate.priceConLuz ?? 0}
                    onChange={e => handleExtraRateChange(idx, 'priceConLuz', e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-black text-sm text-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-slate-600 flex items-center gap-1 mb-1 font-bold text-[11px]">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Sin luz ($):</span>
                  </label>
                  <input
                    type="number"
                    value={rate.priceSinLuz ?? 0}
                    onChange={e => handleExtraRateChange(idx, 'priceSinLuz', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveExtraRates}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Tarifas de Controles</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: SEGURIDAD Y GESTIÓN PRIVADA DE CONTRASEÑAS (Item 3 in Prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Seguridad y Gestión Privada de Contraseñas</span>
          </h3>
          <p className="text-xs text-slate-500">
            Cambio privado de contraseña del Administrador y gestión de credenciales para operadores y cajeros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card A: Admin changes own password */}
          <form onSubmit={handleAdminChangeOwnPassword} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Cambiar Mi Contraseña ({currentUser.name})
              </h4>
            </div>

            {pwAlert && (
              <div className={`p-2.5 rounded-lg text-xs font-bold ${
                pwAlert.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {pwAlert.text}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Contraseña Actual:
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Ingrese clave actual"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium pr-9 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nueva Contraseña:
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium pr-9 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Confirmar Nueva Contraseña:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva clave"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Actualizar Mi Contraseña
            </button>
          </form>

          {/* Card B: Admin sets Operator / Cashier password */}
          <form onSubmit={handleAdminResetOperatorPassword} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Asignar Clave a Operador / Cajero
                </h4>
              </div>

              {opPwAlert && (
                <div className={`p-2.5 rounded-lg text-xs font-bold ${
                  opPwAlert.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {opPwAlert.text}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Seleccionar Usuario:
                </label>
                <select
                  value={selectedOpId}
                  onChange={e => setSelectedOpId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username}) — Rol: {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nueva Contraseña para el Usuario:
                </label>
                <input
                  type="password"
                  value={newOpPassword}
                  onChange={e => setNewOpPassword(e.target.value)}
                  placeholder="Ingrese nueva contraseña"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer mt-3"
            >
              Guardar Contraseña de Usuario
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 4: SYSTEM RESET & BACKUP */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Restablecer Datos Iniciales de Demostración</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Si desea volver a cargar el catálogo inicial de productos de Garguería, Papelería y las 6 consolas con sus tarifas estándar, presione el botón a continuación.
        </p>
        <button
          onClick={() => {
            if (confirm('¿Restablecer el sistema con los datos de ejemplo iniciales?')) {
              resetToInitialDefaults();
              alert('Sistema restablecido con los datos iniciales.');
              window.location.reload();
            }
          }}
          className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
        >
          Recargar Datos Iniciales
        </button>
      </div>
    </div>
  );
};
