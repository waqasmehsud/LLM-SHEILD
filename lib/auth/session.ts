import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Fetches the currently authenticated user from the server-side Supabase Auth.
 * Safe for server components, API routes, and Server Actions.
 */
export async function getCurrentUser(): Promise<User | null> {
  // E2E test bypass: resolve session from test cookies instantly
  if (process.env.PLAYWRIGHT_TEST === "true") {
    try {
      const cookieStore = await cookies();
      const e2eSession = cookieStore.get("e2e-session")?.value;
      if (e2eSession === "admin") {
        return {
          id: "admin-123",
          email: "admin@example.com",
          user_metadata: { role: "admin", full_name: "System Admin" },
        } as unknown as User;
      }
      if (e2eSession === "user") {
        return {
          id: "user-123",
          email: "user@example.com",
          user_metadata: { role: "user", full_name: "Jane Doe" },
        } as unknown as User;
      }
    } catch {
      // Bypasses cookie store bails on build-time static page pre-generation
    }
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Fetches the user profile details from the public profiles table.
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (process.env.PLAYWRIGHT_TEST === "true") {
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || "Jane Doe",
      role: user.user_metadata?.role || "user",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return null;
    }
    return profile;
  } catch {
    return null;
  }
}

/**
 * Resolves the role of the current user. Defaults to 'anonymous' if unauthenticated.
 */
export async function getUserRole(): Promise<"anonymous" | "user" | "admin"> {
  const user = await getCurrentUser();
  if (!user) return "anonymous";

  const metaRole = user.user_metadata?.role;
  if (metaRole === "admin" || metaRole === "user") {
    return metaRole;
  }

  const profile = await getCurrentProfile();
  return (profile?.role as "user" | "admin") || "user";
}
