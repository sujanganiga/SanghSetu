"use client";

import { LABELS } from "@/lib/labels";

interface StatsCardsProps {
  stanas: number;
  gramas: number;
  upavathis: number;
  areas: number;
  members: number;
}

const stats = [
  { label: `${LABELS.mandala}s`, valueKey: "stanas" as const, icon: "📁", color: "from-orange-500 to-orange-600" },
  { label: `${LABELS.grama}s`, valueKey: "gramas" as const, icon: "🏘️", color: "from-amber-500 to-orange-500" },
  { label: `${LABELS.upavasathi}s`, valueKey: "upavathis" as const, icon: "📂", color: "from-orange-500 to-amber-500" },
  { label: `${LABELS.areaShakaha}s`, valueKey: "areas" as const, icon: "🚩", color: "from-orange-600 to-red-500" },
  { label: "Members", valueKey: "members" as const, icon: "👥", color: "from-red-600 to-red-800" },
];

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md shadow-orange-100/50 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className={`bg-gradient-to-r ${s.color} px-4 py-3 text-xl text-white`}>
            {s.icon}
          </div>
          <div className="px-4 py-4">
            <p className="text-3xl font-bold text-stone-900">{props[s.valueKey]}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
