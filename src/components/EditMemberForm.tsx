"use client";

import { FormEvent, useEffect, useState } from "react";
import type { MemberWithPath } from "@/types/organization";

interface EditMemberFormProps {
  member: MemberWithPath | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function EditMemberForm({ member, onClose, onSaved }: EditMemberFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone || "");
      setRole(member.role || "");
      setError("");
    }
  }, [member]);

  if (!member) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/members/${member!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update member");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl"
      >
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4">
          <h2 className="text-lg font-bold text-stone-900">Edit Member</h2>
          <p className="text-sm text-stone-500">{member.areaName}</p>
        </div>
        <div className="space-y-4 p-6">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Name *</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Role</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-700 hover:to-orange-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
