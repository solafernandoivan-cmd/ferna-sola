
import { Drain } from "../types";
import { getDaysSince } from "../utils/dateUtils";

const NOTIFIED_KEY = 'vera_notified_today';

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio.");
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  sendNotification: (title: string, body: string) => {
    if (Notification.permission === "granted") {
      try {
        // Usamos el Service Worker si está disponible para una mejor experiencia PWA
        const icon = "https://cdn-icons-png.flaticon.com/512/3145/3145024.png";
        
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            // Fix: Cast options to any as 'vibrate' and 'badge' might be missing from the local NotificationOptions type definition
            registration.showNotification(title, {
              body,
              icon,
              badge: icon,
              vibrate: [200, 100, 200],
              tag: 'mantenimiento-pluvial'
            } as any);
          });
        } else {
          // Fix: Cast options to any as 'badge' might be missing from the local NotificationOptions type definition
          new Notification(title, {
            body,
            icon,
            badge: icon,
            tag: 'mantenimiento-pluvial'
          } as any);
        }
      } catch (e) {
        console.error("Error al enviar notificación:", e);
      }
    }
  },

  /**
   * Verifica todos los canales y envía alertas si están próximos a vencer o vencidos.
   */
  checkDrainsAndNotify: (drains: Drain[]) => {
    if (Notification.permission !== "granted") return;

    const today = new Date().toISOString().split('T')[0];
    const notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');

    drains.forEach(drain => {
      const lastCleaning = drain.history.length > 0 ? drain.history[0] : null;
      // Si nunca se ha limpiado, se considera vencido desde el inicio
      const daysSince = lastCleaning ? getDaysSince(lastCleaning.date) : 999;
      const daysRemaining = drain.frequencyDays - daysSince;
      
      const notificationId = `${drain.id}-${daysRemaining <= 0 ? 'overdue' : daysRemaining}-${today}`;
      
      // No repetir la misma notificación el mismo día
      if (notified[notificationId]) return;

      if (daysRemaining === 3) {
        notificationService.sendNotification(
          "⚠️ Mantenimiento Próximo",
          `El canal "${drain.name}" requiere limpieza en 3 días.`
        );
        notified[notificationId] = true;
      } else if (daysRemaining <= 0) {
        notificationService.sendNotification(
          "🚨 ¡ALERTA DE MANTENIMIENTO!",
          `El plazo de limpieza del canal "${drain.name}" se ha vencido. Acción inmediata requerida.`
        );
        notified[notificationId] = true;
      }
    });

    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
  },

  /**
   * Dispara una notificación de prueba que simula un vencimiento real.
   */
  simulateOverdueNotification: () => {
    notificationService.sendNotification(
      "🚨 SIMULACRO: Limpieza Vencida",
      "Este es un ejemplo de cómo Vera te avisará cuando un canal pluvial exceda su plazo de mantenimiento."
    );
  }
};
