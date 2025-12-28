
import React, { useState, useEffect } from 'react';
import { DrainCategory, Drain } from '../types';
import { CATEGORY_CONFIG } from '../constants';

interface EditDrainModalProps {
  drain: Drain;
  onClose: () => void;
  onSave: (id: string, updatedData: Omit<Drain, 'id' | 'history'>) => void;
}

export const EditDrainModal: React.FC<EditDrainModalProps> = ({ drain, onClose, onSave }) => {
  const [name, setName] = useState(drain.name);
  const [location, setLocation] = useState(drain.location);
  const [category, setCategory] = useState<DrainCategory>(drain.category);
  const [frequency, setFrequency] = useState(drain.frequencyDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(drain.id, {
      name,
      location,
      category,
      frequencyDays: frequency
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Editar Canal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Identificador</label>
            <input
              type="text"
              required
              className="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación / Dirección</label>
            <input
              type="text"
              required
              className="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría de Importancia</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as DrainCategory)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border-2 transition-all ${
                    category === key ? `${config.border} ${config.bgLight} ${config.text}` : 'border-gray-100 text-gray-400'
                  }`}
                >
                  {config.label.split(' ')[1] || config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Frecuencia de Limpieza (Días)</label>
            <input
              type="number"
              min="1"
              required
              className="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
            />
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
