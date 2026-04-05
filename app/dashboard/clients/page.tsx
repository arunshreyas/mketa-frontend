"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Client, createClient, CreateClientPayload, fetchClients } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

const initialForm: CreateClientPayload = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  industry: "",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<CreateClientPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetchClients(token)
      .then((data) => setClients(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load clients"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreateClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const created = await createClient(form, token);
      setClients((current) => [created, ...current]);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  }

  const industryCounts = useMemo(() => {
    return clients.reduce<Record<string, number>>((acc, client) => {
      const key = client.industry || "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [clients]);

  const topIndustries = Object.entries(industryCounts).slice(0, 4);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-[1480px] mx-auto w-full">
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                Clients
              </h2>
              <p className="text-slate-400 max-w-2xl font-medium text-sm">
                Create clients here first, then use them when you create campaigns and open campaign workspaces.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard")}>
                Back to Overview
              </Button>
              <Button variant="primary" size="md" onClick={() => window.location.reload()}>
                Refresh Clients
              </Button>
            </div>
          </section>

          {error ? (
            <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-300">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-6 mb-10">
            <div className="bg-surface-container-low rounded-3xl p-8 ghost-border">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Create Client</h3>
              <form className="space-y-4" onSubmit={handleCreateClient}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Name
                  </label>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Phone
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.phoneNumber}
                      onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Industry
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      value={form.industry}
                      onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Password
                    </label>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface outline-none"
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    />
                  </div>
                </div>

                <Button className="w-full" disabled={saving} size="lg" type="submit">
                  {saving ? "Creating..." : "Create Client"}
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Clients</p>
                <span className="text-3xl font-bold text-on-surface tracking-tighter font-headline">
                  {clients.length}
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-lg ghost-border md:col-span-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Industry Mix</p>
                <div className="flex flex-wrap gap-3">
                  {topIndustries.length === 0 ? (
                    <span className="text-sm text-slate-400">No client industries yet.</span>
                  ) : (
                    topIndustries.map(([industry, count]) => (
                      <span
                        key={industry}
                        className="rounded-full bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300"
                      >
                        {industry} · {count}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h3 className="font-bold text-lg font-headline">Client Records</h3>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                {loading ? "Loading" : `${clients.length} records`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-white/5 bg-surface-container/50">
                    <th className="px-8 py-4">Client</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td className="px-8 py-6 text-slate-400" colSpan={5}>
                        Loading clients...
                      </td>
                    </tr>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td className="px-8 py-6 text-slate-400" colSpan={5}>
                        No clients yet.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client._id} className="hover:bg-white/[0.03] transition-all duration-300">
                        <td className="px-8 py-6">
                          <p className="text-on-surface font-semibold text-sm">{client.name}</p>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-300">{client.email}</td>
                        <td className="px-6 py-6 text-sm">{client.phoneNumber}</td>
                        <td className="px-6 py-6">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-300">
                            {client.industry}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/campaigns?clientId=${client._id}`)}
                          >
                            Create Campaign
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
