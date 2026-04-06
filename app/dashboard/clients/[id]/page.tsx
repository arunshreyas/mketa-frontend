"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Campaign, Client, fetchCampaigns, fetchClient, getInstagramBusinessLoginUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [client, setClient] = useState<Client | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchClient(clientId, token), fetchCampaigns(token, clientId)])
      .then(([clientData, campaignData]) => {
        setClient(clientData);
        setCampaigns(campaignData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load client"))
      .finally(() => setLoading(false));
  }, [clientId, router]);

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
                onClick={() => router.push("/dashboard/clients")}
                type="button"
              >
                Back to Clients
              </button>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                {client?.name ?? "Client"}
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                Open a client and see all campaigns tied to them in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.open(getInstagramBusinessLoginUrl(`client:${clientId}`), "_self")}
              >
                Connect Instagram
              </Button>
              <Button variant="primary" size="md" onClick={() => router.push(`/dashboard/campaigns?clientId=${clientId}`)}>
                Create Campaign For Client
              </Button>
            </div>
          </section>

          {error ? (
            <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-300">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Email</p>
              <p className="text-sm text-on-surface font-semibold">{client?.email ?? "-"}</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Phone</p>
              <p className="text-sm text-on-surface font-semibold">{client?.phoneNumber ?? "-"}</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Industry</p>
              <p className="text-sm text-on-surface font-semibold">{client?.industry ?? "-"}</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Campaigns</p>
              <p className="text-3xl text-on-surface font-headline font-bold">{campaigns.length}</p>
            </div>
          </section>

          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h3 className="font-bold text-lg font-headline">Client Campaigns</h3>
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
                        No campaigns for this client yet.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-white/[0.03] transition-all duration-300">
                        <td className="px-6 py-6 text-sm text-on-surface font-semibold">{campaign.campaignName}</td>
                        <td className="px-6 py-6 text-sm">{campaign.brandName ?? "-"}</td>
                        <td className="px-6 py-6 text-sm text-slate-300">{campaign.objective}</td>
                        <td className="px-6 py-6 text-sm">{campaign.status}</td>
                        <td className="px-6 py-6">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
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
        </main>
      </div>
    </div>
  );
}
