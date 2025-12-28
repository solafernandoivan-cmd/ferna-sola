
import React from 'react';
import { Drain } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { getDaysSince, isOverdue, formatDate } from '../utils/dateUtils';

interface DrainCardProps {
  drain: Drain;
  onAddCleaning: (id: string) => void;
  onViewHistory: (id: string) => void;
  onEdit: (id: string) => void;
}

// Icono de rejilla/canal pluvial personalizado
const DrainIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
    <path d="M3 14H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
  </svg>
);

export const DrainCard: React.FC<DrainCardProps> = ({ drain, onAddCleaning, onViewHistory, onEdit }) => {
  const config = CATEGORY_CONFIG[drain.category];
  const lastCleaning = drain.history.length > 0 ? drain.history[0] : null;
  const daysSince = lastCleaning ? getDaysSince(lastCleaning.date) : 999;
  const overdue = lastCleaning ? isOverdue(lastCleaning.date, drain.frequencyDays) : true;
  
  const progress = Math.min(100, Math.max(0, (daysSince / drain.frequencyDays) * 100));
  const healthPercentage = Math.max(0, 100 - progress);

  return (
    <div className={`group bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-300 hover:shadow-2xl ${overdue ? 'border-rose-200 shadow-rose-100/50' : 'border-slate-100 shadow-slate-200/50'}`}>
      <div className="p-7">
        {/* SECCIÓN SUPERIOR: CATEGORÍA Y ACCIONES RÁPIDAS */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${config.bgLight} ${config.text}`}>
            {config.label}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(drain.id)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
              title="Editar Canal"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        </div>

        {/* DATOS DEL DESAGÜE (IDENTIFICACIÓN) */}
        <div className="mb-6 flex gap-4">
          <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${overdue ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
            <DrainIcon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
              {drain.name}
            </h3>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 flex items-center">
                <svg className="h-3.5 w-3.5 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {drain.location}
              </p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center">
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Última: {lastCleaning ? formatDate(lastCleaning.date) : 'Sin registros'}
              </p>
            </div>
          </div>
        </div>

        {/* MÉTRICAS OPERATIVAS (POR ARRIBA DEL CÓDIGO DE BARRAS) */}
        <div className="bg-slate-50/80 rounded-3xl p-5 mb-6 border border-slate-100 relative overflow-hidden">
          {overdue && (
            <div className="absolute top-0 right-0">
               <div className="bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">CADUCADO</div>
            </div>
          )}
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estado de Operación</p>
              <p className={`text-xl font-black italic tracking-tighter ${overdue ? 'text-rose-600' : 'text-indigo-600'}`}>
                {overdue ? 'Mantenimiento Ya' : 'Canal Limpio'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ciclo</p>
              <p className="text-sm font-black text-slate-600">
                {daysSince} <span className="text-[10px] text-slate-400">/ {drain.frequencyDays} DÍAS</span>
              </p>
            </div>
          </div>

          {/* LA BARRA DE SALUD (CÓDIGO DE BARRAS VISUAL CON ANIMACIÓN SUAVE) */}
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
            <div 
              className={`h-full rounded-full shadow-sm transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) relative ${overdue ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`}
              style={{ width: `${healthPercentage}%` }}
            >
              {/* Efecto de brillo/shimmer para la barra */}
              <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] animate-pulse-soft"></div>
            </div>
          </div>
        </div>

        {/* ACCIONES PRINCIPALES */}
        <div className="flex gap-3">
          <button
            onClick={() => onAddCleaning(drain.id)}
            className={`flex-1 font-black py-4 px-4 rounded-2xl transition-all shadow-lg active:scale-95 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 ${
              overdue 
              ? 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700' 
              : 'bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Registrar Limpieza
          </button>
          <button
            onClick={() => onViewHistory(drain.id)}
            className="p-4 bg-white border border-slate-200 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
            title="Ver Historial"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
