// /app/lib/websocket-server.ts
import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

interface WebSocketConnection {
  userId: number;
  socket: WebSocket;
}

class NotificationWebSocketServer {
  private wss: WebSocketServer;
  private connections: Map<number, WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.connections = new Map();

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'authenticate' && data.userId) {
            this.connections.set(data.userId, ws);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        // Remove connection when closed
        const entries = Array.from(this.connections.entries());
        for (const [userId, socket] of entries) {
          if (socket === ws) {
            this.connections.delete(userId);
            break;
          }
        }
      });
    });
  }

  sendNotification(userId: number, notification: {
    id: number;
    type: string;
    content: string;
    created_at: Date;
  }) {
    const userSocket = this.connections.get(userId);
    if (userSocket && userSocket.readyState === WebSocket.OPEN) {
      userSocket.send(JSON.stringify(notification));
    }
  }

  broadcastNotification(notification: {
    id: number;
    type: string;
    content: string;
    created_at: Date;
  }) {
    const entries = Array.from(this.connections.entries());
    entries.forEach(([_, socket]) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(notification));
      }
    });
  }
}

export default NotificationWebSocketServer;