"use client";

import type { Mandal, NavState } from "@/types/organization";

interface BreadcrumbsProps {
  mandal: Mandal;
  nav: NavState;
  onNavigate: (nav: NavState) => void;
}

export default function Breadcrumbs({ mandal, nav, onNavigate }: BreadcrumbsProps) {
  const stana = nav.stanaId && mandal.stanas.find((s) => s.id === nav.stanaId);
  const grama = stana && nav.gramaId && stana.gramas.find((g) => g.id === nav.gramaId);
  const upavathi = grama && nav.upavathiId && grama.upavathis.find((u) => u.id === nav.upavathiId);
  const area = upavathi && nav.areaId && upavathi.areas.find((a) => a.id === nav.areaId);

  const crumbs: { label: string; nav: NavState }[] = [
    { label: mandal.name, nav: { level: "mandal" } },
  ];

  if (nav.level === "all-members") {
    crumbs.push({ label: "All Members", nav: { level: "all-members" } });
  } else {
    if (stana) crumbs.push({ label: stana.name, nav: { level: "stana", stanaId: stana.id } });
    if (grama)
      crumbs.push({
        label: grama.name,
        nav: { level: "grama", stanaId: nav.stanaId, gramaId: grama.id },
      });
    if (upavathi)
      crumbs.push({
        label: upavathi.name,
        nav: {
          level: "upavathi",
          stanaId: nav.stanaId,
          gramaId: nav.gramaId,
          upavathiId: upavathi.id,
        },
      });
    if (area)
      crumbs.push({
        label: area.name,
        nav: {
          level: "area",
          stanaId: nav.stanaId,
          gramaId: nav.gramaId,
          upavathiId: nav.upavathiId,
          areaId: area.id,
        },
      });
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm ring-1 ring-stone-200">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-orange-300">›</span>}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-orange-800">{crumb.label}</span>
          ) : (
            <button
              onClick={() => onNavigate(crumb.nav)}
              className="rounded px-1.5 py-0.5 text-stone-500 transition hover:bg-orange-50 hover:text-orange-700"
            >
              {crumb.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
