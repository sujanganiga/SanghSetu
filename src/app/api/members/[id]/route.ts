import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { requireWritableStorage } from "@/lib/api-utils";
import { removeMember, updateMember } from "@/lib/organization";
import type { MemberUpdate } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as MemberUpdate;

  try {
    const member = await updateMember(params.id, body);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  try {
    const removed = await removeMember(params.id);
    if (!removed) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
