
import React, { useState } from 'react';
import { Drain } from '../types';

interface AddCleaningModalProps {
  drain: Drain | null;
  onClose: () => void;
  onSave: (id: string, notes: string, performer: string) => void;
}

export const AddCleaningModal: React.FC<AddCleaningModalProps> = ({ drain, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [performer, setPerformer] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!drain) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    
    // Pequeña pausa para que el usuario vea la confirmación antes de cerrar
    setTimeout(() => {
      onSave(drain.id, notes, performer);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registrar Limpieza</h2>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{drain.name}</p>
          </div>
          {!isSuccess && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
              <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 shadow-inner">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">¡Registro Exitoso!</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Sincronizando con el sistema...</p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nombre del Operario</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-slate-200 border-2 rounded-2xl pl-11 pr-4 py-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Nombre completo"
                    value={performer}
                    onChange={(e) => setPerformer(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Observaciones Técnicas</label>
                <textarea
                  rows={4}
                  required
                  className="w-full bg-slate-50 border-slate-200 border-2 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                  placeholder="Estado del canal, basura encontrada, reparaciones necesarias..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center space-x-2 text-sm uppercase tracking-widest"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  <span>Finalizar Mantenimiento</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-slate-400 hover:text-rose-500 font-black py-2 text-[10px] uppercase tracking-[0.2em] transition-colors"
                >
                  Cancelar Operación
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
