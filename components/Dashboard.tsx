
import React from 'react';
import { Drain, DrainCategory } from '../types';
import { isOverdue } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  drains: Drain[];
  insights: string;
  loadingInsights: boolean;
}

interface QuickStatsProps {
  drains: Drain[];
  onStatClick?: (type: 'all' | 'overdue' | 'health') => void;
}

/**
 * Componente para los 3 indicadores clave de rendimiento (KPIs)
 * Se coloca en la parte superior con iconos de salud, agua y canales.
 */
export const QuickStats: React.FC<QuickStatsProps> = ({ drains, onStatClick }) => {
  const overdueCount = drains.filter(d => 
    d.history.length === 0 || isOverdue(d.history[0].date, d.frequencyDays)
  ).length;

  const stats = [
    { 
      id: 'all', 
      label: 'Agua e Infraestructura', 
      val: drains.length, 
      sub: 'Canales en sistema', 
      color: 'text-slate-900', 
      bg: 'hover:bg-blue-50/30',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { 
      id: 'overdue', 
      label: 'Alertas de Limpieza', 
      val: overdueCount, 
      sub: 'Atención inmediata', 
      color: overdueCount > 0 ? 'text-rose-600' : 'text-emerald-600', 
      bg: 'hover:bg-rose-50/50',
      icon: (
        <svg className={`h-6 w-6 ${overdueCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    { 
      id: 'health', 
      label: 'Salud del Sistema', 
      val: drains.length > 0 ? `${Math.round(((drains.length - overdueCount) / drains.length) * 100)}%` : '0%', 
      sub: 'Capacidad operativa', 
      color: 'text-indigo-600', 
      bg: 'hover:bg-indigo-50/50',
      icon: (
        <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {stats.map((item, i) => (
        <button 
          key={i} 
          onClick={() => onStatClick?.(item.id as any)}
          className={`text-left bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all group active:scale-95 ${item.bg}`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50 group-hover:shadow-md transition-shadow">
              {item.icon}
            </div>
            {item.id === 'overdue' && overdueCount > 0 && (
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <p className={`text-5xl font-black tracking-tighter ${item.color} group-hover:scale-105 transition-transform origin-left`}>{item.val}</p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
              <div className="flex items-center text-indigo-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <span>Ver detalles</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * Componente para el Censo y la Inteligencia Artificial.
 */
export const AnalysisSection: React.FC<DashboardProps> = ({ drains, insights, loadingInsights }) => {
  const chartData = [
    { name: 'Críticos', value: drains.filter(d => d.category === DrainCategory.LARGE).length, color: '#e11d48' },
    { name: 'Medios', value: drains.filter(d => d.category === DrainCategory.MEDIUM).length, color: '#f59e0b' },
    { name: 'Leves', value: drains.filter(d => d.category === DrainCategory.SMALL).length, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16 mb-12">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Censo de Canales</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribución por importancia</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full -mr-24 -mt-24 transition-opacity group-hover:opacity-60"></div>
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">Vera AI Assistant</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Diagnóstico de Infraestructura</p>
            </div>
          </div>
          
          <div className="flex-1">
            {loadingInsights ? (
              <div className="space-y-5">
                <div className="h-3 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-full w-full animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-full w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-300 leading-relaxed italic tracking-wide">
                {insights || "Iniciando protocolos de análisis... Por favor, registre datos de limpieza para generar un diagnóstico preciso."}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Cómputo en tiempo real</span>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">IA Activa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
