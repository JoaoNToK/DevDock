'use client';

import { useState, useEffect } from 'react';

export interface NotificationPreferences {
  pomodoroAlerts: boolean;
  plannerAlerts: boolean;
  reminderAlerts: boolean;
}

const PREF_KEY = 'devdock_notification_preferences_v1';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pomodoroAlerts: true,
    plannerAlerts: true,
    reminderAlerts: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        setPreferences(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    }
  }, []);

  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem(PREF_KEY, JSON.stringify(updated));
  };

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    const res = await Notification.requestPermission();
    setPermission(res);
    return res === 'granted';
  };

  const sendNotification = (title: string, body: string, category: keyof NotificationPreferences = 'pomodoroAlerts') => {
    if (permission !== 'granted' || !preferences[category]) return;

    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.error('Error sending notification:', e);
    }
  };

  return {
    permission,
    hasPermission: permission === 'granted',
    preferences,
    updatePreferences,
    requestPermission,
    sendNotification,
  };
}
