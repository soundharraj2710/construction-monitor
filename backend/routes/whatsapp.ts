import { Router, Request, Response } from "express";
import { store } from "../services/store";
import { graphEngine } from "../langgraph/graph";
import { downloadImageAsBase64 } from "../utils/helper";

const router = Router();

// GET /api/whatsapp/latest
router.get("/whatsapp/latest", (req: Request, res: Response) => {
  const uploads = store.getWhatsApp();
  if (uploads.length === 0) {
    return res.status(404).json({ message: "No WhatsApp analysis logs available." });
  }
  res.json(uploads[0]);
});

// POST /webhook/whatsapp
router.post("/webhook/whatsapp", async (req: Request, res: Response) => {
  try {
    console.log("[WhatsAppWebhook] Payload received:", req.body);

    let imageUrl = "";
    let base64Data = "";
    let mimeType = "image/jpeg";
    let isTwilio = false;
    let fromNumber = "Sandbox User";

    // 1. Handle Twilio URL-encoded format
    if (req.body.MediaUrl0) {
      isTwilio = true;
      imageUrl = req.body.MediaUrl0;
      fromNumber = req.body.From || "WhatsApp Contact";
      
      console.log(`[WhatsAppWebhook] Downloading Twilio image: ${imageUrl}`);
      const download = await downloadImageAsBase64(imageUrl);
      base64Data = download.data;
      mimeType = download.mimeType;
    } 
    // 2. Handle JSON format (useful for custom manual triggers on the client dashboard)
    else if (req.body.imageUrl || req.body.base64Data) {
      imageUrl = req.body.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5";
      base64Data = req.body.base64Data || "";
      mimeType = req.body.mimeType || "image/jpeg";

      if (!base64Data && imageUrl) {
        console.log(`[WhatsAppWebhook] Downloading JSON-provided image: ${imageUrl}`);
        const download = await downloadImageAsBase64(imageUrl);
        base64Data = download.data;
        mimeType = download.mimeType;
      }
    } 
    // 3. User sent a pure text message to Twilio without an image
    else if (req.body.Body && !req.body.MediaUrl0) {
      const responseMessage = 
        `Welcome to the Construction Site Safety Auditing Bot! 🚧\n\n` +
        `Send any picture of your construction zone (scaffolding, crew, materials) and we'll instantly check headcount alignment, helmet safety PPE issues, and list building resources.`;
      
      res.set("Content-Type", "text/xml");
      return res.send(`
        <Response>
          <Message>${responseMessage}</Message>
        </Response>
      `);
    } else {
      return res.status(400).json({ error: "No image attachment or valid payload received." });
    }

    // Prepare context for the state graph run
    const context = `WhatsApp file sent by ${fromNumber}`;
    
    store.addActivity("whatsapp", `Received new WhatsApp image from ${fromNumber}. Triggering LangGraph AI scan...`);

    // Run the LangGraph AI flow
    const resultingState = await graphEngine.execute({
      inputType: "whatsapp",
      base64Data,
      mimeType,
      context,
    });

    const report = resultingState.analysisResult!;

    // Compile safety issues string for text messages
    const safetyStr = report.safetyIssues.length > 0 
      ? report.safetyIssues.join(", ") 
      : "All clear. Under PPE compliance.";

    const messageResponse = 
      `👷 *Construction Site Analysis complete!*\n\n` +
      `🛠️ *Worker Count:* ${report.workerCount}\n` +
      `🪖 *Helmet Count:* ${report.helmetCount}\n` +
      `🚚 *Vehicle Count:* ${report.vehicleCount}\n` +
      `🧱 *Materials:* ${report.materials.join(", ")}\n` +
      `⚠️ *Safety Issue:* ${safetyStr}\n\n` +
      `📝 *Summary:* ${report.activitySummary}`;

    if (isTwilio) {
      // Respond in Twilio TwiML Format
      res.set("Content-Type", "text/xml");
      return res.send(`
        <Response>
          <Message>${messageResponse}</Message>
        </Response>
      `);
    } else {
      // Respond in client-side JSON format
      return res.json({
        success: true,
        message: "WhatsApp analysis complete",
        data: resultingState.analysisResult,
        comparison: resultingState.comparisonReport,
      });
    }

  } catch (err) {
    console.error("[WhatsAppWebhook] Error routing webhook:", err);
    
    if (req.body.MediaUrl0) {
      res.set("Content-Type", "text/xml");
      return res.send(`
        <Response>
          <Message>⚠️ Real-time inspection pipeline suffered an error. Please resubmit your image.</Message>
        </Response>
      `);
    }
    return res.status(500).json({ error: (err as any).message });
  }
});

export default router;
