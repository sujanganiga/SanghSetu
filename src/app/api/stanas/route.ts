import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { requireWritableStorage } from "@/lib/api-utils";
import { addStana, removeStana, updateStana } from "@/lib/organization";
import type { NameUpdate, StanaInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as StanaInput;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Stana name is required" }, { status: 400 });
  }

  try {
    const stana = await addStana({ name: body.name.trim() });
    return NextResponse.json(stana, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add mandala";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as StanaInput & NameUpdate & { stanaId: string };
  if (!body.stanaId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const stana = await updateStana(body.stanaId, body.name);
    if (!stana) return NextResponse.json({ error: "Stana not found" }, { status: 404 });
    return NextResponse.json(stana);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update mandala";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const stanaId = searchParams.get("stanaId");

  if (!stanaId) {
    return NextResponse.json({ error: "stanaId required" }, { status: 400 });
  }

  try {
    const removed = await removeStana(stanaId);
    if (!removed) return NextResponse.json({ error: "Stana not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete mandala";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
