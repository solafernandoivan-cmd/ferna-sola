
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black">Centro de Ayuda</h2>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Sincronización e Instalación</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* BOTÓN INSTALACIÓN DIRECTA */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100 space-y-3">
            <h3 className="font-black text-lg">Instalar la App</h3>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              Descarga la app para tener un icono en tu pantalla de inicio.
            </p>
            {canInstall ? (
              <button 
                onClick={onInstall}
                className="w-full bg-white text-indigo-600 font-black py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Instalar Ahora</span>
              </button>
            ) : (
              <div className="bg-indigo-500/30 p-3 rounded-xl border border-indigo-400/50">
                <p className="text-[10px] text-white font-bold leading-tight">
                  <span className="block mb-1 text-amber-300">💡 SI ESTÁS EN IPHONE:</span>
                  Toca el botón compartir [↑] en tu navegador Safari y elige "Agregar a la pantalla de inicio". Es obligatorio para recibir notificaciones.
                </p>
              </div>
            )}
          </div>

          {/* SIMULADOR DE NOTIFICACIÓN */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Alertas de Mantenimiento
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El sistema te notificará automáticamente cuando un canal esté a 3 días de su frecuencia de limpieza.
            </p>
            <button 
              onClick={handleTestNotifications}
              className={`w-full font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center space-x-2 ${
                notifState === 'granted' 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {notifState === 'granted' ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>Notificaciones Activas</span>
                </>
              ) : (
                <span>Activar y Probar Notificaciones</span>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <span className="bg-blue-100 text-blue-600 h-6 w-6 rounded-full flex items-center justify-center text-[10px] mr-2">1</span>
              Compartir enlace
            </h3>
            <button 
              onClick={copyUrl}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                copied ? 'bg-green-500 border-green-500 text-white' : 'border-blue-100 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copied ? '¡Enlace Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
