import { useEffect, useState, useRef } from 'react';
import { eventBus, type AppNotification } from '../../lib/events';

type ToastProps = {
  notification: AppNotification;
  onRemove: (id: string) => void;
};

function Toast({ notification, onRemove }: ToastProps) {
  const [remaining, setRemaining] = useState(notification.duration || 5000);
  const [isPaused, setIsPaused] = useState(false);
  const lastUpdate = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastUpdate.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      lastUpdate.current = now;

      setRemaining((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          onRemove(notification.id);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, notification.id, onRemove]);

  const progress = (remaining / (notification.duration || 5000)) * 100;

  return (
    <article 
      className={`notification-toast ${notification.type}`} 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onRemove(notification.id)}
    >
      <div className="toast-icon">
         {notification.type === 'success' && '✓'}
         {notification.type === 'error' && '✕'}
         {notification.type === 'warning' && '⚠'}
         {notification.type === 'info' && 'ℹ'}
      </div>
      <div className="toast-content">
        <strong>{notification.title}</strong>
        {notification.message && <p>{notification.message}</p>}
      </div>
      <div className="toast-progress" style={{ width: `${progress}%` }} />
    </article>
  );
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsub = eventBus.on('notification:added', (payload) => {
      setNotifications((prev) => [...prev, payload]);
    });
    return unsub;
  }, []);

  function removeNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onRemove={removeNotification} />
      ))}
    </div>
  );
}
