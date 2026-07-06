import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isGitHubStorageEnabled, saveMandalToGitHub } from "@/lib/github";
import { isWritableEnvironment } from "@/lib/organization";
import type { Mandal } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json(
      {
        error:
          "GitHub storage is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH on Vercel.",
      },
      { status: 503 }
    );
  }

  if (!isGitHubStorageEnabled()) {
    return NextResponse.json(
      { error: "Save via GitHub is only used on Vercel with GitHub env vars set." },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as Mandal;
    await saveMandalToGitHub(body, "Update member data via admin panel");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save to GitHub";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
