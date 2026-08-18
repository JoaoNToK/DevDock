'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  savePushSubscriptionAction,
  deletePushSubscriptionAction,
  sendTestNotificationAction,
} from '@/app/actions/pushActions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Register Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setSwRegistration(reg);
          return reg.pushManager.getSubscription();
        })
        .then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        })
        .catch((err) => {
          console.warn('[WebPush] Service Worker registration error:', err);
        });
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!swRegistration) return { success: false, error: 'Service worker não registrado.' };

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        return { success: false, error: 'Permissão para notificações negada pelo usuário.' };
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        // Local Notification Fallback
        setIsSubscribed(true);
        new Notification('🔔 DevDock Web Push', {
          body: 'Notificações locais ativadas com sucesso!',
          icon: '/icon.png',
        });
        return { success: true, localOnly: true };
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subObj = JSON.parse(JSON.stringify(subscription));
      await savePushSubscriptionAction(subObj);
      setIsSubscribed(true);

      return { success: true };
    } catch (err) {
      console.error('[WebPush] Subscribe error:', err);
      return { success: false, error: (err as Error).message };
    }
  }, [swRegistration]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!swRegistration) return;

    try {
      const sub = await swRegistration.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscriptionAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[WebPush] Unsubscribe error:', err);
    }
  }, [swRegistration]);

  const sendTest = useCallback(async () => {
    if (Notification.permission === 'granted') {
      const res = await sendTestNotificationAction();
      if (!res.success) {
        // Fallback local Notification
        new Notification('🔔 Teste de Notificação DevDock V2', {
          body: 'Notificação do sistema ativo com sucesso no seu dispositivo!',
          icon: '/icon.png',
        });
      }
      return true;
    }
    return false;
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification: sendTest,
  };
}
