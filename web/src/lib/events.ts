/**
 * Sistema de eventos tipado para comunicação entre módulos.
 */

export type AppNotification = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
};

export type AppEvent =
  | { type: 'clients:changed' }
  | { type: 'projects:changed' }
  | { type: 'session:changed' }
  | { type: 'standards:changed' }
  | { type: 'notification:added'; payload: AppNotification };

export type AppEventType = AppEvent['type'];

type EventCallback<T extends AppEventType> = (payload: Extract<AppEvent, { type: T }> extends { payload: infer P } ? P : void) => void;

class EventBus {
  private listeners: Map<string, Set<any>> = new Map();

  on<T extends AppEventType>(event: T, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off<T extends AppEventType>(event: T, callback: EventCallback<T>) {
    this.listeners.get(event)?.delete(callback);
  }

  emit<T extends AppEventType>(event: T, ...args: Extract<AppEvent, { type: T }> extends { payload: infer P } ? [P] : []) {
    const payload = args[0];
    this.listeners.get(event)?.forEach((callback) => callback(payload));
    window.dispatchEvent(new CustomEvent(`electrica:${event}`, { detail: payload }));
  }
}

export const eventBus = new EventBus();

// Utilitário para disparar notificações de qualquer lugar
export function notify(notification: Omit<AppNotification, 'id'>) {
  eventBus.emit('notification:added', {
    ...notification,
    id: Math.random().toString(36).substring(2, 9),
    duration: notification.duration ?? 5000,
  });
}
