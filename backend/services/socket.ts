import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { store } from "./store";

let ioInstance: SocketServer | null = null;

export function initSocketIO(server: HttpServer) {
  ioInstance = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    
    // Push the newest dashboard telemetry instantly upon connections
    socket.emit("dashboard_state", store.getDashboardState());

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Automatically bind store updates to socket broadcasts
  store.on("update", () => {
    broadcastDashboardUpdate();
  });

  return ioInstance;
}

export function broadcastDashboardUpdate() {
  if (ioInstance) {
    console.log("[Socket.IO] Broadcasting refreshed dashboard state to all active client listeners...");
    ioInstance.emit("dashboard_state", store.getDashboardState());
  }
}
