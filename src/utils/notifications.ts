/**
 * Native Browser & Service Worker Notification Helpers
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendBrowserNotification(title: string, body: string, url: string = '/pomodoro') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/favicon.png',
            tag: 'devdock-timer-alert',
            data: { url },
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/favicon.png',
          tag: 'devdock-timer-alert',
        });
      }
    } catch (e) {
      console.error('Error triggering browser notification:', e);
    }
  }
}
