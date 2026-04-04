"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { askCampaignChat, Campaign, CampaignChatMessage, fetchCampaigns } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export default function CopilotPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [messages, setMessages] = useState<CampaignChatMessage[]>([
    {
      role: "assistant",
      content: "Ask about hooks, CTAs, funnel logic, or how to improve a live campaign.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetchCampaigns(token)
      .then((data) => {
        setCampaigns(data);
        if (data[0]) {
          setSelectedCampaignId(data[0]._id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!draft.trim() || !selectedCampaignId) return;

    const nextUserMessage: CampaignChatMessage = {
      role: "user",
      content: draft.trim(),
    };

    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);
    setError(null);

    try {
      const response = await askCampaignChat(selectedCampaignId, token, nextMessages);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            response.reply ??
            response.message ??
            response.content ??
            "I could not generate a reply for that campaign.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  const selectedCampaign = campaigns.find((item) => item._id === selectedCampaignId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-full">
        <Topbar />

        <main className="flex-1 flex overflow-hidden">
          <section className="flex-1 flex flex-col bg-surface-dim relative">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {loading ? <p className="text-slate-400">Loading copilot workspace...</p> : null}
              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-4 max-w-4xl ${
                    message.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      message.role === "assistant"
                        ? "bg-indigo-500/20 border-indigo-500/30"
                        : "bg-surface-container-highest border-white/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-indigo-400">
                      {message.role === "assistant" ? "auto_awesome" : "person"}
                    </span>
                  </div>
                  <div
                    className={`px-6 py-4 text-sm leading-relaxed ${
                      message.role === "assistant"
                        ? "bg-surface-container-high rounded-tr-3xl rounded-br-3xl rounded-bl-3xl border border-white/5"
                        : "glass-panel rounded-tl-3xl rounded-bl-3xl rounded-br-3xl border border-white/10 shadow-lg"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 pt-0">
              <form
                className="max-w-4xl mx-auto glass-panel p-3 rounded-3xl border border-white/10 shadow-2xl"
                onSubmit={handleSubmit}
              >
                <div className="mb-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    Active Campaign
                  </label>
                  <select
                    className="mt-2 w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                    value={selectedCampaignId}
                    onChange={(event) => setSelectedCampaignId(event.target.value)}
                  >
                    {campaigns.map((campaign) => (
                      <option key={campaign._id} value={campaign._id}>
                        {campaign.campaignName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2 px-1">
                  <textarea
                    className="flex-1 bg-transparent border-none text-on-surface placeholder:text-slate-500 focus:ring-0 resize-none py-2 text-sm min-h-[72px] font-body"
                    placeholder="Ask Marketa AI about this campaign..."
                    rows={3}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  ></textarea>
                  <button
                    className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    disabled={sending || !selectedCampaignId}
                    type="submit"
                  >
                    <span className="material-symbols-outlined">
                      {sending ? "progress_activity" : "arrow_upward"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="w-80 bg-surface-container-lowest border-l border-white/5 flex flex-col p-6 overflow-y-auto hidden xl:flex">
            <div className="mb-8">
              <h3 className="font-headline font-extrabold text-xs text-slate-200 tracking-tight mb-4 uppercase tracking-[0.2em]">
                Campaign Context
              </h3>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 space-y-4 shadow-xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1 font-body">
                    Active Project
                  </span>
                  <p className="text-sm font-semibold text-indigo-400 font-headline">
                    {selectedCampaign?.campaignName ?? "No campaign selected"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1 font-body">
                    Product
                  </span>
                  <p className="text-sm text-slate-300">{selectedCampaign?.product ?? "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1 font-body">
                    Objective
                  </span>
                  <p className="text-sm text-slate-300">{selectedCampaign?.objective ?? "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1 font-body">
                    Status
                  </span>
                  <p className="text-sm text-slate-300">{selectedCampaign?.status ?? "-"}</p>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
