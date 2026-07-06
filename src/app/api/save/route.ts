import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { requireWritableStorage } from "@/lib/api-utils";
import { saveMandalToGitHub } from "@/lib/github";
import type { Mandal } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  try {
    const body = (await req.json()) as Mandal;
    await saveMandalToGitHub(body, "Update member data via admin panel");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save to GitHub";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
