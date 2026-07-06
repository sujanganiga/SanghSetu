import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { requireWritableStorage } from "@/lib/api-utils";
import { addGrama, removeGrama, updateGrama } from "@/lib/organization";
import type { GramaInput, NameUpdate } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as GramaInput;
  if (!body.stanaId?.trim()) {
    return NextResponse.json({ error: "Mandala is required" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Grama name is required" }, { status: 400 });
  }

  try {
    const grama = await addGrama({
      stanaId: body.stanaId.trim(),
      name: body.name.trim(),
    });
    return NextResponse.json(grama, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mandala not found";
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message.includes("GitHub") ? 503 : 404 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as GramaInput & NameUpdate & { gramaId: string };
  if (!body.stanaId || !body.gramaId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const grama = await updateGrama(body.stanaId, body.gramaId, body.name);
    if (!grama) return NextResponse.json({ error: "Grama not found" }, { status: 404 });
    return NextResponse.json(grama);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update grama";
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
  const gramaId = searchParams.get("gramaId");

  if (!stanaId || !gramaId) {
    return NextResponse.json({ error: "stanaId and gramaId required" }, { status: 400 });
  }

  try {
    const removed = await removeGrama(stanaId, gramaId);
    if (!removed) return NextResponse.json({ error: "Grama not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete grama";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
