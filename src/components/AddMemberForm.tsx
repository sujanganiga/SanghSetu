"use client";

import { FormEvent, useState } from "react";
import type { MemberInput, AreaOption } from "@/types/organization";

interface AddMemberFormProps {
  areaOptions: AreaOption[];
  defaultAreaId?: string;
  onAdded: () => void;
}

const emptyForm = (areaId: string): MemberInput => ({
  areaId,
  name: "",
  phone: "",
  role: "",
  address: "",
  joinedDate: "",
});

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function AddMemberForm({
  areaOptions,
  defaultAreaId = "",
  onAdded,
}: AddMemberFormProps) {
  const [form, setForm] = useState<MemberInput>(
    emptyForm(defaultAreaId || areaOptions[0]?.areaId || "")
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add member");
        return;
      }
      setForm(emptyForm(form.areaId));
      onAdded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md">
      <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4">
        <h2 className="text-lg font-bold text-stone-900">Add New Member</h2>
        <p className="text-sm text-stone-500">Select the area (shakaha) for this member</p>
      </div>
      <div className="space-y-4 p-6">
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-stone-700">Area (Shakaha) *</span>
          <select
            required
            value={form.areaId}
            onChange={(e) => setForm({ ...form, areaId: e.target.value })}
            className={inputCls}
          >
            {areaOptions.map((opt) => (
              <option key={opt.areaId} value={opt.areaId}>{opt.label}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Name *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Role</span>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Swayamsevak, Ganashyak..." className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">Joined Date</span>
            <input type="date" value={form.joinedDate} onChange={(e) => setForm({ ...form, joinedDate: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-semibold text-stone-700">Address</span>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
          </label>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-orange-700 hover:to-orange-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : "+ Add Member"}
        </button>
      </div>
    </form>
  );
}
