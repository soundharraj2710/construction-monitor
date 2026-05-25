import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { fetchDashboardState, startCameraFeed, stopCameraFeed } from "./services/api";
import { DashboardState } from "./types";

import OverviewCards from "./components/OverviewCards";
import CCTVPanel from "./components/CCTVPanel";
import WhatsAppPanel from "./components/WhatsAppPanel";
import VideoPanel from "./components/VideoPanel";
import MatchResultsPanel from "./components/MatchResultsPanel";
import ActivityFeed from "./components/ActivityFeed";

import { HardHat, Activity, RefreshCw, Layers } from "lucide-react";

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  // Fetch the overall state initially
  const loadInitialData = async () => {
    try {
      const state = await fetchDashboardState();
      setDashboard(state);
      setErrorStatus(null);
    } catch (err) {
      console.error(err);
      setErrorStatus("Failed to reconcile initial dashboard telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Initialize full-duplex socket channel
    console.log("[SocketClient] Opening live dashboard tunnel...");
    const socket = io();

    socket.on("connect", () => {
      console.log(`[SocketClient] Connected as client: ${socket.id}`);
      setSocketStatus("connected");
    });

    socket.on("dashboard_state", (state: DashboardState) => {
      console.log("[SocketClient] Received real-time state refresh.");
      setDashboard(state);
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("[SocketClient] Connection lost.");
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.warn("[SocketClient] Connection temporary warning:", err);
      setSocketStatus("disconnected");
    });

    // Cleanup socket connection on unmount
    return () => {
      socket.close();
    };
  }, []);

  const handleStartCCTV = async (cameraId: "camera1" | "camera2") => {
    try {
      await startCameraFeed(cameraId);
      // Wait for socket update, or trigger manual refresh
      loadInitialData();
    } catch (err) {
      alert((err as any).message);
    }
  };

  const handleStopCCTV = async (cameraId: "camera1" | "camera2") => {
    try {
      await stopCameraFeed(cameraId);
      loadInitialData();
    } catch (err) {
      alert((err as any).message);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-center p-4">
        <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700/60 mb-6 glass">
          <HardHat size={36} className="text-emerald-400 animate-bounce" />
        </div>
        <h1 className="text-lg font-display font-semibold text-white tracking-wide">
          Construction Monitoring System Loading...
        </h1>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          Assembling in-memory databases, hooking live feed intervals, and initializing LangGraph AI agents.
        </p>
        <div className="mt-4 flex items-center space-x-1.5 justify-center">
          <RefreshCw size={12} className="animate-spin text-emerald-400" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Compiling parameters</span>
        </div>
      </div>
    );
  }

  const state = dashboard!;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Rail */}
      <div className="px-4 md:px-8 pt-4 shrink-0 max-w-7xl w-full mx-auto">
        <header className="glass rounded-xl h-20 px-6 flex items-center justify-between shadow-xl border border-white/10">
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/20">
              <HardHat size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-semibold leading-none text-white tracking-tight flex items-center">
                Construction Monitor
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
                Project: North Tower Expansion | Site Alpha
              </p>
            </div>
          </div>

          {/* Controls & Connection badges */}
          <div className="flex items-center space-x-6 text-xs font-mono">
            {/* Status light */}
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Status</p>
              <div className="flex items-center text-emerald-400 text-xs mt-0.5 font-medium">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${socketStatus === "connected" ? "bg-emerald-500 status-pulse" : "bg-rose-500"}`}></span>
                {socketStatus === "connected" ? "Active / Live Sync" : "Reconnecting"}
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-700/60 hidden sm:block"></div>

            {/* Server status indicator */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">LangGraph AI</p>
              <p className="text-xs text-blue-400 font-medium italic mt-0.5">
                Processing Frames...
              </p>
            </div>
          </div>

        </header>
      </div>

      {/* Main Core Content Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {errorStatus && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between">
            <p>{errorStatus}</p>
            <button onClick={loadInitialData} className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 font-semibold">Retry Sync</button>
          </div>
        )}

        {/* 1. Overview aggregates */}
        <OverviewCards overview={state.overview} />

        {/* Base Bento Grid Panels layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Surveillance feed and comparative report analysis */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* CCTV Stream Handling Section */}
            <CCTVPanel
              camera1={state.cctv.camera1}
              camera2={state.cctv.camera2}
              logs={state.cctv.logs}
              onStart={handleStartCCTV}
              onStop={handleStopCCTV}
            />

            {/* Comparison alignment audit node */}
            <MatchResultsPanel comparison={state.comparison} />
          </div>

          {/* Right Column (4 cols): WhatsApp reporting, Webhook testing, and event tracer logs */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* WhatsApp monitoring logs */}
            <WhatsAppPanel
              latestUpload={state.whatsapp}
              history={state.whatsappHistory}
              onTriggerSim={loadInitialData}
            />

            {/* Live event Activity logs */}
            <ActivityFeed activities={state.activities} />
          </div>

        </div>

        {/* Lower container: Manual Drone video file extraction portal */}
        <div className="mt-6">
          <VideoPanel
            latestVideo={state.video}
            history={state.videoHistory}
            onUploadSuccess={loadInitialData}
          />
        </div>

      </main>

      {/* Universal Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/40 py-6 text-center text-xs text-gray-500">
        <p className="font-mono">
          © {new Date().getFullYear()} Construction Safety Telemetry Network. All credentials and operations managed server-side securely.
        </p>
      </footer>

    </div>
  );
}
