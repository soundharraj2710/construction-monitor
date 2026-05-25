import React, { useState } from "react";
import { Camera, Play, Square, ShieldCheck, ShieldAlert, Cpu } from "lucide-react";
import { CameraStreamState, CCTVLog } from "../types";

interface Props {
  camera1: CameraStreamState;
  camera2: CameraStreamState;
  logs: CCTVLog[];
  onStart: (cameraId: "camera1" | "camera2") => void;
  onStop: (cameraId: "camera1" | "camera2") => void;
}

export default function CCTVPanel({ camera1, camera2, logs, onStart, onStop }: Props) {
  const [activeTab, setActiveTab] = useState<"feed" | "logs">("feed");

  const renderCamera = (
    camelId: "camera1" | "camera2",
    title: string,
    state: CameraStreamState,
    zoneDesc: string,
    aspectUrl: string
  ) => {
    const isStreaming = state.isStreaming;
    const report = state.lastAnalysis;

    return (
      <div id={`cctv-${camelId}`} className="glass rounded-xl p-4 transition-all duration-300 hover:border-white/20 shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/10">
        
        {/* Cam Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Camera size={16} className={isStreaming ? "text-emerald-400" : "text-gray-500"} />
            <div>
              <h3 className="text-sm font-display font-semibold text-white">{title}</h3>
              <p className="text-[10px] text-gray-400 font-mono">{zoneDesc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isStreaming ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-gray-600"></span>
            )}
            <span className={`text-[10px] font-mono uppercase tracking-wide ${isStreaming ? "text-rose-400 font-semibold" : "text-gray-400"}`}>
              {isStreaming ? "Live Feed" : "Offline"}
            </span>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-gray-950 shadow-inner group">
          {isStreaming ? (
            <>
              {/* Actual Image Source Overlay */}
              <img
                src={aspectUrl}
                alt={`${title} Live Stream`}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              
              {/* Dynamic Scanline & CRT Effect Grid overlay */}
              <div className="absolute inset-0 cctv-scanline pointer-events-none"></div>

              {/* Laser Scan line moving up and down */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500/60 shadow-[0_0_10px_#10b981] scanning-bar pointer-events-none"></div>

              {/* HUD interface indices */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 border border-gray-800 text-[9px] text-emerald-400 font-mono tracking-widest uppercase">
                ISO 800 - 24FPS
              </div>
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 border border-gray-800 text-[9px] text-gray-400 font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gray-950/80">
              <Camera size={32} className="text-gray-700 mb-2 animate-pulse" />
              <p className="text-xs text-gray-400 font-display font-medium">Camera Feed Standing By</p>
              <p className="text-[10px] text-gray-500 max-w-xs mt-1">
                Toggle the Start Button below to mount the active video frame sequences and trigger AI counts.
              </p>
            </div>
          )}
        </div>

        {/* Start / Stop Stream Actions */}
        <div className="flex items-center space-x-2 my-3 font-mono">
          <button
            onClick={() => onStart(camelId)}
            disabled={isStreaming}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-all outline-none ${
              isStreaming
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/30"
                : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30"
            }`}
          >
            <Play size={12} fill="currentColor" />
            <span>Start</span>
          </button>
          
          <button
            onClick={() => onStop(camelId)}
            disabled={!isStreaming}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-all outline-none ${
              !isStreaming
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/30"
                : "bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50"
            }`}
          >
            <Square size={12} fill="currentColor" />
            <span>Stop</span>
          </button>
        </div>

        {/* Real-Time Parameter Analysis Table */}
        <div className="bg-slate-900/55 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-2">
            <Cpu size={12} className="text-blue-400" />
            <span>Edge AI Analysis</span>
          </div>

          {report ? (
            <div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pb-2">
                <div className="bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] text-slate-400 uppercase">Workers</span>
                  <span className="text-sm font-bold text-white">{report.workerCount}</span>
                </div>
                <div className="bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] text-slate-400 uppercase">Helmets</span>
                  <span className={`text-sm font-bold ${report.helmetCount < report.workerCount ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                    {report.helmetCount}
                  </span>
                </div>
                <div className="bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] text-slate-400 uppercase">Vehicles</span>
                  <span className="text-sm font-bold text-white">{report.vehicleCount}</span>
                </div>
              </div>

              {/* Alert / Compliance Badge */}
              <div className="mt-1">
                {report.safetyIssues.length > 0 ? (
                  <div className="flex items-start space-x-1 text-[10px] text-red-300 bg-red-500/10 rounded-md border border-red-500/20 px-2 py-1.5">
                    <ShieldAlert size={12} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="line-clamp-2">{report.safetyIssues[0]}</p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-300 bg-emerald-500/10 rounded-md border border-emerald-500/20 px-2 py-1">
                    <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                    <span>All workers complying with safety protocols.</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-2 italic leading-relaxed border-t border-slate-800/60 pt-2 line-clamp-2">
                "{report.activitySummary}"
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 text-center italic py-4">
              Pending channel telemetry. Engage stream interval loops to compile parameters.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-6 shadow-xl mb-6 flex flex-col justify-between border border-white/10">
      
      {/* CCTV Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
        <div>
          <h2 className="text-md font-semibold text-white">Live Surveillance Feeds</h2>
          <p className="text-xs text-slate-400 mt-0.5">Continuous interval analysis of site feeds using Gemini Multi-Modal</p>
        </div>
        
        {/* Mini Tab switcher */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "feed" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Camera Feeds
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "logs" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Analysis Logs
          </button>
        </div>
      </div>

      {activeTab === "feed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCamera(
            "camera1",
            "CCTV Camera 01 — Zone A Entry",
            camera1,
            "Perimeter scaffolding, assembly, crane deployment area",
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop"
          )}
          {renderCamera(
            "camera2",
            "CCTV Camera 02 — Zone B Excavation",
            camera2,
            "Support excavation pits, helper warehouses, unloading bay",
            "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop"
          )}
        </div>
      ) : (
        <div className="max-h-[385px] overflow-y-auto pr-1 divide-y divide-slate-800/50">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center italic py-12">No evaluation history compiled yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between space-x-3 hover:bg-slate-900/30 px-2 rounded-lg transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-10 rounded overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                    <img src={log.imageUrl} alt="Logged Frame" className="w-full h-full object-cover animate-fade-in" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        {log.cameraId === "camera1" ? "Camera 1" : "Camera 2"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                      "{log.extractedData.activitySummary}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <div>Workers: {log.extractedData.workerCount}</div>
                    <div>Helmets: {log.extractedData.helmetCount}</div>
                  </div>
                  <div>
                    {log.extractedData.safetyIssues.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-mono border border-red-500/20">
                        Warning
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
                        Secure
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
