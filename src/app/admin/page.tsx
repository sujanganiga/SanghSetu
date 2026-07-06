"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import AddMemberForm from "@/components/AddMemberForm";
import AddAreaForm from "@/components/AddAreaForm";
import AddGramaForm from "@/components/AddGramaForm";
import AddUpavathiForm from "@/components/AddUpavathiForm";
import AddStanaForm from "@/components/AddStanaForm";
import EditMemberForm from "@/components/EditMemberForm";
import EditNodeForm, { type EditNodeTarget } from "@/components/EditNodeForm";
import StorageStatusBanner from "@/components/StorageStatusBanner";
import { HIERARCHY_PATH, LABELS } from "@/lib/labels";
import type { Mandal, MemberWithPath } from "@/types/organization";
import { getAllAreaOptions } from "@/lib/client-utils";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingMember, setEditingMember] = useState<MemberWithPath | null>(null);
  const [editingNode, setEditingNode] = useState<EditNodeTarget | null>(null);

  const loadMandal = useCallback(async () => {
    const res = await fetch("/api/organization");
    setMandal(await res.json());
  }, []);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/auth/session");
    setIsAdmin((await res.json()).isAdmin);
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => { if (isAdmin) loadMandal(); }, [isAdmin, loadMandal, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setLoginError("Invalid password"); return; }
    setIsAdmin(true);
    setPassword("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
  }

  async function handleDeleteMember(id: string) {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
    else alert((await res.json()).error || "Failed to remove member");
  }

  async function handleDeleteStana(stanaId: string, name: string) {
    if (!confirm(`Delete ${LABELS.mandala.toLowerCase()} "${name}" and all its ${LABELS.grama.toLowerCase()}s, ${LABELS.upavasathi.toLowerCase()}s, ${LABELS.areaShakaha.toLowerCase()}s, and members?`)) return;
    const res = await fetch(`/api/stanas?stanaId=${stanaId}`, { method: "DELETE" });
    if (res.ok) refresh();
    else alert((await res.json()).error || `Failed to delete ${LABELS.mandala.toLowerCase()}`);
  }

  async function handleDeleteGrama(stanaId: string, gramaId: string, name: string) {
    if (!confirm(`Delete ${LABELS.grama.toLowerCase()} "${name}" and all its ${LABELS.upavasathi.toLowerCase()}s, ${LABELS.areaShakaha.toLowerCase()}s, and members?`)) return;
    const res = await fetch(`/api/gramas?stanaId=${stanaId}&gramaId=${gramaId}`, { method: "DELETE" });
    if (res.ok) refresh();
    else alert((await res.json()).error || `Failed to delete ${LABELS.grama.toLowerCase()}`);
  }

  async function handleDeleteUpavathi(stanaId: string, gramaId: string, upavathiId: string, name: string) {
    if (!confirm(`Delete ${LABELS.upavasathi.toLowerCase()} "${name}" and all its ${LABELS.areaShakaha.toLowerCase()}s and members?`)) return;
    const res = await fetch(`/api/upavathis?stanaId=${stanaId}&gramaId=${gramaId}&upavathiId=${upavathiId}`, { method: "DELETE" });
    if (res.ok) refresh();
    else alert((await res.json()).error || `Failed to delete ${LABELS.upavasathi.toLowerCase()}`);
  }

  async function handleDeleteArea(stanaId: string, gramaId: string, upavathiId: string, areaId: string, name: string) {
    if (!confirm(`Delete ${LABELS.areaShakaha.toLowerCase()} "${name}" and all its members?`)) return;
    const res = await fetch(`/api/areas?stanaId=${stanaId}&gramaId=${gramaId}&upavathiId=${upavathiId}&areaId=${areaId}`, { method: "DELETE" });
    if (res.ok) refresh();
    else alert((await res.json()).error || "Failed to delete area");
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <form onSubmit={handleLogin} className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl">
            <div className="bg-gradient-to-br from-red-900 to-orange-700 px-8 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">🔐</div>
              <h1 className="text-xl font-bold">Admin Login</h1>
              <p className="mt-2 text-sm text-orange-200">Only admins can manage the directory</p>
            </div>
            <div className="p-8">
              <label className="mb-5 block text-sm">
                <span className="mb-1.5 block font-semibold text-stone-700">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  autoComplete="current-password"
                />
              </label>
              <p className="mb-4 text-xs text-stone-400">
                Password is set in <code className="text-orange-700">.env.local</code> as{" "}
                <code className="text-orange-700">ADMIN_PASSWORD</code>
              </p>
              {loginError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div>}
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-700 hover:to-orange-600">
                Login to Admin Panel
              </button>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  const areaOptions = mandal ? getAllAreaOptions(mandal) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">Admin Mode</span>
            <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">Admin Panel</h1>
            <p className="mt-1 text-sm text-stone-500">
              Manage {HIERARCHY_PATH}
            </p>
          </div>
          <button onClick={handleLogout} className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-800 shadow-sm hover:bg-orange-50">
            Logout
          </button>
        </div>
        <StorageStatusBanner />
        {mandal && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <AddStanaForm onAdded={refresh} />
              <AddGramaForm mandal={mandal} onAdded={refresh} />
              <AddUpavathiForm mandal={mandal} onAdded={refresh} />
              <AddAreaForm mandal={mandal} onAdded={refresh} />
              <AddMemberForm areaOptions={areaOptions} onAdded={refresh} />
            </div>
            <DirectoryExplorer
              key={refreshKey}
              mandal={mandal}
              showActions
              onDelete={handleDeleteMember}
              onEdit={setEditingMember}
              onEditNode={setEditingNode}
              onDeleteStana={handleDeleteStana}
              onDeleteGrama={handleDeleteGrama}
              onDeleteUpavathi={handleDeleteUpavathi}
              onDeleteArea={handleDeleteArea}
            />
          </>
        )}
      </main>
      <Footer />
      <EditMemberForm
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSaved={refresh}
      />
      <EditNodeForm
        target={editingNode}
        onClose={() => setEditingNode(null)}
        onSaved={refresh}
      />
    </div>
  );
}
