import { ExtractedData, store } from "../services/store";
import { analyzeImageWithGemini } from "../services/ai";
import { broadcastDashboardUpdate } from "../services/socket";

// State definition for the Construction Survey State Graph
export interface GraphState {
  inputType: "whatsapp" | "cctv" | "video";
  base64Data: string;
  mimeType: string;
  context: string;
  
  // Accumulated state across nodes
  analysisResult?: ExtractedData;
  comparisonReport?: {
    matchPercentage: number;
    status: "Matched" | "Mismatched" | "Warning" | "Pending";
    confidenceScore: number;
    explanation: string;
    recommendation: string;
  };
  nodeExecutionTrace: string[];
}

/**
 * Reusable nodes for the visual-analytical workflow
 */
class ConstructionSurveyGraph {
  
  // Node 1: WhatsApp Image Analyzer
  private async whatsappImageAnalyzerNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("whatsappImageAnalyzer");
    console.log("[GraphNode] Running WhatsApp Image Analyzer...");
    state.analysisResult = await analyzeImageWithGemini(
      state.base64Data,
      state.mimeType,
      "WhatsApp Image upload: " + state.context
    );
    return state;
  }

  // Node 2: CCTV Camera Analyzer
  private async cctvCameraAnalyzerNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("cctvCameraAnalyzer");
    console.log("[GraphNode] Running CCTV Camera Analyzer...");
    state.analysisResult = await analyzeImageWithGemini(
      state.base64Data,
      state.mimeType,
      "CCTV Frame capture: " + state.context
    );
    return state;
  }

  // Node 3: Video Analyzer
  private async videoAnalyzerNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("videoAnalyzer");
    console.log("[GraphNode] Running Video Analyzer...");
    state.analysisResult = await analyzeImageWithGemini(
      state.base64Data,
      state.mimeType,
      "Manual Video upload: " + state.context
    );
    return state;
  }

  // Node 4: Data Comparator (Compares raw aggregates against other available feeds)
  private async dataComparatorNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("dataComparator");
    console.log("[GraphNode] Running Data Comparator...");
    
    // Trigger memory update first so comparator can scan globally
    const result = state.analysisResult!;
    const allCCTV = store.getCCTVStatus();
    const latestWA = store.getWhatsApp()[0]?.extractedData;
    const latestVid = store.getVideoUploads()[0]?.extractedData;

    // Build values to compare
    const currentW = result.workerCount;
    const otherWValues: number[] = [];
    if (latestWA && state.inputType !== "whatsapp") otherWValues.push(latestWA.workerCount);
    if (latestVid && state.inputType !== "video") otherWValues.push(latestVid.workerCount);
    if (allCCTV.camera1.lastAnalysis && state.context !== "camera1") otherWValues.push(allCCTV.camera1.lastAnalysis.workerCount);
    if (allCCTV.camera2.lastAnalysis && state.context !== "camera2") otherWValues.push(allCCTV.camera2.lastAnalysis.workerCount);

    if (otherWValues.length === 0) {
      state.comparisonReport = {
        matchPercentage: 100,
        status: "Matched",
        confidenceScore: 0.9,
        explanation: "Primary source baseline recorded. Awaiting comparison fields from secondary sources.",
        recommendation: "Activate other cameras or receive high-resolution files to establish comparator parameters.",
      };
      return state;
    }

    // Measure variance
    const avgOtherW = otherWValues.reduce((sum, v) => sum + v, 0) / otherWValues.length;
    const difference = Math.abs(currentW - avgOtherW);

    let matchPct = 100 - Math.round((difference / Math.max(currentW, avgOtherW, 1)) * 100);
    matchPct = Math.max(35, Math.min(100, matchPct));

    let status: "Matched" | "Mismatched" | "Warning" = "Matched";
    let explanation = `The analyzed ${state.inputType} data correlates well with other active on-site checkpoints.`;
    let confidence = 0.95;

    if (difference > 4) {
      status = "Mismatched";
      explanation = `Headcount discrepancy spotted! Fresh feed detected a count of ${currentW} workers, but other monitoring channels average ${avgOtherW.toFixed(0)} workers.`;
      confidence = 0.75;
    } else if (result.safetyIssues.length > 0) {
      status = "Warning";
      explanation = `Count parameters align neatly (${matchPct}% match), but local safety violations have been flagged in this feed.`;
      confidence = 0.88;
    }

    state.comparisonReport = {
      matchPercentage: matchPct,
      status,
      confidenceScore: confidence,
      explanation,
      recommendation: status === "Mismatched" 
        ? "Perform manual verification check. Deploy supervisor to investigate layout discrepancy." 
        : "Check PPE stocks and confirm onsite signage is properly standing.",
    };

    return state;
  }

  // Node 5: Result Generator (Compiles and prepares state records)
  private async resultGeneratorNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("resultGenerator");
    console.log("[GraphNode] Running Result Generator...");
    
    // Save report parameters into store structure
    if (state.comparisonReport) {
      store.setComparison({
        matchPercentage: state.comparisonReport.matchPercentage,
        status: state.comparisonReport.status,
        confidenceScore: state.comparisonReport.confidenceScore,
        explanation: state.comparisonReport.explanation,
        recommendation: state.comparisonReport.recommendation,
        updatedAt: new Date().toISOString()
      });
    }
    return state;
  }

  // Node 6: Dashboard Updater (Pushes payload, logs trace, and broadcasts via sockets)
  private async dashboardUpdaterNode(state: GraphState): Promise<GraphState> {
    state.nodeExecutionTrace.push("dashboardUpdater");
    console.log("[GraphNode] Running Dashboard Updater...");

    const data = state.analysisResult!;
    // Create actual save records
    if (state.inputType === "whatsapp") {
      store.addWhatsApp(state.base64Data, data);
    } else if (state.inputType === "cctv") {
      const camId = state.context === "camera1" ? "camera1" : "camera2";
      store.addCCTVLog(camId, state.base64Data, data);
    } else if (state.inputType === "video") {
      store.addVideoUpload(state.context, "upload_preview", data);
    }

    // Log the complete trace in our activity log
    store.addActivity("comparison", `LangGraph run completed. Traversed nodes: [${state.nodeExecutionTrace.join(" ➔ ")}]. Match status: ${state.comparisonReport?.status}.`);

    // Broadcast the updated state instantly to any listening clients!
    broadcastDashboardUpdate();
    
    return state;
  }

  /**
   * Main runtime execution graph matching specified layout
   */
  public async execute(initialInput: {
    inputType: "whatsapp" | "cctv" | "video";
    base64Data: string;
    mimeType: string;
    context: string;
  }): Promise<GraphState> {
    let state: GraphState = {
      ...initialInput,
      nodeExecutionTrace: []
    };

    try {
      // Step 1 & 2: Routing Analyzer based on payload input
      if (state.inputType === "whatsapp") {
        state = await this.whatsappImageAnalyzerNode(state);
      } else if (state.inputType === "cctv") {
        state = await this.cctvCameraAnalyzerNode(state);
      } else if (state.inputType === "video") {
        state = await this.videoAnalyzerNode(state);
      }

      // Step 3: Data Comparator
      state = await this.dataComparatorNode(state);

      // Step 4: Result Generator
      state = await this.resultGeneratorNode(state);

      // Step 5: Dashboard Updater
      state = await this.dashboardUpdaterNode(state);

      return state;
    } catch (err) {
      console.error("State Graph Execution failed midway:", err);
      store.addActivity("system", `State Graph Run halted due to exception: ${(err as any).message}`);
      throw err;
    }
  }
}

export const graphEngine = new ConstructionSurveyGraph();
