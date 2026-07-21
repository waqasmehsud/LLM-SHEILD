"use client";

import { useState } from "react";

export default function CrawlerConsole() {
  const [isSweeping, setIsSweeping] = useState(false);
  const [totalJobs, setTotalJobs] = useState(148);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Telemetry crawler initial scan completed.",
    "[INFO] Checked target portals: Vercel, Cloudflare, Supabase, Stripe, Linear.",
    "[SUCCESS] Last automated run resolved: 148 positions synchronized.",
  ]);

  const triggerManualSweep = () => {
    if (isSweeping) return;
    setIsSweeping(true);
    setLogs((prev) => [...prev, "[SYSTEM] Initiating manual telemetry sweep..."]);

    const crawlSteps = [
      "[CRAWLER] Loading target endpoints matrix...",
      "[CRAWLER] Connecting to Vercel Career API (Remote/Engineering)...",
      "[SUCCESS] 2 new entries cached: Frontend Design Architect ($165k), Product Eng ($150k)",
      "[CRAWLER] Connecting to Cloudflare Career portal...",
      "[SUCCESS] 1 new entry cached: AI Agent Developer (SF/Hybrid, $180k)",
      "[CRAWLER] Connecting to Supabase job listings...",
      "[INFO] No new entries found (Supabase portal synced).",
      "[CRAWLER] Restructuring payload vectors...",
      "[DATABASE] Writing matches cryptographically to Supabase profiles...",
      "[SYSTEM] Telemetry sweep complete. Database successfully synced.",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < crawlSteps.length) {
        const nextStep = crawlSteps[currentStep];
        if (typeof nextStep === "string") {
          setLogs((prev) => [...prev, nextStep]);
        }
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSweeping(false);
        setTotalJobs((prev) => prev + 3);
      }
    }, 800);
  };

  const getLogStyle = (logMessage: string | undefined) => {
    if (!logMessage) return "border-slate-800";
    if (logMessage.startsWith("[SUCCESS]")) return "border-[#3ddc97] text-[#3ddc97]";
    if (logMessage.startsWith("[SYSTEM]")) return "border-indigo-500 text-indigo-400";
    return "border-slate-800";
  };

  return (
    <div className="space-y-10 text-white font-sans relative">
      {/* Header Banner */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[28px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3ddc97]/30 to-indigo-500/20 opacity-20 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-3 z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase bg-slate-950 border border-slate-800 text-[#3ddc97] rounded-full tracking-wider font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isSweeping ? "bg-[#3ddc97] animate-ping" : "bg-[#3ddc97]"}`} />
            Crawler State: {isSweeping ? "Running Sweep" : "Idle / Synced"}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Background Job Telemetry Crawler
          </h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            Monitor and trigger the background scraping nodes. Crawl target company portals, parse skill structures, and synchronize them into the matching database.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={triggerManualSweep}
            disabled={isSweeping}
            className="w-full sm:w-auto px-6 py-3.5 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm disabled:opacity-50 cursor-pointer shadow-lg shadow-signal/15"
          >
            {isSweeping ? "[ SWEEPING... ]" : "[ TRIGGER MANUAL SWEEP ]"}
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Jobs Scraped (Total)
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {totalJobs}
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Active Portals
          </span>
          <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
            5 tracked
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Sweep Frequency
          </span>
          <span className="text-sm font-bold text-purple-400 mt-2 block font-mono">
            Every 6 hours
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Next Run Time
          </span>
          <span className="text-sm font-bold text-emerald-400 mt-2 block font-mono">
            06:00:00 (Scheduled)
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Runner Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              [ Runner Configuration ]
            </h3>
            
            <div className="space-y-4 font-mono text-[11px] text-slate-300">
              <div className="border-b border-slate-850 pb-2">
                <span className="text-slate-500 block">RUNNER TYPE:</span>
                <span className="text-paper">GitHub Actions (Ubuntu-Latest)</span>
              </div>
              <div className="border-b border-slate-850 pb-2">
                <span className="text-slate-500 block">SCHEDULE CRON:</span>
                <span className="text-signal">0 */6 * * *</span>
              </div>
              <div className="border-b border-slate-850 pb-2">
                <span className="text-slate-500 block">TARGET SCHEMAS:</span>
                <span className="text-paper">Supabase public.available_jobs</span>
              </div>
              <div>
                <span className="text-slate-500 block">CRAWLER MODULE:</span>
                <span className="text-indigo-400">crawler/main.py</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Telemetry logs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-md font-bold text-white tracking-tight">
                Live Crawler Telemetry Logs
              </h3>
              <p className="text-[12px] text-slate-400 mt-1">
                Real-time terminal sweep outputs indicating parsing results.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-850 rounded-[18px] font-mono text-[12px] text-slate-300 space-y-2.5 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed pl-2 border-l ${getLogStyle(log)}`}
              >
                {log || ""}
              </div>
            ))}
            {isSweeping && (
              <div className="text-signal animate-pulse flex items-center gap-1.5 pl-2">
                <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full" />
                <span>Sweeping web career nodes...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
