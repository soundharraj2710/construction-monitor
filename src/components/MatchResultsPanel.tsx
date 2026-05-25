import { ComparisonResult } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, Award, Lightbulb, RefreshCw } from "lucide-react";

interface Props {
  comparison: ComparisonResult;
}

export default function MatchResultsPanel({ comparison }: Props) {
  const isOk = comparison.status === "Matched";
  const isWarning = comparison.status === "Warning";
  const isFail = comparison.status === "Mismatched";

  // Build colors based on state
  const statusConfig = {
    Matched: {
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: CheckCircle2,
      ring: "border-emerald-500",
      badge: "bg-emerald-500 text-black",
      banner: "from-emerald-500/10 via-teal-500/5 to-transparent",
    },
    Warning: {
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse",
      icon: AlertTriangle,
      ring: "border-amber-500",
      badge: "bg-amber-500 text-black",
      banner: "from-amber-500/10 via-yellow-500/5 to-transparent",
    },
    Mismatched: {
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      icon: XCircle,
      ring: "border-rose-500",
      badge: "bg-rose-500 text-white",
      banner: "from-rose-500/10 via-red-500/5 to-transparent",
    },
    Pending: {
      color: "text-gray-400 bg-gray-900 border-gray-800",
      icon: RefreshCw,
      ring: "border-gray-700",
      badge: "bg-gray-800 text-gray-400",
      banner: "from-gray-900 to-transparent",
    },
  }[comparison.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="glass rounded-xl p-6 shadow-xl mb-6 relative overflow-hidden border border-white/10">
      
      {/* Decorative gradient background banner */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
        isOk ? "from-emerald-500" : isWarning ? "from-amber-500" : isFail ? "from-red-500" : "from-slate-700"
      } to-transparent`}></div>

      {/* Header */}
      <div className="border-b border-slate-700/50 pb-4 mb-4">
        <h2 className="text-md font-semibold text-white">Cross-Channel Analytics Audit</h2>
        <p className="text-xs text-slate-400 mt-0.5">LangGraph comparator aligning CCTV frames with ground telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Alignment Gauge Ring Indicator */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center relative">
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            
            {/* outer ring */}
            <div className={`absolute inset-0 rounded-full border-4 border-dashed opacity-25 ${statusConfig.ring}`}></div>
            
            {/* main visual circle */}
            <div className={`absolute w-[110px] h-[110px] rounded-full border-4 flex flex-col items-center justify-center ${statusConfig.ring} bg-slate-950/80 shadow-xl`}>
              <span className="text-3xl font-mono font-bold tracking-tighter text-white">
                {comparison.matchPercentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-semibold">Match Score</span>
            </div>
          </div>

          <div className="mt-4">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.color}`}>
              <StatusIcon size={12} />
              <span>{comparison.status}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            Confidence: {(comparison.confidenceScore * 100).toFixed(0)}%
          </p>
        </div>

        {/* AI Insight Paragraphs */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main decision explanation */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl relative">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-display font-semibold mb-2">
              <Award size={15} className="text-blue-400" />
              <span>AI Core Verdict</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{comparison.explanation}"
            </p>
          </div>

          {/* Strategic Suggestions */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl relative">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-display font-semibold mb-2">
              <Lightbulb size={15} className="text-amber-400" />
              <span>Active Compliance Suggestions</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {comparison.recommendation}
            </p>
          </div>

          {/* Last reconciled stamp */}
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-500 tracking-wider">
              LAST ALIGNMENT CYCLE SYNCED: {new Date(comparison.updatedAt).toLocaleTimeString()}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
