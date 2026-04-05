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
  CampaignLead,
  fetchCampaign,
  fetchCampaignIdeas,
  fetchCampaignLeads,
} from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type WorkspaceTab =
  | "overview"
  | "content"
  | "funnel"
  | "website"
  | "flyer"
  | "account"
  | "leads"
  | "copilot";

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "funnel", label: "Funnel" },
  { id: "website", label: "Website" },
  { id: "flyer", label: "Flyer" },
  { id: "account", label: "Account" },
  { id: "leads", label: "Leads" },
  { id: "copilot", label: "Copilot" },
];

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  return value && typeof value === "object" ? (value as LooseRecord) : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function renderEmptyState(message: string) {
  return <p className="text-slate-400 text-sm">{message}</p>;
}

function downloadIdeasCsv(campaignName: string, ideas: CampaignIdea[]) {
  const header = ["day", "platform", "hook", "angle", "rationale", "cta"];
  const rows = ideas.map((idea) => [
    idea.day ?? "",
    idea.platform ?? "",
    idea.hook ?? idea.idea ?? "",
    idea.angle ?? "",
    idea.rationale ?? idea.body ?? "",
    idea.cta ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${campaignName || "campaign"}-ideas.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CampaignWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<CampaignIdea[]>([]);
  const [leads, setLeads] = useState<CampaignLead[]>([]);
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

    Promise.all([
      fetchCampaign(campaignId, token),
      fetchCampaignIdeas(campaignId, token),
      fetchCampaignLeads(campaignId, token).catch(() => []),
    ])
      .then(([campaignData, ideaData, leadData]) => {
        setCampaign(campaignData);
        setIdeas(ideaData);
        setLeads(leadData);
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

  const funnelData = asRecord(campaign?.generatedFunnel);
  const websiteData = asRecord(campaign?.generatedWebsite);
  const flyerData = asRecord(campaign?.generatedFlyer);
  const accountOptimizationData = asRecord(campaign?.generatedAccountOptimization);

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
                onClick={() => router.push("/dashboard/campaigns")}
                type="button"
              >
                Back to Campaigns
              </button>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                {campaign?.campaignName ?? "Campaign Workspace"}
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                Campaign-specific workspace with tabs for content, funnel direction, website context, leads, and copilot.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard/copilot")}>
                Global Copilot
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => downloadIdeasCsv(campaign?.campaignName ?? "campaign", ideas)}
              >
                Download Ideas CSV
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
                <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Brand Context</h3>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Positioning</p>
                    <p className="text-sm text-slate-300">{campaign?.brandProfile?.positioning ?? "Not set yet"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Voice</p>
                    <p className="text-sm text-slate-300">{campaign?.brandProfile?.voice ?? "Not set yet"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Website Goal</p>
                    <p className="text-sm text-slate-300">{campaign?.websiteBrief?.websiteGoal ?? "Not set yet"}</p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "content" ? (
            <section className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div>
                  <h3 className="font-bold text-lg font-headline">Campaign Ideas</h3>
                  <p className="text-sm text-slate-400 mt-1">Use download to export the table as CSV.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">{ideas.length} ideas</div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadIdeasCsv(campaign?.campaignName ?? "campaign", ideas)}
                  >
                    Download CSV
                  </Button>
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
                          <td className="px-6 py-6 text-sm text-on-surface font-medium">{idea.hook ?? idea.idea ?? "-"}</td>
                          <td className="px-6 py-6 text-sm">{idea.angle ?? "-"}</td>
                          <td className="px-6 py-6 text-sm text-slate-400">{idea.rationale ?? idea.body ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "funnel" ? (
            <section className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Funnel</h3>
              {funnelData ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Funnel Name</p>
                    <h4 className="text-xl font-headline font-bold text-on-surface">
                      {String(funnelData.funnel_name ?? "Generated Funnel")}
                    </h4>
                    <p className="mt-3 text-sm text-slate-400">
                      {String(funnelData.target_audience ?? "Target audience not provided")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.isArray(funnelData.stages) ? (
                      funnelData.stages.map((stage, index) => {
                        const entry = asRecord(stage);
                        return (
                          <div key={`${entry?.stage ?? "stage"}-${index}`} className="rounded-2xl border border-white/5 bg-surface-container p-5">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-300 font-bold mb-3">
                              {String(entry?.stage ?? `Stage ${index + 1}`)}
                            </p>
                            <p className="text-sm font-semibold text-on-surface mb-2">
                              {String(entry?.channel ?? "No channel")}
                            </p>
                            <p className="text-sm text-slate-400 mb-3">{String(entry?.hook ?? "No hook")}</p>
                            <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                              {String(entry?.cta ?? "No CTA")}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      renderEmptyState("No funnel stages available yet.")
                    )}
                  </div>
                </div>
              ) : renderEmptyState("No funnel output saved on this campaign yet.")}
            </section>
          ) : null}

          {!loading && activeTab === "website" ? (
            <section className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Website</h3>
              {websiteData ? (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 p-8">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-300 font-bold mb-3">Page Title</p>
                    <h4 className="text-3xl font-headline font-bold text-on-surface">
                      {String(websiteData.pageTitle ?? "Website direction")}
                    </h4>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
                      {String(websiteData.summary ?? "No website summary generated yet.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(websiteData.sections) ? websiteData.sections : []).map((section, index) => {
                      const entry = asRecord(section);
                      return (
                        <div key={`${entry?.title ?? "section"}-${index}`} className="rounded-2xl border border-white/5 bg-surface-container p-5">
                          <p className="text-sm font-semibold text-on-surface mb-2">{String(entry?.title ?? `Section ${index + 1}`)}</p>
                          <p className="text-sm text-slate-400 mb-4">{String(entry?.description ?? "No description")}</p>
                          <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                            {String(entry?.cta ?? "No CTA")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-slate-400">
                  <p>No website output saved on this campaign yet.</p>
                  <p>Target audience: {campaign?.websiteBrief?.targetAudience ?? "Not set"}</p>
                  <p>Primary CTA: {campaign?.websiteBrief?.primaryCTA ?? "Not set"}</p>
                </div>
              )}
            </section>
          ) : null}

          {!loading && activeTab === "flyer" ? (
            <section className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Flyer</h3>
              {flyerData ? (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-white/5 bg-surface-container p-8">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">Headline</p>
                    <h4 className="text-3xl font-headline font-bold text-on-surface">
                      {String(flyerData.headline ?? "Generated Flyer")}
                    </h4>
                    <p className="mt-3 text-sm text-slate-400">{String(flyerData.subheadline ?? "No subheadline")}</p>
                    <div className="mt-5 inline-flex rounded-full bg-indigo-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                      {String(flyerData.cta ?? flyerData.offer ?? "No CTA")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {asStringArray(flyerData.copyBlocks).map((block, index) => (
                      <div key={`copy-${index}`} className="rounded-2xl border border-white/5 bg-surface-container p-5 text-sm text-slate-300">
                        {block}
                      </div>
                    ))}
                  </div>
                </div>
              ) : renderEmptyState("No flyer output saved on this campaign yet.")}
            </section>
          ) : null}

          {!loading && activeTab === "account" ? (
            <section className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Account Optimization</h3>
              {accountOptimizationData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Profile Name</p>
                      <p className="text-lg font-semibold text-on-surface">{String(accountOptimizationData.profileName ?? "No profile name")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">CTA Strategy</p>
                      <p className="text-sm text-slate-300">{String(accountOptimizationData.ctaStrategy ?? "No CTA strategy")}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Bio</p>
                    <p className="text-sm text-slate-300">{String(accountOptimizationData.bio ?? "No bio recommendation")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">Highlights</p>
                      <div className="space-y-2 text-sm text-slate-300">
                        {asStringArray(accountOptimizationData.highlights).map((item, index) => (
                          <p key={`highlight-${index}`}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">Content Pillars</p>
                      <div className="space-y-2 text-sm text-slate-300">
                        {asStringArray(accountOptimizationData.contentPillars).map((item, index) => (
                          <p key={`pillar-${index}`}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">Checklist</p>
                      <div className="space-y-2 text-sm text-slate-300">
                        {asStringArray(accountOptimizationData.optimizationChecklist).map((item, index) => (
                          <p key={`check-${index}`}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : renderEmptyState("No account optimization output saved on this campaign yet.")}
            </section>
          ) : null}

          {!loading && activeTab === "leads" ? (
            <section className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg font-headline">Leads</h3>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">{leads.length} leads</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 bg-surface-container/50">
                      <th className="px-6 py-4">Lead</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Temp</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Next Step</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-400" colSpan={6}>
                          No leads saved on this campaign yet.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-white/[0.03] transition-all duration-300">
                          <td className="px-6 py-6 text-sm text-on-surface font-medium">{lead.name ?? lead.handle ?? "Unnamed lead"}</td>
                          <td className="px-6 py-6 text-sm">{lead.source}</td>
                          <td className="px-6 py-6 text-sm">{lead.status}</td>
                          <td className="px-6 py-6 text-sm">{lead.temperature}</td>
                          <td className="px-6 py-6 text-sm">{lead.qualificationScore}</td>
                          <td className="px-6 py-6 text-sm text-slate-400">{lead.nextStep ?? "-"}</td>
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
                    <div key={`${message.role}-${index}`} className={`flex gap-4 max-w-4xl ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
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
                      <span className="material-symbols-outlined">{sending ? "progress_activity" : "arrow_upward"}</span>
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
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Active Project</span>
                    <p className="text-sm font-semibold text-indigo-400 font-headline">{campaign?.campaignName ?? "No campaign selected"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Product</span>
                    <p className="text-sm text-slate-300">{campaign?.product ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Objective</span>
                    <p className="text-sm text-slate-300">{campaign?.objective ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Idea Count</span>
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
