
import React from 'react';
import { DrainCategory, Drain } from './types';

export const CATEGORY_CONFIG = {
  [DrainCategory.LARGE]: {
    label: 'Prioridad Alta',
    color: 'bg-rose-600',
    border: 'border-rose-200',
    text: 'text-rose-600',
    bgLight: 'bg-rose-50',
    icon: (className?: string) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  [DrainCategory.MEDIUM]: {
    label: 'Prioridad Media',
    color: 'bg-amber-500',
    border: 'border-amber-200',
    text: 'text-amber-600',
    bgLight: 'bg-amber-50',
    icon: (className?: string) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  [DrainCategory.SMALL]: {
    label: 'Prioridad Ordinaria',
    color: 'bg-emerald-500',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    icon: (className?: string) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
};

// Se eliminaron los ejemplos para iniciar con el inventario vacío
export const INITIAL_DRAINS: Drain[] = [];
