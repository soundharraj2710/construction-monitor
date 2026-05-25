import { ActivityFeedItem } from "../types";
import { MessageSquare, Camera, FileVideo, Cpu, Bolt, Activity } from "lucide-react";

interface Props {
  activities: ActivityFeedItem[];
}

export default function ActivityFeed({ activities }: Props) {
  const getIconProps = (type: ActivityFeedItem["type"]) => {
    switch (type) {
      case "whatsapp":
        return { icon: MessageSquare, bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "cctv":
        return { icon: Camera, bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      case "video":
        return { icon: FileVideo, bg: "bg-sky-500/10 text-sky-400 border-sky-500/20" };
      case "comparison":
        return { icon: Cpu, bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "system":
      default:
        return { icon: Bolt, bg: "bg-gray-500/10 text-gray-400 border-gray-800" };
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-xl flex flex-col justify-between border border-white/10">
      
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-md font-semibold text-white flex items-center space-x-1.5 font-sans">
            <Activity size={18} className="text-blue-400 animate-pulse" />
            <span>Workflow Activity Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time trace logs of the state graph execution nodes</p>
        </div>
      </div>

      {/* Activities layout list */}
      <div className="max-h-[385px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center italic py-24 font-mono">No activities processed yet.</p>
        ) : (
          activities.map((act) => {
            const config = getIconProps(act.type);
            const Icon = config.icon;

            return (
              <div
                key={act.id}
                id={act.id}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-3 hover:border-slate-700 transition-all duration-200"
              >
                {/* Visual Icon Badge */}
                <div className={`p-1.5 rounded-lg border ${config.bg} shrink-0`}>
                  <Icon size={14} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-relaxed break-words font-sans">
                    {act.message}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                      {act.type} channel
                    </span>
                    <span className="text-[9px] font-mono text-slate-600">
                      • {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
