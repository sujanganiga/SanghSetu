import { NextResponse } from "next/server";
import { getMandal } from "@/lib/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const mandal = await getMandal();
  return NextResponse.json(mandal);
}
