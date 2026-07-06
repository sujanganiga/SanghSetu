import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  addMember,
  flattenMembers,
  getMandal,
  getMembersByArea,
  getMembersByUpavathi,
  getMembersByStana,
  isWritableEnvironment,
} from "@/lib/organization";
import type { MemberInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get("areaId");
  const upavathiId = searchParams.get("upavathiId");
  const stanaId = searchParams.get("stanaId");

  const mandal = await getMandal();

  if (areaId) {
    return NextResponse.json(getMembersByArea(mandal, areaId));
  }
  if (upavathiId) {
    return NextResponse.json(getMembersByUpavathi(mandal, upavathiId));
  }
  if (stanaId) {
    return NextResponse.json(getMembersByStana(mandal, stanaId));
  }

  return NextResponse.json(flattenMembers(mandal));
}

export async function POST(request: Request) {
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

  const body = (await request.json()) as MemberInput;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.areaId?.trim()) {
    return NextResponse.json({ error: "Area is required" }, { status: 400 });
  }

  try {
    const member = await addMember({
      areaId: body.areaId.trim(),
      name: body.name.trim(),
      phone: body.phone?.trim(),
      role: body.role?.trim(),
      address: body.address?.trim(),
      joinedDate: body.joinedDate?.trim(),
    });
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Area not found" }, { status: 404 });
  }
}
