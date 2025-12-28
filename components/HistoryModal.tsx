
import React from 'react';
import { Drain } from '../types';
import { formatDate } from '../utils/dateUtils';

interface HistoryModalProps {
  drain: Drain;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ drain, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
        
        {/* Cabecera del Modal */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Historial Operativo</h2>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{drain.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-rose-500 p-3 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo del Modal - Listado */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white">
          {drain.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No existen registros de mantenimiento</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
              {/* Línea de tiempo vertical decorativa */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {drain.history.map((record, index) => (
                <div key={record.id} className="relative pl-10 group">
                  {/* Punto de la línea de tiempo */}
                  <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-white border-4 border-indigo-500 shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                  
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 transition-all group-hover:bg-white group-hover:shadow-xl group-hover:shadow-indigo-500/5 group-hover:border-indigo-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                          <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">{formatDate(record.date)}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          OP: {record.performer}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <svg className="absolute -left-1 -top-1 h-6 w-6 text-indigo-500/10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9125 16 16.0171 16H19.0171C20.1217 16 21.0171 16.8954 21.0171 18V21M14.017 21H21.0171M14.017 21C12.9124 21 12.017 20.1046 12.017 19V12C12.017 10.8954 12.9124 10 14.017 10H17.017C18.1216 10 19.017 10.8954 19.017 12V15M3.01709 21L3.01709 18C3.01709 16.8954 3.91252 16 5.01709 16H8.01709C9.12166 16 10.0171 16.8954 10.0171 18V21M3.01709 21H10.0171M3.01709 21C1.91252 21 1.01709 20.1046 1.01709 19V12C1.01709 10.8954 1.91252 10 3.01709 10H6.01709C7.12166 10 8.01709 10.8954 8.01709 12V15" />
                      </svg>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic pl-6 pt-2">
                        {record.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pie del Modal */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Auditoría de infraestructura activa</p>
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white font-black py-3 px-8 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 text-[11px] uppercase tracking-widest"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
