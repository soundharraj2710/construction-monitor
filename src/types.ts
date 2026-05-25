export interface ExtractedData {
  workerCount: number;
  helmetCount: number;
  vehicleCount: number;
  materials: string[];
  safetyIssues: string[];
  activitySummary: string;
}

export interface WhatsAppUpload {
  id: string;
  imageUrl: string;
  extractedData: ExtractedData;
  timestamp: string;
}

export interface CCTVLog {
  id: string;
  cameraId: "camera1" | "camera2";
  imageUrl: string;
  extractedData: ExtractedData;
  timestamp: string;
}

export interface VideoUpload {
  id: string;
  name: string;
  videoUrl: string;
  extractedData: ExtractedData;
  timestamp: string;
}

export interface ComparisonResult {
  matchPercentage: number;
  status: "Matched" | "Mismatched" | "Warning" | "Pending";
  confidenceScore: number;
  explanation: string;
  recommendation: string;
  updatedAt: string;
}

export interface ActivityFeedItem {
  id: string;
  type: "whatsapp" | "cctv" | "video" | "comparison" | "system";
  message: string;
  timestamp: string;
}

export interface OverviewTelemetry {
  totalWorkers: number;
  totalVehicles: number;
  safetyViolations: number;
  matchScore: number;
}

export interface CameraStreamState {
  isStreaming: boolean;
  lastAnalysis: ExtractedData | null;
}

export interface DashboardState {
  overview: OverviewTelemetry;
  whatsapp: WhatsAppUpload | null;
  whatsappHistory: WhatsAppUpload[];
  cctv: {
    camera1: CameraStreamState;
    camera2: CameraStreamState;
    logs: CCTVLog[];
  };
  video: VideoUpload | null;
  videoHistory: VideoUpload[];
  comparison: ComparisonResult;
  activities: ActivityFeedItem[];
}
