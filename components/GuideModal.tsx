
import React, { useState } from 'react';
import { notificationService } from '../services/notificationService';

interface GuideModalProps {
  onClose: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose, canInstall, onInstall }) => {
  const [copied, setCopied] = useState(false);
  const [notifState, setNotifState] = useState(Notification.permission);
  const [simulating, setSimulating] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotifState(Notification.permission);
    if (granted) {
      notificationService.sendNotification(
        "¡Vera Pluvial Activa!",
        "Las notificaciones de mantenimiento están configuradas correctamente."
      );
    } else {
      alert("Para recibir alertas, debes permitir las notificaciones en la configuración de tu navegador.");
    }
  };

  const handleSimulateOverdue = async () => {
    if (Notification.permission !== 'granted') {
      const granted = await notificationService.requestPermission();
      setNotifState(Notification.permission);
      if (!granted) return;
    }
    
    setSimulating(true);
    // Simular un pequeño delay de procesamiento para realismo
    setTimeout(() => {
      notificationService.simulateOverdueNotification();
      setSimulating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        <div className="p-7 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Centro de Control</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configuración y Soporte</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          {/* SECCIÓN INSTALACIÓN */}
          <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider">Modo Aplicación</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              Instala Vera en tu pantalla de inicio para recibir alertas críticas incluso con la app cerrada.
            </p>
            {canInstall ? (
              <button 
                onClick={onInstall}
                className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 text-[11px] uppercase tracking-widest"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Instalar en Dispositivo</span>
              </button>
            ) : (
              <div className="bg-indigo-500/30 p-4 rounded-2xl border border-indigo-400/50">
                <p className="text-[10px] text-white font-black leading-tight uppercase tracking-wide">
                  <span className="block mb-2 text-amber-300">💡 Tip para iPhone/Safari:</span>
                  Toca [↑] Compartir y selecciona "Agregar a la pantalla de inicio".
                </p>
              </div>
            )}
          </div>

          {/* SECCIÓN ALERTAS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Pruebas de Notificación</h3>
            
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Vera detecta automáticamente cuándo un canal pluvial necesita limpieza basándose en su frecuencia configurada.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleTestNotifications}
                  className={`w-full font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 border-2 ${
                    notifState === 'granted' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 cursor-default' 
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {notifState === 'granted' ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      <span>Permiso Concedido</span>
                    </>
                  ) : (
                    <span>Activar Alertas</span>
                  )}
                </button>

                <button 
                  onClick={handleSimulateOverdue}
                  disabled={simulating}
                  className="w-full bg-white text-indigo-600 border-2 border-indigo-100 font-black py-4 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <svg className={`h-4 w-4 ${simulating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>{simulating ? 'Simulando...' : 'Simular Alerta de Vencimiento'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* COMPARTIR */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Acceso Rápido</h3>
            <button 
              onClick={copyUrl}
              className={`w-full flex items-center justify-center space-x-3 py-5 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              <span>{copied ? '¡URL Copiada al Portapapeles!' : 'Copiar URL del Sistema'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-indigo-600 transition-all text-[11px] uppercase tracking-[0.2em] active:scale-95 shadow-lg"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
