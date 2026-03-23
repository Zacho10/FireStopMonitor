import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { AuditLogEntry, AppUser, AppUserRole } from "@/types/database";

const PASSWORD_KEY_LENGTH = 64;

function getAdminClientOrError() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return {
      client: null,
      error:
        "Missing SUPABASE_SERVICE_ROLE_KEY. Database-backed user management is not configured yet.",
    };
  }

  return { client: supabaseAdmin, error: null };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (derivedHash.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, storedBuffer);
}

export async function getDatabaseUserByUsername(username: string): Promise<{
  data: AppUser | null;
  error: string | null;
}> {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("app_users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  return { data: data as AppUser | null, error: null };
}

export async function getDatabaseUserById(userId: string): Promise<{
  data: AppUser | null;
  error: string | null;
}> {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  return { data: data as AppUser | null, error: null };
}

export async function getUsers(): Promise<{
  data: AppUser[] | null;
  error: string | null;
}> {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("app_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  return { data: (data || []) as AppUser[], error: null };
}

export async function getAuditLogs(limit = 40): Promise<{
  data: AuditLogEntry[] | null;
  error: string | null;
}> {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    return { data: null, error };
  }

  const { data, error: queryError } = await client
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (queryError) {
    return { data: null, error: queryError.message };
  }

  return { data: (data || []) as AuditLogEntry[], error: null };
}

export async function getProjectAuditLogs(
  projectId: string,
  limit = 20
): Promise<{
  data: AuditLogEntry[] | null;
  error: string | null;
}> {
  const { data, error } = await getAuditLogs(200);

  if (error || !data) {
    return { data: null, error };
  }

  const filteredLogs = data
    .filter((entry) => {
      const metadataProjectId =
        entry.metadata && typeof entry.metadata.projectId === "string"
          ? entry.metadata.projectId
          : null;

      return (
        metadataProjectId === projectId ||
        (entry.entity_type === "project" && entry.entity_id === projectId)
      );
    })
    .slice(0, limit);

  return { data: filteredLogs, error: null };
}

export async function createDatabaseUser(input: {
  username: string;
  fullName: string;
  role: AppUserRole;
  password: string;
}) {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    throw new Error(error || "User database is not configured.");
  }

  const { data: existingUser, error: existingUserError } = await client
    .from("app_users")
    .select("id")
    .ilike("username", input.username)
    .maybeSingle();

  if (existingUserError) {
    throw new Error(existingUserError.message);
  }

  if (existingUser) {
    throw new Error("A user with that username already exists.");
  }

  const { data, error: insertError } = await client
    .from("app_users")
    .insert({
      username: input.username,
      full_name: input.fullName,
      role: input.role,
      is_active: true,
      password_hash: hashPassword(input.password),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return data as AppUser;
}

export async function updateDatabaseUser(input: {
  userId: string;
  username: string;
  fullName: string;
  role: AppUserRole;
  isActive: boolean;
  password?: string;
}) {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    throw new Error(error || "User database is not configured.");
  }

  const updatePayload: Record<string, unknown> = {
    username: input.username,
    full_name: input.fullName,
    role: input.role,
    is_active: input.isActive,
  };

  if (input.password) {
    updatePayload.password_hash = hashPassword(input.password);
  }

  const { data, error: updateError } = await client
    .from("app_users")
    .update(updatePayload)
    .eq("id", input.userId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return data as AppUser;
}

export async function deleteDatabaseUser(userId: string) {
  const { client, error } = getAdminClientOrError();

  if (!client) {
    throw new Error(error || "User database is not configured.");
  }

  const { error: deleteError } = await client.from("app_users").delete().eq("id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function logAuditEvent(input: {
  actorUserId?: string | null;
  actorUsername?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
}) {
  const { client } = getAdminClientOrError();

  if (!client) {
    return;
  }

  await client.from("audit_logs").insert({
    actor_user_id: input.actorUserId || null,
    actor_username: input.actorUsername || null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId || null,
    description: input.description,
    metadata: input.metadata || null,
  });
}
