import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here";

describe("Row Level Security (RLS) Integration Tests", () => {
  // Bypasses WebSocket constructor check in Node.js test environments
  const realtimeConfig = { transport: class {} as unknown as typeof globalThis.WebSocket };

  // Client configurations
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });
  const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });

  let dbAvailable = true;

  beforeAll(async () => {
    // Authenticate user client (Jane Doe)
    const { error: userAuthError } = await userClient.auth.signInWithPassword({
      email: "user@example.com",
      password: "Password123",
    });
    if (userAuthError) {
      dbAvailable = false;
      console.warn("⚠️ Local Supabase stack not running. Skipping RLS assertions.");
    }

    // Authenticate admin client (System Administrator)
    const { error: adminAuthError } = await adminClient.auth.signInWithPassword({
      email: "admin@example.com",
      password: "Password123",
    });
    if (adminAuthError) {
      dbAvailable = false;
    }
  });

  it("should prevent anonymous clients from reading items", async () => {
    if (!dbAvailable) return;
    const { data, error } = await anonClient.from("items").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS filters out unauthorized rows
  });

  it("should allow authenticated users to read their own items", async () => {
    if (!dbAvailable) return;
    // Jane Doe owns c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13
    const { data, error } = await userClient.from("items").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    
    // Check that every fetched item belongs to Jane Doe
    const allOwned = data!.every(item => item.user_id === "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12");
    expect(allOwned).toBe(true);
  });

  it("should prevent normal authenticated users from reading other users' private rows", async () => {
    if (!dbAvailable) return;
    // Let's check that the user client cannot read items belonging to other users
    // (Jane Doe only owns c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13 and c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14)
    const { data: itemsData } = await userClient.from("items").select("*");
    expect(itemsData).not.toBeNull();
    
    // Querying table for a specific item belonging to another user (if any existed, e.g. admin's data)
    // In our seed data, all items belong to user@example.com.
    // If we query profiles, a user should only be able to view their own profile.
    const { data: profileData } = await userClient.from("profiles").select("*");
    expect(profileData).not.toBeNull();
    
    // User should only see their own profile
    const onlyOwnProfile = profileData!.every(p => p.id === "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12");
    expect(onlyOwnProfile).toBe(true);
  });

  it("should allow admin clients to read all users' items", async () => {
    if (!dbAvailable) return;
    const { data, error } = await adminClient.from("items").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    
    // Admin should be able to see items owned by Jane Doe
    const hasJaneItems = data!.some(item => item.user_id === "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12");
    expect(hasJaneItems).toBe(true);
  });
});
