import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@supabase/supabase-js";
import { requireAuth, requireAdmin, requireOwnership, AuthError } from "../../lib/auth/guards";
import { getCurrentUser, getUserRole } from "../../lib/auth/session";

// Mock the Supabase server client
vi.mock("../../lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
  getUserRole: vi.fn(),
}));

describe("Auth Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should throw 401 error if user is not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(AuthError);
      await expect(requireAuth()).rejects.toThrow("Unauthorized: Authentication required");
    });

    it("should return user if user is authenticated", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const result = await requireAuth();
      expect(result).toEqual(mockUser);
    });
  });

  describe("requireAdmin", () => {
    it("should throw 403 error if user is not an admin", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getUserRole).mockResolvedValue("user");

      await expect(requireAdmin()).rejects.toThrow(AuthError);
      await expect(requireAdmin()).rejects.toThrow("Forbidden: Admin privileges required");
    });

    it("should return user if user is an admin", async () => {
      const mockUser = { id: "admin-123", email: "admin@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getUserRole).mockResolvedValue("admin");

      const result = await requireAdmin();
      expect(result).toEqual(mockUser);
    });
  });

  describe("requireOwnership", () => {
    it("should succeed if user is the resource owner", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getUserRole).mockResolvedValue("user");

      const result = await requireOwnership("user-123");
      expect(result).toEqual(mockUser);
    });

    it("should succeed if user is not the owner but is an admin", async () => {
      const mockUser = { id: "admin-123", email: "admin@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getUserRole).mockResolvedValue("admin");

      const result = await requireOwnership("user-123");
      expect(result).toEqual(mockUser);
    });

    it("should throw 403 if user is not the owner and is not an admin", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" } as unknown as User;
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(getUserRole).mockResolvedValue("user");

      await expect(requireOwnership("other-user-456")).rejects.toThrow(AuthError);
      await expect(requireOwnership("other-user-456")).rejects.toThrow("Forbidden: Resource ownership or admin privileges required");
    });
  });
});
