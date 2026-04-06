"use client";

import { useEffect, useState } from "react";

type CallbackDetails = {
  code: string | null;
  error: string | null;
  errorReason: string | null;
  errorDescription: string | null;
};

export default function InstagramCallbackPage() {
  const [details, setDetails] = useState<CallbackDetails>({
    code: null,
    error: null,
    errorReason: null,
    errorDescription: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDetails({
      code: params.get("code"),
      error: params.get("error"),
      errorReason: params.get("error_reason"),
      errorDescription: params.get("error_description"),
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/5 bg-surface-container-low p-8 shadow-2xl shadow-black/20">
        <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-bold mb-4">
          Instagram Business Login
        </p>
        <h1 className="text-3xl font-headline font-bold mb-4">Callback Received</h1>
        <p className="text-sm text-slate-400 mb-8">
          Use this route as your Meta redirect URL. It is ready to receive the OAuth redirect after Instagram business login completes.
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-surface-container p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">Code</p>
            <p className="break-all text-sm text-slate-300">{details.code ?? "No code received yet"}</p>
          </div>

          {details.error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <p className="font-semibold">{details.error}</p>
              <p>{details.errorReason ?? ""}</p>
              <p>{details.errorDescription ?? ""}</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
