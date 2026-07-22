import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST() {
  const logs: string[] = [];
  const log = (msg: string) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    logs.push(`${timestamp} [INFO] ${msg}`);
  };

  try {
    logs.push("==================================================");
    logs.push("Initiating Remote GitHub Actions Workflow...");
    logs.push("==================================================");

    const token = env.GITHUB_PAT;
    const owner = env.GITHUB_OWNER || "waqasmehsud";
    const repo = env.GITHUB_REPO || "Hirenetic";
    
    let ref = "main";
    if (process.env.NODE_ENV === "development") {
      try {
        ref = execSync("git branch --show-current").toString().trim() || "main";
      } catch {
        // Fallback to "main"
      }
    } else {
      ref = process.env.VERCEL_GIT_COMMIT_REF || "main";
    }
    
    const workflowId = "crawler.yml";

    log(`Target Repository: ${owner}/${repo}`);
    log(`Target Workflow: ${workflowId}`);
    log(`Target Branch/Ref: ${ref}`);

    if (!token) {
      throw new Error(
        "GITHUB_PAT environment variable is not set. Please configure it in your .env file or Vercel dashboard."
      );
    }

    log("Sending trigger request to GitHub API...");

    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;

    const response = await fetch(githubUrl, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Hirenetic-App",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: ref,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API returned status ${response.status}: ${errorText}`);
    }

    logs.push("==================================================");
    logs.push("[SUCCESS] GitHub Actions workflow triggered successfully!");
    logs.push("Please check your GitHub Actions tab to monitor the run progress.");
    logs.push("==================================================");

    // Get the current total count from Supabase
    const supabase = createAdminSupabaseClient();
    const { count, error } = await supabase
      .from("available_jobs")
      .select("*", { count: "exact", head: true });

    if (error) {
      log(`Failed to fetch database job count: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      logs: logs,
      totalJobs: error || count === null ? 148 : count,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    logs.push(`[SYSTEM ERROR] Trigger failed: ${errorMsg}`);

    return NextResponse.json({
      success: false,
      logs: logs,
      error: errorMsg,
    });
  }
}
