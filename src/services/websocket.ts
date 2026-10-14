type WebSocketEventHandler = (event: { type: string; data: any; timestamp: string }) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketEventHandler> = new Set();
  private statusListeners: Set<(connected: boolean) => void> = new Set();
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;
  private token: string | null = null;

  public connect(token: string) {
    this.token = token;
    this.isExplicitlyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.notifyStatus(true);
        if (this.token) {
          this.sendAuth(this.token);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.listeners.forEach((handler) => handler(payload));
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        this.notifyStatus(false);
        this.ws = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      this.scheduleReconnect();
    }
  }

  public sendAuth(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'AUTH', token }));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed && this.token) {
        this.connect(this.token);
      }
    }, 3000);
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }

  public subscribe(handler: WebSocketEventHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.isConnected());
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach((fn) => fn(connected));
  }
}

export const realtime = new RealtimeClient();
