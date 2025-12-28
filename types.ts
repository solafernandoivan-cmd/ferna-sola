
export enum DrainCategory {
  LARGE = 'LARGE', // Rojo
  MEDIUM = 'MEDIUM', // Naranja
  SMALL = 'SMALL' // Amarillo
}

export interface CleaningRecord {
  id: string;
  date: string;
  notes: string;
  performer: string;
}

export interface Drain {
  id: string;
  name: string;
  location: string;
  category: DrainCategory;
  history: CleaningRecord[];
  frequencyDays: number; // Recomendación de limpieza en días
}

export interface DashboardStats {
  total: number;
  byCategory: {
    large: number;
    medium: number;
    small: number;
  };
  overdue: number;
}
