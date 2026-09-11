import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, RefreshCw, X, HardDrive } from 'lucide-react';

export const DatabaseSecurityBanner: React.FC = () => {
  const { dbSecurityNotice, dismissDbSecurityNotice, retryConnection, cloudSyncStatus } = useApp();
  const [isRetrying, setIsRetrying] = React.useState(false);

  if (!dbSecurityNotice) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      id="db-security-warning-banner"
      className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-slate-800 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                {dbSecurityNotice}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 border border-amber-500/30 font-mono">
                <HardDrive className="w-3 h-3" />
                MODO LOCAL ACTIVO
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              El sistema ha aislado la sesión y activado automáticamente el Modo Local seguro. Todas las ventas, cobros, abonos de créditos y sesiones de consola se guardan de inmediato en la memoria local sin bloqueos ni pantallas congeladas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            id="btn-retry-db-connection"
            onClick={handleRetry}
            disabled={isRetrying || cloudSyncStatus === 'connecting'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Reintentando...' : 'Reintentar'}</span>
          </button>
          <button
            id="btn-dismiss-db-notice"
            onClick={dismissDbSecurityNotice}
            title="Descartar aviso"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
