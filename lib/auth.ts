import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getDatabaseUserById,
  getDatabaseUserByUsername,
  verifyPassword,
} from "@/lib/user-admin";
import type { AppUserRole } from "@/types/database";

export type AppRole = AppUserRole;

export type AppSession = {
  userId: string | null;
  username: string;
  name: string;
  role: AppRole;
  source: "database" | "bootstrap";
  expiresAt: number;
};

type ConfiguredUser = {
  username: string;
  password: string;
  name: string;
  role: AppRole;
};

export const SESSION_COOKIE_NAME = "firestop_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getAuthSecret() {
  const explicitSecret = process.env.AUTH_SECRET?.trim();

  if (explicitSecret) {
    return explicitSecret;
  }

  const fallbackSecret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (fallbackSecret) {
    return fallbackSecret;
  }

  throw new Error("Missing AUTH_SECRET");
}

function parseRole(value: string): AppRole {
  if (value === "admin" || value === "editor" || value === "viewer") {
    return value;
  }

  return "viewer";
}

function getConfiguredUsers(): ConfiguredUser[] {
  const rawUsers = process.env.APP_USERS_JSON?.trim();

  if (!rawUsers) {
    return [
      {
        username: "admin",
        password: "firestop123",
        name: "Administrator",
        role: "admin",
      },
    ];
  }

  const parsed = JSON.parse(rawUsers) as Array<Record<string, unknown>>;

  return parsed
    .map((user) => ({
      username: String(user.username || "").trim(),
      password: String(user.password || ""),
      name: String(user.name || user.username || "").trim(),
      role: parseRole(String(user.role || "viewer")),
    }))
    .filter((user) => user.username && user.password && user.name);
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function encodePayload(payload: AppSession) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AppSession;
}

export function canManageContent(role: AppRole) {
  return role === "admin" || role === "editor";
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  if (signValue(payload) !== signature) {
    return null;
  }

  try {
    const session = decodePayload(payload);

    if (
      !("userId" in session) ||
      !session.username ||
      !session.name ||
      !session.role ||
      !session.source ||
      typeof session.expiresAt !== "number"
    ) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  if (session.source === "database" && session.userId) {
    const { data: user, error } = await getDatabaseUserById(session.userId);

    if (error || !user || !user.is_active) {
      return null;
    }

    return {
      ...session,
      username: user.username,
      name: user.full_name,
      role: user.role,
    };
  }

  return session;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireEditorSession() {
  const session = await requireSession();

  if (!canManageContent(session.role)) {
    throw new Error("Your account has read-only access.");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (session.role !== "admin") {
    throw new Error("Only administrators can manage users.");
  }

  return session;
}

export async function createSessionCookie(input: Omit<AppSession, "expiresAt">) {
  const session: AppSession = {
    ...input,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payload = encodePayload(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, `${payload}.${signValue(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function authenticateUser(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername || !password) {
    return null;
  }

  const { data: databaseUser } = await getDatabaseUserByUsername(normalizedUsername);

  if (databaseUser?.is_active && verifyPassword(password, databaseUser.password_hash)) {
    return {
      userId: databaseUser.id,
      username: databaseUser.username,
      name: databaseUser.full_name,
      role: databaseUser.role,
      source: "database" as const,
    };
  }

  const user = getConfiguredUsers().find(
    (item) => item.username.toLowerCase() === normalizedUsername
  );

  if (!user || user.password !== password) {
    return null;
  }

  return {
    userId: null,
    username: user.username,
    name: user.name,
    role: user.role,
    source: "bootstrap" as const,
  };
}
