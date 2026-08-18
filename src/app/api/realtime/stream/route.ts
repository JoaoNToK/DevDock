import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { realtimeBroadcaster } from '@/lib/realtime/broadcaster';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? ((session.user as { id?: string }).id || session.user.email || 'guest') : 'guest';

  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial connected payload
      sendEvent('connected', { status: 'ok', userId, timestamp: Date.now() });

      // Subscribe to broadcaster for this user
      const unsubscribe = realtimeBroadcaster.subscribe(userId, (eventData) => {
        sendEvent('message', eventData);
      });

      // Heartbeat ping every 15s to keep SSE connection alive
      const intervalId = setInterval(() => {
        try {
          sendEvent('ping', { timestamp: Date.now() });
        } catch {
          clearInterval(intervalId);
          unsubscribe();
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
