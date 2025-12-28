
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
        new Notification(title, {
          body,
          icon: "https://cdn-icons-png.flaticon.com/512/3145/3145024.png",
          badge: "https://cdn-icons-png.flaticon.com/512/3145/3145024.png"
        });
      } catch (e) {
        console.error("Error al enviar notificación:", e);
      }
    }
  },

  checkDrainsAndNotify: (drains: Drain[]) => {
    if (Notification.permission !== "granted") return;

    // Evitar spam: solo notificar una vez por sesión o día si es posible
    const today = new Date().toISOString().split('T')[0];
    const notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');

    drains.forEach(drain => {
      const lastCleaning = drain.history.length > 0 ? drain.history[0] : null;
      if (!lastCleaning) return;

      const daysSince = getDaysSince(lastCleaning.date);
      const daysRemaining = drain.frequencyDays - daysSince;
      
      const notificationId = `${drain.id}-${daysRemaining}-${today}`;
      if (notified[notificationId]) return;

      if (daysRemaining === 3) {
        notificationService.sendNotification(
          "⚠️ Mantenimiento Próximo",
          `El canal "${drain.name}" requiere limpieza en 3 días.`
        );
        notified[notificationId] = true;
      } else if (daysRemaining === 0) {
        notificationService.sendNotification(
          "🚨 ¡Limpieza Requerida!",
          `El canal "${drain.name}" ha llegado al límite de su ciclo hoy.`
        );
        notified[notificationId] = true;
      }
    });

    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
  }
};
