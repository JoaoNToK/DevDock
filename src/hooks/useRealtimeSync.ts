'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { triggerSync } from '@/lib/storage/sync';

export type RealtimeStatus = 'connected' | 'connecting' | 'offline';

export function useRealtimeSync() {
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Broadcast local changes to other tabs on the same device
  const broadcastChange = useCallback((module: string = 'general') => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'local_data_changed', module, timestamp: Date.now() });
      } catch (err) {
        console.warn('[Realtime] Broadcast postMessage error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Setup BroadcastChannel for Instant Cross-Tab Sync
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('devdock-realtime-channel');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === 'local_data_changed') {
          triggerSync();
        }
      };
    } catch (err) {
      console.warn('[Realtime] BroadcastChannel unsupported:', err);
    }

    // 2. Setup Server-Sent Events (SSE) for Multi-Device Sync
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onopen = () => {
          setStatus('connected');
          setIsRealtimeActive(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'data_changed') {
              triggerSync();
            }
          } catch (err) {
            console.error('[Realtime] Parse message error:', err);
          }
        };

        eventSource.onerror = () => {
          setStatus('connecting');
          setIsRealtimeActive(false);
          if (eventSource?.readyState === EventSource.CLOSED) {
            setTimeout(connectSSE, 5000);
          }
        };
      } catch (err) {
        console.error('[Realtime] SSE Connection error:', err);
        setStatus('offline');
        setIsRealtimeActive(false);
      }
    };

    connectSSE();

    return () => {
      if (channel) {
        channel.close();
        broadcastChannelRef.current = null;
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    status,
    isRealtimeActive,
    broadcastChange,
  };
}
