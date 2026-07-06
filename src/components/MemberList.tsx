"use client";

import { useMemo, useState } from "react";
import type { MemberWithPath } from "@/types/organization";

interface MemberListProps {
  members: MemberWithPath[];
  showPath?: boolean;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (member: MemberWithPath) => void;
  title?: string;
}

export default function MemberList({
  members,
  showPath = true,
  showActions = false,
  onDelete,
  onEdit,
  title,
}: MemberListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.areaName.toLowerCase().includes(q) ||
        m.upavathiName.toLowerCase().includes(q) ||
        m.gramaName.toLowerCase().includes(q) ||
        m.stanaName.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [members, query]);

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-10 text-center">
        <p className="text-3xl">👤</p>
        <p className="mt-2 font-semibold text-stone-700">No members in this section</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-stone-900">{title}</h2>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {members.length} total
          </span>
        </div>
      )}

      <input
        type="search"
        placeholder="Search name, area, phone, role..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-stone-900">{member.name}</p>
                  {member.role && (
                    <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
              {showActions && (
                <div className="flex gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(member)}
                      className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(member.id)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            {showPath && (
              <p className="mt-2 text-xs text-stone-500">
                {member.areaName} · {member.gramaName} · {member.upavathiName}
              </p>
            )}
            {member.phone && (
              <p className="mt-2 text-sm text-stone-600">📞 {member.phone}</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Name</th>
                {showPath && <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Location</th>}
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Address</th>
                {showActions && <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-orange-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{member.name}</p>
                        {member.joinedDate && (
                          <p className="text-xs text-stone-400">Since {member.joinedDate}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {showPath && (
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-700">{member.areaName}</p>
                      <p className="text-xs text-stone-400">{member.stanaName} › {member.gramaName} › {member.upavathiName}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {member.role ? (
                      <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                        {member.role}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{member.phone || "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{member.address || "—"}</td>
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(member)}
                            className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(member.id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-stone-500">
        Showing {filtered.length} of {members.length} members
      </p>
    </div>
  );
}
