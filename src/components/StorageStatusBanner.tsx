"use client";

import { useEffect, useState } from "react";

interface StorageStatus {
  appVersion: string;
  vercel: boolean;
  githubConfigured: boolean;
  canSave: boolean;
  expectedErrorIfBlocked: string | null;
  githubEnv: {
    hasToken: boolean;
    hasOwner: boolean;
    hasRepo: boolean;
    branch: string;
  };
}

export default function StorageStatusBanner() {
  const [status, setStatus] = useState<StorageStatus | null>(null);

  useEffect(() => {
    fetch("/api/storage-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const isOldDeployment = status.appVersion !== "2026-07-06-github-storage";

  if (isOldDeployment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <strong>Old deployment detected.</strong> Redeploy from the latest GitHub code (commit with GitHub storage).
      </div>
    );
  }

  if (status.vercel && !status.canSave) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>GitHub storage not configured.</strong> In Vercel → Settings → Environment Variables, add{" "}
        <code className="rounded bg-amber-100 px-1">GITHUB_TOKEN</code>,{" "}
        <code className="rounded bg-amber-100 px-1">GITHUB_OWNER</code>,{" "}
        <code className="rounded bg-amber-100 px-1">GITHUB_REPO</code>,{" "}
        <code className="rounded bg-amber-100 px-1">GITHUB_BRANCH</code>, then redeploy.
        <p className="mt-2 text-xs">
          Token: {status.githubEnv.hasToken ? "✓" : "✗"} · Owner: {status.githubEnv.hasOwner ? "✓" : "✗"} · Repo:{" "}
          {status.githubEnv.hasRepo ? "✓" : "✗"} · Branch: {status.githubEnv.branch}
        </p>
      </div>
    );
  }

  if (status.canSave) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Storage ready — admin changes will save{status.vercel ? " to GitHub" : " locally"}.
      </div>
    );
  }

  return null;
}
