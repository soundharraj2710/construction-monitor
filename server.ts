import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import { initSocketIO } from "./backend/services/socket";
import whatsappRouter from "./backend/routes/whatsapp";
import cctvRouter from "./backend/routes/cctv";
import videoRouter from "./backend/routes/video";
import dashboardRouter from "./backend/routes/dashboard";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure high size limits to allow base64 screenshot telemetry uploads safely
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Register API routers - supporting specified endpoint structures perfectly
  app.use("/", whatsappRouter); // For POST /webhook/whatsapp
  app.use("/api", whatsappRouter); // For GET /api/whatsapp/latest
  app.use("/api", cctvRouter); // For POST /api/cctv/camera1/start etc.
  app.use("/api", videoRouter); // For POST /api/video/upload
  app.use("/api", dashboardRouter); // For GET /api/dashboard, /api/analysis/latest, /api/match/latest

  const server = http.createServer(app);
  
  // Attach Socket.IO to server instance
  initSocketIO(server);

  // Integrate Vite dev middleware or standard static routing
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] running in development mode. Mounting Vite assets middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] running in production mode. Routing compiled index.html...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[FullStackServer] Construction Monitoring Server listening on port ${PORT}`);
  });
}

startServer();
export {};
