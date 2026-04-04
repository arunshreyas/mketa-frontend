"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import {
  Campaign,
  Client,
  createCampaign,
  CreateCampaignPayload,
  fetchCampaigns,
  fetchClients,
} from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

const initialForm: CreateCampaignPayload = {
  client_id: "",
  campaignName: "",
  objective: "",
  status: "planned",
  duration: 30,
  product: "",
  clientIndustry: "",
  brandName: "",
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<CreateCampaignPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const [campaignData, clientData] = await Promise.all([fetchCampaigns(token), fetchClients(token)]);
    setCampaigns(campaignData);
    setClients(clientData);
    setForm((current) => ({
      ...current,
      client_id: current.client_id || clientData[0]?._id || "",
      clientIndustry: current.clientIndustry || clientData[0]?.industry || "",
    }));
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedClient = clients.find((client) => client._id === form.client_id);
      const created = await createCampaign(
        {
          ...form,
          clientIndustry: form.clientIndustry || selectedClient?.industry || "",
        },
        token,
      );

      setCampaigns((current) => [created, ...current]);
      setForm({
        ...initialForm,
        client_id: selectedClient?._id || clients[0]?._id || "",
        clientIndustry: selectedClient?.industry || clients[0]?.industry || "",
      });
      router.push(`/dashboard/campaigns/${created._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
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
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                Campaigns
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                Create campaigns here, then open each one in its own workspace for content and copilot work.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard")}>
                Back to Overview
              </Button>
              <Button variant="primary" size="md" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </section>

          {error ? (
            <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-300">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-6">
            <div className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Create Campaign</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Client
                  </label>
                  <select
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                    value={form.client_id}
                    onChange={(event) => {
                      const nextClient = clients.find((client) => client._id === event.target.value);
                      setForm((current) => ({
                        ...current,
                        client_id: event.target.value,
                        clientIndustry: nextClient?.industry || current.clientIndustry,
                      }));
                    }}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Campaign Name
                  </label>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                    value={form.campaignName}
                    onChange={(event) => setForm((current) => ({ ...current, campaignName: event.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Brand Name
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.brandName}
                      onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Product
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.product}
                      onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Objective
                  </label>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                    value={form.objective}
                    onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </label>
                    <select
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as CreateCampaignPayload["status"],
                        }))
                      }
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Duration
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      min={1}
                      type="number"
                      value={form.duration}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          duration: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Industry
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.clientIndustry ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, clientIndustry: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <Button className="w-full" disabled={saving || clients.length === 0} size="lg" type="submit">
                  {saving ? "Creating..." : "Create Campaign"}
                </Button>

                {clients.length === 0 ? (
                  <p className="text-xs text-amber-300">
                    Create a client first before creating campaigns.
                  </p>
                ) : null}
              </form>
            </div>

            <div className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-lg font-headline">Existing Campaigns</h3>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                  {loading ? "Loading" : `${campaigns.length} records`}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 bg-surface-container/50">
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Objective</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-400" colSpan={5}>
                          Loading campaigns...
                        </td>
                      </tr>
                    ) : campaigns.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-400" colSpan={5}>
                          No campaigns yet.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign._id} className="hover:bg-white/[0.03] transition-all duration-300">
                          <td className="px-6 py-6">
                            <div>
                              <p className="text-on-surface font-semibold text-sm">{campaign.campaignName}</p>
                              <p className="text-slate-500 text-xs">{campaign.product}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm">{campaign.brandName}</td>
                          <td className="px-6 py-6 text-sm text-slate-300">{campaign.objective}</td>
                          <td className="px-6 py-6 text-sm">{campaign.status}</td>
                          <td className="px-6 py-6">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                            >
                              Open
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
