import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addArea, isWritableEnvironment, removeArea, updateArea } from "@/lib/organization";
import type { AreaInput, NameUpdate } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json(
      {
        error:
          "Cannot save on Vercel. Run locally (npm run dev), add area, then push data/mandal.json to redeploy.",
      },
      { status: 503 }
    );
  }

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
  } catch {
    return NextResponse.json({ error: "Upavasathi not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWritableEnvironment()) {
    return NextResponse.json({ error: "Cannot save on Vercel." }, { status: 503 });
  }

  const body = (await request.json()) as AreaInput & NameUpdate & { areaId: string };
  if (!body.stanaId || !body.gramaId || !body.upavathiId || !body.areaId || !body.name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const area = await updateArea(
    body.stanaId,
    body.gramaId,
    body.upavathiId,
    body.areaId,
    body.name
  );
  if (!area) return NextResponse.json({ error: "Area not found" }, { status: 404 });
  return NextResponse.json(area);
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
  const areaId = searchParams.get("areaId");

  if (!stanaId || !gramaId || !upavathiId || !areaId) {
    return NextResponse.json(
      { error: "stanaId, gramaId, upavathiId, and areaId required" },
      { status: 400 }
    );
  }

  const removed = await removeArea(stanaId, gramaId, upavathiId, areaId);
  if (!removed) return NextResponse.json({ error: "Area not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
