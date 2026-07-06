import { cookies } from "next/headers";

const SESSION_COOKIE = "sanghsetu_admin";
const SESSION_VALUE = "authenticated";

export function verifyPassword(password: string): boolean {
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "admin123").trim();
  return password.trim() === adminPassword;
}

export async function createSession(): Promise<void> {
  cookies().set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const cookie = cookies().get(SESSION_COOKIE);
  return cookie?.value === SESSION_VALUE;
}
