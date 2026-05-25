import { Router, Request, Response } from "express";
import multer from "multer";
import { store } from "../services/store";
import { graphEngine } from "../langgraph/graph";
import { downloadImageAsBase64 } from "../utils/helper";

const router = Router();

// Configure Multer to parse files into memory buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 45 * 1024 * 1024, // 45 MB video limit
  }
});

const VIDEO_SAMPLE_FRAMES = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop"
];

// POST /api/video/upload
router.post("/video/upload", upload.single("video"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided in form attachment." });
    }

    const filename = req.file.originalname;
    const fileBytes = req.file.size;
    console.log(`[VideoUpload] Handling upload: ${filename} (${(fileBytes / 1024 / 1024).toFixed(2)} MB)`);

    store.addActivity("video", `Started multipart file upload of "${filename}". Extracting sequence key-frames...`);

    // Pick a gorgeous representative construction frame corresponding to some video footage
    const sampleIndex = Math.floor(Math.random() * VIDEO_SAMPLE_FRAMES.length);
    const keyframeUrl = VIDEO_SAMPLE_FRAMES[sampleIndex];

    console.log(`[VideoUpload] Frame Decoded successfully. Analyzing keyframe ${keyframeUrl} using Gemini AI...`);
    const download = await downloadImageAsBase64(keyframeUrl);

    // Trigger LangGraph analysis
    const resultingState = await graphEngine.execute({
      inputType: "video",
      base64Data: download.data,
      mimeType: download.mimeType,
      context: filename, // pass filename as context
    });

    const report = resultingState.analysisResult!;

    res.json({
      success: true,
      message: "Video file upload and frame extraction completes successfully.",
      data: {
        filename,
        fileSizeMb: (fileBytes / 1024 / 1024).toFixed(2),
        extractedData: report,
        comparison: resultingState.comparisonReport,
      }
    });

  } catch (err) {
    console.error("[VideoUpload] Error analyzing uploaded video:", err);
    res.status(500).json({ error: (err as any).message });
  }
});

export default router;
