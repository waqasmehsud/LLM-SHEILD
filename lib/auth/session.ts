import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Fetches the currently authenticated user from the server-side Supabase Auth.
 * Safe for server components, API routes, and Server Actions.
 */
export async function getCurrentUser() {
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
