import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  addUpavathi,
  isWritableEnvironment,
  removeUpavathi,
  updateUpavathi,
} from "@/lib/organization";
import type { NameUpdate, UpavathiInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const body = (await request.json()) as UpavathiInput;
  if (!body.stanaId?.trim() || !body.gramaId?.trim()) {
    return NextResponse.json({ error: "Mandala and grama are required" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Upavasathi name is required" }, { status: 400 });
  }

  try {
    const upavathi = await addUpavathi({
      stanaId: body.stanaId.trim(),
      gramaId: body.gramaId.trim(),
      name: body.name.trim(),
    });
    return NextResponse.json(upavathi, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Grama not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const body = (await request.json()) as UpavathiInput & NameUpdate & { upavathiId: string };
  if (!body.stanaId || !body.gramaId || !body.upavathiId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const upavathi = await updateUpavathi(
    body.stanaId,
    body.gramaId,
    body.upavathiId,
    body.name
  );
  if (!upavathi) return NextResponse.json({ error: "Upavasathi not found" }, { status: 404 });
  return NextResponse.json(upavathi);
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
  const gramaId = searchParams.get("gramaId");
  const upavathiId = searchParams.get("upavathiId");

  if (!stanaId || !gramaId || !upavathiId) {
    return NextResponse.json({ error: "stanaId, gramaId, and upavathiId required" }, { status: 400 });
  }

  const removed = await removeUpavathi(stanaId, gramaId, upavathiId);
  if (!removed) return NextResponse.json({ error: "Upavasathi not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
