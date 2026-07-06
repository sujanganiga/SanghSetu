import { NextResponse } from "next/server";
import { isWritableEnvironment, STORAGE_UNAVAILABLE_ERROR } from "@/lib/organization";

export function storageUnavailableResponse() {
  return NextResponse.json({ error: STORAGE_UNAVAILABLE_ERROR }, { status: 503 });
}

export function requireWritableStorage(): NextResponse | null {
  if (!isWritableEnvironment()) {
    return storageUnavailableResponse();
  }
  return null;
}
