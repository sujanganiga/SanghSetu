"use client";

import type { Mandal, NavState } from "@/types/organization";
import { LABELS } from "@/lib/labels";

interface HierarchyTreeProps {
  mandal: Mandal;
  nav: NavState;
  onNavigate: (nav: NavState) => void;
}

function TreeBtn({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
        active
          ? "bg-orange-100 font-semibold text-orange-900"
          : "text-stone-600 hover:bg-orange-50 hover:text-stone-900"
      }`}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="ml-auto rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-800">
          {count}
        </span>
      )}
    </button>
  );
}

export default function HierarchyTree({ mandal, nav, onNavigate }: HierarchyTreeProps) {
  const isAllMembers = nav.level === "all-members";
  const isMandalRoot = nav.level === "mandal" && !nav.stanaId;

  return (
    <aside className="sticky top-[4.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-orange-100 bg-white p-3 shadow-md sm:p-4">
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Navigation
      </p>

      <TreeBtn
        active={isMandalRoot}
        onClick={() => onNavigate({ level: "mandal" })}
        icon="🏛️"
        label={mandal.name}
      />
      <TreeBtn
        active={isAllMembers}
        onClick={() => onNavigate({ level: "all-members" })}
        icon="👥"
        label="All Members"
      />

      <div className="my-3 border-t border-orange-100" />
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {LABELS.mandala}s
      </p>

      {mandal.stanas.map((stana) => {
        const isStSelected = nav.stanaId === stana.id;
        return (
          <div key={stana.id} className="mb-0.5">
            <TreeBtn
              active={isStSelected && nav.level === "stana"}
              onClick={() => onNavigate({ level: "stana", stanaId: stana.id })}
              icon="📁"
              label={stana.name}
            />
            {isStSelected && (
              <div className="ml-3 border-l-2 border-orange-100 pl-2">
                {stana.gramas.map((grama) => {
                  const isGrSelected = nav.gramaId === grama.id;
                  return (
                    <div key={grama.id}>
                      <TreeBtn
                        active={isGrSelected && nav.level === "grama"}
                        onClick={() =>
                          onNavigate({
                            level: "grama",
                            stanaId: stana.id,
                            gramaId: grama.id,
                          })
                        }
                        icon="🏘️"
                        label={grama.name}
                      />
                      {isGrSelected && (
                        <div className="ml-3 border-l-2 border-orange-100 pl-2">
                          {grama.upavathis.map((upavathi) => {
                            const isUpSelected = nav.upavathiId === upavathi.id;
                            return (
                              <div key={upavathi.id}>
                                <TreeBtn
                                  active={isUpSelected && nav.level === "upavathi"}
                                  onClick={() =>
                                    onNavigate({
                                      level: "upavathi",
                                      stanaId: stana.id,
                                      gramaId: grama.id,
                                      upavathiId: upavathi.id,
                                    })
                                  }
                                  icon="📂"
                                  label={upavathi.name}
                                />
                                {isUpSelected && (
                                  <div className="ml-3 border-l-2 border-orange-100 pl-2">
                                    {upavathi.areas.map((area) => (
                                      <TreeBtn
                                        key={area.id}
                                        active={nav.areaId === area.id}
                                        onClick={() =>
                                          onNavigate({
                                            level: "area",
                                            stanaId: stana.id,
                                            gramaId: grama.id,
                                            upavathiId: upavathi.id,
                                            areaId: area.id,
                                          })
                                        }
                                        icon="🚩"
                                        label={area.name}
                                        count={area.members.length}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
