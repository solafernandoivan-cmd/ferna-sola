
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
import { cloudService } from './services/cloudService';

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
  
  // Referencia para evitar bucles de sincronización
  const lastKnownCloudDataRef = useRef<string>(JSON.stringify(drains));
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * PUSH: Enviar cambios a la nube cuando el usuario modifica algo localmente
   */
  useEffect(() => {
    const currentDataStr = JSON.stringify(drains);
    
    // Solo persistimos si el cambio es diferente a lo que ya sabemos que hay en la nube
    if (currentDataStr === lastKnownCloudDataRef.current) return;

    const persistData = async () => {
      setIsSyncingLocal(true);
      localStorage.setItem('cunetasvera_drains', currentDataStr);
      
      const cloudId = localStorage.getItem('cloud_sync_id');
      if (cloudId) {
        setCloudStatus('syncing');
        try {
          await cloudService.updateCloud(cloudId, drains);
          lastKnownCloudDataRef.current = currentDataStr;
          setCloudStatus('success');
          setTimeout(() => setCloudStatus('idle'), 3000);
        } catch (err) {
          console.error("Error en autosincronización nube:", err);
          setCloudStatus('error');
        }
      }

      setLastSync(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      setIsSyncingLocal(false);
      notificationService.checkDrainsAndNotify(drains);
    };

    const timeout = setTimeout(persistData, 1000); // Debounce de 1s para no saturar la API
    return () => clearTimeout(timeout);
  }, [drains]);

  /**
   * PULL: Ciclo de actualización automática desde otros dispositivos
   */
  useEffect(() => {
    const cloudId = localStorage.getItem('cloud_sync_id');
    if (!cloudId) return;

    const checkForRemoteUpdates = async () => {
      try {
        const remoteData = await cloudService.pullFromCloud(cloudId);
        const remoteDataStr = JSON.stringify(remoteData);
        
        // Si los datos remotos son diferentes a los locales, actualizamos
        if (remoteDataStr !== JSON.stringify(drains)) {
          console.log("Detectados cambios remotos, actualizando dispositivo...");
          lastKnownCloudDataRef.current = remoteDataStr;
          setDrains(remoteData);
          setCloudStatus('success');
          setTimeout(() => setCloudStatus('idle'), 2000);
        }
      } catch (err) {
        console.warn("Fallo en verificación de actualizaciones remotas:", err);
      }
    };

    // Verificación inicial al montar
    checkForRemoteUpdates();

    // Polling cada 20 segundos
    const interval = setInterval(checkForRemoteUpdates, 20000);
    return () => clearInterval(interval);
  }, [drains]); // Re-suscribir si los drains cambian para mantener el closure fresco

  const fetchInsights = useCallback(async () => {
    if (drains.length === 0) {
      setInsights("No hay canales registrados para analizar.");
      return;
    }
    setLoadingInsights(true);
    const result = await getMaintenanceInsights(drains);
    setInsights(result || "Sin recomendaciones actuales.");
    setLoadingInsights(false);
  }, [drains]);

  useEffect(() => {
    fetchInsights();
  }, [drains.length]);

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drains, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Vera_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleAddDrain = (newDrainData: Omit<Drain, 'id' | 'history'>) => {
    const newDrain: Drain = { ...newDrainData, id: Date.now().toString(), history: [] };
    setDrains(prev => [...prev, newDrain]);
    setIsAddDrainOpen(false);
  };

  const handleDeleteDrain = (id: string) => {
    setDrains(prev => prev.filter(d => d.id !== id));
  };

  const handleAddCleaning = (id: string, notes: string, performer: string) => {
    const newRecord: CleaningRecord = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], notes, performer };
    setDrains(prev => prev.map(d => d.id === id ? { ...d, history: [newRecord, ...d.history] } : d));
    setSelectedDrainId(null);
  };

  const handleDataRestored = (newData: Drain[], cloudId: string) => {
    localStorage.setItem('cloud_sync_id', cloudId);
    lastKnownCloudDataRef.current = JSON.stringify(newData);
    setDrains(newData);
    setCloudStatus('success');
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
        onExportCSV={() => exportToCSV(drains)} 
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
            <p className="text-slate-500 font-medium italic">Vera Pluvial Pro &copy;</p>
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

        <QuickStats drains={drains} onStatClick={(type) => {
          if (type === 'overdue') setActiveTab('overdue');
          else setActiveTab('all');
          listRef.current?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-mt-24">
          {filteredDrains.map(drain => (
            <DrainCard 
              key={drain.id} 
              drain={drain} 
              onAddCleaning={(id) => setSelectedDrainId(id)} 
              onViewHistory={(id) => setViewHistoryDrainId(id)}
              onEdit={(id) => setEditDrainId(id)}
              onDelete={handleDeleteDrain}
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
        </div>

        <AnalysisSection drains={drains} insights={insights} loadingInsights={loadingInsights} />
      </main>

      {/* Navegación Inferior Móvil */}
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
      {isSyncModalOpen && <SyncModal currentData={drains} onClose={() => setIsSyncModalOpen(false)} onDataRestored={handleDataRestored} onDownloadBackup={handleDownloadBackup} onExportCSV={() => exportToCSV(drains)} />}
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
      {editDrainId && <EditDrainModal drain={drains.find(d => d.id === editDrainId)!} onClose={() => setEditDrainId(null)} onSave={(id, data) => setDrains(prev => prev.map(d => d.id === id ? {...d, ...data} : d))} />}
      {selectedDrainId && <AddCleaningModal drain={drains.find(d => d.id === selectedDrainId)!} onClose={() => setSelectedDrainId(null)} onSave={handleAddCleaning} />}
      {viewHistoryDrainId && <HistoryModal drain={drains.find(d => d.id === viewHistoryDrainId)!} onClose={() => setViewHistoryDrainId(null)} />}
    </div>
  );
};

export default App;
