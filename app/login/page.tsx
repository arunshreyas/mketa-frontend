"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      setAuth(data.token, data.user.email);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-surface-container-low rounded-[2rem] border border-white/5 shadow-2xl shadow-black/30 p-8">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-indigo-300 font-bold">
            Welcome Back
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight font-headline">
            Sign in to Marketa
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Connect this new frontend to your live campaign workspace.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Email
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-surface-container px-4 py-3 text-sm outline-none transition focus:border-indigo-500/40"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Password
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-surface-container px-4 py-3 text-sm outline-none transition focus:border-indigo-500/40"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <Button className="w-full justify-center" size="lg" variant="primary">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </main>
  );
}
