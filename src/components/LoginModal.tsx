import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheck, X, Check, KeyRound, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole?: UserRole;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  requiredRole,
  onSuccess,
}) => {
  const { users, currentUser, loginUser } = useApp();

  const [selectedUsername, setSelectedUsername] = useState<string>(currentUser.username);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Por favor ingrese su contraseña.');
      return;
    }

    const res = loginUser(selectedUsername, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Contraseña incorrecta');
      return;
    }

    if (requiredRole && requiredRole === 'admin') {
      const targetUser = users.find(u => u.username === selectedUsername);
      if (targetUser?.role !== 'admin') {
        setErrorMsg('Esta acción requiere privilegios de Administrador.');
        return;
      }
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {requiredRole === 'admin' ? 'Acceso de Administrador' : 'Autenticación de Usuario'}
              </h3>
              <p className="text-xs text-slate-500">
                Seleccione su usuario e ingrese su contraseña secreta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Seleccione el Usuario
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {users.map(u => {
              const isActive = currentUser.id === u.id;
              const roleLabel =
                u.role === 'admin'
                  ? 'Administrador'
                  : u.role === 'operador'
                  ? 'Operador'
                  : 'Cajero';
              const roleBadgeColor =
                u.role === 'admin'
                  ? 'bg-indigo-100 text-indigo-800'
                  : u.role === 'operador'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUsername(u.username);
                    setPassword('');
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedUsername === u.username
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{u.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sesión activa" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleBadgeColor}`}>
                    {roleLabel}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    @{u.username}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Contraseña Secreta
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su clave secreta"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Cada perfil debe ingresar manualmente su contraseña para acceder.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Ingresar como {selectedUsername}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
