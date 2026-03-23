"use server";

import { redirect } from "next/navigation";
import {
  authenticateUser,
  clearSessionCookie,
  createSessionCookie,
  getSession,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/user-admin";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return {
      success: false,
      error: "Please enter your username and password.",
    };
  }

  const user = await authenticateUser(username, password);

  if (!user) {
    return {
      success: false,
      error: "Invalid username or password.",
    };
  }

  await createSessionCookie(user);
  await logAuditEvent({
    actorUserId: user.userId,
    actorUsername: user.username,
    action: "login",
    entityType: "session",
    entityId: user.userId,
    description: `${user.username} signed in.`,
  });

  return { success: true };
}

export async function logoutAction() {
  const session = await getSession();

  if (session) {
    await logAuditEvent({
      actorUserId: session.userId,
      actorUsername: session.username,
      action: "logout",
      entityType: "session",
      entityId: session.userId,
      description: `${session.username} signed out.`,
    });
  }

  await clearSessionCookie();
  redirect("/login");
}
