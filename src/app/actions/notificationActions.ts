'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import webpush from 'web-push';

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: 'pomodoro_complete' | 'break_complete' | 'task_reminder' | 'test_notification' | 'general';
}

// Configure VAPID keys if present in environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@devdock.app';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * Save or update a PushSubscription for the logged-in user in PostgreSQL
 */
export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const userId = (session.user as { id: string }).id;

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return { success: false, error: 'Dados de inscrição inválidos' };
    }

    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar inscrição de notificação';
    console.error('Failed to save push subscription:', error);
    return { success: false, error: message };
  }
}

/**
 * Remove a PushSubscription for the logged-in user
 */
export async function removePushSubscriptionAction(endpoint: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const userId = (session.user as { id: string }).id;

    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao remover inscrição de notificação';
    console.error('Failed to remove push subscription:', error);
    return { success: false, error: message };
  }
}

/**
 * Send a Web Push notification to all subscriptions of a specific user
 */
export async function sendPushToUserAction(userId: string, payload: NotificationPayload) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { success: true, count: 0 };
    }

    const payloadString = JSON.stringify({
      type: payload.type || 'general',
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      tag: payload.tag || 'devdock-notification',
      icon: '/icons/icon-192.png',
      badge: '/favicon.png',
    });

    let sentCount = 0;
    const expiredEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payloadString);
          sentCount++;
        } catch (err: unknown) {
          const pushErr = err as { statusCode?: number };
          // If subscription has expired or is invalid (404/410), mark for deletion
          if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint);
          } else {
            console.error(`Error sending web push to endpoint ${sub.endpoint}:`, err);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: expiredEndpoints },
        },
      });
    }

    return { success: true, count: sentCount };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao enviar notificação por push';
    console.error('Failed to send push to user:', error);
    return { success: false, error: message };
  }
}

/**
 * Trigger a test notification for the currently logged-in user
 */
export async function sendTestNotificationAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const userId = (session.user as { id: string }).id;

    return await sendPushToUserAction(userId, {
      type: 'test_notification',
      title: '🔔 Teste de Notificação DevDock',
      body: 'O sistema de Web Push do DevDock está funcionando perfeitamente!',
      url: '/configuracoes',
      tag: 'test-push',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao testar notificação';
    console.error('Failed to trigger test notification:', error);
    return { success: false, error: message };
  }
}
