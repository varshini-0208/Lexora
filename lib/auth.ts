import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { User } from "@/lib/types";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "lexora_hackathon_super_secret_jwt_key_2026_production_grade";

const SESSION_COOKIE_NAME = "lexora_session";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload?.userId) return null;

    return await db.findUserById(payload.userId);
  } catch (err) {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    const token =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload?.userId) return null;

    return await db.findUserById(payload.userId);
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim();
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
