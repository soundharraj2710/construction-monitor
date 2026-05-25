import { Router, Request, Response } from "express";
import { store } from "../services/store";

const router = Router();

// GET /api/dashboard
router.get("/dashboard", (req: Request, res: Response) => {
  res.json(store.getDashboardState());
});

// GET /api/analysis/latest
router.get("/analysis/latest", (req: Request, res: Response) => {
  const state = store.getDashboardState();
  const candidates = [];

  if (state.whatsapp) {
    candidates.push({ source: "WhatsApp", data: state.whatsapp, stamp: state.whatsapp.timestamp });
  }
  if (state.cctv.camera1.lastAnalysis) {
    candidates.push({ source: "CCTV - Camera 1", data: state.cctv.camera1.lastAnalysis, stamp: new Date().toISOString() });
  }
  if (state.cctv.camera2.lastAnalysis) {
    candidates.push({ source: "CCTV - Camera 2", data: state.cctv.camera2.lastAnalysis, stamp: new Date().toISOString() });
  }
  if (state.video) {
    candidates.push({ source: "Video Footage", data: state.video.extractedData, stamp: state.video.timestamp });
  }

  if (candidates.length === 0) {
    return res.status(404).json({ message: "No analyzed parameters exist yet." });
  }

  // Sort candidates by newest timestamp first
  candidates.sort((a, b) => new Date(b.stamp).getTime() - new Date(a.stamp).getTime());
  res.json(candidates[0]);
});

// GET /api/match/latest
router.get("/match/latest", (req: Request, res: Response) => {
  res.json(store.getComparison());
});

export default router;
