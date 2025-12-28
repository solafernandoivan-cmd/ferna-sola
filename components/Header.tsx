
import React from 'react';

interface HeaderProps {
  onExport: () => void;
  onExportCSV: () => void;
  onImport: (file: File) => void;
  onShowHelp: () => void;
  isSyncing: boolean;
  lastSync: string;
  cloudStatus: 'idle' | 'syncing' | 'success' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ onExport, onShowHelp, isSyncing, lastSync, cloudStatus }) => {
  const hasCloud = !!localStorage.getItem('cloud_sync_id');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl shadow-blue-200 shadow-xl shrink-0 group">
              <svg className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                <path className="text-blue-200" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black text-gray-900 leading-none tracking-tight">Vera Pluvial</h1>
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center">
                  <div className={`h-1.5 w-1.5 rounded-full mr-1 ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Local: {lastSync}</span>
                </div>
                {hasCloud && (
                  <div className="flex items-center border-l border-slate-200 pl-2">
                    <svg className={`h-2.5 w-2.5 mr-1 ${cloudStatus === 'syncing' ? 'text-amber-500 animate-spin' : cloudStatus === 'error' ? 'text-rose-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${cloudStatus === 'error' ? 'text-rose-500' : 'text-blue-500'}`}>
                      {cloudStatus === 'syncing' ? 'Nube...' : cloudStatus === 'error' ? 'Error Nube' : 'Nube OK'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onExport}
              className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-md active:scale-95 ${hasCloud ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-slate-900 text-white shadow-slate-200'}`}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="hidden sm:inline uppercase tracking-widest">{hasCloud ? 'Cloud Manager' : 'Set Cloud Sync'}</span>
            </button>

            <button 
              onClick={onShowHelp}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
