"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import {
  askCampaignChat,
  Campaign,
  CampaignChatMessage,
  CampaignIdea,
  fetchCampaign,
  fetchCampaignIdeas,
} from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type WorkspaceTab = "overview" | "content" | "copilot";

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "copilot", label: "Copilot" },
];

export default function CampaignWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<CampaignIdea[]>([]);
  const [messages, setMessages] = useState<CampaignChatMessage[]>([
    {
      role: "assistant",
      content: "I can help refine hooks, summarize campaign ideas, and strengthen CTAs for this campaign.",
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

    Promise.all([fetchCampaign(campaignId, token), fetchCampaignIdeas(campaignId, token)])
      .then(([campaignData, ideaData]) => {
        setCampaign(campaignData);
        setIdeas(ideaData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load campaign workspace"))
      .finally(() => setLoading(false));
  }, [campaignId, router]);

  const campaignSummary = useMemo(() => {
    if (!campaign) return [];

    return [
      { label: "Brand", value: campaign.brandName || "Unknown brand" },
      { label: "Product", value: campaign.product || "-" },
      { label: "Objective", value: campaign.objective || "-" },
      { label: "Status", value: campaign.status || "-" },
      { label: "Industry", value: campaign.clientIndustry || "-" },
      { label: "Duration", value: `${campaign.duration || 0} days` },
    ];
  }, [campaign]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!draft.trim()) return;

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
      const response = await askCampaignChat(campaignId, token, nextMessages);
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-[1480px] mx-auto w-full">
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <button
                className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300"
                onClick={() => router.push("/dashboard")}
                type="button"
              >
                Back to Campaign Hub
              </button>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                {campaign?.campaignName ?? "Campaign Workspace"}
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                Campaign-specific workspace for strategy context, content ideas, and AI copilot support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard/copilot")}>
                Global Copilot
              </Button>
              <Button variant="primary" size="md" onClick={() => window.location.reload()}>
                Refresh Workspace
              </Button>
            </div>
          </section>

          {error ? (
            <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-300">
              {error}
            </div>
          ) : null}

          <section className="mb-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </section>

          {loading ? (
            <div className="rounded-3xl border border-white/5 bg-surface-container-low p-8 text-slate-400">
              Loading workspace...
            </div>
          ) : null}

          {!loading && activeTab === "overview" ? (
            <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-surface-container-low rounded-3xl p-8 ghost-border">
                <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Campaign Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignSummary.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/5 bg-surface-container p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                        {item.label}
                      </p>
                      <p className="text-sm text-on-surface font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-3xl p-8 ghost-border">
                <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Next Best Move</h3>
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 mb-4">
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {ideas.length > 0
                      ? `This campaign already has ${ideas.length} content ideas. Open the Content tab to turn those into your execution plan, or use Copilot to refine hooks and CTAs.`
                      : "This campaign does not have content ideas loaded yet. Once ideas exist, this workspace becomes the fastest path from strategy to execution."}
                  </p>
                </div>
                <div className="space-y-3 text-sm text-slate-400">
                  <p>1. Review the campaign context so messaging stays aligned.</p>
                  <p>2. Use the Content tab to inspect hooks, angles, and rationale.</p>
                  <p>3. Use Copilot when you want stronger hooks or clearer conversion copy.</p>
                </div>
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "content" ? (
            <section className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg font-headline">Campaign Ideas</h3>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                  {ideas.length} ideas
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 bg-surface-container/50">
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4">Hook</th>
                      <th className="px-6 py-4">Angle</th>
                      <th className="px-6 py-4">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ideas.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-400" colSpan={5}>
                          No ideas found for this campaign yet.
                        </td>
                      </tr>
                    ) : (
                      ideas.map((idea, index) => (
                        <tr key={idea.id ?? `${idea.day}-${index}`} className="hover:bg-white/[0.03] transition-all duration-300">
                          <td className="px-6 py-6 text-sm text-slate-300">{idea.day ?? index + 1}</td>
                          <td className="px-6 py-6 text-sm">{idea.platform ?? "-"}</td>
                          <td className="px-6 py-6 text-sm text-on-surface font-medium">
                            {idea.hook ?? idea.idea ?? "-"}
                          </td>
                          <td className="px-6 py-6 text-sm">{idea.angle ?? "-"}</td>
                          <td className="px-6 py-6 text-sm text-slate-400">
                            {idea.rationale ?? idea.body ?? "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "copilot" ? (
            <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-surface-container-low rounded-3xl p-6 ghost-border flex flex-col min-h-[620px]">
                <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex gap-4 max-w-4xl ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
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

                <form className="mt-6 glass-panel p-3 rounded-3xl border border-white/10 shadow-2xl" onSubmit={handleSubmit}>
                  <div className="flex items-end gap-2 px-1">
                    <textarea
                      className="flex-1 bg-transparent border-none text-on-surface placeholder:text-slate-500 focus:ring-0 resize-none py-2 text-sm min-h-[72px] font-body"
                      placeholder={`Ask about ${campaign?.campaignName ?? "this campaign"}...`}
                      rows={3}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    ></textarea>
                    <button
                      className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      disabled={sending}
                      type="submit"
                    >
                      <span className="material-symbols-outlined">
                        {sending ? "progress_activity" : "arrow_upward"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              <aside className="bg-surface-container-low rounded-3xl p-6 ghost-border">
                <h3 className="font-headline font-extrabold text-xs text-slate-200 tracking-tight mb-4 uppercase tracking-[0.2em]">
                  Workspace Context
                </h3>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                      Active Project
                    </span>
                    <p className="text-sm font-semibold text-indigo-400 font-headline">
                      {campaign?.campaignName ?? "No campaign selected"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                      Product
                    </span>
                    <p className="text-sm text-slate-300">{campaign?.product ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                      Objective
                    </span>
                    <p className="text-sm text-slate-300">{campaign?.objective ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                      Idea Count
                    </span>
                    <p className="text-sm text-slate-300">{ideas.length}</p>
                  </div>
                </div>
              </aside>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
