
export const getDaysSince = (dateStr: string): number => {
  const lastDate = new Date(dateStr);
  const now = new Date();
  // Reset time to midnight for pure day comparison
  const d1 = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const isOverdue = (lastDateStr: string, frequencyDays: number): boolean => {
  return getDaysSince(lastDateStr) > frequencyDays;
};

export const isApproaching = (lastDateStr: string, frequencyDays: number, threshold: number = 3): boolean => {
  const daysSince = getDaysSince(lastDateStr);
  const daysRemaining = frequencyDays - daysSince;
  // Está en el umbral (ej. faltan 3, 2, 1 o 0 días) pero no ha pasado el límite
  return daysRemaining >= 0 && daysRemaining <= threshold;
};
