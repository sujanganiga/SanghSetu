import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isWritableEnvironment, removeMember, updateMember } from "@/lib/organization";
import type { MemberUpdate } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json(
      {
        error:
          "Cannot save on Vercel. Run locally (npm run dev), update members, then push data/mandal.json to redeploy.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as MemberUpdate;
  const member = await updateMember(params.id, body);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json(
      {
        error:
          "Cannot save on Vercel. Run locally (npm run dev), update members, then push data/mandal.json to redeploy.",
      },
      { status: 503 }
    );
  }

  const removed = await removeMember(params.id);
  if (!removed) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
