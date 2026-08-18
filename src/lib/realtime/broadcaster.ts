type RealtimeListener = (data: { type: string; module: string; timestamp: number }) => void;

class RealtimeBroadcaster {
  private listeners: Map<string, Set<RealtimeListener>> = new Map();

  subscribe(userId: string, listener: RealtimeListener): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    const userSet = this.listeners.get(userId)!;
    userSet.add(listener);

    return () => {
      userSet.delete(listener);
      if (userSet.size === 0) {
        this.listeners.delete(userId);
      }
    };
  }

  notifyUserDataChanged(userId: string, module: string = 'general') {
    const userSet = this.listeners.get(userId);
    if (!userSet || userSet.size === 0) return;

    const payload = {
      type: 'data_changed',
      module,
      timestamp: Date.now(),
    };

    userSet.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[Broadcaster] Listener dispatch error:', err);
      }
    });
  }
}

export const realtimeBroadcaster = new RealtimeBroadcaster();
