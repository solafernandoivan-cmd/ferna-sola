
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { QuickStats, AnalysisSection } from './components/Dashboard';
import { DrainCard } from './components/DrainCard';
import { AddCleaningModal } from './components/AddCleaningModal';
import { AddDrainModal } from './components/AddDrainModal';
import { EditDrainModal } from './components/EditDrainModal';
import { HistoryModal } from './components/HistoryModal';
import { SyncModal } from './components/SyncModal';
import { GuideModal } from './components/GuideModal';
import { Drain, CleaningRecord } from './types';
import { INITIAL_DRAINS } from './constants';
import { getMaintenanceInsights } from './services/geminiService';
import { exportToCSV } from './utils/csvExport';
import { notificationService } from './services/notificationService';
import { isOverdue } from './utils/dateUtils';

const App: React.FC = () => {
  const [drains, setDrains] = useState<Drain[]>(() => {
    const saved = localStorage.getItem('cunetasvera_drains');
    return saved ? JSON.parse(saved) : INITIAL_DRAINS;
  });

  const [selectedDrainId, setSelectedDrainId] = useState<string | null>(null);
  const [viewHistoryDrainId, setViewHistoryDrainId] = useState<string | null>(null);
  const [editDrainId, setEditDrainId] = useState<string | null>(null);
  const [isAddDrainOpen, setIsAddDrainOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'red' | 'orange' | 'yellow' | 'overdue'>('all');
  
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState(() => new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  
  const listRef = useRef<HTMLDivElement>(null);

  const saveToLocal = useCallback((data: Drain[]) => {
    setIsSyncingLocal(true);
    localStorage.setItem('cunetasvera_drains', JSON.stringify(data));
    setTimeout(() => {
      setIsSyncingLocal(false);
      setLastSync(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }, 400);
  }, []);

  useEffect(() => {
    saveToLocal(drains);
    notificationService.checkDrainsAndNotify(drains);
  }, [drains, saveToLocal]);

  const fetchInsights = useCallback(async () => {
    if (drains.length === 0) return;
    setLoadingInsights(true);
    const result = await getMaintenanceInsights(drains);
    setInsights(result);
    setLoadingInsights(false);
  }, [drains]);

  useEffect(() => {
    fetchInsights();
  }, [drains.length]);

  const handleStatClick = (type: 'all' | 'overdue' | 'health') => {
    if (type === 'overdue') {
      setActiveTab('overdue');
    } else {
      setActiveTab('all');
    }
    
    // Scroll suave hacia la sección de canales
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleExportCSV = () => {
    if (drains.length === 0) return alert("No hay datos operativos.");
    exportToCSV(drains);
  };

  const handleAddDrain = (newDrainData: Omit<Drain, 'id' | 'history'>) => {
    const newDrain: Drain = { ...newDrainData, id: Date.now().toString(), history: [] };
    setDrains(prev => [...prev, newDrain]);
    setIsAddDrainOpen(false);
  };

  const handleAddCleaning = (id: string, notes: string, performer: string) => {
    const newRecord: CleaningRecord = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], notes, performer };
    setDrains(prev => prev.map(d => d.id === id ? { ...d, history: [newRecord, ...d.history] } : d));
    setSelectedDrainId(null);
  };

  const filteredDrains = drains.filter(d => {
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') {
      return d.history.length === 0 || isOverdue(d.history[0].date, d.frequencyDays);
    }
    const catMap = { 'red': 'LARGE', 'orange': 'MEDIUM', 'yellow': 'SMALL' };
    return d.category === catMap[activeTab as keyof typeof catMap];
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-32">
      <Header 
        onExport={() => setIsSyncModalOpen(true)} 
        onExportCSV={handleExportCSV} 
        onImport={() => {}}
        onShowHelp={() => setIsGuideOpen(true)}
        isSyncing={isSyncingLocal}
        lastSync={lastSync}
        cloudStatus={cloudStatus}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Panel Maestro</h2>
            <p className="text-slate-500 font-medium">Gestión Profesional Pluvial</p>
          </div>
          
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 self-stretch md:self-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'overdue', label: 'Alertas' },
              { id: 'red', label: 'Críticos' },
              { id: 'orange', label: 'Medios' },
              { id: 'yellow', label: 'Leves' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-xl' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS PRINCIPALES AL PRINCIPIO */}
        <QuickStats drains={drains} onStatClick={handleStatClick} />

        {/* LISTADO DE CANALES (ZONA OPERATIVA) */}
        <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-mt-24">
          {filteredDrains.map(drain => (
            <DrainCard 
              key={drain.id} 
              drain={drain} 
              onAddCleaning={(id) => setSelectedDrainId(id)} 
              onViewHistory={(id) => setViewHistoryDrainId(id)}
              onEdit={(id) => setEditDrainId(id)}
            />
          ))}
          
          {activeTab === 'all' && (
            <button 
              onClick={() => setIsAddDrainOpen(true)}
              className="border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-500 hover:bg-white transition-all group min-h-[350px]"
            >
              <div className="bg-slate-50 group-hover:bg-indigo-50 p-6 rounded-full mb-4 transition-colors">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-sm">Nuevo Canal</span>
            </button>
          )}

          {filteredDrains.length === 0 && activeTab !== 'all' && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay canales en este estado</p>
              <button onClick={() => setActiveTab('all')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">Ver todos los canales</button>
            </div>
          )}
        </div>

        {/* CENSO E IA AL FINAL DE TODO */}
        <AnalysisSection drains={drains} insights={insights} loadingInsights={loadingInsights} />
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-4 flex justify-between items-center shadow-2xl border border-white/10">
          {[
            { id: 'dashboard', icon: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />, label: 'Panel', action: () => setActiveTab('all') },
            { id: 'add', icon: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />, label: 'Añadir', action: () => setIsAddDrainOpen(true) },
            { id: 'sync', icon: <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />, label: 'Sincro', action: () => setIsSyncModalOpen(true) },
            { id: 'help', icon: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, label: 'Ayuda', action: () => setIsGuideOpen(true) }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={item.action}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'all' && item.id === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{item.icon}</svg>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isAddDrainOpen && <AddDrainModal onClose={() => setIsAddDrainOpen(false)} onSave={handleAddDrain} />}
      {isSyncModalOpen && <SyncModal currentData={drains} onClose={() => setIsSyncModalOpen(false)} onDataRestored={(d) => setDrains(d)} onDownloadBackup={() => {}} onExportCSV={handleExportCSV} />}
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
      {editDrainId && <EditDrainModal drain={drains.find(d => d.id === editDrainId)!} onClose={() => setEditDrainId(null)} onSave={(id, data) => setDrains(prev => prev.map(d => d.id === id ? {...d, ...data} : d))} />}
      {selectedDrainId && <AddCleaningModal drain={drains.find(d => d.id === selectedDrainId)!} onClose={() => setSelectedDrainId(null)} onSave={handleAddCleaning} />}
      {viewHistoryDrainId && <HistoryModal drain={drains.find(d => d.id === viewHistoryDrainId)!} onClose={() => setViewHistoryDrainId(null)} />}
    </div>
  );
};

export default App;
