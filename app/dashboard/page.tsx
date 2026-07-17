"use client";

import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function DashboardHome() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const triggerRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      try {
        const res = await fetch("/api/v1/items");
        if (!res.ok) throw new Error("Failed to load items");
        const data = (await res.json()) as Item[];
        if (isMounted) {
          setItems(data);
        }
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        if (isMounted) {
          setError(errorObj.message || "Error loading items");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems().catch((err: unknown) => {
      console.error("Unhandled error in loadItems:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]);

  const openCreateModal = () => {
    setEditItem(null);
    setName("");
    setDescription("");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editItem ? `/api/v1/items/${editItem.id}` : "/api/v1/items";
    const method = editItem ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error: string };
        throw new Error(errData.error || "Failed to save item");
      }

      setModalOpen(false);
      triggerRefetch();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/v1/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error: string };
        throw new Error(errData.error || "Failed to delete item");
      }

      triggerRefetch();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || "Error deleting item");
    }
  };

  return (
    <div className="space-y-10 text-white font-sans relative">
      {/* 1. Glassmorphic Header Banner Card */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[28px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        {/* Colorful gradient glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 blur-3xl rounded-full" />

        <div className="space-y-4 z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase bg-slate-950 border border-slate-800 text-indigo-400 rounded-full tracking-wider font-mono">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            Shield Coordinator Nodes
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Configure guardrail pipelines and inspect incoming prompt metadata.
          </h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            Manage your tenant security configurations, register credential
            rules, and keep an active log of your AI pipeline protection
            systems.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-550/20"
          >
            Configure Node
          </button>
        </div>
      </div>

      {/* 2. Mini stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Active Nodes
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {loading ? "..." : items.length}
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Security Score
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            99.98%
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Filters Active
          </span>
          <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
            12
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            System Latency
          </span>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">
            2.4 ms
          </span>
        </div>
      </div>

      {/* 3. Main Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Protected Infrastructure Nodes
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Active prompt filters, databases context, and safety rules
              registered in your sandbox environment.
            </p>
          </div>
        </div>

        {/* Loader state */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-slate-900/40 border border-slate-850/80 rounded-[24px]">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-400 tracking-wider animate-pulse">
              Querying infrastructure directory...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-slate-900/40 border border-slate-850/80 rounded-[24px] text-center space-y-5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-600"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 12 12 18 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[14px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              No active nodes found
            </p>
            <p className="text-[13px] text-slate-500 max-w-sm">
              Your network database doesn&apos;t have any guardrails defined yet.
              Create your first security node below.
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[13px] rounded-xl transition-all cursor-pointer"
            >
              Configure Node
            </button>
          </div>
        ) : (
          /* Grid of Nodes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/50 border border-slate-850/80 rounded-[24px] p-6 flex flex-col justify-between h-64 hover:border-indigo-500/50 transition-all shadow-md hover:shadow-indigo-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-850/60 pb-3 mb-4">
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      ID: {item.id.substring(0, 8).toUpperCase()}...
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold border border-emerald-950/40 bg-emerald-950/20 text-emerald-400 rounded-full uppercase tracking-wider font-mono">
                      Safe Node
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-slate-400 text-[13px] mt-2 line-clamp-3 leading-relaxed">
                    {item.description ||
                      "No description payload registered for this node."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-850/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 text-slate-300 rounded-lg text-[12px] font-bold transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 border border-slate-800 hover:border-rose-900/60 hover:text-rose-400 bg-slate-950/40 hover:bg-rose-955/20 rounded-lg text-[12px] font-bold transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[24px] p-8 max-w-md w-full space-y-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
            <h2 className="text-lg font-bold border-b border-slate-800/80 pb-3">
              {editItem
                ? "Edit Infrastructure Node"
                : "Configure Infrastructure Node"}
            </h2>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-355 text-[13px] rounded-xl text-center">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Node Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter configuration name"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Configuration Payload / Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide config rules or security constraints..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all h-28 resize-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 bg-slate-950 hover:bg-slate-950/80 rounded-xl text-[13px] font-bold transition-all cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[13px] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving node..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
