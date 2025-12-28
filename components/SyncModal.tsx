
import React, { useState } from 'react';
import { cloudService } from '../services/cloudService';
import { Drain } from '../types';

interface SyncModalProps {
  currentData: Drain[];
  onClose: () => void;
  onDataRestored: (newData: Drain[], cloudId: string) => void;
  onDownloadBackup: () => void;
  onExportCSV: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ currentData, onClose, onDataRestored, onDownloadBackup, onExportCSV }) => {
  const [syncId, setSyncId] = useState('');
  const [savedCloudId, setSavedCloudId] = useState<string | null>(() => localStorage.getItem('cloud_sync_id'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePush = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (savedCloudId) {
        await cloudService.updateCloud(savedCloudId, currentData);
        setSuccess("Sincronización manual completada.");
      } else {
        const id = await cloudService.pushToCloud(currentData);
        setSavedCloudId(id);
        localStorage.setItem('cloud_sync_id', id);
        setSuccess("Cuenta en la nube activada.");
      }
    } catch (err: any) {
      setError(err.message || "Fallo de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    if (!syncId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cloudService.pullFromCloud(syncId.trim());
      if (window.confirm("Se han encontrado datos. ¿Deseas reemplazar el inventario actual de este dispositivo?")) {
        localStorage.setItem('cloud_sync_id', syncId.trim());
        onDataRestored(data, syncId.trim());
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (savedCloudId) {
      navigator.clipboard.writeText(savedCloudId);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        <div className="p-8 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-800 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">Exportar y Nube</h2>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de Datos Vera</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          {/* NUBE */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Sincronización Multidispositivo</h3>
            
            {savedCloudId ? (
              <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-[2rem] p-6 flex flex-col items-center text-center space-y-4">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Código de Acceso Nube</span>
                <span className="text-4xl font-black text-indigo-600 tracking-[0.2em] font-mono select-all">{savedCloudId}</span>
                <div className="flex space-x-3 w-full">
                  <button onClick={copyToClipboard} className="flex-1 bg-white text-indigo-600 border border-indigo-200 font-black py-4 rounded-2xl shadow-sm hover:bg-indigo-50 transition-colors">
                    {copying ? '¡COPIADO!' : 'COPIAR'}
                  </button>
                  <button onClick={handlePush} disabled={loading} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all">
                    {loading ? '...' : 'SINCRONIZAR'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handlePush} disabled={loading || currentData.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all">
                {loading ? 'ACTIVANDO...' : 'ACTIVAR NUBE VERA'}
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-slate-300">REPORTES Y BACKUPS</span></div>
          </div>

          {/* EXPORTACIONES FÍSICAS */}
          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={onExportCSV}
              className="flex flex-col items-center justify-center bg-slate-50 hover:bg-green-50 border-2 border-slate-100 hover:border-green-200 p-5 rounded-[2rem] transition-all group"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-green-700 tracking-wider">Reporte Excel</span>
            </button>

            <button 
              onClick={onDownloadBackup}
              className="flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-200 p-5 rounded-[2rem] transition-all group"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-blue-700 tracking-wider">Backup Datos</span>
            </button>
          </div>

          {/* RECUPERAR */}
          <div className="bg-slate-900 rounded-[2rem] p-6 space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Importar desde otro dispositivo</h3>
             <div className="flex space-x-2">
                <input 
                  type="text"
                  placeholder="CÓDIGO"
                  value={syncId}
                  onChange={(e) => setSyncId(e.target.value.toUpperCase().trim())}
                  className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 text-center font-black tracking-[0.3em] text-white focus:bg-white/20 outline-none transition-all"
                />
                <button onClick={handlePull} disabled={loading || !syncId} className="bg-white text-slate-900 font-black px-6 rounded-2xl hover:bg-indigo-100 transition-colors">
                  VINCULAR
                </button>
             </div>
          </div>

          {(success || error) && (
            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border animate-in slide-in-from-top-2 ${success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {success || error}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-50 text-center shrink-0">
          <p className="text-[9px] text-slate-400 font-black uppercase italic tracking-widest">Los reportes CSV incluyen historial completo de operarios.</p>
        </div>
      </div>
    </div>
  );
};
