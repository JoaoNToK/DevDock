'use server';

import webpush from 'web-push';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@devdock.app';

  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  }
  return false;
}

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: 'Não autenticado.' };
  const userId = (session.user as { id: string }).id;

  try {
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
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
  } catch (err) {
    console.error('savePushSubscriptionAction error:', err);
    // Graceful fallback for local mode
    return { success: true, localOnly: true };
  }
}

export async function deletePushSubscriptionAction(endpoint: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: 'Não autenticado.' };
  const userId = (session.user as { id: string }).id;

  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
    return { success: true };
  } catch (err) {
    console.error('deletePushSubscriptionAction error:', err);
    return { success: true };
  }
}

export async function sendWebPushNotificationToUserAction(input: {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}) {
  const isVapidConfigured = configureVapid();
  if (!isVapidConfigured) {
    return { success: false, error: 'VAPID keys não configuradas no servidor.' };
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: input.userId },
    });

    if (subscriptions.length === 0) {
      return { success: false, error: 'Nenhum dispositivo cadastrado para este usuário.' };
    }

    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      icon: input.icon || '/icon.png',
      url: input.url || '/',
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      try {
        await webpush.sendNotification(pushSub, payload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Remove expired or invalid subscription
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    });

    await Promise.all(sendPromises);
    return { success: true, count: subscriptions.length };
  } catch (err) {
    console.error('sendWebPushNotificationToUserAction error:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function sendTestNotificationAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: 'Não autenticado.' };
  const userId = (session.user as { id: string }).id;

  return sendWebPushNotificationToUserAction({
    userId,
    title: '🔔 Teste de Notificação DevDock V2',
    body: 'As Notificações Web Push foram ativadas com sucesso no seu dispositivo!',
    icon: '/icon.png',
    url: '/configuracoes',
  });
}
