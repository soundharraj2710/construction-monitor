import { DashboardState } from "../types";

const BASE_URL = ""; // Relative paths since express proxy serves both at same port

export async function fetchDashboardState(): Promise<DashboardState> {
  const res = await fetch(`${BASE_URL}/api/dashboard`);
  if (!res.ok) throw new Error("Failed to load dashboard statistics.");
  return res.json();
}

export async function startCameraFeed(cameraId: "camera1" | "camera2"): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/cctv/${cameraId}/start`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to activate ${cameraId}`);
  return res.json();
}

export async function stopCameraFeed(cameraId: "camera1" | "camera2"): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/cctv/${cameraId}/stop`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to deactivate ${cameraId}`);
  return res.json();
}

export async function uploadVideoFile(
  file: File,
  onProgress: (pct: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("video", file);

    xhr.open("POST", `${BASE_URL}/api/video/upload`, true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve({ success: true, message: "Parsed response" });
        }
      } else {
        reject(new Error(`Video upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error during file upload."));
    };

    xhr.send(formData);
  });
}

/**
 * Triggers a simulated WhatsApp webhook call directly into our backend.
 * Helpful for users without active Twilio sandbox numbers, implementing the sandbox workflow cleanly!
 */
export async function triggerWhatsAppSimulation(payload: {
  imageUrl?: string;
  base64Data?: string;
  mimeType?: string;
  from?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/webhook/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("WhatsApp simulated submission failed.");
  return res.json();
}
