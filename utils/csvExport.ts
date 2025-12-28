
import { Drain } from "../types";
import { formatDate } from "./dateUtils";

export const exportToCSV = (drains: Drain[]) => {
  // Encabezados del reporte
  let csvContent = "\uFEFF"; // BOM para asegurar compatibilidad con acentos en Excel
  csvContent += "Canal,Ubicacion,Categoria,Ultima Limpieza,Operario,Observaciones,Frecuencia (Dias)\n";

  drains.forEach(drain => {
    if (drain.history.length > 0) {
      // Si tiene historial, listamos cada limpieza
      drain.history.forEach(record => {
        const row = [
          `"${drain.name}"`,
          `"${drain.location}"`,
          `"${drain.category}"`,
          `"${formatDate(record.date)}"`,
          `"${record.performer}"`,
          `"${record.notes.replace(/"/g, '""')}"`,
          `"${drain.frequencyDays}"`
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      // Si no tiene historial, una fila básica de estado
      const row = [
        `"${drain.name}"`,
        `"${drain.location}"`,
        `"${drain.category}"`,
        "SIN LIMPIEZA",
        "N/A",
        "N/A",
        `"${drain.frequencyDays}"`
      ].join(",");
      csvContent += row + "\n";
    }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Reporte_Vera_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
