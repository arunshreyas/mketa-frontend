"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Campaign, Client, fetchCampaigns, fetchClients } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

const DashboardPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchCampaigns(token), fetchClients(token)])
      .then(([campaignData, clientData]) => {
        setCampaigns(campaignData);
        setClients(clientData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load workspace"))
      .finally(() => setLoading(false));
  }, [router]);

  const stats = useMemo(() => {
    const active = campaigns.filter((item) => item.status === "active").length;
    const completed = campaigns.filter((item) => item.status === "completed").length;
    const avgDuration =
      campaigns.length > 0
        ? Math.round(campaigns.reduce((sum, item) => sum + (item.duration || 0), 0) / campaigns.length)
        : 0;

    return {
      totalClients: clients.length,
      totalCampaigns: campaigns.length,
      activeCampaigns: active,
      completedCampaigns: completed,
      avgDuration,
    };
  }, [campaigns, clients]);

  const recentCampaigns = campaigns.slice(0, 5);
  const recentClients = clients.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-[1480px] mx-auto w-full">
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                Workspace Overview
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                The Next frontend now follows the actual Mketa flow: clients feed campaigns, and campaigns open into dedicated workspaces for content planning and copilot support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard/clients")}>
                View Clients
              </Button>
              <Button variant="primary" size="md" onClick={() => router.push("/dashboard/copilot")}>
                Global Copilot
              </Button>
            </div>
          </section>

          {error ? (
            <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-300">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Clients</p>
              <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                {stats.totalClients}
              </span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Campaigns</p>
              <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                {stats.totalCampaigns}
              </span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Active</p>
              <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                {stats.activeCampaigns}
              </span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Completed</p>
              <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                {stats.completedCampaigns}
              </span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Duration</p>
              <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                {stats.avgDuration}d
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg font-headline">Campaign Flow</h3>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                  {loading ? "Loading" : `${campaigns.length} records`}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 bg-surface-container/50">
                      <th className="px-8 py-4">Campaign</th>
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Objective</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td className="px-8 py-6 text-slate-400" colSpan={6}>
                          Loading campaigns...
                        </td>
                      </tr>
                    ) : recentCampaigns.length === 0 ? (
                      <tr>
                        <td className="px-8 py-6 text-slate-400" colSpan={6}>
                          No campaigns yet.
                        </td>
                      </tr>
                    ) : (
                      recentCampaigns.map((camp) => (
                        <tr key={camp._id} className="hover:bg-white/[0.03] transition-all duration-300">
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-on-surface font-semibold text-sm">{camp.campaignName}</p>
                              <p className="text-slate-500 text-xs font-body">{camp.clientIndustry || "No industry"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm">{camp.brandName || "Unknown brand"}</td>
                          <td className="px-6 py-6 text-sm text-slate-300">{camp.objective}</td>
                          <td className="px-6 py-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                camp.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : camp.status === "paused"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : camp.status === "completed"
                                      ? "bg-indigo-500/10 text-indigo-300"
                                      : "bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              {camp.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-sm">{camp.product}</td>
                          <td className="px-6 py-6">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/dashboard/campaigns/${camp._id}`)}
                            >
                              Open Workspace
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg font-headline">Client Directory</h3>
                <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/clients")}>
                  All Clients
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {loading ? (
                  <p className="text-slate-400 text-sm">Loading clients...</p>
                ) : recentClients.length === 0 ? (
                  <p className="text-slate-400 text-sm">No clients yet.</p>
                ) : (
                  recentClients.map((client) => (
                    <div key={client._id} className="rounded-2xl border border-white/5 bg-surface-container px-4 py-4">
                      <p className="text-sm font-semibold text-on-surface">{client.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{client.email}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        <span>{client.industry}</span>
                        <span>{client.phoneNumber}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
