import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Define strict types for the global store to satisfy ESLint
interface MockEnv {
  NODE_ENV: string;
  RESEND_API_KEY: string;
  EMAIL_FROM_ADDRESS: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
}

const globalStore = globalThis as unknown as {
  mockEnv: MockEnv;
};

// Initialize the mockEnv on globalThis before module imports
globalStore.mockEnv = {
  NODE_ENV: "test",
  RESEND_API_KEY: "your-resend-api-key-here",
  EMAIL_FROM_ADDRESS: "no-reply@yourdomain.com",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key-here",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

// Mock env lazily to resolve hoisting issues
vi.mock("../../lib/env", () => ({
  get env() {
    return (globalThis as unknown as { mockEnv: MockEnv }).mockEnv;
  },
}));

import {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountEventEmail,
} from "../../lib/notifications/provider";

describe("Notification Provider", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should stub email sending in test environment without making network calls", async () => {
    globalStore.mockEnv.NODE_ENV = "test";
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    expect(result).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should perform a POST request to Resend API when configured", async () => {
    const originalNodeEnv = globalStore.mockEnv.NODE_ENV;
    const originalApiKey = globalStore.mockEnv.RESEND_API_KEY;
    const originalFrom = globalStore.mockEnv.EMAIL_FROM_ADDRESS;

    globalStore.mockEnv.NODE_ENV = "production";
    globalStore.mockEnv.RESEND_API_KEY = "re_testkey123";
    globalStore.mockEnv.EMAIL_FROM_ADDRESS = "noreply@example.com";

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: async () => "OK",
    } as unknown as Response);

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Verification",
      html: "<p>Link</p>",
    });

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer re_testkey123",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@example.com",
          to: "user@example.com",
          subject: "Verification",
          html: "<p>Link</p>",
        }),
      })
    );

    // Restore env variables
    globalStore.mockEnv.NODE_ENV = originalNodeEnv;
    globalStore.mockEnv.RESEND_API_KEY = originalApiKey;
    globalStore.mockEnv.EMAIL_FROM_ADDRESS = originalFrom;
  });

  it("should wire verification, reset, and account event helpers to sendEmail", async () => {
    const originalNodeEnv = globalStore.mockEnv.NODE_ENV;
    const originalApiKey = globalStore.mockEnv.RESEND_API_KEY;
    const originalFrom = globalStore.mockEnv.EMAIL_FROM_ADDRESS;

    globalStore.mockEnv.NODE_ENV = "production";
    globalStore.mockEnv.RESEND_API_KEY = "re_testkey123";
    globalStore.mockEnv.EMAIL_FROM_ADDRESS = "noreply@example.com";

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: async () => "OK",
    } as unknown as Response);

    const vResult = await sendVerificationEmail("user@example.com", "http://verify-url");
    expect(vResult).toBe(true);

    const rResult = await sendPasswordResetEmail("user@example.com", "http://reset-url");
    expect(rResult).toBe(true);

    const eResult = await sendAccountEventEmail("user@example.com", "Login Detected", "IP: 1.1.1.1");
    expect(eResult).toBe(true);

    expect(global.fetch).toHaveBeenCalledTimes(3);

    globalStore.mockEnv.NODE_ENV = originalNodeEnv;
    globalStore.mockEnv.RESEND_API_KEY = originalApiKey;
    globalStore.mockEnv.EMAIL_FROM_ADDRESS = originalFrom;
  });
});
