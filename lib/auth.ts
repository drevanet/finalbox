import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const cookieName = "betty_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-this-secret");

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return await db.user.findUnique({ where: { id: payload.sub }, include: { subscription: true } });
  } catch { return null; }
}
export async function destroySession() {
  (await cookies()).delete(cookieName);
}
