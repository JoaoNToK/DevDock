'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
  sendTestNotificationAction,
} from '@/app/actions/notificationActions';

export interface NotificationPreferences {
  pomodoroAlerts: boolean;
  calendarAlerts: boolean;
  plannerAlerts: boolean;
  taskAlerts: boolean;
  studyAlerts: boolean;
  projectAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pomodoroAlerts: true,
  calendarAlerts: true,
  plannerAlerts: true,
  taskAlerts: true,
  studyAlerts: true,
  projectAlerts: true,
};

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

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const loadPreferences = useCallback(() => {
    const loaded = storageAdapter.get<NotificationPreferences>(
      STORAGE_KEYS.NOTIFICATIONS,
      storageAdapter.get<NotificationPreferences>(STORAGE_KEYS.LEGACY_NOTIFICATIONS, DEFAULT_PREFERENCES)
    );
    setPreferences(loaded);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    loadPreferences();

    // Check existing push subscription
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, [loadPreferences]);

  useStorageSync([STORAGE_KEYS.NOTIFICATIONS, STORAGE_KEYS.LEGACY_NOTIFICATIONS], loadPreferences);

  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    storageAdapter.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  /**
   * Subscribe to Web Push Notifications on server
   */
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      setIsLoading(true);
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      const jsonSub = sub.toJSON();
      if (jsonSub.endpoint && jsonSub.keys?.p256dh && jsonSub.keys?.auth) {
        const res = await savePushSubscriptionAction({
          endpoint: jsonSub.endpoint,
          keys: {
            p256dh: jsonSub.keys.p256dh,
            auth: jsonSub.keys.auth,
          },
        });
        if (res.success) {
          setIsSubscribed(true);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unsubscribe from Web Push Notifications
   */
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

    try {
      setIsLoading(true);
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscriptionAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe from Web Push:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request Notification Permission from User
   */
  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        await subscribeToPush();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  };

  /**
   * Trigger a browser notification locally when appropriate
   */
  const sendNotification = (
    title: string,
    body: string,
    category: keyof NotificationPreferences = 'pomodoroAlerts',
    url: string = '/pomodoro'
  ) => {
    if (permission !== 'granted' || !preferences[category]) return;

    try {
      // If Service Worker is available and registered, use SW showNotification for native behavior
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/favicon.png',
            tag: 'devdock-timer',
            data: { url },
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/favicon.png',
        });
      }
    } catch (e) {
      console.error('Error triggering notification:', e);
    }
  };

  /**
   * Trigger a test notification via Web Push server action
   */
  const triggerTestNotification = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return { success: false, error: 'Permissão não concedida' };
    }
    return await sendTestNotificationAction();
  };

  return {
    permission,
    hasPermission: permission === 'granted',
    isSubscribed,
    isLoading,
    preferences,
    updatePreferences,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
    triggerTestNotification,
  };
}
