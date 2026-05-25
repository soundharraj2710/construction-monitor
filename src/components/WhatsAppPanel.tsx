import React, { useState } from "react";
import { MessageSquare, Calendar, ShieldCheck, ShieldAlert, Radio, Send, PlayCircle, Layers } from "lucide-react";
import { WhatsAppUpload } from "../types";
import { triggerWhatsAppSimulation } from "../services/api";

interface Props {
  latestUpload: WhatsAppUpload | null;
  history: WhatsAppUpload[];
  onTriggerSim: () => void; // Reload stats on completion
}

const PRESET_TELEMETRY = [
  {
    name: "Steel erection team",
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Excavation and trench safety check",
    url: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Zone C heavy aggregate scaffolding",
    url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
  }
];

export default function WhatsAppPanel({ latestUpload, history, onTriggerSim }: Props) {
  const [activeTab, setActiveTab] = useState<"viewer" | "sandbox" | "history">("viewer");
  
  // Sandbox State variables
  const [customUrl, setCustomUrl] = useState(PRESET_TELEMETRY[0].url);
  const [senderNum, setSenderNum] = useState("whatsapp:+14155238886");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSandboxSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setIsLoading(true);
    setStatusMsg("Webhook packet fired. Downloading ground snapshot...");

    try {
      const response = await triggerWhatsAppSimulation({
        imageUrl: customUrl,
        from: senderNum
      });

      if (response.success) {
        setStatusMsg("Success! LangGraph traversed: " + (response.data?.activitySummary || "Extracted."));
        onTriggerSim(); // Re-trigger parent dashboard reload
        setTimeout(() => {
          setActiveTab("viewer");
          setStatusMsg("");
        }, 1500);
      } else {
        setStatusMsg("Dispatched, but server warning flagged.");
      }
    } catch (error) {
      console.error(error);
      setStatusMsg(`Webhook Error: ${(error as any).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-xl mb-6 border border-white/10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare size={20} className="text-blue-400" />
          <div>
            <h2 className="text-md font-semibold text-white">WhatsApp Ground Auditing</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sandbox reports submitted by off-site crew members</p>
          </div>
        </div>

        {/* Action Toggle Tab Switching */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] mt-3 sm:mt-0 font-mono">
          <button
            onClick={() => setActiveTab("viewer")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "viewer" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Latest Report
          </button>
          
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
              activeTab === "sandbox" ? "bg-blue-600 text-white" : "text-blue-400 hover:text-blue-300"
            }`}
          >
            <Radio size={10} className="animate-pulse" />
            <span>Sandbox Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "history" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {activeTab === "viewer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestUpload ? (
            <>
              {/* Image View */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                <img
                  src={latestUpload.imageUrl}
                  alt="WhatsApp Ground Audit Update"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono">
                  <Calendar size={12} className="text-blue-400" />
                  <span>{new Date(latestUpload.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Data Extraction Analysis Card */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="px-2 py-1 text-[10px] font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest font-bold">
                    Active Ground Telemetry
                  </span>

                  <h3 className="text-md font-semibold text-white mt-3 font-display">AI Image Parameters</h3>

                  <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-center">
                    <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 font-mono">
                      <span className="block text-[9px] text-slate-400">WORKERS</span>
                      <span className="text-md font-bold text-white font-mono">{latestUpload.extractedData.workerCount}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 font-mono">
                      <span className="block text-[9px] text-slate-400">HELMETS</span>
                      <span className={`text-md font-bold font-mono ${latestUpload.extractedData.helmetCount < latestUpload.extractedData.workerCount ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                        {latestUpload.extractedData.helmetCount}
                      </span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 font-mono">
                      <span className="block text-[9px] text-slate-400">VEHICLES</span>
                      <span className="text-md font-bold text-white font-mono">{latestUpload.extractedData.vehicleCount}</span>
                    </div>
                  </div>

                  {/* Materials list */}
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                      Materials Detected
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {latestUpload.extractedData.materials.map((m, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-white/10">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Safety compliance checks */}
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">
                      Incidents Auditing
                    </span>
                    {latestUpload.extractedData.safetyIssues.length > 0 ? (
                      <div className="flex items-start space-x-1.5 p-2 rounded bg-red-500/10 border border-red-500/25 text-xs text-red-300 font-mono">
                        <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <ul className="list-disc pl-3">
                          {latestUpload.extractedData.safetyIssues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 p-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
                        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                        <span>All crew elements verified compliant with safety helmet protocols.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summarized comments */}
                <div className="border-t border-slate-800 pt-3 mt-4">
                  <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                    "{latestUpload.extractedData.activitySummary}"
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 text-center py-12 text-slate-500 italic font-mono text-xs">
              No WhatsApp data uploads processed yet. Fire up the Sandbox Webhook tab to feed a ground visual.
            </div>
          )}
        </div>
      )}

      {activeTab === "sandbox" && (
        <form onSubmit={handleSandboxSimulate} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 tracking-wider mb-4 border-b border-slate-800 pb-2">
            <Radio size={14} className="animate-pulse" />
            <span>TWILIO WHATSAPP SANDBOX INTERFACE SIMULATOR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left side settings */}
            <div className="space-y-4 font-mono">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  WhatsApp Crew Contact Number
                </label>
                <input
                  type="text"
                  value={senderNum}
                  onChange={(e) => setSenderNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="whatsapp:+14155238886"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Preset Telemetry Options
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_TELEMETRY.map((p, ix) => (
                    <button
                      key={ix}
                      type="button"
                      onClick={() => setCustomUrl(p.url)}
                      className={`px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between text-xs font-medium border ${
                        customUrl === p.url
                          ? "bg-blue-600/20 text-white border-blue-500/50"
                          : "bg-slate-950 text-slate-400 hover:text-white border-slate-800/80"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <PlayCircle size={14} className={customUrl === p.url ? "text-blue-400 shrink-0 ml-1" : "text-slate-600 shrink-0 ml-1"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Custom image Webhook Url
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>

            {/* Right side - visually showing the selected test layout */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 font-mono">Selected Image Frame Preview</label>
                <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                  {customUrl ? (
                    <img src={customUrl} alt="Preset visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600 font-mono">No Image Selected</div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-4 font-mono">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-1.5 outline-none shadow-lg shadow-blue-500/20"
                >
                  <Send size={14} fill="currentColor" />
                  <span>{isLoading ? "Extracting Parameters..." : "Fire Webhook Packet"}</span>
                </button>
              </div>
            </div>
          </div>

          {statusMsg && (
            <div className="mt-4 p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
              <p>{statusMsg}</p>
            </div>
          )}
        </form>
      )}

      {activeTab === "history" && (
        <div className="max-h-[300px] overflow-y-auto pr-1 divide-y divide-slate-800/60 font-sans">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center italic py-8 font-mono">No WhatsApp logs processed.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-start justify-between space-x-2 hover:bg-slate-900/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-10 rounded overflow-hidden border border-slate-800 shrink-0">
                    <img src={h.imageUrl} alt="Historical" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">WhatsApp Ground Report</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">
                  <div>Workers: {h.extractedData.workerCount}</div>
                  <div>Safety Alerts: {h.extractedData.safetyIssues.length}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
