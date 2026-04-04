"use client";

import { useEffect, useState } from "react";
import { getAuthEmail } from "@/lib/auth";

const Topbar = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getAuthEmail() ?? "");
  }, []);

  return (
    <header className="sticky top-0 w-full z-30 bg-[#0B0F14]/80 backdrop-blur-xl border-b border-white/10 h-16 flex justify-between items-center px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            placeholder="Search campaigns or intelligence..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Connected
          </div>
          <div className="text-sm text-slate-200">{email || "Workspace"}</div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-indigo-300 transition-colors relative" type="button">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>

        <div className="h-8 w-8 rounded-full overflow-hidden border border-indigo-400/30 ring-2 ring-indigo-500/10 cursor-pointer hover:ring-indigo-500/30 transition-all flex items-center justify-center bg-indigo-500/10 text-indigo-300 text-xs font-bold">
          {(email.charAt(0) || "M").toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
