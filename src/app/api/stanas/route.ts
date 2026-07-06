import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addStana, isWritableEnvironment, removeStana, updateStana } from "@/lib/organization";
import type { NameUpdate, StanaInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const body = (await request.json()) as StanaInput;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Stana name is required" }, { status: 400 });
  }

  const stana = await addStana({ name: body.name.trim() });
  return NextResponse.json(stana, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const body = (await request.json()) as StanaInput & NameUpdate & { stanaId: string };
  if (!body.stanaId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const stana = await updateStana(body.stanaId, body.name);
  if (!stana) return NextResponse.json({ error: "Stana not found" }, { status: 404 });
  return NextResponse.json(stana);
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const stanaId = searchParams.get("stanaId");

  if (!stanaId) {
    return NextResponse.json({ error: "stanaId required" }, { status: 400 });
  }

  const removed = await removeStana(stanaId);
  if (!removed) return NextResponse.json({ error: "Stana not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
