import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { requireWritableStorage } from "@/lib/api-utils";
import { addArea, removeArea, updateArea } from "@/lib/organization";
import type { AreaInput, NameUpdate } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as AreaInput;

  if (!body.stanaId?.trim() || !body.gramaId?.trim() || !body.upavathiId?.trim()) {
    return NextResponse.json({ error: "Mandala, grama, and upavasathi are required" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Area name is required" }, { status: 400 });
  }

  try {
    const area = await addArea({
      stanaId: body.stanaId.trim(),
      gramaId: body.gramaId.trim(),
      upavathiId: body.upavathiId.trim(),
      name: body.name.trim(),
    });
    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upavasathi not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = requireWritableStorage();
  if (blocked) return blocked;

  const body = (await request.json()) as AreaInput & NameUpdate & { areaId: string };
  if (!body.stanaId || !body.gramaId || !body.upavathiId || !body.areaId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const area = await updateArea(
      body.stanaId,
      body.gramaId,
      body.upavathiId,
      body.areaId,
      body.name
    );
    if (!area) return NextResponse.json({ error: "Area not found" }, { status: 404 });
    return NextResponse.json(area);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update area";
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
  const upavathiId = searchParams.get("upavathiId");
  const areaId = searchParams.get("areaId");

  if (!stanaId || !gramaId || !upavathiId || !areaId) {
    return NextResponse.json(
      { error: "stanaId, gramaId, upavathiId, and areaId required" },
      { status: 400 }
    );
  }

  try {
    const removed = await removeArea(stanaId, gramaId, upavathiId, areaId);
    if (!removed) return NextResponse.json({ error: "Area not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete area";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
