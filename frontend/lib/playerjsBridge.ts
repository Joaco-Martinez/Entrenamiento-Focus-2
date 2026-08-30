/**
 * Bridge mínimo al protocolo "player.js" (postMessage) que usa el embed de
 * Bunny Stream (iframe.mediadelivery.net). No agregamos la librería
 * `player.js` como dependencia (está sin tipos y prácticamente sin
 * mantenimiento) porque el formato de mensajes es simple y ya lo
 * confirmamos leyendo el bridge que Bunny sirve en su propio embed
 * (pjs-implementation.js): eventos como "timeupdate", "play", "pause" y
 * "ready" salen solos del iframe, sin necesidad de suscribirse antes.
 */

type PlayerJsMessage = {
  context?: string;
  event?: string;
  method?: string;
  value?: unknown;
  listener?: string;
};

export class BunnyPlayerBridge {
  private iframe: HTMLIFrameElement;
  private eventListeners = new Map<string, (value: any) => void>();
  private pendingCallbacks = new Map<string, (value: any) => void>();
  private handleMessage: (e: MessageEvent) => void;

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;

    this.handleMessage = (e: MessageEvent) => {
      if (e.source !== this.iframe.contentWindow) return;

      let data: PlayerJsMessage | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (!data || data.context !== "player.js") return;

      if (data.event) {
        this.eventListeners.get(data.event)?.(data.value);
      }

      if (data.listener) {
        const cb = this.pendingCallbacks.get(data.listener);
        if (cb) {
          cb(data.value);
          this.pendingCallbacks.delete(data.listener);
        }
      }
    };

    window.addEventListener("message", this.handleMessage);
  }

  on(event: string, cb: (value: any) => void) {
    this.eventListeners.set(event, cb);
  }

  private post(method: string, value?: unknown, listener?: string) {
    this.iframe.contentWindow?.postMessage(
      JSON.stringify({ context: "player.js", version: "0.0.1", method, value, listener }),
      "*"
    );
  }

  call(method: string, value?: unknown) {
    this.post(method, value);
  }

  request<T = number>(method: string, timeoutMs = 1500): Promise<T | null> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).slice(2);
      const timer = setTimeout(() => {
        this.pendingCallbacks.delete(id);
        resolve(null);
      }, timeoutMs);

      this.pendingCallbacks.set(id, (value) => {
        clearTimeout(timer);
        resolve(value);
      });

      this.post(method, undefined, id);
    });
  }

  destroy() {
    window.removeEventListener("message", this.handleMessage);
    this.eventListeners.clear();
    this.pendingCallbacks.clear();
  }
}
