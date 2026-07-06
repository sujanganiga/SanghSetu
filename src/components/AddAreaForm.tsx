"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Mandal } from "@/types/organization";
import {
  getGramaOptionsForStana,
  getStanaOptions,
  getUpavathiOptionsForGrama,
} from "@/lib/client-utils";
import { LABELS } from "@/lib/labels";

interface AddAreaFormProps {
  mandal: Mandal;
  onAdded: () => void;
}

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function AddAreaForm({ mandal, onAdded }: AddAreaFormProps) {
  const stanaOptions = useMemo(() => getStanaOptions(mandal), [mandal]);

  const [stanaId, setStanaId] = useState(stanaOptions[0]?.id ?? "");
  const [gramaId, setGramaId] = useState("");
  const [upavathiId, setUpavathiId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const gramaOptions = useMemo(
    () => getGramaOptionsForStana(mandal, stanaId),
    [mandal, stanaId]
  );

  const effectiveGramaId = gramaId || gramaOptions[0]?.id || "";

  const upavathiOptions = useMemo(
    () => getUpavathiOptionsForGrama(mandal, stanaId, effectiveGramaId),
    [mandal, stanaId, effectiveGramaId]
  );

  const effectiveUpavathiId = upavathiId || upavathiOptions[0]?.id || "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stanaId,
          gramaId: effectiveGramaId,
          upavathiId: effectiveUpavathiId,
          name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed to add ${LABELS.areaShakaha.toLowerCase()}`);
        return;
      }
      setName("");
      setSuccess(`${LABELS.areaShakaha} "${data.name}" added successfully`);
      onAdded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (stanaOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 text-sm text-stone-600">
        No {LABELS.mandala.toLowerCase()}s yet. Add a {LABELS.mandala.toLowerCase()} first.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md">
      <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4">
        <h2 className="text-lg font-bold text-stone-900">Add New {LABELS.areaShakaha}</h2>
        <p className="text-sm text-stone-500">
          Create a {LABELS.areaShakaha.toLowerCase()} under a {LABELS.upavasathi.toLowerCase()}
        </p>
      </div>
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">{LABELS.mandala} *</span>
            <select
              required
              value={stanaId}
              onChange={(e) => {
                setStanaId(e.target.value);
                setGramaId("");
                setUpavathiId("");
              }}
              className={inputCls}
            >
              {stanaOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">{LABELS.grama} *</span>
            <select
              required
              value={effectiveGramaId}
              onChange={(e) => {
                setGramaId(e.target.value);
                setUpavathiId("");
              }}
              className={inputCls}
            >
              {gramaOptions.length === 0 ? (
                <option value="">No {LABELS.grama.toLowerCase()}s</option>
              ) : (
                gramaOptions.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-stone-700">{LABELS.upavasathi} *</span>
            <select
              required
              value={effectiveUpavathiId}
              onChange={(e) => setUpavathiId(e.target.value)}
              className={inputCls}
            >
              {upavathiOptions.length === 0 ? (
                <option value="">No {LABELS.upavasathi.toLowerCase()}s</option>
              ) : (
                upavathiOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))
              )}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-stone-700">{LABELS.areaShakaha} Name *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Road Shakaha"
            className={inputCls}
          />
        </label>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-100">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading || gramaOptions.length === 0 || upavathiOptions.length === 0}
          className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-orange-700 hover:to-orange-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : `+ Add ${LABELS.areaShakaha}`}
        </button>
      </div>
    </form>
  );
}
