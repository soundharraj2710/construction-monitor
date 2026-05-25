import { Users, Truck, ShieldAlert, Award } from "lucide-react";
import { OverviewTelemetry } from "../types";

interface Props {
  overview: OverviewTelemetry;
}

export default function OverviewCards({ overview }: Props) {
  const cards = [
    {
      id: "stat-workers",
      name: "Workers Headcount",
      value: overview.totalWorkers,
      icon: Users,
      iconColor: "text-blue-400",
      description: "Active high-vis personnel spotted",
    },
    {
      id: "stat-vehicles",
      name: "Vehicles & Equipment",
      value: overview.totalVehicles,
      icon: Truck,
      iconColor: "text-indigo-400",
      description: "Active excavators, mixers & loaders",
    },
    {
      id: "stat-violations",
      name: "Safety Alerts",
      value: overview.safetyViolations,
      icon: ShieldAlert,
      iconColor: overview.safetyViolations > 0 ? "text-red-400 animate-pulse" : "text-slate-400",
      description: overview.safetyViolations > 0 
        ? "Active PPE warning logs detected" 
        : "All zones wearing safety helmets",
    },
    {
      id: "stat-alignment",
      name: "Telemetry Match",
      value: `${overview.matchScore}%`,
      icon: Award,
      iconColor: "text-emerald-400",
      description: "Cross-channel validation consistency",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="glass rounded-xl p-5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                {card.name}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold tracking-tight text-white ${card.id === "stat-alignment" ? "text-emerald-400" : ""}`}>
                {card.value}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
