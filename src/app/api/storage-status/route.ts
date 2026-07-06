import { NextResponse } from "next/server";
import { isGitHubStorageEnabled } from "@/lib/github";
import { isWritableEnvironment, STORAGE_UNAVAILABLE_ERROR } from "@/lib/organization";

export const dynamic = "force-dynamic";

/** Public diagnostic — helps verify the live Vercel deployment is up to date. */
export async function GET() {
  const github = isGitHubStorageEnabled();
  const writable = isWritableEnvironment();

  return NextResponse.json({
    appVersion: "2026-07-06-github-storage",
    vercel: process.env.VERCEL === "1",
    githubConfigured: github,
    canSave: writable,
    expectedErrorIfBlocked: writable ? null : STORAGE_UNAVAILABLE_ERROR,
    githubEnv: {
      hasToken: !!process.env.GITHUB_TOKEN,
      hasOwner: !!process.env.GITHUB_OWNER,
      hasRepo: !!process.env.GITHUB_REPO,
      branch: process.env.GITHUB_BRANCH || "main",
    },
  });
}
