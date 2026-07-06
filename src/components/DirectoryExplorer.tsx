"use client";

import { useMemo, useState } from "react";
import type { Mandal, MemberWithPath, NavState } from "@/types/organization";
import Breadcrumbs from "./Breadcrumbs";
import FolderGrid from "./FolderGrid";
import HierarchyTree from "./HierarchyTree";
import MemberList from "./MemberList";
import StatsCards from "./StatsCards";
import { LABELS } from "@/lib/labels";
import type { EditNodeTarget } from "./EditNodeForm";

interface DirectoryExplorerProps {
  mandal: Mandal;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (member: MemberWithPath) => void;
  onEditNode?: (target: EditNodeTarget) => void;
  onDeleteStana?: (stanaId: string, name: string) => void;
  onDeleteGrama?: (stanaId: string, gramaId: string, name: string) => void;
  onDeleteUpavathi?: (stanaId: string, gramaId: string, upavathiId: string, name: string) => void;
  onDeleteArea?: (stanaId: string, gramaId: string, upavathiId: string, areaId: string, name: string) => void;
}

function flattenMembers(mandal: Mandal): MemberWithPath[] {
  const result: MemberWithPath[] = [];
  for (const stana of mandal.stanas) {
    for (const grama of stana.gramas) {
      for (const upavathi of grama.upavathis) {
        for (const area of upavathi.areas) {
          for (const member of area.members) {
            result.push({
              ...member,
              areaId: area.id,
              areaName: area.name,
              upavathiName: upavathi.name,
              gramaName: grama.name,
              stanaName: stana.name,
            });
          }
        }
      }
    }
  }
  return result;
}

export default function DirectoryExplorer({
  mandal,
  showActions = false,
  onDelete,
  onEdit,
  onEditNode,
  onDeleteStana,
  onDeleteGrama,
  onDeleteUpavathi,
  onDeleteArea,
}: DirectoryExplorerProps) {
  const [nav, setNav] = useState<NavState>({ level: "mandal" });

  const stats = useMemo(() => {
    const gramas = mandal.stanas.reduce((a, s) => a + s.gramas.length, 0);
    const upavathis = mandal.stanas.reduce(
      (a, s) => a + s.gramas.reduce((b, g) => b + g.upavathis.length, 0),
      0
    );
    const areas = mandal.stanas.reduce(
      (a, s) =>
        a +
        s.gramas.reduce(
          (b, g) => b + g.upavathis.reduce((c, u) => c + u.areas.length, 0),
          0
        ),
      0
    );
    const members = flattenMembers(mandal).length;
    return {
      stanas: mandal.stanas.length,
      gramas,
      upavathis,
      areas,
      members,
    };
  }, [mandal]);

  const allMembers = useMemo(() => flattenMembers(mandal), [mandal]);

  function renderContent() {
    if (nav.level === "all-members") {
      return (
        <MemberList
          members={allMembers}
          showPath
          showActions={showActions}
          onDelete={onDelete}
          onEdit={onEdit}
          title={`All ${LABELS.taluku} Members`}
        />
      );
    }

    if (nav.level === "mandal" || !nav.stanaId) {
      return (
        <div className="space-y-6">
          <StatsCards {...stats} />
          <FolderGrid
            title={`${LABELS.mandala}s`}
            subtitle={`Select a ${LABELS.mandala.toLowerCase()} to explore ${LABELS.grama.toLowerCase()}s`}
            items={mandal.stanas.map((s) => ({
              id: s.id,
              name: s.name,
              icon: "📁",
              count: s.gramas.length,
              countLabel: s.gramas.length === 1 ? LABELS.grama.toLowerCase() : `${LABELS.grama}s`.toLowerCase(),
              onClick: () => setNav({ level: "stana", stanaId: s.id }),
              onEdit: showActions && onEditNode
                ? () => onEditNode({ type: "stana", label: LABELS.mandala, name: s.name, stanaId: s.id })
                : undefined,
              onDelete: showActions && onDeleteStana
                ? () => onDeleteStana(s.id, s.name)
                : undefined,
            }))}
          />
          <button
            onClick={() => setNav({ level: "all-members" })}
            className="w-full rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-800 shadow-sm transition hover:bg-orange-50 sm:w-auto"
          >
            👥 View all {stats.members} {LABELS.taluku.toLowerCase()} members
          </button>
        </div>
      );
    }

    const stana = mandal.stanas.find((s) => s.id === nav.stanaId);
    if (!stana) return null;

    if (nav.level === "stana" || !nav.gramaId) {
      const stMembers = allMembers.filter((m) => m.stanaName === stana.name);
      return (
        <div className="space-y-6">
          <FolderGrid
            title={`${LABELS.grama}s in ${stana.name}`}
            subtitle={`${stMembers.length} members across this ${LABELS.mandala.toLowerCase()}`}
            items={stana.gramas.map((g) => ({
              id: g.id,
              name: g.name,
              icon: "🏘️",
              count: g.upavathis.length,
              countLabel: g.upavathis.length === 1 ? LABELS.upavasathi.toLowerCase() : `${LABELS.upavasathi}s`.toLowerCase(),
              onClick: () =>
                setNav({
                  level: "grama",
                  stanaId: stana.id,
                  gramaId: g.id,
                }),
              onEdit: showActions && onEditNode
                ? () =>
                    onEditNode({
                      type: "grama",
                      label: LABELS.grama,
                      name: g.name,
                      stanaId: stana.id,
                      gramaId: g.id,
                    })
                : undefined,
              onDelete: showActions && onDeleteGrama
                ? () => onDeleteGrama(stana.id, g.id, g.name)
                : undefined,
            }))}
          />
          <MemberList
            members={stMembers}
            showPath
            showActions={showActions}
            onDelete={onDelete}
            onEdit={onEdit}
            title={`All members — ${stana.name}`}
          />
        </div>
      );
    }

    const grama = stana.gramas.find((g) => g.id === nav.gramaId);
    if (!grama) return null;

    if (nav.level === "grama" || !nav.upavathiId) {
      const grMembers = allMembers.filter(
        (m) => m.stanaName === stana.name && m.gramaName === grama.name
      );
      return (
        <div className="space-y-6">
          <FolderGrid
            title={`${LABELS.upavasathi}s in ${grama.name}`}
            subtitle={`${grMembers.length} members in this ${LABELS.grama.toLowerCase()}`}
            items={grama.upavathis.map((u) => ({
              id: u.id,
              name: u.name,
              icon: "📂",
              count: u.areas.length,
              countLabel: u.areas.length === 1 ? LABELS.areaShakaha.toLowerCase() : `${LABELS.areaShakaha}s`.toLowerCase(),
              onClick: () =>
                setNav({
                  level: "upavathi",
                  stanaId: stana.id,
                  gramaId: grama.id,
                  upavathiId: u.id,
                }),
              onEdit: showActions && onEditNode
                ? () =>
                    onEditNode({
                      type: "upavathi",
                      label: LABELS.upavasathi,
                      name: u.name,
                      stanaId: stana.id,
                      gramaId: grama.id,
                      upavathiId: u.id,
                    })
                : undefined,
              onDelete: showActions && onDeleteUpavathi
                ? () => onDeleteUpavathi(stana.id, grama.id, u.id, u.name)
                : undefined,
            }))}
          />
          <MemberList
            members={grMembers}
            showPath
            showActions={showActions}
            onDelete={onDelete}
            onEdit={onEdit}
            title={`All members — ${grama.name}`}
          />
        </div>
      );
    }

    const upavathi = grama.upavathis.find((u) => u.id === nav.upavathiId);
    if (!upavathi) return null;

    if (nav.level === "upavathi" || !nav.areaId) {
      const upMembers = allMembers.filter(
        (m) =>
          m.stanaName === stana.name &&
          m.gramaName === grama.name &&
          m.upavathiName === upavathi.name
      );
      return (
        <div className="space-y-6">
          <FolderGrid
            title={`${LABELS.areaShakaha}s in ${upavathi.name}`}
            subtitle={`${upMembers.length} members in this ${LABELS.upavasathi.toLowerCase()}`}
            items={upavathi.areas.map((a) => ({
              id: a.id,
              name: a.name,
              icon: "🚩",
              count: a.members.length,
              countLabel: a.members.length === 1 ? "member" : "members",
              onClick: () =>
                setNav({
                  level: "area",
                  stanaId: stana.id,
                  gramaId: grama.id,
                  upavathiId: upavathi.id,
                  areaId: a.id,
                }),
              onEdit: showActions && onEditNode
                ? () =>
                    onEditNode({
                      type: "area",
                      label: LABELS.areaShakaha,
                      name: a.name,
                      stanaId: stana.id,
                      gramaId: grama.id,
                      upavathiId: upavathi.id,
                      areaId: a.id,
                    })
                : undefined,
              onDelete: showActions && onDeleteArea
                ? () => onDeleteArea(stana.id, grama.id, upavathi.id, a.id, a.name)
                : undefined,
            }))}
          />
          <MemberList
            members={upMembers}
            showPath={false}
            showActions={showActions}
            onDelete={onDelete}
            onEdit={onEdit}
            title={`All members — ${upavathi.name}`}
          />
        </div>
      );
    }

    const area = upavathi.areas.find((a) => a.id === nav.areaId);
    if (!area) return null;

    const arMembers = area.members.map((m) => ({
      ...m,
      areaId: area.id,
      areaName: area.name,
      upavathiName: upavathi.name,
      gramaName: grama.name,
      stanaName: stana.name,
    }));

    return (
      <MemberList
        members={arMembers}
        showPath={false}
        showActions={showActions}
        onDelete={onDelete}
        onEdit={onEdit}
        title={`${area.name} — Members`}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
      <HierarchyTree mandal={mandal} nav={nav} onNavigate={setNav} />
      <div className="min-w-0 space-y-4">
        <Breadcrumbs mandal={mandal} nav={nav} onNavigate={setNav} />
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-md sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
