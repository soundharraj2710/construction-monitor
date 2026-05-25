import { Router, Request, Response } from "express";
import { store } from "../services/store";
import { graphEngine } from "../langgraph/graph";
import { downloadImageAsBase64 } from "../utils/helper";

const router = Router();

// Store active setInterval objects in memory
const activeIntervals: { [key: string]: NodeJS.Timeout } = {};

const CAM_IMAGES = {
  camera1: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop"
  ],
  camera2: [
    "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop"
  ]
};

// Helper function to trigger a frame analysis
async function runCameraScan(cameraId: "camera1" | "camera2") {
  try {
    const images = CAM_IMAGES[cameraId];
    const itemIndex = Math.floor(Math.random() * images.length);
    const frameUrl = images[itemIndex];

    console.log(`[CCTVStream] Scheduled Scan: Analyzing Frame for ${cameraId} using ${frameUrl}`);
    
    // Convert current frame into Base64
    const download = await downloadImageAsBase64(frameUrl);
    
    // Feed into the AI / LangGraph workflow
    await graphEngine.execute({
      inputType: "cctv",
      base64Data: download.data,
      mimeType: download.mimeType,
      context: cameraId,
    });

    console.log(`[CCTVStream] Successfully analyzed Frame for ${cameraId}`);
  } catch (error) {
    console.error(`[CCTVStream] Scheduled Scan Error on ${cameraId}:`, error);
  }
}

// Handler for Kamerastream Start
const startCamera = async (cameraId: "camera1" | "camera2", res: Response) => {
  const currentStatus = store.getCCTVStatus();
  
  if (currentStatus[cameraId].isStreaming) {
    return res.json({ success: true, message: `${cameraId} is already active.` });
  }

  // Update State 
  store.setCCTVStreaming(cameraId, true);

  // Trigger first scan immediately in the background
  runCameraScan(cameraId);

  // Setup loop every 12 seconds for stream frame scanning
  activeIntervals[cameraId] = setInterval(() => {
    runCameraScan(cameraId);
  }, 12000);

  return res.json({ success: true, message: `Live Feed Started for ${cameraId}.` });
};

// Handler for Kamerastream Stop
const stopCamera = (cameraId: "camera1" | "camera2", res: Response) => {
  const currentStatus = store.getCCTVStatus();

  if (!currentStatus[cameraId].isStreaming) {
    return res.json({ success: true, message: `${cameraId} is already resting.` });
  }

  // Update State
  store.setCCTVStreaming(cameraId, false);

  if (activeIntervals[cameraId]) {
    clearInterval(activeIntervals[cameraId]);
    delete activeIntervals[cameraId];
  }

  return res.json({ success: true, message: `Live Feed Stopped for ${cameraId}.` });
};

// Endpoints mapping
router.post("/cctv/camera1/start", (req, res) => startCamera("camera1", res));
router.post("/cctv/camera1/stop", (req, res) => stopCamera("camera1", res));
router.post("/cctv/camera2/start", (req, res) => startCamera("camera2", res));
router.post("/cctv/camera2/stop", (req, res) => stopCamera("camera2", res));

export default router;
export { activeIntervals }; // For cleanup if needed
